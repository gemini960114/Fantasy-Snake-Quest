/**
 * UI Controller - 使用者介面控制
 * 處理按鈕點擊、排行榜顯示、遊戲狀態更新等
 */

import apiClient from './api.js';
import Game from './game.js';
import Renderer from './renderer.js';

class UIController {
    constructor() {
        // 初始化渲染器和遊戲
        this.canvas = document.getElementById('game-canvas');
        this.renderer = new Renderer(this.canvas);
        this.game = new Game(this.renderer);

        // DOM 元素
        this.elements = {
            // 覆蓋層
            overlayStart: document.getElementById('overlay-start'),
            overlayPause: document.getElementById('overlay-pause'),
            overlayLevelComplete: document.getElementById('overlay-level-complete'),
            overlayGameOver: document.getElementById('overlay-game-over'),

            // 按鈕
            btnStart: document.getElementById('btn-start'),
            btnResume: document.getElementById('btn-resume'),
            btnQuit: document.getElementById('btn-quit'),
            btnNextLevel: document.getElementById('btn-next-level'),
            btnEndGame: document.getElementById('btn-end-game'),
            btnSubmitScore: document.getElementById('btn-submit-score'),
            btnRestart: document.getElementById('btn-restart'),
            btnLeaderboard: document.getElementById('btn-leaderboard'),
            btnCloseLeaderboard: document.getElementById('btn-close-leaderboard'),
            btnSettings: document.getElementById('btn-settings'),

            // 顯示區域
            scoreDisplay: document.getElementById('score-display'),
            levelDisplay: document.getElementById('level-display'),
            timeDisplay: document.getElementById('time-display'),

            // 遊戲結束顯示
            finalScore: document.getElementById('final-score'),
            finalLevel: document.getElementById('final-level'),
            finalTime: document.getElementById('final-time'),

            // 關卡完成顯示
            levelScore: document.getElementById('level-score'),
            levelTime: document.getElementById('level-time'),

            // 輸入
            playerName: document.getElementById('player-name'),

            // 排行榜
            leaderboardPanel: document.getElementById('leaderboard-panel'),
            leaderboardList: document.getElementById('leaderboard-list')
        };

        // 綁定事件
        this.bindEvents();

        // 啟動 UI 更新循環
        this.startUIUpdateLoop();
    }

