// ==================== 游戏配置 ====================

const GAME_CONFIG = {
    // 🎨 【在这里配置你们班的11个等级！】
    levels: [
        { size: 30,  image: 'images/game/level1.png',  name: '小豆芽',   points: 1,   color: '#FF6B6B' },
        { size: 40,  image: 'images/game/level2.png',  name: '小番茄',   points: 3,   color: '#4ECDC4' },
        { size: 50,  image: 'images/game/level3.png',  name: '小土豆',   points: 6,   color: '#45B7D1' },
        { size: 60,  image: 'images/game/level4.png',  name: '小茄子',   points: 10,  color: '#FFA07A' },
        { size: 70,  image: 'images/game/level5.png',  name: '小辣椒',   points: 15,  color: '#98D8C8' },
        { size: 80,  image: 'images/game/level6.png',  name: '小玉米',   points: 21,  color: '#F7DC6F' },
        { size: 90,  image: 'images/game/level7.png',  name: '小南瓜',   points: 28,  color: '#BB8FCE' },
        { size: 100, image: 'images/game/level8.png',  name: '小西瓜',   points: 36,  color: '#85C1E2' },
        { size: 110, image: 'images/game/level9.png',  name: '大向日葵', points: 45,  color: '#F8B739' },
        { size: 120, image: 'images/game/level10.png', name: '班级合影', points: 55,  color: '#52B788' },
        { size: 140, image: 'images/game/level11.png', name: '孙钰女王', points: 100, color: '#DE5D83' }
    ],
    wallThickness: 10,
    dropLine: 100,
    deathLine: 120,
    initialDropChance: [0.4, 0.3, 0.2, 0.1] // 前4级的掉落概率
};

// ==================== 检查 Matter.js 是否加载 ====================

if (typeof Matter === 'undefined') {
    document.getElementById('loading').innerHTML = `
        <h3 style="color: red;">❌ 物理引擎加载失败！</h3>
        <p>请确保 matter.min.js 文件在正确位置</p>
    `;
    throw new Error('Matter.js 未加载');
}

console.log('✅ Matter.js 加载成功！');

// ==================== Matter.js 引擎初始化 ====================

const { Engine, Render, Runner, Bodies, Composite, Events } = Matter;

let engine, render, runner, world;
let canvas, canvasWidth, canvasHeight;
let score = 0;
let nextBallLevel = 0;
let canDrop = true;
let gameOver = false;
let imagesLoaded = false;
let ballImages = {};

// --- 初始化游戏 ---
function initGame() {
    console.log('🎮 开始初始化游戏...');

    canvas = document.getElementById('game-canvas');
    const container = document.getElementById('canvas-wrapper');
    canvasWidth = container.clientWidth;
    canvasHeight = container.clientHeight;

    console.log(`📐 画布尺寸: ${canvasWidth} x ${canvasHeight}`);

    // 创建引擎
    engine = Engine.create();
    world = engine.world;
    world.gravity.y = 0.8; // 重力

    // 创建渲染器
    render = Render.create({
        canvas: canvas,
        engine: engine,
        options: {
            width: canvasWidth,
            height: canvasHeight,
            wireframes: false,
            background: '#FFF8DC'
        }
    });

    Render.run(render);

    // 创建运行器
    runner = Runner.create();
    Runner.run(runner, engine);

    // 创建游戏边界
    createWalls();

    // 预加载图片
    preloadImages(() => {
        console.log('✅ 图片加载完成！');
        imagesLoaded = true;
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('next-ball-preview').style.display = 'flex';
        
        // 鼠标交互
        setupMouseControl();

        // 碰撞检测
        Events.on(engine, 'collisionStart', handleCollision);

        // 生成第一个待投放的球
        generateNextBall();

        // 游戏循环检测
        Events.on(engine, 'afterUpdate', checkGameOver);
    });
}

