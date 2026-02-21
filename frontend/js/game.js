/**
 * Game Engine - 貪食蛇遊戲核心邏輯
 * 處理遊戲狀態、關卡、碰撞檢測等
 */

// 關卡配置
const LEVEL_CONFIG = {
    1: {
        name: '翠綠森林',
        speed: 150,
        foodScore: 10,
        targetScore: 100,
        obstacles: [],
        traps: [],
        hasObstacles: false,
        hasTraps: false
    },
    2: {
        name: '幽暗洞穴',
        speed: 120,
        foodScore: 15,
        targetScore: 300,
        obstacles: [],
        traps: [],
        hasObstacles: true,
        hasTraps: false
    },
    3: {
        name: '火焰地獄',
        speed: 100,
        foodScore: 20,
        targetScore: 600,
        obstacles: [],
        traps: [],
        hasObstacles: true,
        hasTraps: false,
        movingObstacles: true
    },
    4: {
        name: '冰雪王國',
        speed: 80,
        foodScore: 25,
        targetScore: 1000,
        obstacles: [],
        traps: [],
        hasObstacles: true,
        hasTraps: true
    },
    5: {
        name: '最終試煉',
        speed: 60,
        foodScore: 30,
        targetScore: 1500,
        obstacles: [],
        traps: [],
        hasObstacles: true,
        hasTraps: true,
        movingObstacles: true
    }
};

class Game {
    constructor(renderer) {
        this.renderer = renderer;
        this.canvas = renderer.canvas;

        // 遊戲狀態
        this.isRunning = false;
        this.isPaused = false;
        this.isGameOver = false;
        this.isLevelComplete = false;

        // 遊戲資料
        this.snake = [];
        this.food = null;
        this.obstacles = [];
        this.traps = [];
        this.direction = 'right';
        this.nextDirection = 'right';

        // 分數與關卡
        this.score = 0;
        this.level = 1;
        this.playTime = 0;
        this.startTime = 0;

        // 計時器
        this.gameLoop = null;
        this.timeLoop = null;
        this.obstacleMoveTimer = 0;

        // 冰凍狀態
        this.isFrozen = false;
        this.freezeTimer = 0;

        // 綁定鍵盤事件
        this.bindKeyboardEvents();
    }

