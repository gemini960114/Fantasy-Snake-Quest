# ── Snake Fantasy — Dockerfile（前後端合一版）──────────────
# 前端靜態檔案 + FastAPI 後端，一個容器搞定，無需 Firebase
FROM python:3.11-slim

WORKDIR /app

# 安裝 Python 依賴
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 複製後端程式碼
COPY backend/ ./backend/

# 複製前端靜態檔案（前端放在 /app/frontend/）
COPY frontend/ ./frontend/

# 設定工作目錄為後端（main.py 在此）
WORKDIR /app/backend

# Cloud Run 注入 PORT 環境變數
ENV PORT=8080

# 啟動指令
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT}
