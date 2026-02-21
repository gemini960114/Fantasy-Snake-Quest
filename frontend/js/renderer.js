/**
 * Renderer - 遊戲渲染系統
 * 負責繪製遊戲畫面、粒子效果、光暈等視覺元素
 */

class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;

        // 網格大小
        this.gridSize = 20;
        this.cols = Math.floor(this.width / this.gridSize);
        this.rows = Math.floor(this.height / this.gridSize);

        // 粒子系統
        this.particles = [];

        // 背景星星
        this.stars = this.createStars(100);

        // 動畫計時器
        this.animationFrame = 0;

        // 顏色配置
        this.colors = {
            snakeHead: '#ff6b6b',
            snakeBody: '#4ecdc4',
            food: '#ffd93d',
            foodGlow: '#ffeb3b',
            obstacle: '#6c757d',
            trap: '#74c0fc',
            grid: 'rgba(157, 78, 221, 0.1)',
            background: '#10002b'
        };
    }

    /**
     * 建立背景星星
     */
    createStars(count) {
        const stars = [];
        for (let i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 2 + 0.5,
                speed: Math.random() * 0.5 + 0.1,
                opacity: Math.random()
            });
        }
        return stars;
    }

    /**
     * 清除畫布
     */
    clear() {
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    /**
     * 繪製背景
     */
    drawBackground() {
        // 繪製網格
        this.ctx.strokeStyle = this.colors.grid;
        this.ctx.lineWidth = 0.5;

        for (let x = 0; x <= this.width; x += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }

        for (let y = 0; y <= this.height; y += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }

        // 繪製移動星星
        this.stars.forEach(star => {
            star.y += star.speed;
            if (star.y > this.height) {
                star.y = 0;
                star.x = Math.random() * this.width;
            }

            star.opacity = 0.3 + Math.sin(this.animationFrame * 0.05 + star.x) * 0.3;

            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(157, 78, 221, ${star.opacity})`;
            this.ctx.fill();
        });
    }

    /**
     * 繪製蛇
     * @param {Array} snake - 蛇的身體陣列
     * @param {string} direction - 移動方向
     */
    drawSnake(snake, direction) {
        // 繪製身體
        snake.forEach((segment, index) => {
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;
            const size = this.gridSize - 2;

            // 漸變色
            const progress = index / snake.length;
            const r = Math.floor(78 + (255 - 78) * progress);
            const g = Math.floor(205 + (107 - 205) * progress);
            const b = Math.floor(196 + (107 - 196) * progress);

            // 陰影效果
            this.ctx.shadowColor = `rgba(78, 205, 196, 0.5)`;
            this.ctx.shadowBlur = 10;

            // 身體區塊
            this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            this.ctx.beginPath();
            this.ctx.roundRect(x + 1, y + 1, size, size, 4);
            this.ctx.fill();

            // 內部高光
            this.ctx.fillStyle = `rgba(255, 255, 255, 0.2)`;
            this.ctx.beginPath();
            this.ctx.roundRect(x + 3, y + 3, size - 4, size / 2 - 2, 2);
            this.ctx.fill();
        });

        // 繪製頭部
        const head = snake[0];
        const headX = head.x * this.gridSize;
        const headY = head.y * this.gridSize;
        const headSize = this.gridSize - 2;

        // 頭部陰影
        this.ctx.shadowColor = 'rgba(255, 107, 107, 0.8)';
        this.ctx.shadowBlur = 15;

        // 頭部主體
        this.ctx.fillStyle = this.colors.snakeHead;
        this.ctx.beginPath();
        this.ctx.roundRect(headX + 1, headY + 1, headSize, headSize, 6);
        this.ctx.fill();

        // 眼睛
        this.ctx.shadowBlur = 0;
        const eyeSize = 4;
        const eyeOffset = 5;

        let eye1X, eye1Y, eye2X, eye2Y;

        switch (direction) {
            case 'up':
                eye1X = headX + eyeOffset;
                eye1Y = headY + eyeOffset;
                eye2X = headX + headSize - eyeOffset - eyeSize;
                eye2Y = headY + eyeOffset;
                break;
            case 'down':
                eye1X = headX + eyeOffset;
                eye1Y = headY + headSize - eyeOffset - eyeSize;
                eye2X = headX + headSize - eyeOffset - eyeSize;
                eye2Y = headY + headSize - eyeOffset - eyeSize;
                break;
            case 'left':
                eye1X = headX + eyeOffset;
                eye1Y = headY + eyeOffset;
                eye2X = headX + eyeOffset;
                eye2Y = headY + headSize - eyeOffset - eyeSize;
                break;
            case 'right':
            default:
                eye1X = headX + headSize - eyeOffset - eyeSize;
                eye1Y = headY + eyeOffset;
                eye2X = headX + headSize - eyeOffset - eyeSize;
                eye2Y = headY + headSize - eyeOffset - eyeSize;
                break;
        }

        // 眼白
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(eye1X + eyeSize / 2, eye1Y + eyeSize / 2, eyeSize, 0, Math.PI * 2);
        this.ctx.arc(eye2X + eyeSize / 2, eye2Y + eyeSize / 2, eyeSize, 0, Math.PI * 2);
        this.ctx.fill();

        // 瞳孔
        this.ctx.fillStyle = '#000000';
        this.ctx.beginPath();
        this.ctx.arc(eye1X + eyeSize / 2, eye1Y + eyeSize / 2, eyeSize / 2, 0, Math.PI * 2);
        this.ctx.arc(eye2X + eyeSize / 2, eye2Y + eyeSize / 2, eyeSize / 2, 0, Math.PI * 2);
        this.ctx.fill();
    }

    /**
     * 繪製食物
     * @param {Object} food - 食物位置
     */
    drawFood(food) {
        if (!food) return;

        const x = food.x * this.gridSize + this.gridSize / 2;
        const y = food.y * this.gridSize + this.gridSize / 2;
        const baseRadius = this.gridSize / 2 - 2;

        // 閃爍動畫
        const pulse = Math.sin(this.animationFrame * 0.1) * 0.2 + 0.8;
        const radius = baseRadius * pulse;

        // 光暈效果
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius * 2);
        gradient.addColorStop(0, this.colors.foodGlow);
        gradient.addColorStop(0.5, this.colors.food);
        gradient.addColorStop(1, 'rgba(255, 217, 61, 0)');

        this.ctx.shadowColor = this.colors.foodGlow;
        this.ctx.shadowBlur = 20;

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius * 2, 0, Math.PI * 2);
        this.ctx.fill();

        // 食物主體
        this.ctx.fillStyle = this.colors.food;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();

        // 高光
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.beginPath();
        this.ctx.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.3, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.shadowBlur = 0;
    }

    /**
     * 繪製障礙物
     * @param {Array} obstacles - 障礙物陣列
     */
    drawObstacles(obstacles) {
        obstacles.forEach(obs => {
            const x = obs.x * this.gridSize;
            const y = obs.y * this.gridSize;
            const size = this.gridSize - 2;

            // 障礙物陰影
            this.ctx.shadowColor = 'rgba(108, 117, 125, 0.5)';
            this.ctx.shadowBlur = 8;

            // 障礙物主體
            this.ctx.fillStyle = this.colors.obstacle;
            this.ctx.beginPath();
            this.ctx.roundRect(x + 1, y + 1, size, size, 3);
            this.ctx.fill();

            // 紋理
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            this.ctx.fillRect(x + 3, y + 3, size - 6, 2);
            this.ctx.fillRect(x + 3, y + size - 5, size - 6, 2);
        });

        this.ctx.shadowBlur = 0;
    }

    /**
     * 繪製陷阱
     * @param {Array} traps - 陷阱陣列
     */
    drawTraps(traps) {
        traps.forEach(trap => {
            const x = trap.x * this.gridSize;
            const y = trap.y * this.gridSize;
            const size = this.gridSize - 2;

            // 冰凍閃爍效果
            const flicker = Math.sin(this.animationFrame * 0.15) * 0.3 + 0.7;

            // 陷阱光暈
            this.ctx.shadowColor = 'rgba(116, 192, 252, 0.6)';
            this.ctx.shadowBlur = 15;

            // 陷阱主體
            this.ctx.fillStyle = `rgba(116, 192, 252, ${flicker})`;
            this.ctx.beginPath();
            this.ctx.roundRect(x + 1, y + 1, size, size, 3);
            this.ctx.fill();

            // 冰晶圖案
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(x + size / 2, y + 3);
            this.ctx.lineTo(x + size / 2, y + size - 3);
            this.ctx.moveTo(x + 3, y + size / 2);
            this.ctx.lineTo(x + size - 3, y + size / 2);
            this.ctx.stroke();
        });

        this.ctx.shadowBlur = 0;
    }

    /**
     * 建立粒子效果
     * @param {number} x - X 座標
     * @param {number} y - Y 座標
     * @param {string} color - 粒子顏色
     */
    createParticles(x, y, color = '#ffd93d') {
        const particleCount = 12;

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 / particleCount) * i;
            const speed = Math.random() * 3 + 2;

            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                decay: Math.random() * 0.03 + 0.02,
                size: Math.random() * 4 + 2,
                color: color
            });
        }
    }

    /**
     * 更新粒子
     */
    updateParticles() {
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay;
            p.vx *= 0.95;
            p.vy *= 0.95;
            return p.life > 0;
        });
    }

    /**
     * 繪製粒子
     */
    drawParticles() {
        this.particles.forEach(p => {
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            this.ctx.fill();
        });

        this.ctx.globalAlpha = 1;
    }

    /**
     * 繪製遊戲畫面
     * @param {Object} gameState - 遊戲狀態
     */
    render(gameState) {
        this.animationFrame++;

        this.clear();
        this.drawBackground();

        // 繪製遊戲元素
        if (gameState.obstacles) {
            this.drawObstacles(gameState.obstacles);
        }

        if (gameState.traps) {
            this.drawTraps(gameState.traps);
        }

        if (gameState.food) {
            this.drawFood(gameState.food);
        }

        if (gameState.snake) {
            this.drawSnake(gameState.snake, gameState.direction);
        }

        // 更新和繪製粒子
        this.updateParticles();
        this.drawParticles();
    }

    /**
     * 取得網格座標
     * @param {number} x - 像素 X 座標
     * @param {number} y - 像素 Y 座標
     */
    getGridPosition(x, y) {
        return {
            x: Math.floor(x / this.gridSize),
            y: Math.floor(y / this.gridSize)
        };
    }
}

// 匯出 Renderer 類別
export default Renderer;
