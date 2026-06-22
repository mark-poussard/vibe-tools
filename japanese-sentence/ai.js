import { state, saveAiProviderConfigs } from './state.js';
import { escapeHtml } from './utils.js';

export const AI_PROVIDER_DEFINITIONS = [
    {
        id: 'gemini',
        name: 'Google Gemini',
        keyLabel: 'Gemini API key',
        keyPlaceholder: 'AIza...',
        helperText: 'Optional. Used only for sentence generation.',
        model: 'gemini-3.1-flash-lite',
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent',
    },
];

function getProviderDefinition(providerId) {
    return AI_PROVIDER_DEFINITIONS.find((provider) => provider.id === providerId) || null;
}

function getStoredProviderConfig(providerId) {
    return state.aiProviderConfigs?.[providerId] || {};
}

export function getProviderApiKey(providerId) {
    return String(getStoredProviderConfig(providerId).apiKey || '').trim();
}

export function hasConfiguredProvider(providerId) {
    return getProviderApiKey(providerId).length > 0;
}

export function hasAnyConfiguredProvider() {
    return AI_PROVIDER_DEFINITIONS.some((provider) => hasConfiguredProvider(provider.id));
}

export function renderAiProviderConfigFields(containerId, prefix) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
        <div class="ai-provider-section">
            <h3>AI Features (optional)</h3>
            <p class="screen-subtitle">Add provider keys here to unlock sentence generation. The app still works without them.</p>
            ${AI_PROVIDER_DEFINITIONS.map((provider) => `
                <div class="form-group ai-provider-field">
                    <label for="${prefix}-${provider.id}-api-key">${escapeHtml(provider.name)} API key</label>
                    <input
                        type="password"
                        id="${prefix}-${provider.id}-api-key"
                        placeholder="${escapeHtml(provider.keyPlaceholder)}"
                        autocomplete="off"
                    >
                    <div class="ai-provider-helper">${escapeHtml(provider.helperText)}</div>
                </div>
            `).join('')}
        </div>
    `;

    populateAiProviderConfigFields(prefix);
}

export function populateAiProviderConfigFields(prefix) {
    AI_PROVIDER_DEFINITIONS.forEach((provider) => {
        const input = document.getElementById(`${prefix}-${provider.id}-api-key`);
        if (!input) return;
        input.value = getProviderApiKey(provider.id);
    });
}

export function collectAiProviderConfigValues(prefix) {
    const nextConfigs = {};

    AI_PROVIDER_DEFINITIONS.forEach((provider) => {
        const input = document.getElementById(`${prefix}-${provider.id}-api-key`);
        const apiKey = input ? input.value.trim() : '';
        if (apiKey) {
            nextConfigs[provider.id] = { apiKey };
        }
    });

    return nextConfigs;
}

export function saveAiProviderConfigValues(prefix) {
    state.aiProviderConfigs = collectAiProviderConfigValues(prefix);
    saveAiProviderConfigs();
    return state.aiProviderConfigs;
}

function parseJsonPayload(text) {
    const trimmed = String(text || '').trim();
    if (!trimmed) {
        throw new Error('The AI response was empty.');
    }

    const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    const candidate = fencedMatch ? fencedMatch[1].trim() : trimmed;

    try {
        return JSON.parse(candidate);
    } catch {
        const start = candidate.indexOf('[');
        const end = candidate.lastIndexOf(']');
        if (start === -1 || end === -1 || end <= start) {
            throw new Error('The AI response was not valid JSON.');
        }
        return JSON.parse(candidate.slice(start, end + 1));
    }
}

function normalizeGeneratedSentence(entry) {
    const japanese = String(entry?.japanese || entry?.japaneseSentence || '').trim();
    const english = String(entry?.english || entry?.translation || '').trim();

    if (!japanese || !english) return null;

    return { japanese, english };
}

function validateGeneratedSentences(value) {
    const items = Array.isArray(value) ? value : value?.sentences;
    if (!Array.isArray(items)) {
        throw new Error('The AI response did not include a sentence list.');
    }

    const normalized = items
        .map(normalizeGeneratedSentence)
        .filter(Boolean);

    if (normalized.length === 0) {
        throw new Error('The AI response did not include usable sentences.');
    }

    return normalized;
}

function buildAvoidanceBlock(excludedSentences) {
    if (!Array.isArray(excludedSentences) || excludedSentences.length === 0) {
        return '';
    }

    const lines = excludedSentences.slice(0, 20).map((sentence, index) => {
        const japanese = String(sentence?.japanese || '').trim();
        const english = String(sentence?.english || '').trim();
        return `${index + 1}. Japanese: ${japanese} | English: ${english}`;
    }).filter((line) => line.includes('Japanese:') && line.includes('English:'));

    if (lines.length === 0) {
        return '';
    }

    return [
        'Do not repeat or closely paraphrase any of the following previously generated sentences:',
        ...lines,
    ].join('\n');
}

export function buildGeminiSentencePrompt(japaneseWord, { count = 5, excludedSentences = [] } = {}) {
    return [
        'You are helping a Japanese sentence practice app create study corpus entries.',
        `Create exactly ${count} different natural Japanese example sentences that each use the target word or phrase: "${japaneseWord}".`,
        'Each sentence must be meaningfully different from the others.',
        buildAvoidanceBlock(excludedSentences),
        'Return the answer as structured output that conforms to the requested JSON schema.',
        'The "japanese" field must be a natural Japanese sentence that includes the target word or phrase.',
        'The "english" field must be a concise, accurate English translation of that sentence.',
    ].join(' ');
}

function buildGeminiResponseSchema(count = 5) {
    return {
        type: 'object',
        properties: {
            sentences: {
                type: 'array',
                minItems: count,
                maxItems: count,
                items: {
                    type: 'object',
                    properties: {
                        japanese: { type: 'string' },
                        english: { type: 'string' },
                    },
                    required: ['japanese', 'english'],
                },
            },
        },
        required: ['sentences'],
    };
}

export async function generateGeminiSentences(japaneseWord, { count = 5, excludedSentences = [] } = {}) {
    const apiKey = getProviderApiKey('gemini');
    if (!apiKey) {
        throw new Error('Add a Gemini API key in Config first.');
    }

    const word = String(japaneseWord || '').trim();
    if (!word) {
        throw new Error('Enter a Japanese word or phrase first.');
    }

    const definition = getProviderDefinition('gemini');
    if (!definition) {
        throw new Error('Gemini is not configured.');
    }

    const response = await fetch(definition.endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
            contents: [
                {
                    role: 'user',
                    parts: [{ text: buildGeminiSentencePrompt(word, { count, excludedSentences }) }],
                },
            ],
            generationConfig: {
                temperature: 0.9,
                topP: 0.95,
                maxOutputTokens: 2048,
                responseMimeType: 'application/json',
                responseSchema: buildGeminiResponseSchema(count),
            },
        }),
    });

    if (!response.ok) {
        throw new Error(`Gemini request failed: ${response.status} ${response.statusText}`);
    }

    const payload = await response.json();
    const responseText = payload?.text
        || payload?.candidates?.[0]?.content?.parts?.map((part) => part?.text || '').join('')
        || '';

    return validateGeneratedSentences(parseJsonPayload(responseText));
}
