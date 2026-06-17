.PHONY: test-e2e

test-e2e:
	@if [ -z "$$(find .playwright-browsers -maxdepth 1 -type d -name 'firefox-*' -print -quit)" ]; then \
		PLAYWRIGHT_BROWSERS_PATH=.playwright-browsers uv run python -m playwright install firefox; \
	fi
	PLAYWRIGHT_BROWSERS_PATH=.playwright-browsers uv run pytest
