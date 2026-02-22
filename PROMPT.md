你是一位資深全端工程師。請依據 skills：`backend-development`、`frontend-development`t`、`node-npm-environment`、`uv-environment`，從零開始規劃並實作「Fantasy 風格貪食蛇」Web App。

### 目標

* 使用者可直接在瀏覽器玩貪食蛇。
* 遊戲結束後可輸入姓名並提交成績。
* 頁面即時顯示排行榜（Top 20）。

### 前端需求（frontend-development）

* UI：現代化、前瞻、強烈 fantasy 氛圍（發光、霓虹、粒子、魔法符文、玻璃擬態等任選），整體一致的視覺系統。
* 介面：開始/暫停/重新開始、HUD（分數、關卡、時間）、Game Over 對話框（姓名輸入 + 提交按鈕）。
* 排行榜：右側或浮層顯示 Top 20（姓名、分數、關卡、時間）。
* 技術：建議 React + Vite + TypeScript（或你自行選擇但需說明理由），遊戲用 Canvas 或 WebGL（擇一），需有乾淨的模組化結構（game engine / render / ui / api）。

### 後端需求（backend-development）

* 提供 REST API：

  * `POST /api/scores`：提交成績（name, score, level, duration_ms, played_at 可選）
  * `GET /api/leaderboard?limit=20`：取得排行榜（排序規則需說明）
* 資料儲存：SQLite 或 PostgreSQL（擇一），要提供 schema / migration 或初始化方式。
* 驗證與防呆：欄位長度、數值範圍、避免空姓名；回傳一致的錯誤格式。

### 交付格式

1. 先輸出「系統規劃」：架構圖（文字描述即可）、資料表設計、API 規格、前後端資料流程、排行榜排序規則。
2. 再輸出「專案結構」與「完整可執行程式碼」（分檔案呈現）。
3. 最後提供「本機啟動步驟」與「測試方式」（例如 curl 範例、前端操作流程）。
