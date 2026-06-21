import { generateGeminiSentences, hasConfiguredProvider } from './ai.js';
import { refreshCorpusMetadata, state, markUnsynced, normalizeOrder, normalizeProgress } from './state.js';
import { escapeHtml, normalizeString } from './utils.js';
import { renderReviewList } from './review.js';
import { showScreen, updateUnsyncedBanner } from './ui.js';

function getGenerateStatusElement() {
    return document.getElementById('generate-status');
}

function setGenerateStatus(message, tone = 'neutral') {
    const status = getGenerateStatusElement();
    if (!status) return;

    status.textContent = message;
    status.className = tone === 'error' ? 'text-error generate-status' : 'generate-status';
    state.generatedSentenceStatus = message;
}

function buildGeneratedCandidate(candidate) {
    return {
        japanese: String(candidate.japanese || '').trim(),
        english: String(candidate.english || '').trim(),
        selected: true,
        added: false,
        duplicate: false,
    };
}

function renderGeneratedSentenceCard(candidate, index) {
    const statusLabel = candidate.added
        ? '<span class="generated-sentence-badge generated-sentence-badge-added">Added</span>'
        : candidate.duplicate
            ? '<span class="generated-sentence-badge">Already in corpus</span>'
            : '';

    const checkboxDisabled = candidate.added || candidate.duplicate ? 'disabled' : '';
    const checkboxChecked = candidate.selected && !candidate.added && !candidate.duplicate ? 'checked' : '';

    return `
        <div class="generated-sentence-card ${candidate.added ? 'is-added' : ''}">
            <div class="generated-sentence-card-top">
                <label class="generated-sentence-select">
                    <input
                        type="checkbox"
                        ${checkboxChecked}
                        ${checkboxDisabled}
                        onchange="toggleGeneratedSentenceSelection(${index}, this.checked)"
                    >
                    <span>Select</span>
                </label>
                ${statusLabel}
            </div>
            <div class="generated-sentence-japanese">${escapeHtml(candidate.japanese)}</div>
            <div class="generated-sentence-english">${escapeHtml(candidate.english)}</div>
        </div>
    `;
}

function getExistingGeneratedSentencePairs() {
    return (state.generatedSentenceCandidates || [])
        .filter((candidate) => !candidate.added)
        .map((candidate) => ({ japanese: candidate.japanese, english: candidate.english }));
}

export function updateGenerateAiNotice() {
    const notice = document.getElementById('generate-ai-notice');
    if (!notice) return;

    if (hasConfiguredProvider('gemini')) {
        notice.style.display = 'none';
        return;
    }

    notice.style.display = 'flex';
    notice.querySelector('.generate-ai-notice-text').textContent = 'AI generation is optional. Add a Gemini API key in Config to unlock sentence generation.';
}

export function renderGeneratedSentenceResults() {
    const container = document.getElementById('generated-sentence-results');
    const summary = document.getElementById('generated-sentence-summary');
    const addButton = document.getElementById('add-generated-sentences-btn');

    if (!container || !summary) return;

    const candidates = state.generatedSentenceCandidates || [];
    const selectedCount = candidates.filter((candidate) => candidate.selected && !candidate.added && !candidate.duplicate).length;

    if (!state.generatedSentenceWord) {
        summary.textContent = 'Enter a Japanese word or phrase, then generate study sentences.';
        container.innerHTML = '';
        if (addButton) addButton.disabled = true;
        return;
    }

    if (candidates.length === 0) {
        summary.textContent = `No generated sentences yet for "${state.generatedSentenceWord}".`;
        container.innerHTML = '';
        if (addButton) addButton.disabled = true;
        return;
    }

    summary.textContent = `${candidates.length} generated sentence${candidates.length === 1 ? '' : 's'} for "${state.generatedSentenceWord}". ${selectedCount} selected.`;
    container.innerHTML = candidates.map((candidate, index) => renderGeneratedSentenceCard(candidate, index)).join('');

    if (addButton) {
        addButton.disabled = selectedCount === 0;
    }
}

export function openGenerateSentences() {
    showScreen('generate-sentences-screen');
    updateGenerateAiNotice();
    renderGeneratedSentenceResults();

    const input = document.getElementById('generate-word-input');
    if (input) {
        input.value = state.generatedSentenceWord || '';
        setTimeout(() => input.focus(), 10);
    }
}

export function handleGenerateSentenceEnter(event) {
    if (event.key !== 'Enter') return;
    generateSentences();
}

