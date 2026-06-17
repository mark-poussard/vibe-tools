import { initializeState } from './state.js';
import { showScreen, openConfigModal, closeConfigModal, saveConfig, clearConfig, saveEditedConfig } from './ui.js';
import {
    startPractice,
    loadNextPracticeSentence,
    handlePracticeEnter,
    checkAnswer,
    overrideAnswer,
    closeOverrideModal,
    confirmOverride,
    openSkipModal,
    closeSkipModal,
    skipSentence,
    forgiveMistake,
    openWordPractice,
    searchWordPractice,
    startSelectedWordPractice,
    handleWordPracticeEnter,
} from './practice.js';
import {
    openReview,
    renderReviewList,
    addSentenceRow,
    deleteSentence,
    updateLocalMap,
} from './review.js';
import { cancelCorpusSync, keepLocalCorpus, pullRemoteCorpus, syncWithGithub } from './sync.js';

function initApp() {
    initializeState();

    const token = localStorage.getItem('gh_token');
    const repo = localStorage.getItem('gh_repo');
    const path = localStorage.getItem('gh_path');

    showScreen(token && repo && path ? 'home-screen' : 'config-screen');

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js').catch((error) => {
            console.warn('Service worker registration failed:', error);
        });
    }
}

function bindGlobals() {
    Object.assign(window, {
        showScreen,
        openConfigModal,
        closeConfigModal,
        saveConfig,
        clearConfig,
        saveEditedConfig,
        startPractice,
        loadNextPracticeSentence,
        handlePracticeEnter,
        checkAnswer,
        overrideAnswer,
        closeOverrideModal,
        confirmOverride,
        openSkipModal,
        closeSkipModal,
        skipSentence,
        forgiveMistake,
        openWordPractice,
        searchWordPractice,
        startSelectedWordPractice,
        handleWordPracticeEnter,
        openReview,
        renderReviewList,
        addSentenceRow,
        deleteSentence,
        updateLocalMap,
        syncWithGithub,
        keepLocalCorpus,
        pullRemoteCorpus,
        cancelCorpusSync,
    });
}

if (typeof window !== 'undefined') {
    bindGlobals();
    initApp();
}
