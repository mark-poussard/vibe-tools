import { refreshCorpusMetadata, state, clearUnsynced, normalizeOrder, normalizeProgress } from './state.js';
import { updateUnsyncedBanner } from './ui.js';
import { buildCorpusMetadata, cloneJson } from './utils.js';
import { renderReviewList } from './review.js';
import { renderWordPracticeResults } from './practice.js';

const DATA_BLOCK_REGEX = /\/\* DATA_START \*\/[\s\S]*?\/\* DATA_END \*\//;
const EXPORT_REGEX = (name) => new RegExp('export const ' + name + ' = ([\\s\\S]*?);\\n');

let pendingSyncPayload = null;

function encodeBase64Unicode(str) {
    const bytes = new TextEncoder().encode(str);
    const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
    return btoa(binString);
}

function decodeBase64Unicode(b64) {
    const binString = atob(b64);
    const bytes = Uint8Array.from(binString, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
}

function getStatusLabel() {
    return document.getElementById('sync-status') || document.getElementById('home-sync-status');
}

function setStatus(message, color) {
    const label = getStatusLabel();
    if (!label) return;
    label.textContent = message;
    label.style.color = color;
}

function getCorpusSyncModal() {
    return document.getElementById('corpus-sync-modal');
}

function showCorpusSyncModal(localMetadata, remoteMetadata) {
    const modal = getCorpusSyncModal();
    if (!modal) return;

    document.getElementById('local-corpus-version').textContent = localMetadata.version;
    document.getElementById('local-corpus-count').textContent = String(localMetadata.sentenceCount);
    document.getElementById('remote-corpus-version').textContent = remoteMetadata.version;
    document.getElementById('remote-corpus-count').textContent = String(remoteMetadata.sentenceCount);
    modal.style.display = 'flex';
}

function hideCorpusSyncModal() {
    const modal = getCorpusSyncModal();
    if (!modal) return;
    modal.style.display = 'none';
}

function extractExportedJson(moduleContent, exportName) {
    const match = moduleContent.match(EXPORT_REGEX(exportName));
    if (!match) {
        throw new Error(`Could not find ${exportName} in remote corpus file.`);
    }

    return JSON.parse(match[1]);
}

function extractCorpusFromModule(moduleContent) {
    const map = extractExportedJson(moduleContent, 'seedSentencesMap');
    let metadata = null;

    try {
        metadata = extractExportedJson(moduleContent, 'seedCorpusMetadata');
    } catch {
        metadata = null;
    }

    const computedMetadata = buildCorpusMetadata(map);
    if (!metadata || metadata.version !== computedMetadata.version) {
        metadata = computedMetadata;
    }

    return { map, metadata };
}

function replaceCorpusBlock(moduleContent, sentencesMap) {
    const corpusMetadata = buildCorpusMetadata(sentencesMap);
    const replacementCode = [
        '/* DATA_START */',
        `export const seedSentencesMap = ${JSON.stringify(sentencesMap, null, 2)};`,
        `export const seedCorpusMetadata = ${JSON.stringify(corpusMetadata, null, 2)};`,
        '/* DATA_END */',
    ].join('\n');

    const nextContent = moduleContent.replace(DATA_BLOCK_REGEX, replacementCode);
    if (nextContent === moduleContent) {
        throw new Error('Could not update the corpus block in the remote file.');
    }

    return { nextContent, corpusMetadata };
}

async function pushLocalCorpus(remoteContent, remoteSha) {
    const token = localStorage.getItem('gh_token');
    const repo = localStorage.getItem('gh_repo');
    const path = localStorage.getItem('gh_path');

    const url = `https://api.github.com/repos/${repo}/contents/${path}`;
    const headers = {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
    };

    const localMetadata = refreshCorpusMetadata();
    const { nextContent } = replaceCorpusBlock(remoteContent, state.sentencesMap);

    if (nextContent === remoteContent) {
        clearUnsynced();
        updateUnsyncedBanner();
        setStatus('No corpus changes to sync.', 'var(--text)');
        return;
    }

    setStatus('Pushing local corpus...', 'var(--text)');
    const putRes = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
            message: 'Sync Japanese practice sentences',
            content: encodeBase64Unicode(nextContent),
            sha: remoteSha,
        }),
    });

    if (!putRes.ok) throw new Error(`Push failed: ${putRes.status} ${putRes.statusText}`);

    clearUnsynced();
    updateUnsyncedBanner();
    setStatus(`✓ Synced corpus ${localMetadata.version}`, 'var(--success)');
    setTimeout(() => setStatus('', ''), 3000);
}

