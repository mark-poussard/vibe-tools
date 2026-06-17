import { refreshCorpusMetadata, state, markUnsynced, normalizeOrder, normalizeProgress, saveOrder, saveProgress } from './state.js';
import { escapeHtml, generateDiffHTML, normalizeString } from './utils.js';
import { showScreen } from './ui.js';

function updateScoreDisplay(score) {
    const scoreEl = document.getElementById('current-score');
    scoreEl.textContent = String(score);
    const hue = Math.min(score * 12, 120);
    scoreEl.style.backgroundColor = `hsl(${hue}, 70%, 50%)`;
}

function setPracticeButtons({ submit, next, override, forgive }) {
    document.getElementById('submit-btn').style.display = submit ? 'inline-block' : 'none';
    document.getElementById('next-btn').style.display = next ? 'inline-block' : 'none';
    document.getElementById('override-btn').style.display = override ? 'inline-block' : 'none';
    document.getElementById('forgive-btn').style.display = forgive ? 'inline-block' : 'none';
}

function isWordPracticeSession() {
    return Array.isArray(state.practiceSessionIds) && state.practiceSessionIds.length > 0;
}

function updatePracticeSessionLabel() {
    const labelEl = document.getElementById('practice-session-label');
    if (labelEl) {
        labelEl.textContent = state.practiceSessionLabel || '';
    }
}

function buildPracticeQueue(sentenceIds = null) {
    const allowedIds = Array.isArray(sentenceIds) ? new Set(sentenceIds) : null;
    return state.sentenceOrder
        .filter((id) => state.sentencesMap[id] && (!allowedIds || allowedIds.has(id)))
        .map((id) => ({ id, ...state.sentencesMap[id] }));
}

function requeueCurrentPracticeItem() {
    if (state.practiceQueue.length === 0) return null;

    const item = state.practiceQueue.shift();
    const score = state.sentenceProgress[item.id].score;
    const insertPos = Math.pow(2, score + 1);
    state.practiceQueue.splice(insertPos, 0, item);

    if (!isWordPracticeSession()) {
        state.sentenceOrder = state.practiceQueue.map((entry) => entry.id);
        saveOrder();
    }

    return item;
}

function getEmptyPracticeMessage() {
    return isWordPracticeSession()
        ? 'No sentences matched that word or kanji.'
        : 'No sentences available to practice!';
}

function getSessionCompleteMessage() {
    return isWordPracticeSession()
        ? '🎉 All done! You cleared this word practice set.'
        : '🎉 All done! You cleared all sentences.';
}

function getWordPracticeMatchFields(data, normalizedQuery) {
    const matchedFields = [];

    if (normalizeString(data.english).includes(normalizedQuery)) {
        matchedFields.push('English');
    }

    if (normalizeString(data.primaryJapanese).includes(normalizedQuery)) {
        matchedFields.push('Primary Japanese');
    }

    if ((data.alternates || []).some((alternate) => normalizeString(alternate).includes(normalizedQuery))) {
        matchedFields.push('Alternate translations');
    }

    return matchedFields;
}

function escapeRegExp(value) {
    return value.replace(/[.*+?^\${}()|[\]\\]/g, "\\$&");
}

function highlightText(text, query) {
    const safeText = escapeHtml(text);
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return safeText;

    const regex = new RegExp(escapeRegExp(trimmedQuery), 'ig');
    return safeText.replace(regex, (match) => `<mark class="word-practice-highlight">${match}</mark>`);
}

function buildWordPracticeMatches(query) {
    const normalizedQuery = normalizeString(query);
    if (!normalizedQuery) return [];

    const orderedIds = state.sentenceOrder.filter((id) => state.sentencesMap[id]);
    const ids = orderedIds.length > 0 ? orderedIds : Object.keys(state.sentencesMap);

    return ids
        .map((id) => {
            const data = state.sentencesMap[id];
            if (!data) return null;

            const matchedFields = getWordPracticeMatchFields(data, normalizedQuery);
            if (matchedFields.length === 0) return null;

            return {
                id,
                english: data.english,
                primaryJapanese: data.primaryJapanese,
                alternates: data.alternates || [],
                matchedFields,
            };
        })
        .filter(Boolean);
}

