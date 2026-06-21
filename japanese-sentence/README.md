# Japanese Sentence Practice

## Overview

`japanese-sentence` is a static single-page web app for practicing written Japanese.
It runs entirely in the browser with plain HTML, CSS, and JavaScript. There is no
bundler or frontend framework.

The app has four main screens:

1. Initial GitHub configuration
2. Home
3. Sentence practice
4. Sentence review and editing

It also includes an optional AI generation screen for creating sentence
suggestions from a Japanese word or phrase.

The sentence corpus is editable in the browser and can be synced back to a GitHub
repository.

## How It Works

The app boots from `index.html`, which loads `main.js` as a module.
`main.js` initializes shared state, decides whether to show the config screen or
home screen, registers the service worker, and exposes the UI handlers on `window`
because the HTML uses inline `onclick` attributes.

The UI is split across a few small modules:

- `ui.js` handles screen switching and config modal behavior
- `practice.js` drives sentence practice, word search practice, scoring, and answer handling
- `generate.js` drives AI sentence generation and corpus insertion
- `review.js` renders the editable sentence list and local mutations
- `sync.js` handles GitHub fetch/push flow for the corpus file
- `state.js` stores the shared client-side state and persistence helpers
- `ai.js` contains AI provider configuration and Gemini request helpers
- `utils.js` provides corpus hashing, normalization, cloning, and diff helpers

## Data Model

Sentences live in `sentences-data.js` as a global map of:

```js
<id, { english, primaryJapanese, alternates }>
```

That file also exports corpus metadata:

- `seedSentencesMap`
- `seedCorpusMetadata`

The corpus block is wrapped in `/* DATA_START */` and `/* DATA_END */` markers so
`sync.js` can replace just the data portion when pushing changes to GitHub.

## Practice Flow

Practice sessions build a queue from the current sentence ordering stored in state.
The user is shown the English sentence and types the Japanese translation.

Notable behavior:

- Punctuation and spacing are normalized away for answer checking
- Alternate Japanese translations are accepted
- Incorrect answers show a color-coded diff of expected vs actual text
- After an incorrect answer, the user can confirm the response as a new alternate
- Sentences are reinserted into the queue after study so they can reappear later in
  the same session

There is also a "word practice" mode that searches the corpus by English, Japanese,
or kanji before starting a focused practice session.

## Review And Editing

The review screen renders the full corpus as editable rows.
Users can:

- Edit English text
- Edit the primary Japanese translation
- Edit alternate translations as a pipe-separated list
- Add new sentences
- Delete sentences
- Search the corpus before editing

Edits are kept in memory and marked as unsynced until the user pushes them to GitHub.

## AI Sentence Generation

The home screen includes a `Generate sentences` action.
That screen accepts a Japanese word or phrase and, when a Gemini API key is
configured, requests AI-generated sentence suggestions with English translations.

Generated results can be selected individually and added to the corpus. Those new
sentences become part of the in-memory corpus immediately and are included in the
existing GitHub sync flow.

AI provider settings are stored separately from the GitHub settings so the design
can grow to support more providers later without changing the rest of the app.

## GitHub Sync

Sync uses the GitHub Contents API against the configured repository and file path.
The user supplies:

- A GitHub personal access token
- A repository in `owner/repo` form
- The remote path to the corpus file

The sync flow works like this:

1. Fetch the remote corpus file
2. Decode the base64 response
3. Extract the sentence map from the exported corpus block
4. Compare corpus versions
5. If versions differ, prompt the user to keep local or pull remote
6. If versions match, push the local in-memory corpus back to GitHub

Corpus versioning is deterministic and computed from a stable stringification of
the sentence map using an FNV-1a hash.

## Persistence

The app uses `localStorage` for:

- GitHub token
- GitHub repo
- GitHub file path
- AI provider configs
- Sentence progress
- Sentence ordering

`state.js` normalizes persisted state against the current corpus so missing sentences
get initialized and stale entries are dropped.

## Offline And App Shell

`sw.js` registers a service worker that caches the app shell and core assets for
offline use.

The current manifest and service worker are configured for this workspace path:

- `/vibe-tools/japanese-sentence/`

That is worth keeping in mind if the app is moved or hosted under a different base
URL.

## Testing

End-to-end tests live under `tests/e2e/` and use Playwright with Firefox.

The test harness:

- Serves the project as static files from a local HTTP server
- Seeds authenticated localStorage state
- Mocks the GitHub Contents API
- Verifies config persistence, practice flow, override behavior, review editing,
  sync, and search

The `Makefile` provides a `test-e2e` target that installs Firefox if needed and then
runs `pytest`.

## Notable Technical Details

- The app is framework-free and relies on DOM APIs directly
- Global `window` bindings are used to support inline event handlers in `index.html`
- `generateDiffHTML` in `utils.js` produces the color-coded incorrect-answer display
- `review.js` mutates the in-memory corpus directly and then marks it unsynced
- `sync.js` keeps a pending local-vs-remote reconciliation payload when versions differ
- `manifest.json` turns the app into an installable PWA-style experience
