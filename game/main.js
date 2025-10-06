// ==================== main.js (V2.0 - 召唤版) ====================

// --- 【核心！】从 Player.js 文件中，“进口”我们的“玩家蓝图” ---
import Player from './Player.js';
import InputHandler from '/game/InputHandler.js'; // <-- 新增的“进口”

// --- 游戏设置 (保持不变) ---
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
// 【核心圣旨！】关闭图像平滑，让我们的像素保持锋利！
ctx.imageSmoothingEnabled = false;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


// --- 【核心！】召唤仪式！用“玩家蓝图”，创造一个真实的主角！ ---
// 我们把画布的宽度和高度，作为“出生礼物”送给新生的玩家
const player = new Player(canvas.width, canvas.height);
const input = new InputHandler(); // <-- 新增的“创生”！

// --- 游戏的核心：“游戏循环 (Game Loop)” ---
let lastTime = 0;

function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    ctx.fillStyle = '#2E473B';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. 更新 (Update)：在每一帧，都告诉玩家“更新一下你自己！”
   player.update(input, deltaTime);

    // 3. 绘制 (Draw)：在每一帧，都命令玩家“把自己画出来！”
    player.draw(ctx);

    requestAnimationFrame(gameLoop);
}

// --- 游戏启动！---
requestAnimationFrame(gameLoop);