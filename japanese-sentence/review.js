import { refreshCorpusMetadata, state, markUnsynced, normalizeOrder, normalizeProgress } from './state.js';
import { escapeHtml } from './utils.js';
import { showScreen } from './ui.js';

export function openReview() {
    renderReviewList();
    showScreen('review-screen');
    const input = document.getElementById('review-search-input');
    if (input) {
        input.value = state.reviewSearchQuery || '';
        setTimeout(() => input.focus(), 10);
    }
}

function normalizeReviewTerms(query) {
    return query
        .split(/[\s　,，、。！？!?]+/)
        .map((term) => term.trim())
        .filter(Boolean)
        .map((term) => term.toLowerCase().replace(/[\s　、。！？,!?]/g, ''));
}

function sentenceMatchesSearch(data, query) {
    const terms = normalizeReviewTerms(query);
    if (terms.length === 0) return true;

    const fields = [
        data.english,
        data.primaryJapanese,
        ...(data.alternates || []),
    ].map((value) => String(value || '').toLowerCase().replace(/[\s　、。！？,!?]/g, ''));

    return terms.some((term) => fields.some((field) => field.includes(term)));
}

export function renderReviewList() {
    const container = document.getElementById('review-list');
    const summary = document.getElementById('review-summary');
    const query = state.reviewSearchQuery || '';
    const entries = Object.entries(state.sentencesMap)
        .filter(([, data]) => sentenceMatchesSearch(data, query));

    container.innerHTML = '';

    if (summary) {
        summary.textContent = query
            ? `${entries.length} sentence${entries.length === 1 ? '' : 's'} match "${query}".`
            : `${Object.keys(state.sentencesMap).length} sentence${Object.keys(state.sentencesMap).length === 1 ? '' : 's'} in the review list.`;
    }

    if (entries.length === 0) {
        container.innerHTML = '<div class="review-empty">No sentences match this search.</div>';
        return;
    }

    entries.forEach(([id, data]) => {
        container.appendChild(createSentenceElement(id, data.english, data.primaryJapanese, data.alternates.join(' | ')));
    });
}

export function searchReviewSentences() {
    const input = document.getElementById('review-search-input');
    if (!input) return;

    state.reviewSearchQuery = input.value.trim();
    renderReviewList();
}

export function createSentenceElement(id, eng, pri, alt) {
    const div = document.createElement('div');
    div.className = 'sentence-row';
    div.dataset.id = id;

    div.innerHTML = `
        <div class="form-group" style="margin:0;">
            <label>English</label>
            <input type="text" class="edit-english" value="${escapeHtml(eng)}" onchange="updateLocalMap('${id}')">
        </div>
        <div class="form-group" style="margin:0;">
            <label>Primary Japanese</label>
            <input type="text" class="edit-primary" value="${escapeHtml(pri)}" onchange="updateLocalMap('${id}')">
        </div>
        <div class="form-group" style="margin:0;">
            <label>Alternates (pipe '|' separated)</label>
            <input type="text" class="edit-alternates" value="${escapeHtml(alt)}" onchange="updateLocalMap('${id}')">
        </div>
        <button class="danger" onclick="deleteSentence('${id}')">Delete</button>
    `;

    return div;
}

export function addSentenceRow() {
    const newId = Date.now().toString();
    state.sentencesMap[newId] = { english: '', primaryJapanese: '', alternates: [] };
    state.sentenceProgress[newId] = { score: 0 };
    state.sentenceOrder.unshift(newId);
    refreshCorpusMetadata();
    normalizeProgress(false);
    normalizeOrder(false);
    markUnsynced();
    renderReviewList();
}

export function deleteSentence(id) {
    if (!confirm('Delete this sentence?')) return;

    delete state.sentencesMap[id];
    delete state.sentenceProgress[id];
    state.sentenceOrder = state.sentenceOrder.filter((entryId) => entryId !== id);
    refreshCorpusMetadata();
    markUnsynced();
    normalizeProgress(false);
    normalizeOrder(false);
    renderReviewList();
}

export function updateLocalMap(id) {
    const row = document.querySelector(`.sentence-row[data-id="${id}"]`);
    if (!row) return;

    const eng = row.querySelector('.edit-english').value;
    const pri = row.querySelector('.edit-primary').value;
    const altStr = row.querySelector('.edit-alternates').value;
    const alternates = altStr.split('|').map((entry) => entry.trim()).filter(Boolean);

    state.sentencesMap[id] = {
        english: eng,
        primaryJapanese: pri,
        alternates,
    };
    refreshCorpusMetadata();
    markUnsynced();
}
