.PHONY: test-e2e

test-e2e:
	@if browser="$$(find .playwright-browsers -maxdepth 1 -type d -name 'firefox-*' -print -quit 2>/dev/null)"; [ -z "$$browser" ]; then \
		printf "%s" "Firefox is not installed for Playwright. Install it now with 'uv run python -m playwright install firefox'? [y/N] "; \
		read -r answer; \
		case "$$answer" in \
			[yY]|[yY][eE][sS]) PLAYWRIGHT_BROWSERS_PATH=.playwright-browsers uv run python -m playwright install firefox ;; \
			*) echo "Skipping install. Re-run with Firefox installed to run e2e tests."; exit 1 ;; \
		esac; \
	fi
	PLAYWRIGHT_BROWSERS_PATH=.playwright-browsers uv run pytest
