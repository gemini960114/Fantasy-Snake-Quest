#!/bin/bash
# 使用 uv 啟動 Snake Fantasy 後端伺服器

cd "$(dirname "$0")"

echo "🐍 正在使用 uv 啟動 Snake Fantasy 後端..."
echo ""

# 使用 uv run 執行 Python 腳本
uv run uvicorn main:app --host 0.0.0.0 --port 8005
