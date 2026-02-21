/**
 * API Client - 與後端伺服器通訊
 *
 * 自動偵測環境：
 *   - 本機開發（localhost:3000）→ 連到 localhost:8000
 *   - Cloud Run 部署（前後端同一網域）→ 使用相對路徑 /api/v1
 */

const isLocalDev = window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

const API_BASE_URL = isLocalDev
    ? 'http://localhost:8000/api/v1'   // 本機開發：後端在 8000
    : '/api/v1';                        // Cloud Run：前後端同一網域，用相對路徑

class APIClient {
    constructor(baseUrl = API_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    /**
     * 提交遊戲分數
     * @param {string} playerName - 玩家名稱
     * @param {number} score - 遊戲分數
     * @param {number} level - 通過關卡數
     * @param {number} playTime - 遊戲時長(秒)
     * @returns {Promise<Object>} 伺服器響應
     */
    async submitScore(playerName, score, level, playTime) {
        try {
            const response = await fetch(`${this.baseUrl}/scores`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    player_name: playerName,
                    score: score,
                    level: level,
                    play_time: playTime
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || '提交失敗');
            }

            return await response.json();
        } catch (error) {
            console.error('提交分數錯誤:', error);
            throw error;
        }
    }

    /**
     * 取得排行榜
     * @param {number} limit - 每次返回數量
     * @param {number} offset - 偏移量
     * @returns {Promise<Object>} 排行榜資料
     */
    async getLeaderboard(limit = 10, offset = 0) {
        try {
            const response = await fetch(
                `${this.baseUrl}/scores?limit=${limit}&offset=${offset}`
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || '取得排行榜失敗');
            }

            return await response.json();
        } catch (error) {
            console.error('取得排行榜錯誤:', error);
            throw error;
        }
    }

    /**
     * 取得單筆分數
     * @param {number} id - 分數 ID
     * @returns {Promise<Object>} 分數資料
     */
    async getScore(id) {
        try {
            const response = await fetch(`${this.baseUrl}/scores/${id}`);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || '取得分數失敗');
            }

            return await response.json();
        } catch (error) {
            console.error('取得分數錯誤:', error);
            throw error;
        }
    }
}

// 匯出 API 客戶端實例
const apiClient = new APIClient();

// 匯出類別以供測試
export { APIClient, API_BASE_URL };
export default apiClient;