    /**
     * 綁定鍵盤事件
     */
    bindKeyboardEvents() {
        document.addEventListener('keydown', (e) => {
            if (!this.isRunning || this.isPaused) return;

            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    if (this.direction !== 'down') {
                        this.nextDirection = 'up';
                    }
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    if (this.direction !== 'up') {
                        this.nextDirection = 'down';
                    }
                    e.preventDefault();
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    if (this.direction !== 'right') {
                        this.nextDirection = 'left';
                    }
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    if (this.direction !== 'left') {
                        this.nextDirection = 'right';
                    }
                    e.preventDefault();
                    break;
                case ' ':
                    this.togglePause();
                    e.preventDefault();
                    break;
            }
        });
    }

    /**
     * 初始化遊戲
     */
    init() {
        // 初始化蛇
        this.snake = [
            { x: 5, y: 10 },
            { x: 4, y: 10 },
            { x: 3, y: 10 }
        ];

        this.direction = 'right';
        this.nextDirection = 'right';

        // 初始化分數和關卡
        this.score = 0;
        this.level = 1;
        this.playTime = 0;

        // 初始化關卡元素
        this.initLevel();

        // 生成食物
        this.spawnFood();

        // 遊戲狀態
        this.isRunning = true;
        this.isPaused = false;
        this.isGameOver = false;
        this.isLevelComplete = false;

        // 記錄開始時間
        this.startTime = Date.now();

        // 啟動遊戲循環
        this.startGameLoop();
        this.startTimeLoop();
    }

    /**
     * 初始化關卡
     */
    initLevel() {
        const config = LEVEL_CONFIG[this.level];

        // 清空障礙物和陷阱
        this.obstacles = [];
        this.traps = [];

        // 根據關卡生成障礙物
        if (config.hasObstacles) {
            this.generateObstacles();
        }

        // 根據關卡生成陷阱
        if (config.hasTraps) {
            this.generateTraps();
        }

        // 重置移動障礙計時器
        this.obstacleMoveTimer = 0;
    }

    /**
     * 生成障礙物
     */
    generateObstacles() {
        const obstacleCount = 5 + this.level * 2;
        const maxAttempts = 100;

        for (let i = 0; i < obstacleCount; i++) {
            let attempts = 0;
            let validPosition = false;
            let x, y;

            while (!validPosition && attempts < maxAttempts) {
                x = Math.floor(Math.random() * this.renderer.cols);
                y = Math.floor(Math.random() * this.renderer.rows);

                // 檢查是否與蛇重疊
                const overlapsSnake = this.snake.some(seg => seg.x === x && seg.y === y);

                // 檢查是否與食物重疊
                const overlapsFood = this.food && this.food.x === x && this.food.y === y;

                // 檢查是否與現有障礙物重疊
                const overlapsObstacle = this.obstacles.some(obs => obs.x === x && obs.y === y);

                // 檢查是否在邊界區域（保留空間給蛇）
                const isSafeZone = x > 2 && x < this.renderer.cols - 3 && y > 2 && y < this.renderer.rows - 3;

                if (!overlapsSnake && !overlapsFood && !overlapsObstacle && isSafeZone) {
                    validPosition = true;
                }

                attempts++;
            }

            if (validPosition) {
                this.obstacles.push({
                    x,
                    y,
                    moving: LEVEL_CONFIG[this.level].movingObstacles && Math.random() > 0.5,
                    moveDirection: ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)]
                });
            }
        }
    }

    /**
     * 生成陷阱
     */
    generateTraps() {
        const trapCount = 3 + this.level;

        for (let i = 0; i < trapCount; i++) {
            let attempts = 0;
            let validPosition = false;
            let x, y;

            while (!validPosition && attempts < 100) {
                x = Math.floor(Math.random() * this.renderer.cols);
                y = Math.floor(Math.random() * this.renderer.rows);

                const overlapsSnake = this.snake.some(seg => seg.x === x && seg.y === y);
                const overlapsFood = this.food && this.food.x === x && this.food.y === y;
                const overlapsObstacle = this.obstacles.some(obs => obs.x === x && obs.y === y);
                const overlapsTrap = this.traps.some(trap => trap.x === x && trap.y === y);
                const isSafeZone = x > 2 && x < this.renderer.cols - 3 && y > 2 && y < this.renderer.rows - 3;

                if (!overlapsSnake && !overlapsFood && !overlapsObstacle && !overlapsTrap && isSafeZone) {
                    validPosition = true;
                }

                attempts++;
            }

            if (validPosition) {
                this.traps.push({ x, y });
            }
        }
    }

    /**
     * 生成食物
     */
    spawnFood() {
        let validPosition = false;
        let x, y;
        let attempts = 0;
        const maxAttempts = 500; // Bug 3 修復：加入嘗試次數上限防止無限迴圈

        while (!validPosition && attempts < maxAttempts) {
            x = Math.floor(Math.random() * this.renderer.cols);
            y = Math.floor(Math.random() * this.renderer.rows);

            // 檢查是否與蛇、障礙物、陷阱重疊
            const overlapsSnake = this.snake.some(seg => seg.x === x && seg.y === y);
            const overlapsObstacle = this.obstacles.some(obs => obs.x === x && obs.y === y);
            const overlapsTrap = this.traps.some(trap => trap.x === x && trap.y === y);

            if (!overlapsSnake && !overlapsObstacle && !overlapsTrap) {
                validPosition = true;
            }

            attempts++;
        }

        if (!validPosition) {
            // 找不到空位置（遊戲場地已滿），觸發遊戲結束
            console.warn('spawnFood: 無法找到合法位置，遊戲結束');
            this.gameOver();
            return;
        }

        this.food = { x, y };
    }

    /**
     * 啟動遊戲循環
     */
    startGameLoop() {
        const config = LEVEL_CONFIG[this.level];

        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }

        this.gameLoop = setInterval(() => {
            if (!this.isPaused && this.isRunning && !this.isGameOver) {
                this.update();
                this.render();
            }
        }, config.speed);
    }

    /**
     * 啟動時間循環
     */
    startTimeLoop() {
        if (this.timeLoop) {
            clearInterval(this.timeLoop);
        }

        this.timeLoop = setInterval(() => {
            if (this.isRunning && !this.isPaused && !this.isGameOver) {
                this.playTime = Math.floor((Date.now() - this.startTime) / 1000);
            }
        }, 1000);
    }

    /**
     * 更新遊戲狀態
     */
    update() {
        // 處理冰凍狀態
        if (this.isFrozen) {
            this.freezeTimer--;
            if (this.freezeTimer <= 0) {
                this.isFrozen = false;
            }
            return;
        }

        // 更新方向
        this.direction = this.nextDirection;

        // 計算新蛇頭位置
        const head = { ...this.snake[0] };

        switch (this.direction) {
            case 'up':
                head.y--;
                break;
            case 'down':
                head.y++;
                break;
            case 'left':
                head.x--;
                break;
            case 'right':
                head.x++;
                break;
        }

        // 檢查邊界碰撞
        if (head.x < 0 || head.x >= this.renderer.cols ||
            head.y < 0 || head.y >= this.renderer.rows) {
            this.gameOver();
            return;
        }

        // 檢查障礙物碰撞
        if (this.obstacles.some(obs => obs.x === head.x && obs.y === head.y)) {
            this.gameOver();
            return;
        }

        // 檢查自身碰撞
        if (this.snake.some(seg => seg.x === head.x && seg.y === head.y)) {
            this.gameOver();
            return;
        }

        // 移動蛇
        this.snake.unshift(head);

        // 檢查食物碰撞
        if (this.food && head.x === this.food.x && head.y === this.food.y) {
            // 吃到食物
            const config = LEVEL_CONFIG[this.level];
            this.score += config.foodScore;

            // 創建粒子效果
            const foodPixelX = this.food.x * this.renderer.gridSize + this.renderer.gridSize / 2;
            const foodPixelY = this.food.y * this.renderer.gridSize + this.renderer.gridSize / 2;
            this.renderer.createParticles(foodPixelX, foodPixelY);

            // 生成新食物
            this.spawnFood();

            // 檢查是否過關
            this.checkLevelComplete();
        } else {
            // 移除尾部
            this.snake.pop();
        }

        // 更新移動障礙物
        this.updateMovingObstacles();

        // 檢查陷阱碰撞
        this.checkTrapCollision();
    }

    /**
     * 更新移動障礙物
     */
    updateMovingObstacles() {
        if (!LEVEL_CONFIG[this.level].movingObstacles) return;

        this.obstacleMoveTimer++;

        // 每 3 次遊戲更新移動一次障礙物
        if (this.obstacleMoveTimer >= 3) {
            this.obstacleMoveTimer = 0;

            this.obstacles.forEach(obs => {
                if (!obs.moving) return;

                let newX = obs.x;
                let newY = obs.y;

                switch (obs.moveDirection) {
                    case 'up': newY--; break;
                    case 'down': newY++; break;
                    case 'left': newX--; break;
                    case 'right': newX++; break;
                }

                // 檢查邊界
                if (newX >= 0 && newX < this.renderer.cols &&
                    newY >= 0 && newY < this.renderer.rows) {

                    // 檢查是否與蛇碰撞
                    const hitsSnake = this.snake.some(seg => seg.x === newX && seg.y === newY);

                    if (!hitsSnake) {
                        obs.x = newX;
                        obs.y = newY;
                    } else {
                        // 改變方向
                        const directions = ['up', 'down', 'left', 'right'];
                        obs.moveDirection = directions[Math.floor(Math.random() * directions.length)];
                    }
                } else {
                    // 碰到邊界，改變方向
                    const directions = ['up', 'down', 'left', 'right'];
                    obs.moveDirection = directions[Math.floor(Math.random() * directions.length)];
                }
            });
        }
    }

    /**
     * 檢查陷阱碰撞
     */
    checkTrapCollision() {
        const head = this.snake[0];
        const trapIndex = this.traps.findIndex(trap => trap.x === head.x && trap.y === head.y);

        if (trapIndex !== -1) {
            this.isFrozen = true;
            this.freezeTimer = 20; // 凍住 20 個遊戲週期（約 2 秒）
            // Bug 7 修復：踩到陷阱後將其移除，避免解凍後重複觸發
            this.traps.splice(trapIndex, 1);
        }
    }

    /**
     * 檢查關卡完成
     */
    checkLevelComplete() {
        const config = LEVEL_CONFIG[this.level];

        if (this.score >= config.targetScore) {
            if (this.level < 5) {
                // 進入下一關
                this.isLevelComplete = true;
                this.isRunning = false;
                clearInterval(this.gameLoop);
            } else {
                // Bug 2 修復：第 5 關達標處損遊戲結束（游戲通關）
                this.gameOver();
            }
        }
    }

    /**
     * 渲染遊戲畫面
     */
    render() {
        this.renderer.render({
            snake: this.snake,
            food: this.food,
            obstacles: this.obstacles,
            traps: this.traps,
            direction: this.direction
        });
    }

    /**
     * 切換暫停狀態
     */
    togglePause() {
        this.isPaused = !this.isPaused;
    }

    /**
     * 遊戲結束
     */
    gameOver() {
        this.isGameOver = true;
        this.isRunning = false;

        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }

        if (this.timeLoop) {
            clearInterval(this.timeLoop);
        }
    }

    /**
     * 進入下一關
     */
    nextLevel() {
        if (this.level < 5) {
            this.level++;
            this.initLevel();
            this.spawnFood(); // Bug 6 修復：換關後重新生成食物防止與障礙物重疊
            this.isLevelComplete = false;
            this.isRunning = true;
            this.startGameLoop();
        } else {
            // 最終關卡已結束，不應再进入
            this.isLevelComplete = false;
            this.isRunning = false;
        }
    }

    /**
     * 取得遊戲狀態
     */
    getGameState() {
        return {
            score: this.score,
            level: this.level,
            playTime: this.playTime,
            isRunning: this.isRunning,
            isPaused: this.isPaused,
            isGameOver: this.isGameOver,
            isLevelComplete: this.isLevelComplete
        };
    }

    /**
     * 格式化時間
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * 停止遊戲
     */
    stop() {
        this.isRunning = false;
        this.isPaused = false;

        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }

        if (this.timeLoop) {
            clearInterval(this.timeLoop);
        }
    }
}

// 匯出 Game 類別
export default Game;
