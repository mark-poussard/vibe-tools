import { state } from './state.js';

export function updateUnsyncedBanner() {
    const banner = document.getElementById('unsynced-banner');
    if (!banner) return;
    banner.style.display = state.hasUnsyncedChanges ? 'flex' : 'none';
}

export function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach((screen) => {
        screen.classList.remove('active');
    });

    const nextScreen = document.getElementById(screenId);
    if (nextScreen) nextScreen.classList.add('active');

    if (screenId === 'home-screen') {
        updateUnsyncedBanner();
    }
}

export function openConfigModal() {
    document.getElementById('edit-gh-token').value = localStorage.getItem('gh_token') || '';
    document.getElementById('edit-gh-repo').value = localStorage.getItem('gh_repo') || '';
    document.getElementById('edit-gh-path').value = localStorage.getItem('gh_path') || 'sentences-data.js';
    document.getElementById('config-modal').style.display = 'flex';
}

export function closeConfigModal() {
    document.getElementById('config-modal').style.display = 'none';
}

export function saveConfig() {
    const token = document.getElementById('gh-token').value.trim();
    const repo = document.getElementById('gh-repo').value.trim();
    const path = document.getElementById('gh-path').value.trim();

    if (!token || !repo || !path) {
        alert('Please fill in all configuration fields.');
        return;
    }

    localStorage.setItem('gh_token', token);
    localStorage.setItem('gh_repo', repo);
    localStorage.setItem('gh_path', path);
    showScreen('home-screen');
}

export function clearConfig() {
    if (!confirm('Are you sure you want to clear your GitHub configuration?')) return;

    localStorage.removeItem('gh_token');
    localStorage.removeItem('gh_repo');
    localStorage.removeItem('gh_path');

    document.getElementById('gh-token').value = '';
    document.getElementById('gh-repo').value = '';
    document.getElementById('gh-path').value = 'sentences-data.js';

    showScreen('config-screen');
}

export function saveEditedConfig() {
    const token = document.getElementById('edit-gh-token').value.trim();
    const repo = document.getElementById('edit-gh-repo').value.trim();
    const path = document.getElementById('edit-gh-path').value.trim();

    if (!token || !repo || !path) {
        alert('Please fill in all configuration fields.');
        return;
    }

    localStorage.setItem('gh_token', token);
    localStorage.setItem('gh_repo', repo);
    localStorage.setItem('gh_path', path);
    closeConfigModal();
    updateUnsyncedBanner();
    alert('Configuration successfully updated!');
}