export function renderWordPracticeResults(matches = state.wordPracticeMatches, query = state.wordPracticeQuery) {
    const summary = document.getElementById('word-practice-summary');
    const container = document.getElementById('word-practice-results');
    const startButton = document.getElementById('start-word-practice-btn');

    if (!summary || !container) return;

    if (!query) {
        summary.textContent = 'Search by English, Japanese, or kanji to review matching sentences before starting practice.';
        container.innerHTML = '';
        if (startButton) startButton.disabled = true;
        return;
    }

    if (matches.length === 0) {
        summary.textContent = `No sentences matched "${query}".`;
        container.innerHTML = '<div class="word-practice-empty">Try another word or kanji.</div>';
        if (startButton) startButton.disabled = true;
        return;
    }

    summary.textContent = `${matches.length} sentence${matches.length === 1 ? '' : 's'} match "${query}". Review the sentences and translations below, then start practice.`;
    container.innerHTML = matches.map((match) => `
        <div class="word-practice-result">
            <div class="word-practice-result-top">
                <div class="word-practice-result-id">Sentence ${escapeHtml(match.id)}</div>
                <div class="word-practice-result-match">Matched in: ${escapeHtml(match.matchedFields.join(', '))}</div>
            </div>
            <div class="word-practice-result-fields">
                <div><strong>English:</strong> ${highlightText(match.english, query)}</div>
                <div><strong>Primary Japanese:</strong> ${highlightText(match.primaryJapanese, query)}</div>
                <div><strong>Alternates:</strong> ${highlightText(match.alternates.length ? match.alternates.join(' | ') : 'None', query)}</div>
            </div>
        </div>
    `).join('');

    if (startButton) startButton.disabled = false;
}

export function openWordPractice() {
    state.wordPracticeQuery = '';
    state.wordPracticeMatches = [];
    showScreen('word-practice-screen');
    renderWordPracticeResults([], '');

    const input = document.getElementById('word-practice-input');
    if (input) {
        input.value = '';
        setTimeout(() => input.focus(), 10);
    }
}

export function searchWordPractice() {
    const input = document.getElementById('word-practice-input');
    if (!input) return;

    const query = input.value.trim();
    state.wordPracticeQuery = query;
    state.wordPracticeMatches = query ? buildWordPracticeMatches(query) : [];
    renderWordPracticeResults(state.wordPracticeMatches, query);
}

export function handleWordPracticeEnter(event) {
    if (event.key !== 'Enter') return;
    searchWordPractice();
}

export function startSelectedWordPractice() {
    if (!state.wordPracticeMatches.length) {
        alert('Search for a word or kanji first.');
        return;
    }

    startPractice(
        state.wordPracticeMatches.map((match) => match.id),
        `Word practice: ${state.wordPracticeQuery}`,
    );
}

export function startPractice(sentenceIds = null, practiceLabel = '') {
    normalizeProgress();
    normalizeOrder();

    state.practiceSessionIds = Array.isArray(sentenceIds) ? [...sentenceIds] : null;
    state.practiceSessionLabel = practiceLabel || (isWordPracticeSession() ? 'Word practice' : 'Sentence practice');
    state.practiceQueue = buildPracticeQueue(state.practiceSessionIds);

    if (state.practiceQueue.length === 0) {
        state.practiceSessionIds = null;
        state.practiceSessionLabel = '';
        state.practiceQueue = [];
        alert(getEmptyPracticeMessage());
        return;
    }

    showScreen('practice-screen');
    updatePracticeSessionLabel();
    loadNextPracticeSentence();
}

export function loadNextPracticeSentence() {
    const feedback = document.getElementById('practice-feedback');
    const input = document.getElementById('practice-input');

    updatePracticeSessionLabel();
    state.isRetryState = false;
    state.originalScoreBeforeRetry = null;
    state.lastIncorrectInput = '';

    feedback.innerHTML = '';
    feedback.className = '';
    input.value = '';
    input.disabled = false;
    setPracticeButtons({ submit: true, next: false, override: false, forgive: false });

    if (state.practiceQueue.length === 0) {
        document.getElementById('practice-english').textContent = getSessionCompleteMessage();
        document.getElementById('current-score').textContent = '-';
        document.getElementById('current-score').style.backgroundColor = '#ccc';
        input.disabled = true;
        setPracticeButtons({ submit: false, next: false, override: false, forgive: false });
        return;
    }

    state.currentPracticeItem = state.practiceQueue[0];
    document.getElementById('practice-english').textContent = state.currentPracticeItem.english;
    updateScoreDisplay(state.sentenceProgress[state.currentPracticeItem.id].score);

    setTimeout(() => input.focus(), 10);
}

