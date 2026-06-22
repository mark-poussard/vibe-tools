from __future__ import annotations

import base64
import json
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


def install_mock_gemini(context):
    requests: list[dict] = []
    responses = [
        [
            {
                "japanese": "猫が窓辺で眠っている。",
                "english": "The cat is sleeping by the window.",
            },
            {
                "japanese": "猫は静かに背伸びをした。",
                "english": "The cat quietly stretched.",
            },
            {
                "japanese": "その猫は庭をゆっくり歩いた。",
                "english": "That cat walked slowly through the garden.",
            },
            {
                "japanese": "子猫が毛布の上で丸くなった。",
                "english": "The kitten curled up on the blanket.",
            },
            {
                "japanese": "黒い猫が月明かりの下に座っていた。",
                "english": "The black cat was sitting under the moonlight.",
            },
        ],
        [
            {
                "japanese": "猫は台所の椅子の下に隠れた。",
                "english": "The cat hid under the kitchen chair.",
            },
            {
                "japanese": "猫の目が暗闇で光った。",
                "english": "The cat's eyes shone in the dark.",
            },
            {
                "japanese": "その猫は魚の匂いに気づいた。",
                "english": "That cat noticed the smell of fish.",
            },
            {
                "japanese": "白い猫が窓の外をじっと見ていた。",
                "english": "The white cat was staring out the window.",
            },
            {
                "japanese": "猫は暖かい日差しの中であくびをした。",
                "english": "The cat yawned in the warm sunlight.",
            },
        ],
    ]
    response_index = 0

    def handler(route) -> None:
        nonlocal response_index
        request = route.request
        payload = json.loads(request.post_data or "{}")
        requests.append(payload)

        next_sentences = responses[min(response_index, len(responses) - 1)]
        response_index += 1
        route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps(
                {
                    "candidates": [
                        {
                            "content": {
                                "parts": [
                                    {
                                        "text": json.dumps({"sentences": next_sentences}, ensure_ascii=False),
                                    }
                                ]
                            }
                        }
                    ]
                }
            ),
        )

    context.route("**/generativelanguage.googleapis.com/**", handler)
    return requests


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


def test_reveal_marks_sentence_incorrect(browser, app_server):
    context = browser.new_context(viewport={"width": 1280, "height": 960})
    page = open_authenticated_app(context, app_server)
    try:
        page.get_by_role("button", name="Word Practice").click()
        page.get_by_label("Search word or kanji").fill("imagination")
        page.get_by_role("button", name="Search").click()
        page.get_by_role("button", name="Start Practice").click()
        wait_for_screen(page, "practice-screen")

        page.get_by_role("button", name="Reveal").click()

        expect(page.locator("#practice-feedback")).to_contain_text("Incorrect.")
        expect(page.locator("#practice-input")).to_have_value("")
        expect(page.locator("#current-score")).to_contain_text("0")
        expect(page.get_by_role("button", name="I was right (Add as alternate)")).to_be_visible()
        expect(page.get_by_role("button", name="No Penalty")).to_be_visible()
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

        page.get_by_role("button", name="Back to Home").first.click()
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


def test_generate_sentences_adds_ai_results_to_corpus(browser, app_server):
    context = browser.new_context(viewport={"width": 1280, "height": 960})
    seed_authenticated_context(
        context,
        ai_provider_configs={"gemini": {"apiKey": "test-gemini-key"}},
    )
    gemini_requests = install_mock_gemini(context)
    page = context.new_page()
    try:
        page.goto(app_server, wait_until="domcontentloaded")
        wait_for_screen(page, "home-screen")

        page.get_by_role("button", name="Generate sentences").click()
        wait_for_screen(page, "generate-sentences-screen")

        page.get_by_label("Japanese word or phrase").fill("猫")
        page.get_by_role("button", name="Generate", exact=True).click()

        expect(page.locator("#generated-sentence-summary")).to_contain_text('5 generated sentences for "猫".')
        expect(page.locator(".generated-sentence-card")).to_have_count(5)

        page.get_by_role("button", name="Generate more").click()

        expect(page.locator("#generated-sentence-summary")).to_contain_text('10 generated sentences for "猫".')
        expect(page.locator(".generated-sentence-card")).to_have_count(10)

        page.get_by_role("button", name="Add selected to corpus").click()

        expect(page.locator("#generate-status")).to_contain_text("Added 10 sentences to the corpus.")

        page.get_by_role("button", name="Back to Home").first.click()
        wait_for_screen(page, "home-screen")
        expect(page.locator("#unsynced-banner")).to_be_visible()

        page.get_by_role("button", name="Review & Edit Sentences").click()
        wait_for_screen(page, "review-screen")

        search = page.locator("#review-search-input")
        search.fill("窓辺で眠っている")

        expect(page.locator("#review-summary")).to_contain_text(
            '1 sentence match "窓辺で眠っている".'
        )
        expect(page.locator(".sentence-row")).to_have_count(1)
        expect(page.locator(".sentence-row .edit-english")).to_have_value(
            "The cat is sleeping by the window."
        )

        first_request = gemini_requests[0]
        assert first_request["generationConfig"]["responseMimeType"] == "application/json"
        assert first_request["generationConfig"]["responseSchema"]["properties"]["sentences"]["minItems"] == 5
        assert "Create exactly 5 different natural Japanese example sentences" in first_request["contents"][0]["parts"][0]["text"]
        assert "Do not repeat or closely paraphrase" in gemini_requests[1]["contents"][0]["parts"][0]["text"]
        assert len(gemini_requests) == 2
        assert "猫" in json.dumps(gemini_requests[0], ensure_ascii=False)
    finally:
        context.close()
