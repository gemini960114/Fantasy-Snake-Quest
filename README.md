# 🐍 Snake Fantasy — 夢幻貪食蛇

> 一款結合現代視覺效果的多關卡貪食蛇遊戲，採用 FastAPI 後端 + 純 HTML/CSS/JavaScript 前端架構。

![Snake Fantasy](https://img.shields.io/badge/Snake%20Fantasy-v1.0.0-9d4edd?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.11%2B-3776AB?style=flat&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109%2B-009688?style=flat&logo=fastapi)
![License](https://img.shields.io/badge/License-MIT-green?style=flat)

---

## 📋 目錄

- [專案特色](#-專案特色)
- [專案結構](#-專案結構)
- [後端安裝與啟動](#-後端安裝與啟動)
- [前端安裝與啟動](#-前端安裝與啟動)
- [遊戲操作說明](#-遊戲操作說明)
- [關卡介紹](#-關卡介紹)
- [API 文件](#-api-文件)
- [注意事項](#-注意事項)

---

## ✨ 專案特色

- 🎮 **五大關卡**：逐漸增加難度的主題關卡
- 💫 **精美視覺效果**：粒子爆炸、發光特效、星空背景
- 🏆 **排行榜系統**：玩家分數即時提交與查詢
- ❄️ **陷阱機制**：冰凍陷阱讓遊戲更具挑戰性
- 🚧 **移動障礙物**：高關卡出現會自動移動的障礙物
- 📱 **鍵盤全支援**：方向鍵與 WASD 雙操作模式

---

## 📁 專案結構

```
roocode/
├── README.md                  # 本說明文件
├── .gitignore                 # Git 忽略設定
├── SPEC.md                    # 遊戲設計規格書
│
├── backend/                   # FastAPI 後端
│   ├── main.py                # API 主程式（路由定義）
│   ├── models.py              # Pydantic 資料模型
│   ├── database.py            # SQLite 資料庫操作
│   ├── pyproject.toml         # Python 專案設定（uv）
│   ├── requirements.txt       # Python 套件依賴清單
│   ├── run.sh                 # 一鍵啟動腳本
│   └── snake_game.db          # SQLite 資料庫（執行後自動建立）
│
└── frontend/                  # 純 HTML/JS 前端
    ├── index.html             # 主頁面
    ├── css/
    │   └── style.css          # 樣式表
    └── js/
        ├── game.js            # 遊戲核心邏輯引擎
        ├── renderer.js        # Canvas 渲染系統
        ├── ui.js              # UI 控制器（事件處理）
        └── api.js             # 後端 API 客戶端
```

---

## 🖥️ 後端安裝與啟動

### 前置需求

| 工具 | 版本 | 安裝說明 |
|------|------|---------|
| Python | ≥ 3.11 | [python.org](https://www.python.org/downloads/) |
| uv | 最新版 | `curl -LsSf https://astral.sh/uv/install.sh \| sh` |

> ⚠️ 若無 `uv`，也可使用傳統 `pip` 安裝（見下方替代方案）。

---

### 方法一：使用 uv（推薦）

```bash
# 1. 切換到後端目錄
cd backend

# 2. 建立虛擬環境並安裝依賴（uv 自動完成）
uv sync

# 3. 啟動伺服器（方法 A：使用啟動腳本）
bash run.sh

# 3. 啟動伺服器（方法 B：直接執行）
uv run uvicorn main:app --host 0.0.0.0 --port 8005
```

### 方法二：使用 pip（替代方案）

```bash
# 1. 切換到後端目錄
cd backend

# 2. 建立並啟動虛擬環境
python3 -m venv .venv
source .venv/bin/activate        # Linux / macOS
# .venv\Scripts\activate         # Windows

# 3. 安裝依賴套件
pip install -r requirements.txt

# 4. 啟動伺服器
uvicorn main:app --host 0.0.0.0 --port 8005
```

### 驗證後端運行

後端啟動後，於瀏覽器開啟以下網址確認服務正常：

```
http://localhost:8005/
```

預期回應：
```json
{
  "message": "🐍 Snake Fantasy API",
  "version": "1.0.0",
  "endpoints": {
    "POST /api/v1/scores": "提交遊戲分數",
    "GET /api/v1/scores": "取得排行榜",
    "GET /api/v1/scores/{id}": "取得單筆分數"
  }
}
```

互動式 API 文件（Swagger UI）：
```
http://localhost:8005/docs
```

---

## 🌐 前端安裝與啟動

前端為純靜態網頁，**無需安裝任何套件**，只需要一個 HTTP 伺服器即可。

### 方法一：使用 Python 內建伺服器（推薦）

```bash
# 切換到前端目錄
cd frontend

# 啟動靜態伺服器（Port 8090）
python3 -m http.server 8090
```

接著在瀏覽器開啟：

```
http://localhost:8090
```

### 方法二：使用 uv 執行

```bash
cd frontend
uv run python -m http.server 8090
```

### 方法三：其他 HTTP 伺服器

```bash
# 使用 Node.js serve
npx serve frontend -p 8090

# 使用 VS Code Live Server 擴充功能（直接開啟 frontend/index.html）
```

> ⚠️ **重要**：不可直接用瀏覽器開啟 `index.html` 檔案（`file://` 協定），因為 JavaScript 模組（`type="module"`）在本地端不支援跨來源載入，必須透過 HTTP 伺服器存取。

---

## 🎮 遊戲操作說明

### 基本控制

| 按鍵 | 功能 |
|------|------|
| `↑` / `W` | 向上移動 |
| `↓` / `S` | 向下移動 |
| `←` / `A` | 向左移動 |
| `→` / `D` | 向右移動 |
| `空白鍵` | 暫停 / 繼續 |
| `Esc` | 顯示暫停選單 |

### 遊戲流程

```
開始畫面 → 選擇遊戲 → 第 1 關
    ↓
 吃食物累積分數
    ↓
 達到目標分數 → 關卡完成 → 第 2 關 → ... → 第 5 關
    ↓                                           ↓
 碰到自身/牆壁/障礙物                      達到目標分數
    ↓                                           ↓
 遊戲結束 ←─────────────────────── 遊戲通關（顯示結束畫面）
    ↓
 輸入名稱提交分數 → 查看排行榜
```

### 遊戲元素說明

| 元素 | 外觀 | 說明 |
|------|------|------|
| 🟥 蛇頭 | 紅色發光方塊 | 玩家控制的蛇頭，碰觸目標判定點 |
| 🟩 蛇身 | 青綠漸層方塊 | 吃食物後增長，碰到自身則死亡 |
| 🟡 食物 | 黃色閃爍球體 | 吃到後得分並增加蛇身長度 |
| ⬛ 障礙物 | 灰色方塊 | 碰到即遊戲結束，高關卡會移動 |
| 🔵 陷阱 | 藍色冰晶方塊 | 踩到後凍住約 2 秒，踩後消失 |

### 分數機制

- 每吃一顆食物得分依關卡而異（詳見關卡介紹）
- 達到關卡目標分數後進入下一關
- 第 5 關達標後遊戲通關，最終分數可提交至排行榜

---

## 🗺️ 關卡介紹

| 關卡 | 名稱 | 速度 | 每顆食物分 | 目標分數 | 特殊機制 |
|------|------|------|-----------|---------|---------|
| 1 | 🌿 翠綠森林 | 慢（150ms） | 10 分 | 100 分 | 無障礙物、無陷阱，最適合新手練習 |
| 2 | 🌑 幽暗洞穴 | 中（120ms） | 15 分 | 300 分 | 出現靜態障礙物 |
| 3 | 🔥 火焰地獄 | 快（100ms） | 20 分 | 600 分 | 障礙物開始移動，需提高專注力 |
| 4 | ❄️ 冰雪王國 | 很快（80ms） | 25 分 | 1000 分 | 加入冰凍陷阱，移動障礙物增多 |
| 5 | ⚡ 最終試煉 | 極快（60ms） | 30 分 | 1500 分 | 最多陷阱+移動障礙物，速度最快 |

### 關卡詳細說明

#### 🌿 第 1 關：翠綠森林
新手友善的入門關卡。寬敞的場地、緩慢的速度，沒有任何障礙物和陷阱。目標是學習蛇的移動方式，累積 **100 分**即可過關。

#### 🌑 第 2 關：幽暗洞穴
場地中開始出現靜止的灰色障礙物，需要規劃路線繞過它們。速度略有提升，需要更謹慎的操作。目標分數：**300 分**。

#### 🔥 第 3 關：火焰地獄
危機四伏！部分障礙物開始自動移動，牠們會在邊界反彈並隨機改變方向。玩家需隨時注意障礙物的動向。目標分數：**600 分**。

#### ❄️ 第 4 關：冰雪王國
除了移動障礙物，藍色的冰凍陷阱也登場了！踩到陷阱後蛇會被凍住約 2 秒動彈不得，踩過的陷阱會消失。速度很快，需要冷靜應對。目標分數：**1000 分**。

#### ⚡ 第 5 關：最終試煉
最高難度！最密集的障礙物、最多的陷阱、最快的移動速度（60ms/幀）。唯有最頂尖的玩家才能在此存活並達到 **1500 分**，完成遊戲通關！

---

## 📡 API 文件

後端 API 基礎路徑：`http://localhost:8005/api/v1`

### POST `/api/v1/scores` — 提交分數

**Request Body：**
```json
{
  "player_name": "玩家名稱（1~50字元）",
  "score": 350,
  "level": 3,
  "play_time": 120
}
```

**Response（201 Created）：**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "player_name": "玩家名稱",
    "score": 350,
    "level": 3,
    "play_time": 120,
    "created_at": "2026-02-22 00:00:00"
  }
}
```

---

### GET `/api/v1/scores` — 取得排行榜

**Query 參數：**

| 參數 | 型別 | 預設值 | 說明 |
|------|------|--------|------|
| `limit` | int | 10 | 一次回傳筆數（1~100） |
| `offset` | int | 0 | 分頁偏移量 |

**範例：**
```
GET /api/v1/scores?limit=10&offset=0
```

**Response（200 OK）：**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42
  }
}
```

---

### GET `/api/v1/scores/{id}` — 取得單筆分數

```
GET /api/v1/scores/1
```

**Response（200 OK）：** 與提交分數的回應格式相同。

**Response（404 Not Found）：**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Score not found"
  }
}
```

---

## ⚠️ 注意事項

1. **啟動順序**：請先啟動後端（Port 8005），再啟動前端（Port 8090）。
2. **同源限制**：前端的 `api.js` 中 `API_BASE_URL` 預設為 `http://localhost:8005/api/v1`，若部署至其他主機需修改此設定。
3. **資料庫**：SQLite 資料庫檔案 `backend/snake_game.db` 會在後端首次啟動時自動建立，無需手動操作。
4. **瀏覽器需求**：需支援 ES Module（`type="module"`）的現代瀏覽器，建議使用 Chrome 90+、Firefox 89+、Edge 90+。
5. **防火牆**：若在遠端伺服器執行，請確認 Port 8005 和 Port 8090 已開放對外。

---

## 📝 License

MIT License — 歡迎自由使用與修改。

---

<div align="center">
  Made with ❤️ and 🐍 | Snake Fantasy v1.0.0
</div>