export function handlePracticeEnter(event) {
    if (event.key !== 'Enter') return;
    if (document.getElementById('next-btn').style.display === 'inline-block') {
        loadNextPracticeSentence();
    } else {
        checkAnswer();
    }
}

export function checkAnswer() {
    if (state.practiceQueue.length === 0) return;

    const inputElement = document.getElementById('practice-input');
    const input = inputElement.value.trim();
    if (!input) return;

    const normalizedInput = normalizeString(input);
    const normalizedPrimary = normalizeString(state.currentPracticeItem.primaryJapanese);
    const normalizedAlternates = state.currentPracticeItem.alternates.map(normalizeString);
    const isCorrect = normalizedInput === normalizedPrimary || normalizedAlternates.includes(normalizedInput);

    const feedback = document.getElementById('practice-feedback');
    const nextBtn = document.getElementById('next-btn');

    if (isCorrect) {
        if (!state.isRetryState) {
            state.sentenceProgress[state.currentPracticeItem.id].score += 1;
            saveProgress();
        }

        feedback.textContent = 'Correct!';
        feedback.className = 'text-success';

        requeueCurrentPracticeItem();
        inputElement.disabled = true;
        setPracticeButtons({ submit: false, next: true, override: false, forgive: false });
        nextBtn.focus();
    } else {
        if (!state.isRetryState) {
            state.originalScoreBeforeRetry = state.sentenceProgress[state.currentPracticeItem.id].score;
            const currentScore = state.sentenceProgress[state.currentPracticeItem.id].score;
            state.sentenceProgress[state.currentPracticeItem.id].score = currentScore > 2 ? 2 : 0;
            saveProgress();
            state.lastIncorrectInput = input;
            state.isRetryState = true;
            setPracticeButtons({ submit: true, next: false, override: true, forgive: true });
        }

        const diff = generateDiffHTML(state.currentPracticeItem.primaryJapanese, input);
        feedback.innerHTML = `
            <span class="text-error">Incorrect.</span><br>
            <span style="color: var(--text);">Your answer:</span> ${diff.actualHTML}<br>
            <span style="color: var(--text);">Expected answer:</span> ${diff.expectedHTML}
        `;
        feedback.className = '';
        inputElement.value = '';
        inputElement.focus();
    }
}

export function overrideAnswer() {
    document.getElementById('modal-eng').innerHTML = escapeHtml(state.currentPracticeItem.english);
    document.getElementById('modal-pri').innerHTML = escapeHtml(state.currentPracticeItem.primaryJapanese);
    document.getElementById('modal-new-alt').innerHTML = escapeHtml(state.lastIncorrectInput);
    document.getElementById('override-modal').style.display = 'flex';
}

export function closeOverrideModal() {
    document.getElementById('override-modal').style.display = 'none';
}

export function confirmOverride() {
    const id = state.currentPracticeItem.id;

    if (state.originalScoreBeforeRetry !== null) {
        state.sentenceProgress[id].score = state.originalScoreBeforeRetry + 1;
        saveProgress();
    }

    state.sentencesMap[id].alternates.push(state.lastIncorrectInput);
    refreshCorpusMetadata();
    markUnsynced();

    requeueCurrentPracticeItem();

    document.getElementById('practice-feedback').textContent = 'Correct (Added as alternate)!';
    document.getElementById('practice-feedback').className = 'text-success';
    document.getElementById('practice-input').disabled = true;
    setPracticeButtons({ submit: false, next: true, override: false, forgive: false });
    document.getElementById('next-btn').focus();
    closeOverrideModal();
}

export function openSkipModal() {
    if (state.practiceQueue.length === 0) return;
    document.getElementById('skip-modal').style.display = 'flex';
}

export function closeSkipModal() {
    document.getElementById('skip-modal').style.display = 'none';
}

export function skipSentence(scoreChange) {
    if (state.practiceQueue.length === 0) return;

    const id = state.currentPracticeItem.id;
    if (scoreChange > 0) {
        state.sentenceProgress[id].score += scoreChange;
        saveProgress();
    }

    requeueCurrentPracticeItem();
    closeSkipModal();
    loadNextPracticeSentence();
}

export function forgiveMistake() {
    if (!state.isRetryState || state.originalScoreBeforeRetry === null) return;

    state.sentenceProgress[state.currentPracticeItem.id].score = state.originalScoreBeforeRetry;
    saveProgress();
    document.getElementById('forgive-btn').style.display = 'none';
    updateScoreDisplay(state.sentenceProgress[state.currentPracticeItem.id].score);
}
