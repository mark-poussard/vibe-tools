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

export function startPractice() {
    normalizeProgress();
    normalizeOrder();

    state.practiceQueue = state.sentenceOrder.map((id) => ({
        id,
        ...state.sentencesMap[id],
    }));

    if (state.practiceQueue.length === 0) {
        alert('No sentences available to practice!');
        return;
    }

    showScreen('practice-screen');
    loadNextPracticeSentence();
}

export function loadNextPracticeSentence() {
    const feedback = document.getElementById('practice-feedback');
    const input = document.getElementById('practice-input');

    state.isRetryState = false;
    state.originalScoreBeforeRetry = null;
    state.lastIncorrectInput = '';

    feedback.innerHTML = '';
    feedback.className = '';
    input.value = '';
    input.disabled = false;
    setPracticeButtons({ submit: true, next: false, override: false, forgive: false });

    if (state.practiceQueue.length === 0) {
        document.getElementById('practice-english').textContent = '🎉 All done! You cleared all sentences.';
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
    const submitBtn = document.getElementById('submit-btn');
    const nextBtn = document.getElementById('next-btn');

    if (isCorrect) {
        if (!state.isRetryState) {
            state.sentenceProgress[state.currentPracticeItem.id].score += 1;
            saveProgress();
        }

        feedback.textContent = 'Correct!';
        feedback.className = 'text-success';

        const item = state.practiceQueue.shift();
        const score = state.sentenceProgress[item.id].score;
        const insertPos = Math.pow(2, score + 1);
        state.practiceQueue.splice(insertPos, 0, item);

        state.sentenceOrder = state.practiceQueue.map((entry) => entry.id);
        saveOrder();

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

    const item = state.practiceQueue.shift();
    const score = state.sentenceProgress[item.id].score;
    const insertPos = Math.pow(2, score + 1);
    state.practiceQueue.splice(insertPos, 0, item);
    state.sentenceOrder = state.practiceQueue.map((entry) => entry.id);
    saveOrder();

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

    const item = state.practiceQueue.shift();
    const newScore = state.sentenceProgress[id].score;
    const insertPos = Math.pow(2, newScore + 1);
    state.practiceQueue.splice(insertPos, 0, item);
    state.sentenceOrder = state.practiceQueue.map((entry) => entry.id);
    saveOrder();

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

