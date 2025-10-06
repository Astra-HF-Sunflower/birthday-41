// ==================== Player.js (V3.1 - 终极动画版) ====================

export default class Player {
    
constructor(gameWidth, gameHeight) {
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;

    // --- “裁剪”尺寸 (基于我们新的、无变形的图片) ---
    this.image = new Image();
    this.image.src = './game/player.png';
    this.spriteWidth = 256;    // 单帧宽度
    this.spriteHeight = 256;   // 单帧高度
    
    // --- 【核心！】“智能缩放”！ ---
    this.scale = 0.5; // 缩放比例！你可以改成 0.4, 0.6, 任何你喜欢的大小！
    this.width = this.spriteWidth * this.scale;
    this.height = this.spriteHeight * this.scale;

    this.x = this.gameWidth / 2 - this.width / 2;
    this.y = this.gameHeight - this.height - 20;
    
    this.speed = 0;
    this.maxSpeed = 3;

    // --- 动画控制 (保持不变) ---
    this.frameX = 0;
    this.maxFrame = 3;
    this.fps = 8;
    this.frameTimer = 0;
    this.frameInterval = 1000 / this.fps;
}

    update(input, deltaTime) {
        // --- 移动逻辑 ---
        if (input.keys.indexOf('d') > -1) {
            this.speed = this.maxSpeed;
        } else if (input.keys.indexOf('a') > -1) {
            this.speed = -this.maxSpeed;
        } else {
            this.speed = 0;
        }
        this.x += this.speed;
        if (this.x < 0) this.x = 0;
        if (this.x > this.gameWidth - this.width) this.x = this.gameWidth - this.width;

        // --- 动画更新逻辑 ---
        if (this.speed !== 0) {
            this.frameTimer += deltaTime;
            if (this.frameTimer > this.frameInterval) {
                this.frameX = (this.frameX + 1) % (this.maxFrame + 1); // 用取余运算来完美循环！
                this.frameTimer = 0;
            }
        } else {
            this.frameX = 0;
        }
    }

    draw(context) {
        // 【核心！】我们现在绝对是在画精灵图了！
        context.drawImage(
            this.image,
            this.frameX * this.spriteWidth, 0,
            this.spriteWidth, this.spriteHeight,
            this.x, this.y,
            this.width, this.height
        );
    }
}