// --- 创建墙壁 ---
function createWalls() {
    const thickness = GAME_CONFIG.wallThickness;
    const walls = [
        Bodies.rectangle(thickness / 2, canvasHeight / 2, thickness, canvasHeight, {
            isStatic: true,
            render: { fillStyle: '#8B4513' },
            label: 'wall'
        }),
        Bodies.rectangle(canvasWidth - thickness / 2, canvasHeight / 2, thickness, canvasHeight, {
            isStatic: true,
            render: { fillStyle: '#8B4513' },
            label: 'wall'
        }),
        Bodies.rectangle(canvasWidth / 2, canvasHeight - thickness / 2, canvasWidth, thickness, {
            isStatic: true,
            render: { fillStyle: '#8B4513' },
            label: 'wall'
        })
    ];
    Composite.add(world, walls);
    console.log('✅ 墙壁创建完成');
}

// --- 预加载图片 ---
function preloadImages(callback) {
    let loadedCount = 0;
    const totalImages = GAME_CONFIG.levels.length;

    console.log(`📷 开始加载 ${totalImages} 张图片...`);

    GAME_CONFIG.levels.forEach((level, index) => {
        const img = new Image();
        img.onload = () => {
            loadedCount++;
            console.log(`✅ 图片 ${index + 1}/${totalImages} 加载完成`);
            if (loadedCount === totalImages) {
                callback();
            }
        };
        img.onerror = () => {
            console.warn(`⚠️ 图片 ${level.image} 加载失败，使用纯色代替`);
            loadedCount++;
            if (loadedCount === totalImages) {
                callback();
            }
        };
        img.src = level.image;
        ballImages[index] = img;
    });
}

// --- 鼠标控制 ---
function setupMouseControl() {
    const clickHandler = (x) => {
        if (!canDrop || gameOver || !imagesLoaded) return;
        dropBall(x);
    };

    canvas.addEventListener('click', (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        clickHandler(x);
    });

    canvas.addEventListener('touchstart', (event) => {
        event.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const touch = event.touches[0];
        const x = touch.clientX - rect.left;
        clickHandler(x);
    }, { passive: false });

    console.log('✅ 鼠标控制设置完成');
}

// --- 生成下一个球的等级 ---
function generateNextBall() {
    const rand = Math.random();
    let cumulative = 0;

    for (let i = 0; i < GAME_CONFIG.initialDropChance.length; i++) {
        cumulative += GAME_CONFIG.initialDropChance[i];
        if (rand < cumulative) {
            nextBallLevel = i;
            break;
        }
    }

    // 更新预览
    const level = GAME_CONFIG.levels[nextBallLevel];
    const previewImg = document.getElementById('next-ball-img');
    const previewName = document.getElementById('next-ball-name');
    
    // 如果图片加载成功就用图片，否则用纯色
    if (ballImages[nextBallLevel] && ballImages[nextBallLevel].complete) {
        previewImg.src = level.image;
        previewImg.style.display = 'block';
    } else {
        previewImg.style.display = 'none';
    }
    
    previewName.textContent = level.name;
}

// --- 投放球 ---
function dropBall(x) {
    canDrop = false;

    const level = GAME_CONFIG.levels[nextBallLevel];
    const radius = level.size / 2;

    // 限制X坐标在安全范围内
    const safeX = Math.max(radius + 15, Math.min(canvasWidth - radius - 15, x));

    // 检查图片是否加载成功
    const img = ballImages[nextBallLevel];
    const useImage = img && img.complete && img.naturalWidth > 0;

    const ballOptions = {
        restitution: 0.2,
        friction: 0.3,
        density: 0.001,
        label: `ball-${nextBallLevel}`
    };

    // 如果图片加载成功，使用图片纹理
    if (useImage) {
        ballOptions.render = {
            sprite: {
                texture: level.image,
                xScale: level.size / img.naturalWidth,
                yScale: level.size / img.naturalHeight
            }
        };
    } else {
        // 否则使用纯色
        ballOptions.render = {
            fillStyle: level.color
        };
    }

    const ball = Bodies.circle(safeX, GAME_CONFIG.dropLine, radius, ballOptions);

    Composite.add(world, ball);
    console.log(`🎯 投放了 ${level.name}`);

    // 生成下一个
    setTimeout(() => {
        generateNextBall();
        canDrop = true;
    }, 500);
}

