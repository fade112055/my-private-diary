// Personal Diary App - Main JavaScript Functionality
// Handles theme switching, diary management, stopwatch, and timer

class DiaryApp {
    constructor() {
        this.currentTheme = 'cherry-blossom';
        this.isPrivateMode = false;
        this.diaryEntries = [];
        this.stopwatchTime = 0;
        this.stopwatchInterval = null;
        this.timerTime = 0;
        this.timerInterval = null;
        this.lapTimes = [];
        this.autoSaveTimeout = null;
        
        this.init();
    }

    init() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.updateDateDisplay();
        this.renderDiaryEntries();
        this.applyTheme();
        this.updateTimerDisplay();
        
        // Auto-save diary input every 2 seconds
        this.setupAutoSave();
    }

    // Storage Management
    loadFromStorage() {
        const savedTheme = localStorage.getItem('diary-theme');
        const savedEntries = localStorage.getItem('diary-entries');
        const savedPrivateMode = localStorage.getItem('diary-private-mode');
        const savedDraft = localStorage.getItem('diary-draft');

        if (savedTheme) {
            this.currentTheme = savedTheme;
        }

        if (savedEntries) {
            try {
                this.diaryEntries = JSON.parse(savedEntries);
            } catch (e) {
                console.error('Error loading diary entries:', e);
                this.diaryEntries = [];
            }
        }

        if (savedPrivateMode) {
            this.isPrivateMode = savedPrivateMode === 'true';
        }

        if (savedDraft) {
            const diaryInput = document.getElementById('diaryInput');
            if (diaryInput) {
                diaryInput.value = savedDraft;
            }
        }
    }

    saveToStorage() {
        localStorage.setItem('diary-theme', this.currentTheme);
        localStorage.setItem('diary-entries', JSON.stringify(this.diaryEntries));
        localStorage.setItem('diary-private-mode', this.isPrivateMode.toString());
    }

    saveDraft() {
        const diaryInput = document.getElementById('diaryInput');
        if (diaryInput) {
            localStorage.setItem('diary-draft', diaryInput.value);
        }
    }

    // Event Listeners Setup
    setupEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        const themeSelector = document.getElementById('themeSelector');
        
        themeToggle.addEventListener('click', () => {
            themeSelector.classList.toggle('active');
        });

        // Close theme selector when clicking outside
        document.addEventListener('click', (e) => {
            if (!themeToggle.contains(e.target) && !themeSelector.contains(e.target)) {
                themeSelector.classList.remove('active');
            }
        });

        // Theme options
        const themeOptions = document.querySelectorAll('.theme-option');
        themeOptions.forEach(option => {
            option.addEventListener('click', () => {
                this.currentTheme = option.dataset.theme;
                this.applyTheme();
                this.saveToStorage();
                themeSelector.classList.remove('active');
            });
        });

        // Private mode toggle
        const privateToggle = document.getElementById('privateToggle');
        privateToggle.addEventListener('click', () => {
            this.togglePrivateMode();
        });

        // Diary functionality
        const saveEntry = document.getElementById('saveEntry');
        const clearEntry = document.getElementById('clearEntry');
        const diaryInput = document.getElementById('diaryInput');

        saveEntry.addEventListener('click', () => {
            this.saveDiaryEntry();
        });

        clearEntry.addEventListener('click', () => {
            this.clearDiaryInput();
        });

        diaryInput.addEventListener('input', () => {
            this.saveDraft();
        });

        // Timer tabs
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.switchTab(button.dataset.tab);
            });
        });

        // Stopwatch controls
        const stopwatchStart = document.getElementById('stopwatchStart');
        const stopwatchPause = document.getElementById('stopwatchPause');
        const stopwatchReset = document.getElementById('stopwatchReset');
        const lapBtn = document.getElementById('lapBtn');

        stopwatchStart.addEventListener('click', () => {
            this.startStopwatch();
        });

        stopwatchPause.addEventListener('click', () => {
            this.pauseStopwatch();
        });

        stopwatchReset.addEventListener('click', () => {
            this.resetStopwatch();
        });

        lapBtn.addEventListener('click', () => {
            this.addLap();
        });

        // Timer controls
        const timerStart = document.getElementById('timerStart');
        const timerPause = document.getElementById('timerPause');
        const timerReset = document.getElementById('timerReset');
        const timerInputs = document.querySelectorAll('#timerHours, #timerMinutes, #timerSeconds');

        timerStart.addEventListener('click', () => {
            this.startTimer();
        });

        timerPause.addEventListener('click', () => {
            this.pauseTimer();
        });

        timerReset.addEventListener('click', () => {
            this.resetTimer();
        });

        timerInputs.forEach(input => {
            input.addEventListener('change', () => {
                this.updateTimerFromInputs();
            });
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl + S: Save diary entry
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.saveDiaryEntry();
            }
            
            // Ctrl + L: Clear diary input
            if (e.ctrlKey && e.key === 'l') {
                e.preventDefault();
                this.clearDiaryInput();
            }
            
            // Ctrl + P: Toggle private mode
            if (e.ctrlKey && e.key === 'p') {
                e.preventDefault();
                this.togglePrivateMode();
            }
            
            // Space: Start/pause stopwatch or timer (when focused on timer section)
            if (e.code === 'Space' && e.target.closest('.timer-section')) {
                e.preventDefault();
                const activeTab = document.querySelector('.tab-button.active').dataset.tab;
                if (activeTab === 'stopwatch') {
                    this.stopwatchInterval ? this.pauseStopwatch() : this.startStopwatch();
                } else {
                    this.timerInterval ? this.pauseTimer() : this.startTimer();
                }
            }
        });
    }

    setupAutoSave() {
        const diaryInput = document.getElementById('diaryInput');
        let autoSaveTimeout;

        diaryInput.addEventListener('input', () => {
            clearTimeout(autoSaveTimeout);
            autoSaveTimeout = setTimeout(() => {
                this.saveDraft();
            }, 2000);
        });
    }

    // Theme Management
    applyTheme() {
        document.body.setAttribute('data-theme', this.currentTheme);
        
        // Update theme toggle icon based on current theme
        const themeToggle = document.getElementById('themeToggle');
        const icon = themeToggle.querySelector('i');
        
        switch (this.currentTheme) {
            case 'cherry-blossom':
                icon.className = 'fas fa-leaf';
                break;
            case 'night-sky':
                icon.className = 'fas fa-moon';
                break;
            case 'forest':
                icon.className = 'fas fa-tree';
                break;
            default:
                icon.className = 'fas fa-palette';
        }
    }

    // Private Mode
    togglePrivateMode() {
        this.isPrivateMode = !this.isPrivateMode;
        const privateOverlay = document.getElementById('privateOverlay');
        const privateToggle = document.getElementById('privateToggle');
        const icon = privateToggle.querySelector('i');

        if (this.isPrivateMode) {
            privateOverlay.classList.add('active');
            icon.className = 'fas fa-eye-slash';
            privateToggle.title = 'Show Diary';
        } else {
            privateOverlay.classList.remove('active');
            icon.className = 'fas fa-eye';
            privateToggle.title = 'Private Mode';
        }

        this.saveToStorage();
    }

    // Date Management
    updateDateDisplay() {
        const dateDisplay = document.getElementById('dateDisplay');
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        dateDisplay.textContent = now.toLocaleDateString('en-US', options);
    }

    // Diary Management
    saveDiaryEntry() {
        const diaryInput = document.getElementById('diaryInput');
        const entryText = diaryInput.value.trim();

        if (!entryText) {
            this.showNotification('Please write something before saving!', 'error');
            return;
        }

        const entry = {
            id: Date.now(),
            text: entryText,
            date: new Date().toISOString(),
            timestamp: new Date().toLocaleString()
        };

        this.diaryEntries.unshift(entry);
        this.saveToStorage();
        this.renderDiaryEntries();
        
        // Clear input and draft
        diaryInput.value = '';
        localStorage.removeItem('diary-draft');
        
        this.showNotification('Entry saved successfully!', 'success');
    }

    clearDiaryInput() {
        const diaryInput = document.getElementById('diaryInput');
        diaryInput.value = '';
        localStorage.removeItem('diary-draft');
        diaryInput.focus();
    }

    renderDiaryEntries() {
        const entryList = document.getElementById('entryList');
        entryList.innerHTML = '';

        if (this.diaryEntries.length === 0) {
            entryList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); font-style: italic;">No entries yet. Start writing your first diary entry!</p>';
            return;
        }

        this.diaryEntries.forEach(entry => {
            const entryDiv = document.createElement('div');
            entryDiv.className = 'diary-entry';
            entryDiv.innerHTML = `
                <div class="entry-header">
                    <span class="entry-date">${entry.timestamp}</span>
                    <button class="entry-delete" onclick="diaryApp.deleteEntry(${entry.id})" title="Delete Entry">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="entry-text">${this.escapeHtml(entry.text)}</div>
            `;
            entryList.appendChild(entryDiv);
        });
    }

    deleteEntry(entryId) {
        if (confirm('Are you sure you want to delete this entry?')) {
            this.diaryEntries = this.diaryEntries.filter(entry => entry.id !== entryId);
            this.saveToStorage();
            this.renderDiaryEntries();
            this.showNotification('Entry deleted successfully!', 'success');
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Timer Tab Management
    switchTab(tabName) {
        const tabButtons = document.querySelectorAll('.tab-button');
        const timerContents = document.querySelectorAll('.timer-content');

        tabButtons.forEach(button => {
            button.classList.remove('active');
        });

        timerContents.forEach(content => {
            content.classList.remove('active');
        });

        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}-content`).classList.add('active');
    }

    // Stopwatch Functionality
    startStopwatch() {
        if (this.stopwatchInterval) return;

        this.stopwatchInterval = setInterval(() => {
            this.stopwatchTime += 10;
            this.updateStopwatchDisplay();
        }, 10);
    }

    pauseStopwatch() {
        if (this.stopwatchInterval) {
            clearInterval(this.stopwatchInterval);
            this.stopwatchInterval = null;
        }
    }

    resetStopwatch() {
        this.pauseStopwatch();
        this.stopwatchTime = 0;
        this.lapTimes = [];
        this.updateStopwatchDisplay();
        this.updateLapDisplay();
    }

    updateStopwatchDisplay() {
        const display = document.getElementById('stopwatchDisplay');
        display.textContent = this.formatTime(this.stopwatchTime);
    }

    addLap() {
        if (this.stopwatchTime > 0) {
            this.lapTimes.push(this.stopwatchTime);
            this.updateLapDisplay();
        }
    }

    updateLapDisplay() {
        const lapTimesDiv = document.getElementById('lapTimes');
        lapTimesDiv.innerHTML = '';

        this.lapTimes.forEach((lapTime, index) => {
            const lapDiv = document.createElement('div');
            lapDiv.className = 'lap-time';
            lapDiv.innerHTML = `
                <span>Lap ${index + 1}</span>
                <span>${this.formatTime(lapTime)}</span>
            `;
            lapTimesDiv.appendChild(lapDiv);
        });
    }

    // Timer Functionality
    startTimer() {
        if (this.timerInterval) return;

        if (this.timerTime <= 0) {
            this.updateTimerFromInputs();
        }

        if (this.timerTime <= 0) {
            this.showNotification('Please set a time for the timer!', 'error');
            return;
        }

        this.timerInterval = setInterval(() => {
            this.timerTime -= 1000;
            this.updateTimerDisplay();

            if (this.timerTime <= 0) {
                this.pauseTimer();
                this.timerComplete();
            }
        }, 1000);
    }

    pauseTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    resetTimer() {
        this.pauseTimer();
        this.updateTimerFromInputs();
    }

    updateTimerFromInputs() {
        const hours = parseInt(document.getElementById('timerHours').value) || 0;
        const minutes = parseInt(document.getElementById('timerMinutes').value) || 0;
        const seconds = parseInt(document.getElementById('timerSeconds').value) || 0;

        this.timerTime = (hours * 3600 + minutes * 60 + seconds) * 1000;
        this.updateTimerDisplay();
    }

    updateTimerDisplay() {
        const display = document.getElementById('timerDisplay');
        const totalSeconds = Math.max(0, Math.floor(this.timerTime / 1000));
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (hours > 0) {
            display.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            display.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    timerComplete() {
        this.showNotification('Timer completed!', 'success');
        
        // Play a simple beep sound (if user allows)
        if (typeof Audio !== 'undefined') {
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = 800;
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.1);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.5);
            } catch (e) {
                console.log('Audio notification not supported');
            }
        }

        // Flash the timer display
        const display = document.getElementById('timerDisplay');
        display.style.animation = 'pulse 0.5s ease-in-out 3';
        setTimeout(() => {
            display.style.animation = '';
        }, 1500);
    }

    // Utility Functions
    formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const totalMilliseconds = milliseconds % 1000;
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${Math.floor(totalMilliseconds / 10).toString().padStart(2, '0')}`;
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : 'var(--button-primary)'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: var(--shadow);
            z-index: 1000;
            animation: slideIn 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }

    .notification {
        font-family: 'Noto Sans JP', sans-serif;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .notification::before {
        content: '✓';
        font-weight: bold;
    }

    .notification.error::before {
        content: '✗';
    }

    .notification.info::before {
        content: 'ℹ';
    }
`;
document.head.appendChild(style);

// Initialize the app when DOM is loaded
let diaryApp;
document.addEventListener('DOMContentLoaded', () => {
    diaryApp = new DiaryApp();
});

// Service Worker Registration for PWA capabilities (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then((registration) => {
            console.log('SW registered: ', registration);
        }).catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
        });
    });
}

// Handle page visibility changes to save data
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && diaryApp) {
        diaryApp.saveDraft();
        diaryApp.saveToStorage();
    }
});

// Handle beforeunload to save data
window.addEventListener('beforeunload', () => {
    if (diaryApp) {
        diaryApp.saveDraft();
        diaryApp.saveToStorage();
    }
});
