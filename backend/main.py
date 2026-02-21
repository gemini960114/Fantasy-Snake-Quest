from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from typing import Optional
import math
import os

from database import init_database, create_score, get_scores, get_score_by_id
from models import (
    ScoreCreate,
    ScoreResponse,
    ScoreListResponse,
    ScoreCreateResponse,
    ErrorResponse,
    ErrorDetail,
    PaginationInfo
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """應用程式生命週期管理"""
    # 啟動時初始化資料庫
    init_database()
    yield
    # 關閉時清理資源


app = FastAPI(
    title="Snake Fantasy API",
    description="貪食蛇遊戲分數記錄 API",
    version="1.0.0",
    lifespan=lifespan
)

# 設定 CORS 中間件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.post(
    "/api/v1/scores",
    response_model=ScoreCreateResponse,
    status_code=201,
    responses={
        422: {"model": ErrorResponse, "description": "驗證錯誤"}
    }
)
async def submit_score(score_data: ScoreCreate):
    """提交遊戲分數"""
    try:
        # 建立分數記錄
        result = create_score(
            player_name=score_data.player_name,
            score=score_data.score,
            level=score_data.level,
            play_time=score_data.play_time
        )
        
        if not result:
            raise HTTPException(status_code=500, detail="Failed to create score")
        
        # 格式化 created_at
        score_response = ScoreResponse(
            id=result["id"],
            player_name=result["player_name"],
            score=result["score"],
            level=result["level"],
            play_time=result["play_time"],
            created_at=result["created_at"]
        )
        
        return ScoreCreateResponse(success=True, data=score_response)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get(
    "/api/v1/scores",
    response_model=ScoreListResponse,
    responses={
        400: {"model": ErrorResponse, "description": "參數錯誤"}
    }
)
async def get_leaderboard(
    limit: int = Query(default=10, ge=1, le=100, description="每次返回數量"),
    offset: int = Query(default=0, ge=0, description="偏移量")
):
    """取得排行榜"""
    try:
        scores, total = get_scores(limit=limit, offset=offset)
        
        # 計算當前頁碼
        page = (offset // limit) + 1 if limit > 0 else 1
        
        # 轉換為響應模型
        score_responses = [
            ScoreResponse(
                id=score["id"],
                player_name=score["player_name"],
                score=score["score"],
                level=score["level"],
                play_time=score["play_time"],
                created_at=score["created_at"]
            )
            for score in scores
        ]
        
        pagination = PaginationInfo(
            page=page,
            limit=limit,
            total=total
        )
        
        return ScoreListResponse(
            success=True,
            data=score_responses,
            pagination=pagination
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get(
    "/api/v1/scores/{score_id}",
    response_model=ScoreCreateResponse,
    responses={
        404: {"model": ErrorResponse, "description": "分數不存在"}
    }
)
async def get_score(score_id: int):
    """根據 ID 取得單筆分數"""
    try:
        score = get_score_by_id(score_id)
        
        if not score:
            raise HTTPException(status_code=404, detail="Score not found")
        
        score_response = ScoreResponse(
            id=score["id"],
            player_name=score["player_name"],
            score=score["score"],
            level=score["level"],
            play_time=score["play_time"],
            created_at=score["created_at"]
        )
        
        return ScoreCreateResponse(success=True, data=score_response)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


# ⚠️ 注意：StaticFiles mount 必須在所有 API 路由定義完之後才掛載
# 否則「/」會攔截所有 /api/v1/* 的請求，造成 404 / 405
_frontend_dir = os.path.join(os.path.dirname(__file__), "..", "frontend")
if os.path.isdir(_frontend_dir):
    app.mount("/", StaticFiles(directory=_frontend_dir, html=True), name="frontend")
