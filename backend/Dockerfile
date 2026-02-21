# ── 後端 Dockerfile ──────────────────────────────────────
# 使用官方 Python 3.11 slim 映像
FROM python:3.11-slim

# 設定工作目錄
WORKDIR /app

# 複製依賴清單並安裝（利用 Docker layer cache）
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 複製應用程式程式碼
COPY . .

# Cloud Run 會注入 PORT 環境變數（預設 8080）
# 我們讀取它並傳給 uvicorn
ENV PORT=8080

# 啟動指令
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT}
