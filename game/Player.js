// ==================== Player.js (V4.0 - 最终比例版) ====================
export default class Player {
    constructor(gameWidth, gameHeight) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.image = new Image();
        this.image.src = '/images/player.png'; // 确保图片在 images 文件夹！
        this.spriteWidth = 256;
        this.spriteHeight = 256;
        this.scale = 0.5;
        this.width = this.spriteWidth * this.scale;
        this.height = this.spriteHeight * this.scale;
        this.x = 100; // 让她出生在左边一点
        this.y = 100; // 让她出生在上面一点
        this.speed = 0;
        this.maxSpeed = 3;
        this.vy = 0; // 垂直速度，暂时不用
        this.frameX = 0;
        this.maxFrame = 3;
        this.fps = 8;
        this.frameTimer = 0;
        this.frameInterval = 1000 / this.fps;
    }

    update(input, deltaTime) {
        // --- 水平移动 ---
        if (input.keys.indexOf('d') > -1) { this.speed = this.maxSpeed; } 
        else if (input.keys.indexOf('a') > -1) { this.speed = -this.maxSpeed; } 
        else { this.speed = 0; }
        this.x += this.speed;

        // --- 垂直移动 (我们也加上 W 和 S！) ---
        if (input.keys.indexOf('w') > -1) { this.vy = -this.maxSpeed; }
        else if (input.keys.indexOf('s') > -1) { this.vy = this.maxSpeed; }
        else { this.vy = 0; }
        this.y += this.vy;
        
        // --- 边界检测 ---
        if (this.x < 0) this.x = 0;
        if (this.x > this.gameWidth - this.width) this.x = this.gameWidth - this.width;
        if (this.y < 0) this.y = 0;
        if (this.y > this.gameHeight - this.height) this.y = this.gameHeight - this.height;

        // --- 动画更新 ---
        if (this.speed !== 0 || this.vy !== 0) { // 只要在动，就播放动画
            this.frameTimer += deltaTime;
            if (this.frameTimer > this.frameInterval) {
                this.frameX = (this.frameX + 1) % (this.maxFrame + 1);
                this.frameTimer = 0;
            }
        } else {
            this.frameX = 0;
        }
    }

    draw(context) {
        context.drawImage(
            this.image,
            this.frameX * this.spriteWidth, 0,
            this.spriteWidth, this.spriteHeight,
            this.x, this.y,
            this.width, this.height
        );
    }
}