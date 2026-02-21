import sqlite3
from contextlib import contextmanager
from typing import List, Dict, Any, Optional

DATABASE_PATH = "snake_game.db"


def get_connection() -> sqlite3.Connection:
    """建立資料庫連接"""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn


@contextmanager
def get_db():
    """資料庫連接上下文管理器"""
    conn = get_connection()
    try:
        yield conn
    except Exception:
        # Bug 8 修復：發生異常時自動 rollback，避免不完整的交易狀態
        conn.rollback()
        raise
    finally:
        conn.close()


def init_database():
    """初始化資料庫表格"""
    with get_db() as conn:
        cursor = conn.cursor()
        
        # 建立分數表格
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS scores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                player_name VARCHAR(50) NOT NULL,
                score INTEGER NOT NULL,
                level INTEGER NOT NULL DEFAULT 1,
                play_time INTEGER NOT NULL DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # 建立索引以優化查詢
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_scores_score 
            ON scores(score DESC)
        """)
        
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_scores_level 
            ON scores(level DESC)
        """)
        
        conn.commit()


def create_score(player_name: str, score: int, level: int, play_time: int) -> Dict[str, Any]:
    """建立新的分數記錄"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO scores (player_name, score, level, play_time)
            VALUES (?, ?, ?, ?)
            """,
            (player_name, score, level, play_time)
        )
        conn.commit()
        
        # 取得剛插入的記錄
        cursor.execute("SELECT * FROM scores WHERE id = ?", (cursor.lastrowid,))
        row = cursor.fetchone()
        
        return dict(row) if row else None


def get_scores(limit: int = 10, offset: int = 0) -> tuple[List[Dict[str, Any]], int]:
    """取得分數列表（分頁）"""
    with get_db() as conn:
        cursor = conn.cursor()
        
        # 取得總數
        cursor.execute("SELECT COUNT(*) as total FROM scores")
        total = cursor.fetchone()["total"]
        
        # 取得分數列表（按分數降序排列）
        cursor.execute(
            """
            SELECT * FROM scores 
            ORDER BY score DESC, created_at DESC
            LIMIT ? OFFSET ?
            """,
            (limit, offset)
        )
        rows = cursor.fetchall()
        
        return [dict(row) for row in rows], total


def get_score_by_id(score_id: int) -> Optional[Dict[str, Any]]:
    """根據 ID 取得單筆分數"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM scores WHERE id = ?", (score_id,))
        row = cursor.fetchone()
        
        return dict(row) if row else None
