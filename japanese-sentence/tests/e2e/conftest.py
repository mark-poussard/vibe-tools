from __future__ import annotations

import base64
import json
import threading
from dataclasses import dataclass, field
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

import pytest
from playwright.sync_api import Error, Page, Playwright, sync_playwright


ROOT = Path(__file__).resolve().parents[2]


class QuietHTTPServer(ThreadingHTTPServer):
    allow_reuse_address = True
    daemon_threads = True


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, format: str, *args) -> None:  # pragma: no cover - noisy server logging
        return


@dataclass
class MockGithub:
    remote_content: str
    sha: str = "remote-sha"
    put_payloads: list[dict] = field(default_factory=list)


@pytest.fixture(scope="session")
def app_server() -> str:
    handler = partial(QuietHandler, directory=str(ROOT))
    server = QuietHTTPServer(("127.0.0.1", 0), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield f"http://127.0.0.1:{server.server_address[1]}"
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=5)


@pytest.fixture(scope="session")
def playwright() -> Playwright:
    with sync_playwright() as instance:
        yield instance


@pytest.fixture
def browser(playwright: Playwright):
    try:
        browser = playwright.firefox.launch(headless=True)
    except Error as exc:  # pragma: no cover - environment dependent
        raise RuntimeError(
            "Firefox is required for the headless browser tests. "
            "Install it with `uv run python -m playwright install firefox`."
        ) from exc

    try:
        yield browser
    finally:
        browser.close()


@pytest.fixture
def context(browser):
    context = browser.new_context(viewport={"width": 1280, "height": 960})
    try:
        yield context
    finally:
        context.close()


@pytest.fixture
def page(context):
    page = context.new_page()
    try:
        yield page
    finally:
        page.close()


def seed_authenticated_context(
    context,
    token: str = "test-token",
    repo: str = "owner/repo",
    path: str = "sentences-data.js",
) -> None:
    seed = json.dumps({"token": token, "repo": repo, "path": path})
    context.add_init_script(
        f"""
        (() => {{
            const seed = {seed};
            localStorage.setItem('gh_token', seed.token);
            localStorage.setItem('gh_repo', seed.repo);
            localStorage.setItem('gh_path', seed.path);
        }})();
        """
    )


def wait_for_screen(page: Page, screen_id: str) -> None:
    page.locator(f"#{screen_id}").wait_for()
    page.wait_for_function(
        """(id) => {
            const el = document.getElementById(id);
            return !!el && el.classList.contains('active');
        }""",
        arg=screen_id,
    )


def install_mock_github(context, remote_content: str) -> MockGithub:
    mock = MockGithub(remote_content=remote_content)

    def handler(route) -> None:
        request = route.request

        if request.method == "GET":
            body = json.dumps(
                {
                    "sha": mock.sha,
                    "content": base64.b64encode(mock.remote_content.encode("utf-8")).decode("ascii"),
                    "encoding": "base64",
                }
            )
            route.fulfill(status=200, content_type="application/json", body=body)
            return

        if request.method == "PUT":
            payload = json.loads(request.post_data or "{}")
            mock.put_payloads.append(payload)
            decoded = base64.b64decode(payload["content"]).decode("utf-8")
            mock.remote_content = decoded
            mock.sha = "updated-sha"
            route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps({"content": {"sha": mock.sha}}),
            )
            return

        route.abort()

    context.route("**/api.github.com/repos/**/contents/**", handler)
    return mock
