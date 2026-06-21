import { buildCorpusMetadata, cloneJson } from './utils.js';
import { seedCorpusMetadata, seedSentencesMap } from './sentences-data.js';

const STORAGE_KEYS = {
    progress: 'sentenceProgress',
    order: 'sentenceOrder',
    aiProviderConfigs: 'aiProviderConfigs',
};

function readJson(key, fallback) {
    if (typeof localStorage === 'undefined') return cloneJson(fallback);
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : cloneJson(fallback);
    } catch {
        return cloneJson(fallback);
    }
}

function writeJson(key, value) {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(value));
}

export const state = {
    sentencesMap: cloneJson(seedSentencesMap),
    sentenceProgress: {},
    sentenceOrder: [],
    aiProviderConfigs: {},
    practiceQueue: [],
    currentPracticeItem: null,
    practiceSessionIds: null,
    practiceSessionLabel: '',
    isRetryState: false,
    originalScoreBeforeRetry: null,
    lastIncorrectInput: '',
    hasUnsyncedChanges: false,
    corpusMetadata: cloneJson(seedCorpusMetadata),
    wordPracticeQuery: '',
    wordPracticeMatches: [],
    reviewSearchQuery: '',
    generatedSentenceWord: '',
    generatedSentenceCandidates: [],
    generatedSentenceStatus: '',
};

export function initializeState() {
    state.sentencesMap = cloneJson(seedSentencesMap);
    state.sentenceProgress = readJson(STORAGE_KEYS.progress, {});
    state.sentenceOrder = readJson(STORAGE_KEYS.order, []);
    state.aiProviderConfigs = readJson(STORAGE_KEYS.aiProviderConfigs, {});
    state.practiceQueue = [];
    state.currentPracticeItem = null;
    state.practiceSessionIds = null;
    state.practiceSessionLabel = '';
    state.isRetryState = false;
    state.originalScoreBeforeRetry = null;
    state.lastIncorrectInput = '';
    state.hasUnsyncedChanges = false;
    state.corpusMetadata = cloneJson(seedCorpusMetadata);
    state.wordPracticeQuery = '';
    state.wordPracticeMatches = [];
    state.reviewSearchQuery = '';
    state.generatedSentenceWord = '';
    state.generatedSentenceCandidates = [];
    state.generatedSentenceStatus = '';
    refreshCorpusMetadata();
    normalizeProgress(true);
    normalizeOrder(true);
}

export function saveProgress() {
    writeJson(STORAGE_KEYS.progress, state.sentenceProgress);
}

export function saveOrder() {
    writeJson(STORAGE_KEYS.order, state.sentenceOrder);
}

export function saveAiProviderConfigs() {
    writeJson(STORAGE_KEYS.aiProviderConfigs, state.aiProviderConfigs);
}

export function clearAiProviderConfigs() {
    state.aiProviderConfigs = {};
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.aiProviderConfigs);
}

export function markUnsynced() {
    state.hasUnsyncedChanges = true;
}

export function clearUnsynced() {
    state.hasUnsyncedChanges = false;
}

export function refreshCorpusMetadata() {
    state.corpusMetadata = buildCorpusMetadata(state.sentencesMap);
    return state.corpusMetadata;
}

export function normalizeProgress(persist = true) {
    let updated = false;
    for (const id of Object.keys(state.sentencesMap)) {
        const current = state.sentenceProgress[id];
        const score = current && typeof current.score === 'number' ? current.score : 0;
        if (!current || current.score !== score || Object.keys(current).some((key) => key !== 'score')) {
            state.sentenceProgress[id] = { score };
            updated = true;
        }
    }

    for (const id of Object.keys(state.sentenceProgress)) {
        if (!state.sentencesMap[id]) {
            delete state.sentenceProgress[id];
            updated = true;
        }
    }

    if (updated && persist) saveProgress();
}

export function normalizeOrder(persist = true) {
    const currentIds = Object.keys(state.sentencesMap);
    let updated = false;

    const filtered = state.sentenceOrder.filter((id) => state.sentencesMap[id]);
    if (filtered.length !== state.sentenceOrder.length) {
        state.sentenceOrder = filtered;
        updated = true;
    }

    const newIds = currentIds.filter((id) => !state.sentenceOrder.includes(id));
    if (newIds.length > 0) {
        state.sentenceOrder = [...newIds, ...state.sentenceOrder];
        updated = true;
    }

    if (state.sentenceOrder.length === 0 && currentIds.length > 0) {
        state.sentenceOrder = [...currentIds];
        updated = true;
    }

    if (updated && persist) saveOrder();
}

export function ensureSentenceState(id) {
    if (!state.sentenceProgress[id]) {
        state.sentenceProgress[id] = { score: 0 };
    }
    if (!state.sentenceOrder.includes(id)) {
        state.sentenceOrder.unshift(id);
    }
}
