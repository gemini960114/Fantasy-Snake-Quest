#!/bin/bash
# ============================================================
#  Snake Fantasy — Google Cloud Run 部署腳本（SQLite 版）
#
#  ⚠️  注意：使用 SQLite 儲存資料
#      容器重啟或重新部署時，排行榜資料會被清空，這是預期行為。
#      如需永久保存資料，請改用 Cloud SQL。
#
#  使用方式：bash deploy.sh
# ============================================================

set -e  # 任何指令失敗立即中止

# ── 請修改以下變數 ──────────────────────────────────────────
PROJECT_ID="your-gcp-project-id"       # GCP 專案 ID（必填）
REGION="asia-east1"                     # 部署區域（台灣最近：asia-east1）
SERVICE_NAME="snake-fantasy-api"        # Cloud Run 服務名稱
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"
# ───────────────────────────────────────────────────────────

echo "🐍 Snake Fantasy — Cloud Run 部署（SQLite 版）"
echo "  專案：${PROJECT_ID}"
echo "  區域：${REGION}"
echo "  服務：${SERVICE_NAME}"
echo "  資料庫：SQLite（重啟後會清空，屬正常行為）"
echo "  模式：前後端合一，無需 Firebase Hosting"
echo ""

# 確認 PROJECT_ID 已設定
if [ "${PROJECT_ID}" = "your-gcp-project-id" ]; then
    echo "❌ 請先修改 deploy.sh 中的 PROJECT_ID！"
    exit 1
fi

# 1. 設定 GCP 專案
gcloud config set project "${PROJECT_ID}"

# 2. 建置 Docker 映像（從根目錄，Dockerfile 包含前後端）
echo "📦 建置 Docker 映像（前後端合一）..."
cd "$(dirname "$0")"
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
  --min-instances 1 \
  --max-instances 3 \
  --set-env-vars "PORT=8080"
#
# 說明：
#   --min-instances 1  → 維持至少 1 個容器常駐，減少 SQLite 資料遺失頻率
#                        （重新部署或 GCP 維護時仍會清空，這是正常現象）
#   --max-instances 3  → 最多 3 個容器（SQLite 多容器會各自維護獨立資料）

# 4. 取得服務 URL
SERVICE_URL=$(gcloud run services describe "${SERVICE_NAME}" \
  --region "${REGION}" \
  --format "value(status.url)")

echo ""
echo "✅ 部署成功（前後端合一）！"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🎮 遊戲網址：${SERVICE_URL}"
echo "  📡 API URL ：${SERVICE_URL}/api/v1"
echo "  📖 Swagger ：${SERVICE_URL}/docs"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔗 測試 API："
echo "   curl ${SERVICE_URL}/"
echo "   curl '${SERVICE_URL}/api/v1/scores?limit=5'"
echo ""
echo "⚠️  注意：SQLite 資料於重新部署時會清空，此為正常行為。"
