export function cloneJson(value) {
    return JSON.parse(JSON.stringify(value));
}

export function stableStringify(value) {
    if (Array.isArray(value)) {
        return `[${value.map((entry) => stableStringify(entry)).join(',')}]`;
    }

    if (value && typeof value === 'object') {
        const keys = Object.keys(value).sort();
        return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
    }

    return JSON.stringify(value);
}

export function computeCorpusVersion(sentencesMap) {
    const input = stableStringify(sentencesMap || {});
    let hash = 0x811c9dc5;

    for (let i = 0; i < input.length; i += 1) {
        hash ^= input.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193);
    }

    return `fnv1a-${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

export function buildCorpusMetadata(sentencesMap) {
    const version = computeCorpusVersion(sentencesMap);
    const sentenceCount = Object.keys(sentencesMap || {}).length;

    return { version, sentenceCount };
}

export function escapeHtml(unsafe) {
    if (unsafe == null) return '';
    return String(unsafe)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

export function normalizeString(str) {
    if (!str) return '';
    return String(str).replace(/[\s　、。！？,!?]/g, '').toLowerCase();
}

export function generateDiffHTML(expected, actual) {
    const isPunc = (c) => /[。、！？「」『』・\s.,!?]/.test(c);

    const expFiltered = [];
    for (let i = 0; i < expected.length; i += 1) {
        if (!isPunc(expected[i])) expFiltered.push({ char: expected[i], origIdx: i });
    }

    const actFiltered = [];
    for (let i = 0; i < actual.length; i += 1) {
        if (!isPunc(actual[i])) actFiltered.push({ char: actual[i], origIdx: i });
    }

    const m = expFiltered.length;
    const n = actFiltered.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    for (let i = 1; i <= m; i += 1) {
        for (let j = 1; j <= n; j += 1) {
            if (expFiltered[i - 1].char === actFiltered[j - 1].char) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }

    let i = m;
    let j = n;
    const actualMatchStatus = new Array(actual.length).fill(false);

    while (i > 0 && j > 0) {
        if (expFiltered[i - 1].char === actFiltered[j - 1].char) {
            actualMatchStatus[actFiltered[j - 1].origIdx] = true;
            i -= 1;
            j -= 1;
        } else if (dp[i - 1][j] > dp[i][j - 1]) {
            i -= 1;
        } else {
            j -= 1;
        }
    }

    let actualHTML = '';
    let currentMatch = null;
    let currentStr = '';

    for (let k = 0; k < actual.length; k += 1) {
        const char = actual[k];
        const matchState = isPunc(char) ? 'punc' : actualMatchStatus[k];

        if (matchState === currentMatch) {
            currentStr += char;
        } else {
            if (currentMatch !== null) {
                const color = currentMatch === 'punc'
                    ? 'var(--text)'
                    : (currentMatch ? 'var(--success)' : 'var(--error)');
                actualHTML += `<span style="color: ${color};">${escapeHtml(currentStr)}</span>`;
            }
            currentMatch = matchState;
            currentStr = char;
        }
    }

    if (currentStr) {
        const color = currentMatch === 'punc'
            ? 'var(--text)'
            : (currentMatch ? 'var(--success)' : 'var(--error)');
        actualHTML += `<span style="color: ${color};">${escapeHtml(currentStr)}</span>`;
    }

    const expectedHTML = `<span style="color: var(--success);">${escapeHtml(expected)}</span>`;
    return { expectedHTML, actualHTML };
}

