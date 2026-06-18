from __future__ import annotations

import base64
from pathlib import Path

from playwright.sync_api import expect

from conftest import ROOT, install_mock_github, seed_authenticated_context, wait_for_screen


REMOTE_SENTENCES = (ROOT / "sentences-data.js").read_text(encoding="utf-8")


def open_authenticated_app(context, app_server: str):
    seed_authenticated_context(context)
    page = context.new_page()
    page.goto(app_server, wait_until="domcontentloaded")
    wait_for_screen(page, "home-screen")
    return page


def test_config_flow_persists_to_reload(browser, app_server):
    context = browser.new_context(viewport={"width": 1280, "height": 960})
    page = context.new_page()
    try:
        page.goto(app_server, wait_until="domcontentloaded")
        wait_for_screen(page, "config-screen")

        page.locator("#gh-token").fill("test-token")
        page.locator("#gh-repo").fill("owner/repo")
        page.locator("#gh-path").fill("sentences-data.js")
        page.get_by_role("button", name="Save Configuration").click()

        wait_for_screen(page, "home-screen")
        page.reload(wait_until="domcontentloaded")
        wait_for_screen(page, "home-screen")
        expect(page.locator("#unsynced-banner")).not_to_be_visible()
    finally:
        context.close()


def test_word_practice_accepts_correct_answer(browser, app_server):
    context = browser.new_context(viewport={"width": 1280, "height": 960})
    page = open_authenticated_app(context, app_server)
    try:
        page.get_by_role("button", name="Word Practice").click()
        page.get_by_label("Search word or kanji").fill("imagination")
        page.get_by_role("button", name="Search").click()
        expect(page.locator("#word-practice-summary")).to_contain_text('1 sentence match "imagination".')

        page.get_by_role("button", name="Start Practice").click()
        wait_for_screen(page, "practice-screen")

        expect(page.locator("#practice-english")).to_contain_text("imagination")
        page.locator("#practice-input").fill("それは君の想像にすぎない")
        page.get_by_role("button", name="Submit").click()

        expect(page.locator("#practice-feedback")).to_contain_text("Correct!")
        expect(page.get_by_role("button", name="Next Sentence")).to_be_visible()
    finally:
        context.close()


def test_incorrect_answer_can_be_overridden(browser, app_server):
    context = browser.new_context(viewport={"width": 1280, "height": 960})
    page = open_authenticated_app(context, app_server)
    try:
        page.get_by_role("button", name="Word Practice").click()
        page.get_by_label("Search word or kanji").fill("imagination")
        page.get_by_role("button", name="Search").click()
        page.get_by_role("button", name="Start Practice").click()
        wait_for_screen(page, "practice-screen")

        page.locator("#practice-input").fill("wrong answer")
        page.get_by_role("button", name="Submit").click()

        expect(page.locator("#practice-feedback")).to_contain_text("Incorrect.")
        page.get_by_role("button", name="I was right (Add as alternate)").click()
        expect(page.locator("#override-modal")).to_be_visible()
        expect(page.locator("#modal-new-alt")).to_contain_text("wrong answer")

        page.get_by_role("button", name="Confirm & Add").click()
        expect(page.locator("#practice-feedback")).to_contain_text("Added as alternate")
        expect(page.get_by_role("button", name="Next Sentence")).to_be_visible()
    finally:
        context.close()


def test_review_edits_sync_to_mocked_github(browser, app_server):
    context = browser.new_context(viewport={"width": 1280, "height": 960})
    mock = install_mock_github(context, REMOTE_SENTENCES)
    page = open_authenticated_app(context, app_server)
    try:
        page.get_by_role("button", name="Review & Edit Sentences").click()
        wait_for_screen(page, "review-screen")

        row = page.locator('.sentence-row[data-id="1"]')
        row.locator(".edit-english").fill("I changed this sentence.")
        row.locator(".edit-english").press("Tab")

        page.get_by_role("button", name="Back to Home").click()
        wait_for_screen(page, "home-screen")
        expect(page.locator("#unsynced-banner")).to_be_visible()

        page.get_by_role("button", name="Sync Now").click()
        expect(page.locator("#corpus-sync-modal")).to_be_visible()

        page.get_by_role("button", name="Keep Local and Push").click()

        expect(page.locator("#unsynced-banner")).not_to_be_visible()
        expect(page.locator("#home-sync-status")).to_contain_text("Synced corpus")
        assert mock.put_payloads, "Expected the mocked GitHub endpoint to receive a PUT request."
        pushed_content = base64.b64decode(mock.put_payloads[-1]["content"]).decode("utf-8")
        assert "I changed this sentence." in pushed_content
    finally:
        context.close()


def test_review_search_filters_by_sentence_and_translation(browser, app_server):
    context = browser.new_context(viewport={"width": 1280, "height": 960})
    page = open_authenticated_app(context, app_server)
    try:
        page.get_by_role("button", name="Review & Edit Sentences").click()
        wait_for_screen(page, "review-screen")

        search = page.locator("#review-search-input")
        search.fill("imagination")

        expect(page.locator("#review-summary")).to_contain_text('1 sentence match "imagination".')
        expect(page.locator(".sentence-row")).to_have_count(1)
        expect(page.locator('.sentence-row[data-id="10"] .edit-english')).to_have_value(
            "That is nothing but your imagination."
        )

        search.fill("免許証")

        expect(page.locator("#review-summary")).to_contain_text('1 sentence match "免許証".')
        expect(page.locator(".sentence-row")).to_have_count(1)
        expect(page.locator('.sentence-row[data-id="8"] .edit-primary')).to_have_value("免許証を拝見できますか。")

        search.fill("彼は病気を理由に会議を出席しませんでした")

        expect(page.locator("#review-summary")).to_contain_text(
            '1 sentence match "彼は病気を理由に会議を出席しませんでした".'
        )
        expect(page.locator(".sentence-row")).to_have_count(1)
        expect(page.locator('.sentence-row[data-id="19"] .edit-english')).to_have_value(
            "He did not attend the meeting due to illness."
        )

        search.fill("imagination license")

        expect(page.locator("#review-summary")).to_contain_text('2 sentences match "imagination license".')
        expect(page.locator(".sentence-row")).to_have_count(2)
        expect(page.locator('.sentence-row[data-id="10"] .edit-english')).to_have_value(
            "That is nothing but your imagination."
        )
        expect(page.locator('.sentence-row[data-id="8"] .edit-primary')).to_have_value("免許証を拝見できますか。")

        search.fill("astronaut nebula")

        expect(page.locator("#review-summary")).to_contain_text('0 sentences match "astronaut nebula".')
        expect(page.locator(".review-empty")).to_contain_text("No sentences match this search.")
        expect(page.locator(".sentence-row")).to_have_count(0)
    finally:
        context.close()