export function toggleGeneratedSentenceSelection(index, selected) {
    const candidate = state.generatedSentenceCandidates?.[index];
    if (!candidate || candidate.added || candidate.duplicate) return;

    candidate.selected = Boolean(selected);
    renderGeneratedSentenceResults();
}

function hydrateGeneratedCandidates(sentences, existingCandidates = []) {
    const seenKeys = new Set(
        Object.values(state.sentencesMap).map((entry) => `${normalizeString(entry.english)}::${normalizeString(entry.primaryJapanese)}`),
    );
    existingCandidates.forEach((candidate) => {
        seenKeys.add(sentenceKey(candidate));
    });

    const nextCandidates = sentences.map((sentence) => {
        const candidate = buildGeneratedCandidate(sentence);
        const key = sentenceKey(candidate);
        candidate.duplicate = seenKeys.has(key);
        candidate.selected = !candidate.duplicate;
        seenKeys.add(key);
        return candidate;
    });

    return nextCandidates;
}

export async function generateSentences(appendExisting = false) {
    const input = document.getElementById('generate-word-input');
    if (!input) return;

    const word = input.value.trim();
    if (!word) {
        alert('Enter a Japanese word or phrase first.');
        return;
    }

    const shouldAppend = appendExisting && state.generatedSentenceWord === word && state.generatedSentenceCandidates.length > 0;
    if (!shouldAppend) {
        state.generatedSentenceWord = word;
        state.generatedSentenceCandidates = [];
    }

    const existingCandidates = getExistingGeneratedSentencePairs();
    const promptLabel = shouldAppend ? 'Generating 5 more sentences...' : 'Generating 5 sentences...';
    setGenerateStatus(promptLabel);
    renderGeneratedSentenceResults();

    try {
        const sentences = await generateGeminiSentences(word, {
            count: 5,
            excludedSentences: existingCandidates,
        });
        const newCandidates = hydrateGeneratedCandidates(sentences, existingCandidates);
        state.generatedSentenceCandidates = shouldAppend
            ? [...state.generatedSentenceCandidates, ...newCandidates]
            : newCandidates;

        const newCount = newCandidates.filter((candidate) => !candidate.duplicate).length;
        setGenerateStatus(
            `${shouldAppend ? 'Generated more.' : 'Generated'} ${newCount} new sentence${newCount === 1 ? '' : 's'} for "${word}".`,
        );
        renderGeneratedSentenceResults();
    } catch (error) {
        console.error(error);
        setGenerateStatus(error.message, 'error');
    }
}

function sentenceKey(sentence) {
    return `${normalizeString(sentence.english)}::${normalizeString(sentence.japanese)}`;
}

function addCandidateToCorpus(candidate) {
    const nextId = `generated-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    state.sentencesMap[nextId] = {
        english: candidate.english,
        primaryJapanese: candidate.japanese,
        alternates: [],
    };

    state.sentenceProgress[nextId] = { score: 0 };
    state.sentenceOrder.unshift(nextId);

    refreshCorpusMetadata();
    normalizeProgress(false);
    normalizeOrder(false);
    markUnsynced();
}

export function addSelectedGeneratedSentences() {
    const selected = (state.generatedSentenceCandidates || []).filter((candidate) => candidate.selected && !candidate.added && !candidate.duplicate);

    if (selected.length === 0) {
        alert('Select one or more generated sentences to add.');
        return;
    }

    const existingKeys = new Set(
        Object.values(state.sentencesMap).map((entry) => `${normalizeString(entry.english)}::${normalizeString(entry.primaryJapanese)}`),
    );

    let addedCount = 0;
    let skippedCount = 0;

    selected.forEach((candidate) => {
        const key = sentenceKey(candidate);
        if (existingKeys.has(key)) {
            candidate.duplicate = true;
            candidate.selected = false;
            skippedCount += 1;
            return;
        }

        addCandidateToCorpus(candidate);
        existingKeys.add(key);
        candidate.added = true;
        candidate.selected = false;
        addedCount += 1;
    });

    if (document.getElementById('review-screen')?.classList.contains('active')) {
        renderReviewList();
    }

    updateUnsyncedBanner();

    if (addedCount > 0 && skippedCount > 0) {
        setGenerateStatus(`Added ${addedCount} sentence${addedCount === 1 ? '' : 's'} to the corpus. ${skippedCount} duplicate${skippedCount === 1 ? '' : 's'} skipped.`);
    } else if (addedCount > 0) {
        setGenerateStatus(`Added ${addedCount} sentence${addedCount === 1 ? '' : 's'} to the corpus.`);
    } else {
        setGenerateStatus('No new sentences were added.');
    }

    renderGeneratedSentenceResults();
}
