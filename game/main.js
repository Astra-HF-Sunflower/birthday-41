// ==================== main.js (V4.0 - 引擎总装版) ====================
import Player from './Player.js';
import InputHandler from './InputHandler.js';
import World from './World.js';

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// 【核心修复！】让画布重新占满整个窗口！
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
ctx.imageSmoothingEnabled = false;

// --- 创生万物！---
const player = new Player(canvas.width, canvas.height);
const input = new InputHandler(); // <-- 【核心修复！】我们的“手柄”回来了！
const world = new World();

let lastTime = 0;
function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    world.draw(ctx);
    
    // 【核心修复！】把“手柄”信号传给玩家！
    player.update(input, deltaTime);
    player.draw(ctx);

    requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);