// --- 碰撞处理（合成逻辑）---
function handleCollision(event) {
    event.pairs.forEach(pair => {
        const { bodyA, bodyB } = pair;

        if (bodyA.label.startsWith('ball-') && bodyB.label.startsWith('ball-')) {
            const levelA = parseInt(bodyA.label.split('-')[1]);
            const levelB = parseInt(bodyB.label.split('-')[1]);

            if (levelA === levelB && levelA < GAME_CONFIG.levels.length - 1) {
                const newLevel = levelA + 1;
                const newLevelConfig = GAME_CONFIG.levels[newLevel];

                const newX = (bodyA.position.x + bodyB.position.x) / 2;
                const newY = (bodyA.position.y + bodyB.position.y) / 2;

                Composite.remove(world, bodyA);
                Composite.remove(world, bodyB);

                const img = ballImages[newLevel];
                const useImage = img && img.complete && img.naturalWidth > 0;

                const newBallOptions = {
                    restitution: 0.2,
                    friction: 0.3,
                    density: 0.001,
                    label: `ball-${newLevel}`
                };

                if (useImage) {
                    newBallOptions.render = {
                        sprite: {
                            texture: newLevelConfig.image,
                            xScale: newLevelConfig.size / img.naturalWidth,
                            yScale: newLevelConfig.size / img.naturalHeight
                        }
                    };
                } else {
                    newBallOptions.render = {
                        fillStyle: newLevelConfig.color
                    };
                }

                const newBall = Bodies.circle(newX, newY, newLevelConfig.size / 2, newBallOptions);

                Composite.add(world, newBall);

                addScore(newLevelConfig.points);
                console.log(`✨ 合成了 ${newLevelConfig.name}！`);

                if (newLevel === GAME_CONFIG.levels.length - 1) {
                    celebrateMaxLevel();
                }
            }
        }
    });
}

// --- 加分 ---
function addScore(points) {
    score += points;
    document.getElementById('score').textContent = score;
}

// --- 检查游戏结束 ---
function checkGameOver() {
    if (gameOver) return;

    const balls = Composite.allBodies(world).filter(body => body.label.startsWith('ball-'));
    
    for (let ball of balls) {
        if (ball.position.y - ball.circleRadius < GAME_CONFIG.deathLine) {
            setTimeout(() => {
                if (!gameOver && ball.position.y - ball.circleRadius < GAME_CONFIG.deathLine) {
                    endGame();
                }
            }, 1500);
            break;
        }
    }
}

// --- 游戏结束 ---
function endGame() {
    gameOver = true;
    canDrop = false;
    document.getElementById('final-score').textContent = score;
    document.getElementById('game-over-screen').classList.add('show');
    console.log('💀 游戏结束！');
}

// --- 重新开始 ---
function restartGame() {
    Composite.clear(world, false);
    Engine.clear(engine);
    Render.stop(render);
    Runner.stop(runner);
    render.canvas.remove();
    render.canvas = null;
    render.context = null;
    render.textures = {};

    score = 0;
    gameOver = false;
    canDrop = true;
    document.getElementById('score').textContent = '0';
    document.getElementById('game-over-screen').classList.remove('show');
    document.getElementById('loading').classList.remove('hidden');

    const newCanvas = document.createElement('canvas');
    newCanvas.id = 'game-canvas';
    document.getElementById('canvas-wrapper').appendChild(newCanvas);

    initGame();
}

// --- 彩蛋：合成最高级 ---
function celebrateMaxLevel() {
    console.log('🎉 恭喜合成最高级！');
    setTimeout(() => {
        alert('🎉 恭喜你合成了终极形态！\n\n生日快乐，孙钰！✨');
    }, 500);
}

// ==================== 游戏启动 ====================
window.addEventListener('load', () => {
    console.log('🚀 页面加载完成，准备启动游戏...');
    initGame();
});