    /**
     * 綁定所有事件
     */
    bindEvents() {
        // 開始遊戲
        this.elements.btnStart.addEventListener('click', () => {
            this.hideAllOverlays();
            this.game.init();
        });

        // 繼續遊戲
        this.elements.btnResume.addEventListener('click', () => {
            this.game.togglePause();
            this.elements.overlayPause.classList.add('hidden');
        });

        // 結束遊戲
        this.elements.btnQuit.addEventListener('click', () => {
            this.game.stop();
            this.showGameOver();
        });

        // 下一關
        this.elements.btnNextLevel.addEventListener('click', () => {
            this.elements.overlayLevelComplete.classList.add('hidden');
            this.game.nextLevel();
        });

        // 關卡結束時結束遊戲
        this.elements.btnEndGame.addEventListener('click', () => {
            this.elements.overlayLevelComplete.classList.add('hidden');
            this.showGameOver();
        });

        // 提交分數
        this.elements.btnSubmitScore.addEventListener('click', () => {
            this.submitScore();
        });

        // 提交分數（按 Enter）
        this.elements.playerName.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.submitScore();
            }
        });

        // 再玩一次
        this.elements.btnRestart.addEventListener('click', () => {
            this.elements.overlayGameOver.classList.add('hidden');
            this.elements.playerName.value = '';
            this.game.init();
        });

        // 排行榜
        this.elements.btnLeaderboard.addEventListener('click', () => {
            this.showLeaderboard();
        });

        // 關閉排行榜
        this.elements.btnCloseLeaderboard.addEventListener('click', () => {
            this.elements.leaderboardPanel.classList.add('hidden');
        });

        // 設定按鈕（預留）
        this.elements.btnSettings.addEventListener('click', () => {
            alert('設定功能開發中...');
        });

        // 鍵盤事件 - 暫停
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.game.isRunning && !this.game.isPaused) {
                    this.game.togglePause();
                    this.elements.overlayPause.classList.remove('hidden');
                }
            }
        });
    }

    /**
     * 隱藏所有覆蓋層
     */
    hideAllOverlays() {
        this.elements.overlayStart.classList.add('hidden');
        this.elements.overlayPause.classList.add('hidden');
        this.elements.overlayLevelComplete.classList.add('hidden');
        this.elements.overlayGameOver.classList.add('hidden');
    }

    /**
     * 顯示遊戲結束畫面
     */
    showGameOver() {
        const state = this.game.getGameState();

        this.elements.finalScore.textContent = state.score;
        this.elements.finalLevel.textContent = state.level;
        this.elements.finalTime.textContent = this.game.formatTime(state.playTime);

        this.elements.overlayGameOver.classList.remove('hidden');
    }

    /**
     * 顯示關卡完成畫面
     */
    showLevelComplete() {
        const state = this.game.getGameState();

        this.elements.levelScore.textContent = state.score;
        this.elements.levelTime.textContent = this.game.formatTime(state.playTime);

        this.elements.overlayLevelComplete.classList.remove('hidden');
    }

    /**
     * 提交分數
     */
    async submitScore() {
        const playerName = this.elements.playerName.value.trim();

        if (!playerName) {
            alert('請輸入玩家名稱！');
            this.elements.playerName.focus();
            return;
        }

        if (playerName.length > 50) {
            alert('玩家名稱不能超過 50 個字元！');
            return;
        }

        const state = this.game.getGameState();

        try {
            this.elements.btnSubmitScore.disabled = true;
            this.elements.btnSubmitScore.textContent = '提交中...';

            await apiClient.submitScore(
                playerName,
                state.score,
                state.level,
                state.playTime
            );

            alert('分數提交成功！');

            // 顯示排行榜
            this.showLeaderboard();

            // 隱藏遊戲結束畫面
            this.elements.overlayGameOver.classList.add('hidden');

        } catch (error) {
            console.error('提交分數失敗:', error);
            alert('提交失敗，請稍後再試！');
        } finally {
            this.elements.btnSubmitScore.disabled = false;
            this.elements.btnSubmitScore.innerHTML = '<span>📝</span> 提交分數';
        }
    }

    /**
     * 顯示排行榜
     */
    async showLeaderboard() {
        this.elements.leaderboardPanel.classList.remove('hidden');
        this.elements.leaderboardList.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

        try {
            const response = await apiClient.getLeaderboard(10, 0);

            if (response.data && response.data.length > 0) {
                this.renderLeaderboard(response.data);
            } else {
                this.elements.leaderboardList.innerHTML = '<div class="leaderboard-empty">暫無排行榜資料</div>';
            }
        } catch (error) {
            console.error('取得排行榜失敗:', error);
            this.elements.leaderboardList.innerHTML = '<div class="leaderboard-empty">載入失敗，請稍後再試</div>';
        }
    }

    /**
     * 渲染排行榜
     * @param {Array} scores - 分數資料
     */
    renderLeaderboard(scores) {
        this.elements.leaderboardList.innerHTML = scores.map((score, index) => {
            const rank = index + 1;
            const topClass = rank <= 3 ? `top-${rank}` : '';
            const time = this.formatTime(score.play_time);

            return `
                <div class="leaderboard-item ${topClass}">
                    <div class="rank">#${rank}</div>
                    <div class="player-info">
                        <div class="player-name">${this.escapeHtml(score.player_name)}</div>
                        <div class="player-details">${score.level} 關 | ${time}</div>
                    </div>
                    <div class="player-score">${score.score}</div>
                </div>
            `;
        }).join('');
    }

    /**
     * 格式化時間
     * @param {number} seconds - 秒數
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * 防止 XSS 攻擊
     * @param {string} text - 要轉義的文字
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * 啟動 UI 更新循環
     */
    startUIUpdateLoop() {
        setInterval(() => {
            this.updateUI();
            this.checkGameState();
        }, 100);
    }

    /**
     * 更新 UI 顯示
     */
    updateUI() {
        const state = this.game.getGameState();

        this.elements.scoreDisplay.textContent = state.score;
        this.elements.levelDisplay.textContent = state.level;
        this.elements.timeDisplay.textContent = this.game.formatTime(state.playTime);
    }

    /**
     * 檢查遊戲狀態
     */
    checkGameState() {
        const state = this.game.getGameState();

        // 檢查遊戲結束（Bug 1 修復：改用 'hidden' class 判斷，避免重複觸發）
        if (state.isGameOver && this.elements.overlayGameOver.classList.contains('hidden')) {
            this.showGameOver();
        }

        // 檢查關卡完成（只在 overlay 尚未顯示時觸發）
        if (state.isLevelComplete && this.elements.overlayLevelComplete.classList.contains('hidden')) {
            this.showLevelComplete();
        }
    }
}

// 當 DOM 載入完成後初始化 UI
document.addEventListener('DOMContentLoaded', () => {
    window.uiController = new UIController();
});

// 匯出 UIController 類別
export default UIController;
