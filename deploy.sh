#!/bin/bash
# ============================================================
#  Snake Fantasy — Google Cloud Run 部署腳本
#  使用方式：bash deploy.sh
# ============================================================

set -e  # 任何指令失敗立即中止

# ── 請修改以下變數 ──────────────────────────────────────────
PROJECT_ID="your-gcp-project-id"       # GCP 專案 ID
REGION="asia-east1"                     # 部署區域（台灣最近：asia-east1）
SERVICE_NAME="snake-fantasy-api"        # Cloud Run 服務名稱
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"
# ───────────────────────────────────────────────────────────

echo "🐍 Snake Fantasy — Cloud Run 部署開始"
echo "  專案：${PROJECT_ID}"
echo "  區域：${REGION}"
echo "  服務：${SERVICE_NAME}"
echo ""

# 1. 設定 GCP 專案
gcloud config set project "${PROJECT_ID}"

# 2. 建置 Docker 映像並推送至 GCR
echo "📦 建置 Docker 映像..."
cd "$(dirname "$0")/backend"
gcloud builds submit --tag "${IMAGE_NAME}" .

# 3. 部署到 Cloud Run
echo "🚀 部署至 Cloud Run..."
gcloud run deploy "${SERVICE_NAME}" \
  --image "${IMAGE_NAME}" \
  --platform managed \
  --region "${REGION}" \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --set-env-vars "PORT=8080"

# 4. 取得服務 URL
SERVICE_URL=$(gcloud run services describe "${SERVICE_NAME}" \
  --region "${REGION}" \
  --format "value(status.url)")

echo ""
echo "✅ 後端部署成功！"
echo "   API URL：${SERVICE_URL}"
echo ""
echo "⚠️  請將前端 frontend/js/api.js 中的 API_BASE_URL 改為："
echo "   ${SERVICE_URL}/api/v1"
echo ""
echo "📖 下一步：部署前端到 Firebase Hosting"
echo "   cd frontend"
echo "   firebase deploy"