async function applyRemoteCorpus(remoteContent, remoteMetadata) {
    const { map } = extractCorpusFromModule(remoteContent);
    state.sentencesMap = cloneJson(map);
    state.practiceQueue = [];
    state.currentPracticeItem = null;
    state.practiceSessionIds = null;
    state.practiceSessionLabel = '';
    state.isRetryState = false;
    state.originalScoreBeforeRetry = null;
    state.lastIncorrectInput = '';
    state.wordPracticeQuery = '';
    state.wordPracticeMatches = [];
    const appliedMetadata = refreshCorpusMetadata();
    state.corpusMetadata = remoteMetadata || appliedMetadata;
    normalizeProgress(true);
    normalizeOrder(true);
    clearUnsynced();
    updateUnsyncedBanner();

    if (document.getElementById('review-screen')?.classList.contains('active')) {
        renderReviewList();
    }

    if (document.getElementById('word-practice-screen')?.classList.contains('active')) {
        renderWordPracticeResults([], '');
    }

    setStatus(`✓ Local corpus replaced with ${appliedMetadata.version}`, 'var(--success)');
    setTimeout(() => setStatus('', ''), 3000);
}

export async function syncWithGithub() {
    const token = localStorage.getItem('gh_token');
    const repo = localStorage.getItem('gh_repo');
    const path = localStorage.getItem('gh_path');

    if (!token || !repo || !path) {
        alert('Configuration missing. Please set up the config screen.');
        return;
    }

    const url = `https://api.github.com/repos/${repo}/contents/${path}`;
    const headers = {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
    };

    try {
        setStatus('Fetching remote corpus...', 'var(--text)');

        const getRes = await fetch(url, { headers });
        if (!getRes.ok) throw new Error(`Fetch failed: ${getRes.status} ${getRes.statusText}`);

        const getJson = await getRes.json();
        const remoteSha = getJson.sha;
        const remoteContent = decodeBase64Unicode(getJson.content);
        const remoteCorpus = extractCorpusFromModule(remoteContent);
        const localMetadata = refreshCorpusMetadata();

        if (localMetadata.version !== remoteCorpus.metadata.version) {
            pendingSyncPayload = {
                remoteSha,
                remoteContent,
                remoteMetadata: remoteCorpus.metadata,
            };
            showCorpusSyncModal(localMetadata, remoteCorpus.metadata);
            setStatus('Corpus versions differ. Choose how to reconcile.', 'var(--text)');
            return;
        }

        await pushLocalCorpus(remoteContent, remoteSha);
    } catch (error) {
        console.error(error);
        setStatus('Sync failed. See console.', 'var(--error)');
        alert(`Sync Error: ${error.message}`);
    }
}

export async function keepLocalCorpus() {
    if (!pendingSyncPayload) return;

    const { remoteContent, remoteSha } = pendingSyncPayload;
    pendingSyncPayload = null;
    hideCorpusSyncModal();
    await pushLocalCorpus(remoteContent, remoteSha);
}

export async function pullRemoteCorpus() {
    if (!pendingSyncPayload) return;

    const { remoteContent, remoteMetadata } = pendingSyncPayload;
    pendingSyncPayload = null;
    hideCorpusSyncModal();

    try {
        setStatus('Replacing local corpus...', 'var(--text)');
        await applyRemoteCorpus(remoteContent, remoteMetadata);
    } catch (error) {
        console.error(error);
        setStatus('Pull failed. See console.', 'var(--error)');
        alert(`Sync Error: ${error.message}`);
    }
}

export function cancelCorpusSync() {
    pendingSyncPayload = null;
    hideCorpusSyncModal();
    setStatus('Sync canceled.', 'var(--text)');
    setTimeout(() => setStatus('', ''), 2000);
}
