from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime


class ScoreCreate(BaseModel):
    """建立分數的請求模型"""
    player_name: str = Field(..., min_length=1, max_length=50, description="玩家名稱")
    score: int = Field(..., ge=0, description="遊戲分數")  # Bug 4 修復：改為 ge=0 允許零分提交
    level: int = Field(..., ge=1, le=5, description="通過關卡數")
    play_time: int = Field(..., ge=0, description="遊戲時長(秒)")  # 也改為 ge=0 允許時長為零
    
    @field_validator('player_name')
    @classmethod
    def validate_player_name(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("玩家名稱不能為空")
        return v.strip()


class ScoreResponse(BaseModel):
    """分數響應模型"""
    id: int
    player_name: str
    score: int
    level: int
    play_time: int
    created_at: str
    
    class Config:
        from_attributes = True


class PaginationInfo(BaseModel):
    """分頁資訊"""
    page: int
    limit: int
    total: int


class ScoreListResponse(BaseModel):
    """分數列表響應模型"""
    success: bool = True
    data: list[ScoreResponse]
    pagination: PaginationInfo


class ScoreCreateResponse(BaseModel):
    """建立分數響應模型"""
    success: bool = True
    data: ScoreResponse


class ErrorDetail(BaseModel):
    """錯誤詳情"""
    code: str
    message: str


class ErrorResponse(BaseModel):
    """錯誤響應模型"""
    success: bool = False
    error: ErrorDetail
