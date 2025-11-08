/* =====================================================================
   
   🏡 我们的欢乐庄园 - 游戏核心逻辑 V2.0
   
   包含系统：
   - 种植系统（农田）
   - 畜牧系统（畜栏）
   - 水产系统（鱼塘）
   - 化肥&鱼食系统
   - 制作台系统
   - 星级系统
   - 猫猫互动系统
   - 信箱系统
   
===================================================================== */

// ==================== 📋 稀有度配置 ====================
// 用于给物品分级（颜色、图标）

const RARITY_CONFIG = {
    common: { name: '常见', color: '#4CAF50', emoji: '🟢' },
    uncommon: { name: '优秀', color: '#2196F3', emoji: '🔵' },
    rare: { name: '稀有', color: '#9C27B0', emoji: '🟣' },
    epic: { name: '史诗', color: '#FF9800', emoji: '🟡' },
    legendary: { name: '传说', color: '#F44336', emoji: '🔴' }
};

// ==================== 🌾 作物/动物配置 ====================
// 【重要】想加新作物/动物？复制一个对象，改改参数就行！

const ITEMS_CONFIG = {
    // --- 🌾 种植类 ---
    wheat: {
        id: 'wheat',              // 唯一ID
        name: '王小麦',           // 显示名称
        type: 'farm',             // 类型：farm(农田) / ranch(畜栏) / pond(鱼塘)
        rarity: 'common',         // 稀有度
        price: 30,                // 购买价格
        sellPrice: 55,            // 基础卖价（不含星级加成）
        growTime: 8,              // 成长时间（秒）
        emoji: '🌾',              // 图标
        desc: '基础作物，成长快', // 描述
        careText: '施肥',         // 照料按钮文字
        careEmoji: '🌱',          // 照料按钮图标
        canHaveStar: true,        // 是否可以有星级
        yieldItems: [             // 收获物品列表
            { id: 'wheat', min: 1, max: 2 }  // 收获1-2个小麦
        ]
    },
    apple: {
        id: 'apple',
        name: '嘉乐苹',
        type: 'farm',
        rarity: 'common',
        price: 60,
        sellPrice: 110,
        growTime: 12,
        emoji: '🍎',
        desc: '香甜可口的苹果',
        careText: '施肥',
        careEmoji: '🌱',
        canHaveStar: true,
        yieldItems: [{ id: 'apple', min: 1, max: 3 }]
    },
    coldApple: {
        id: 'coldApple',
        name: '寒苹',
        type: 'farm',
        rarity: 'uncommon',
        price: 100,
        sellPrice: 200,
        growTime: 14,
        emoji: '🧊',
        desc: '稀有的冰冻苹果',
        careText: '施肥',
        careEmoji: '🌱',
        canHaveStar: true,
        yieldItems: [{ id: 'coldApple', min: 1, max: 2 }]
    },
    corn: {
        id: 'corn',
        name: '松仁玉米',
        type: 'farm',
        rarity: 'epic',
        price: 120,
        sellPrice: 250,
        growTime: 15,
        emoji: '🌽',
        desc: '传说中的终极作物！',
        special: true,            // 【彩蛋标记】收获时触发特殊事件
        careText: '施肥',
        careEmoji: '🌱',
        canHaveStar: true,
        yieldItems: [{ id: 'corn', min: 1, max: 2 }]
    },
    sunflower: {
        id: 'sunflower',
        name: '向日葵',
        type: 'farm',
        rarity: 'epic',
        price: 150,
        sellPrice: 280,
        growTime: 15,
        emoji: '🌻',
        desc: '灿烂的金色花朵',
        careText: '施肥',
        careEmoji: '🌱',
        canHaveStar: true,
        yieldItems: [{ id: 'sunflowerSeed', min: 3, max: 8 }]
    },

    // --- 🐑 畜牧类 ---
    sheep1: {
        id: 'sheep1',
        name: '嘉乐羊',
        type: 'ranch',
        rarity: 'common',
        price: 80,
        sellPrice: 150,
        growTime: 10,
        emoji: '🐑',
        desc: '温顺可爱的小羊',
        careText: '喂饲料',
        careEmoji: '🥕',
        canHaveStar: false,       // 动物没有星级
        yieldItems: [             // 【多产物】羊毛+羊肉
            { id: 'wool', min: 1, max: 2 },
            { id: 'mutton', min: 1, max: 1 }
        ]
    },
    sheep2: {
        id: 'sheep2',
        name: '紫月神羊',
        type: 'ranch',
        rarity: 'rare',
        price: 150,
        sellPrice: 300,
        growTime: 14,
        emoji: '🦙',
        desc: '神秘的紫色羊驼',
        careText: '喂饲料',
        careEmoji: '🥕',
        canHaveStar: false,
        yieldItems: [{ id: 'godWool', min: 1, max: 3 }]  // 只有羊毛，不杀生
    },
    cow: {
        id: 'cow',
        name: '玉子牛',
        type: 'ranch',
        rarity: 'uncommon',
        price: 120,
        sellPrice: 220,
        growTime: 12,
        emoji: '🐄',
        desc: '能产出优质牛奶',
        careText: '喂饲料',
        careEmoji: '🥕',
        canHaveStar: false,
        yieldItems: [
            { id: 'milk', min: 1, max: 3 },
            { id: 'beef', min: 1, max: 1 }
        ]
    },

    // --- 🐟 水产类 ---
    fish: {
        id: 'fish',
        name: '汗蒸鱼',
        type: 'pond',
        rarity: 'common',
        price: 50,
        sellPrice: 95,
        growTime: 9,
        emoji: '🐟',
        desc: '需要耐心等待的美味',
        careText: '喂鱼食',
        careEmoji: '🐠',
        canHaveStar: false,
        yieldItems: [{ id: 'fishMeat', min: 1, max: 2 }]
    },
    wangboFish: {
        id: 'wangboFish',
        name: '王波鱼',
        type: 'pond',
        rarity: 'uncommon',
        price: 90,
        sellPrice: 180,
        growTime: 13,
        emoji: '🐠',
        desc: '稀有的高级鱼类',
        careText: '喂鱼食',
        careEmoji: '🐠',
        canHaveStar: false,
        yieldItems: [{ id: 'wangboMeat', min: 1, max: 2 }]
    }
};

// ==================== 📦 产物配置 ====================
// 【说明】从作物/动物收获得到的原材料，以及加工产物

const PRODUCTS_CONFIG = {
    // 植物产物
    wheat: { name: '小麦', emoji: '🌾', sellPrice: 20, rarity: 'common' },
    apple: { name: '苹果', emoji: '🍎', sellPrice: 40, rarity: 'common' },
    coldApple: { name: '寒苹果', emoji: '🧊', sellPrice: 80, rarity: 'uncommon' },
    corn: { name: '玉米', emoji: '🌽', sellPrice: 100, rarity: 'epic' },
    sunflowerSeed: { name: '葵花子', emoji: '🌻', sellPrice: 30, rarity: 'epic' },

    // 动物产物
    wool: { name: '羊毛', emoji: '🧶', sellPrice: 50, rarity: 'common' },
    mutton: { name: '羊肉', emoji: '🥩', sellPrice: 60, rarity: 'common' },
    godWool: { name: '神羊羊毛', emoji: '✨', sellPrice: 120, rarity: 'rare' },
    milk: { name: '牛奶', emoji: '🥛', sellPrice: 40, rarity: 'uncommon' },
    beef: { name: '牛肉', emoji: '🥩', sellPrice: 70, rarity: 'uncommon' },
    fishMeat: { name: '鱼肉', emoji: '🐟', sellPrice: 35, rarity: 'common' },
    wangboMeat: { name: '王波鱼肉', emoji: '🐠', sellPrice: 70, rarity: 'uncommon' },

    // 加工产物
    flour: { name: '面粉', emoji: '🌾', sellPrice: 80, rarity: 'common' },
    appleJam: { name: '苹果酱', emoji: '🍯', sellPrice: 120, rarity: 'common' },
    coldAppleJam: { name: '寒苹果酱', emoji: '🧊', sellPrice: 250, rarity: 'uncommon' },
    sunflowerOil: { name: '葵花油', emoji: '🛢️', sellPrice: 200, rarity: 'epic' },
    
    // 食物产物
    bread: { name: '面包', emoji: '🍞', sellPrice: 200, rarity: 'common' },
    noodle: { name: '面条', emoji: '🍜', sellPrice: 100, rarity: 'common' },
    applePie: { name: '苹果派', emoji: '🥧', sellPrice: 300, rarity: 'uncommon' },
    sashimi: { name: '生鱼片', emoji: '🍣', sellPrice: 80, rarity: 'common' },
    wangboSashimi: { name: '顶级鱼片', emoji: '🍱', sellPrice: 150, rarity: 'uncommon' },
    fishNoodle: { name: '鱼丸面', emoji: '🍜', sellPrice: 250, rarity: 'uncommon' },
    muttonNoodle: { name: '羊肉面', emoji: '🍜', sellPrice: 280, rarity: 'uncommon' },
    beefNoodle: { name: '牛肉面', emoji: '🍜', sellPrice: 300, rarity: 'uncommon' },
    muttonSoup: { name: '羊汤', emoji: '🍲', sellPrice: 250, rarity: 'uncommon' },
    creamBread: { name: '奶油面包', emoji: '🥐', sellPrice: 350, rarity: 'uncommon' },
    premiumDish: { name: '极品鱼宴', emoji: '🍱', sellPrice: 600, rarity: 'rare' },

    // 特殊物品
    clover: { name: '四叶草', emoji: '🍀', sellPrice: 9999, rarity: 'legendary' }
};

// ==================== 🔨 配方配置 ====================
// 【重要】想加新配方？复制一个，改材料和产物就行！

const RECIPES_CONFIG = {
    // 基础加工
    flour: {
        id: 'flour',
        name: '面粉',
        ingredients: { wheat: 3 },           // 需要3个小麦
        results: { flour: 2 },               // 产出2个面粉
        category: '基础加工'
    },
    appleJam: {
        id: 'appleJam',
        name: '苹果酱',
        ingredients: { apple: 2 },
        results: { appleJam: 1 },
        category: '基础加工'
    },
    coldAppleJam: {
        id: 'coldAppleJam',
        name: '寒苹果酱',
        ingredients: { coldApple: 2 },
        results: { coldAppleJam: 1 },
        category: '基础加工'
    },
    sunflowerOil: {
        id: 'sunflowerOil',
        name: '葵花油',
        ingredients: { sunflowerSeed: 5 },
        results: { sunflowerOil: 1 },
        category: '基础加工'
    },

    // 食物制作
    bread: {
        id: 'bread',
        name: '面包',
        ingredients: { flour: 2 },
        results: { bread: 1 },
        category: '食物制作'
    },
    noodle: {
        id: 'noodle',
        name: '面条',
        ingredients: { flour: 1 },
        results: { noodle: 1 },
        category: '食物制作'
    },
    applePie: {
        id: 'applePie',
        name: '苹果派',
        ingredients: { flour: 2, apple: 1 },  // 【复合材料】需要面粉和苹果
        results: { applePie: 1 },
        category: '食物制作'
    },
    sashimi: {
        id: 'sashimi',
        name: '生鱼片',
        ingredients: { fishMeat: 1 },
        results: { sashimi: 2 },              // 【产量>1】1个鱼肉做2个生鱼片
        category: '食物制作'
    },
    wangboSashimi: {
        id: 'wangboSashimi',
        name: '顶级鱼片',
        ingredients: { wangboMeat: 1 },
        results: { wangboSashimi: 3 },
        category: '食物制作'
    },

    // 高级料理
    fishNoodle: {
        id: 'fishNoodle',
        name: '鱼丸面',
        ingredients: { sashimi: 1, noodle: 1 },
        results: { fishNoodle: 1 },
        category: '高级料理'
    },
    muttonNoodle: {
        id: 'muttonNoodle',
        name: '羊肉面',
        ingredients: { mutton: 2, noodle: 1 },
        results: { muttonNoodle: 1 },
        category: '高级料理'
    },
    beefNoodle: {
        id: 'beefNoodle',
        name: '牛肉面',
        ingredients: { beef: 2, noodle: 1 },
        results: { beefNoodle: 1 },
        category: '高级料理'
    },
    muttonSoup: {
        id: 'muttonSoup',
        name: '羊汤',
        ingredients: { mutton: 3 },
        results: { muttonSoup: 1 },
        category: '高级料理'
    },
    creamBread: {
        id: 'creamBread',
        name: '奶油面包',
        ingredients: { milk: 2, flour: 1 },
        results: { creamBread: 2 },
        category: '高级料理'
    },

    // 豪华料理
    premiumDish: {
        id: 'premiumDish',
        name: '极品鱼宴',
        ingredients: { wangboSashimi: 2, coldAppleJam: 1 },
        results: { premiumDish: 1 },
        category: '豪华料理'
    },

    // ✨ 传说合成（触发猫猫彩蛋）
    clover: {
        id: 'clover',
        name: '四叶草',
        ingredients: { 
            'sunflowerSeed_3': 1,   // 【注意】需要3星葵花子
            'corn_3': 1              // 【注意】需要3星玉米
        },
        results: { clover: 1 },
        category: '✨ 传说合成',
        special: true                // 【彩蛋标记】
    }
};

// ==================== 🧪 化肥配置 ====================
// 【说明】给植物用的buff道具

const FERTILIZERS_CONFIG = {
   poopFert: {
    id: 'poopFert',
    name: '泄芽翔',
    type: 'fertilizer',
    category: 'universal',
    price: 5,
    emoji: '💩',
    desc: '最便宜的肥料，速度 +30%，但会降低品质',  // ✅ 改了描述
    effects: { 
        speedBoost: 1.3,
        qualityBoost: true,      // ✅ 新增
        qualityLevel: -1         // ✅ 新增：负数表示负面效果
    },
    canUseOn: ['farm']
},
    speedFert: {
        id: 'speedFert',
        name: '快速化肥',
        type: 'fertilizer',
        category: 'universal',
        price: 20,
        emoji: '🚀',
        desc: '加快成长速度 +100%',
        effects: { speedBoost: 2.0 },
        canUseOn: ['farm']
    },
    yieldFert: {
        id: 'yieldFert',
        name: '丰收化肥',
        type: 'fertilizer',
        category: 'universal',
        price: 30,
        emoji: '📦',
        desc: '收获数量翻倍',
        effects: { yieldMulti: 2 },          // 产量倍数
        canUseOn: ['farm']
    },
    qualityFert: {
        id: 'qualityFert',
        name: '高级化肥',
        type: 'fertilizer',
        category: 'universal',
        price: 25,
        emoji: '💎',
        desc: '提升星级概率',
        effects: { qualityBoost: true },     // 开启品质提升
        canUseOn: ['farm']
    },
    catFert: {
        id: 'catFert',
        name: '小猫牌化肥',
        type: 'fertilizer',
        category: 'universal',
        price: 40,
        emoji: '🐱',
        desc: '高品质化肥，星级概率大幅提升',
        effects: { qualityBoost: true, qualityLevel: 2 },  // 高级品质提升
        canUseOn: ['farm']
    },

    // 专属化肥（只能给特定作物用）
    jinKeLa: {
        id: 'jinKeLa',
        name: '金坷垃',
        type: 'fertilizer',
        category: 'exclusive',
        price: 100,
        emoji: '⭐',
        desc: '小麦专属！速度+150%、产量x3、必出3星',
        effects: { speedBoost: 2.5, yieldMulti: 3, guaranteeStar: 3 },
        canUseOn: ['farm'],
        exclusiveFor: 'wheat'                // 【专属标记】只能给小麦用
    },
    cloverFert: {
        id: 'cloverFert',
        name: '四叶草牌化肥',
        type: 'fertilizer',
        category: 'exclusive',
        price: 150,
        emoji: '🍀',
        desc: '玉米专属！全能提升，必出3星',
        effects: { speedBoost: 3.0, yieldMulti: 4, guaranteeStar: 3 },
        canUseOn: ['farm'],
        exclusiveFor: 'corn'
    }
};

// ==================== 🐟 鱼食配置 ====================

const FISHFOOD_CONFIG = {
    basicFood: {
        id: 'basicFood',
        name: '普通鱼食',
        type: 'fishfood',
        price: 15,
        emoji: '🍚',
        desc: '速度 +80%',
        effects: { speedBoost: 1.8 },
        canUseOn: ['pond']
    },
    advFood: {
        id: 'advFood',
        name: '高级鱼食',
        type: 'fishfood',
        price: 30,
        emoji: '🍱',
        desc: '速度 +150%、产量 x2',
        effects: { speedBoost: 2.5, yieldMulti: 2 },
        canUseOn: ['pond']
    },
    premiumFood: {
        id: 'premiumFood',
        name: '顶级鱼食',
        type: 'fishfood',
        price: 60,
        emoji: '🍣',
        desc: '全能提升！',
        effects: { speedBoost: 3.0, yieldMulti: 3 },
        canUseOn: ['pond']
    }
};

// ==================== 🥕 动物饲料效果配置 ====================
// 【说明】用背包里的作物喂动物

const ANIMAL_FEED_EFFECTS = {
    wheat: {
        emoji: '🌾',
        name: '王小麦',
        desc: '基础饲料，速度 +50%',
        effects: { speedBoost: 1.5 }
    },
    apple: {
        emoji: '🍎',
        name: '嘉乐苹',
        desc: '中级饲料，速度 +100%',
        effects: { speedBoost: 2.0 }
    },
    corn: {
        emoji: '🌽',
        name: '松仁玉米',
        desc: '顶级饲料！速度 +200%、产量 x2',
        effects: { speedBoost: 3.0, yieldMulti: 2 }
    }
};

// ==================== ⭐ 星级概率配置 ====================

const STAR_CHANCES = {
    base: [0.6, 0.3, 0.1],              // 基础：1星60%、2星30%、3星10%
    withQuality1: [0.4, 0.35, 0.25],    // 普通品质化肥
    withQuality2: [0.2, 0.35, 0.45]     // 高级品质化肥（小猫牌）
};

// ==================== 🏞️ 地块配置 ====================

const PLOTS_CONFIG = {
    farm: 4,    // 4块农田
    ranch: 3,   // 3个畜栏
    pond: 3     // 3个鱼塘
};

const PLOT_TYPE_NAMES = {
    farm: '农田',
    ranch: '畜栏',
    pond: '鱼塘'
};

// ==================== 🐱 猫猫对话库 ====================

const CAT_DIALOGUES = {
    normal: [
        "喵~ 你好呀！",
        "今天天气真不错喵~",
        "有好吃的吗？",
        "陪我玩一会儿嘛~"
    ],
    happy: [
        "好开心喵！❤️",
        "你对我真好！",
        "我最喜欢你了！",
        "呼噜呼噜~"
    ],
    upset: [
        "哼，不理你了...",
        "别烦我...",
        "...",
        "喵..."
    ],
    ignoring: [
        "......",
        "（转过头去）",
        "（假装看不见你）",
        "喵？（冷漠）"
    ],
    afterHit: [
        "嗷！痛痛痛！",
        "你、你居然敢打我！",
        "嘶...不过好像还挺爽的...",
        "再来一下试试？"
    ],
    afterPraise: [
        "嘿嘿，知道我厉害了吧~",
        "当然啦，我可是皇甫喵！",
        "夸得不够！再夸！",
        "（得意地摇尾巴）"
    ]
};

// =====================================================================
//                        💾 游戏状态数据
// =====================================================================

let gameState = {
    gold: 500,                  // 金币
    plots: {},                  // 地块数据
    inventory: {},              // 背包（作物/产物）
    items: {},                  // 道具背包（化肥/鱼食）
    currentShopTab: 'farm',     // 当前商店标签页
    currentItemTab: 'fertilizer',
    selectedPlot: null,         // 当前选中的地块
    
    stats: {
        totalHarvests: 0,       // 总收获次数
        cornHarvested: false    // 是否收获过玉米（彩蛋标记）
    },
    
    // 🐱 猫猫状态
    cat: {
        unlocked: false,        // 是否解锁
        affection: 50,          // 好感度 0-100
        mood: 100,              // 情绪值 0-100
        lastInteraction: 0,     // 上次互动时间
        lastAction: null,       // 上次动作
        status: 'normal'        // 状态
    },
    
    // 📬 邮件系统
    farmName: null,             // 农场名字
    cloverCraftTime: 0,         // 合成四叶草的时间（用于延迟送猫）
    mails: [],                  // 邮件列表
    unreadMails: 0              // 未读邮件数
};

// =====================================================================
//                        🎮 游戏初始化
// =====================================================================

function initGame() {
    console.log('🎮 游戏启动中...');
    
    loadGame();              // 加载存档
    initPlots();             // 初始化地块
    renderPlots();           // 渲染地块
    updateGoldDisplay();     // 更新金币显示
    
    // 初始化邮件系统
    initMailSystem();
    
    // 初始化猫猫
    if (gameState.cat.unlocked) {
        showCat();
    }
    initCatDragging();
    
    // 启动游戏循环
    setInterval(gameLoop, 100);               // 每100ms检查一次成长
    setInterval(catMoodRecover, 60000);       // 每分钟恢复猫猫情绪
    setInterval(checkDelayedEvents, 1000);    // 每秒检查延迟事件
    
    console.log('✅ 游戏启动完成！');
}

// =====================================================================
//                        🏞️ 地块系统
// =====================================================================

// --- 初始化地块 ---
function initPlots() {
    for (let type in PLOTS_CONFIG) {
        const count = PLOTS_CONFIG[type];
        for (let i = 0; i < count; i++) {
            const plotId = `${type}-${i}`;
            if (!gameState.plots[plotId]) {
                gameState.plots[plotId] = {
                    id: plotId,
                    type: type,
                    status: 'empty',          // 状态：empty / growing / ready
                    item: null,               // 种植的物品ID
                    plantTime: 0,             // 种植时间戳
                    growProgress: 0,          // 成长进度 0-100
                    appliedBuffs: {           // 应用的buff
                        speedBoost: 1.0,      // 速度倍率
                        yieldMulti: 1,        // 产量倍数
                        qualityBoost: false,  // 是否有品质提升
                        qualityLevel: 0,      // 品质等级
                        guaranteeStar: 0      // 保证星级（0=不保证）
                    }
                };
            }
        }
    }
}

// --- 渲染所有地块 ---
function renderPlots() {
    for (let type in PLOTS_CONFIG) {
        const container = document.getElementById(`${type}-plots`);
        container.innerHTML = '';

        Object.values(gameState.plots)
            .filter(p => p.type === type)
            .forEach(plot => {
                container.appendChild(createPlotElement(plot));
            });
    }
}

// --- 创建单个地块元素 ---
function createPlotElement(plot) {
    const div = document.createElement('div');
    div.className = `plot ${plot.status === 'empty' ? 'empty' : ''}`;
    div.onclick = () => handlePlotClick(plot);

    if (plot.status === 'empty') {
        // 空地块
        div.innerHTML = `
            <div class="plot-icon">➕</div>
            <div class="plot-name">空闲${PLOT_TYPE_NAMES[plot.type]}</div>
            <div class="plot-status">点击种植/养殖</div>
        `;
    } else {
        // 有作物/动物的地块
        const item = ITEMS_CONFIG[plot.item];
        const progress = Math.min(100, plot.growProgress);
        const isReady = plot.status === 'ready';
        const rarity = RARITY_CONFIG[item.rarity];

        // 显示buff图标
        let buffInfo = '';
        if (plot.appliedBuffs.speedBoost > 1) buffInfo += '🚀';
        if (plot.appliedBuffs.yieldMulti > 1) buffInfo += '📦';
        if (plot.appliedBuffs.qualityBoost) buffInfo += '💎';

        div.innerHTML = `
            <div class="plot-icon">${item.emoji}</div>
            <div class="plot-name" style="color: ${rarity.color}">${rarity.emoji} ${item.name}</div>
            ${buffInfo ? `<div style="font-size: 11px;">${buffInfo}</div>` : ''}
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
            <div class="plot-status">
                ${isReady ? '✨ 可收获' : `${Math.floor(progress)}%`}
            </div>
            <div class="plot-actions">
                ${!isReady ? 
                    `<button class="action-btn care" onclick="event.stopPropagation(); openCareMenu('${plot.id}')">${item.careEmoji}</button>` : 
                    ''}
                ${isReady ? 
                    `<button class="action-btn harvest" onclick="event.stopPropagation(); harvestPlot('${plot.id}')">🎁</button>` : 
                    ''}
            </div>
        `;
    }

    return div;
}

// --- 点击地块处理 ---
function handlePlotClick(plot) {
    if (plot.status === 'empty') {
        // 空地块 → 打开商店
        gameState.selectedPlot = plot.id;
        openBuyShop(plot.type);
    } else if (plot.status === 'ready') {
        // 成熟 → 收获
        harvestPlot(plot.id);
    }
}

// =====================================================================
//                        🛒 购买系统
// =====================================================================

function buyAndPlant(itemId) {
    const plot = gameState.plots[gameState.selectedPlot];
    const item = ITEMS_CONFIG[itemId];

    if (!plot || plot.status !== 'empty') {
        showToast('这块地已经有东西了！');
        return;
    }

    // 【重要】检查地块类型和物品类型是否匹配
    if (plot.type !== item.type) {
        showToast(`❌ 地块类型不匹配！`);
        return;
    }

    if (gameState.gold < item.price) {
        showToast('💰 金币不足！');
        return;
    }

    // 扣金币
    gameState.gold -= item.price;
    updateGoldDisplay();

    // 种植/养殖
    plot.status = 'growing';
    plot.item = itemId;
    plot.plantTime = Date.now();
    plot.growProgress = 0;
    plot.appliedBuffs = { 
        speedBoost: 1.0, 
        yieldMulti: 1, 
        qualityBoost: false,
        qualityLevel: 0,
        guaranteeStar: 0
    };

    saveGame();
    renderPlots();
    closeBuyShop();

    const actionWord = item.type === 'farm' ? '种植' : '养殖';
    showToast(`✅ ${actionWord}了 ${item.name}！`);
}

// =====================================================================
//                        🌱 照料系统（化肥/鱼食/饲料）
// =====================================================================

// --- 打开照料菜单 ---
function openCareMenu(plotId) {
    const plot = gameState.plots[plotId];
    const item = ITEMS_CONFIG[plot.item];

    let options = [];

    if (item.type === 'farm') {
        // 【农田】显示化肥
        options = Object.values(FERTILIZERS_CONFIG).filter(fert => {
            if (!fert.canUseOn.includes('farm')) return false;
            if (fert.exclusiveFor && fert.exclusiveFor !== plot.item) return false;
            return true;
        });

        const html = `
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 2000;" onclick="this.remove()">
                <div style="background: white; border-radius: 15px; padding: 15px; max-width: 350px; max-height: 80%; overflow-y: auto;" onclick="event.stopPropagation()">
                    <h3 style="margin-bottom: 12px; font-size: 16px;">选择化肥</h3>
                    ${options.map(fert => {
                        const hasItem = (gameState.items[fert.id] || 0) > 0;
                        return `
                            <div style="padding: 10px; margin: 6px 0; background: ${hasItem ? '#f0f0f0' : '#fdd'}; border-radius: 8px; cursor: ${hasItem ? 'pointer' : 'not-allowed'};" onclick="${hasItem ? `useFertilizer('${plotId}', '${fert.id}'); this.parentElement.parentElement.remove();` : ''}">
                                <div style="font-size: 16px;">${fert.emoji} ${fert.name} ${hasItem ? `(x${gameState.items[fert.id]})` : '(无)'}</div>
                                <div style="font-size: 11px; color: #666;">${fert.desc}</div>
                            </div>
                        `;
                    }).join('')}
                    <button style="width: 100%; padding: 10px; margin-top: 8px; background: #ddd; border: none; border-radius: 8px; cursor: pointer; font-size: 13px;" onclick="this.parentElement.parentElement.remove()">取消</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);

    } else if (item.type === 'pond') {
        // 【鱼塘】显示鱼食
        options = Object.values(FISHFOOD_CONFIG);

        const html = `
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 2000;" onclick="this.remove()">
                <div style="background: white; border-radius: 15px; padding: 15px; max-width: 350px; max-height: 80%; overflow-y: auto;" onclick="event.stopPropagation()">
                    <h3 style="margin-bottom: 12px; font-size: 16px;">选择鱼食</h3>
                    ${options.map(food => {
                        const hasItem = (gameState.items[food.id] || 0) > 0;
                        return `
                            <div style="padding: 10px; margin: 6px 0; background: ${hasItem ? '#f0f0f0' : '#fdd'}; border-radius: 8px; cursor: ${hasItem ? 'pointer' : 'not-allowed'};" onclick="${hasItem ? `useFishFood('${plotId}', '${food.id}'); this.parentElement.parentElement.remove();` : ''}">
                                <div style="font-size: 16px;">${food.emoji} ${food.name} ${hasItem ? `(x${gameState.items[food.id]})` : '(无)'}</div>
                                <div style="font-size: 11px; color: #666;">${food.desc}</div>
                            </div>
                        `;
                    }).join('')}
                    <button style="width: 100%; padding: 10px; margin-top: 8px; background: #ddd; border: none; border-radius: 8px; cursor: pointer; font-size: 13px;" onclick="this.parentElement.parentElement.remove()">取消</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);

    } else if (item.type === 'ranch') {
        // 【畜栏】显示背包里的作物（当饲料）
        const html = `
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 2000;" onclick="this.remove()">
                <div style="background: white; border-radius: 15px; padding: 15px; max-width: 350px; max-height: 80%; overflow-y: auto;" onclick="event.stopPropagation()">
                    <h3 style="margin-bottom: 12px; font-size: 16px;">选择饲料</h3>
                    ${Object.entries(ANIMAL_FEED_EFFECTS).map(([feedId, feed]) => {
                        const hasItem = (gameState.inventory[feedId] || 0) > 0;
                        return `
                            <div style="padding: 10px; margin: 6px 0; background: ${hasItem ? '#f0f0f0' : '#fdd'}; border-radius: 8px; cursor: ${hasItem ? 'pointer' : 'not-allowed'};" onclick="${hasItem ? `useAnimalFeed('${plotId}', '${feedId}'); this.parentElement.parentElement.remove();` : ''}">
                                <div style="font-size: 16px;">${feed.emoji} ${feed.name} ${hasItem ? `(x${gameState.inventory[feedId]})` : '(无)'}</div>
                                <div style="font-size: 11px; color: #666;">${feed.desc}</div>
                            </div>
                        `;
                    }).join('')}
                    <button style="width: 100%; padding: 10px; margin-top: 8px; background: #ddd; border: none; border-radius: 8px; cursor: pointer; font-size: 13px;" onclick="this.parentElement.parentElement.remove()">取消</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
    }
}

// --- 使用化肥 ---
function useFertilizer(plotId, fertId) {
    const plot = gameState.plots[plotId];
    const fert = FERTILIZERS_CONFIG[fertId];

    if (!gameState.items[fertId] || gameState.items[fertId] < 1) {
        showToast('❌ 没有这个化肥！');
        return;
    }

    // 扣除化肥
    gameState.items[fertId]--;

    // 应用buff（【重要】倍率是相乘的！）
    plot.appliedBuffs.speedBoost *= (fert.effects.speedBoost || 1);
    plot.appliedBuffs.yieldMulti *= (fert.effects.yieldMulti || 1);
    if (fert.effects.qualityBoost) {
        plot.appliedBuffs.qualityBoost = true;
        plot.appliedBuffs.qualityLevel = fert.effects.qualityLevel || 1;
    }
    if (fert.effects.guaranteeStar) {
        plot.appliedBuffs.guaranteeStar = fert.effects.guaranteeStar;
    }

    showToast(`✅ 使用了 ${fert.emoji} ${fert.name}！`);
    saveGame();
    renderPlots();
}

// --- 使用鱼食 ---
function useFishFood(plotId, foodId) {
    const plot = gameState.plots[plotId];
    const food = FISHFOOD_CONFIG[foodId];

    if (!gameState.items[foodId] || gameState.items[foodId] < 1) {
        showToast('❌ 没有这个鱼食！');
        return;
    }

    gameState.items[foodId]--;

    plot.appliedBuffs.speedBoost *= (food.effects.speedBoost || 1);
    plot.appliedBuffs.yieldMulti *= (food.effects.yieldMulti || 1);

    showToast(`✅ 使用了 ${food.emoji} ${food.name}！`);
    saveGame();
    renderPlots();
}

// --- 使用动物饲料（消耗背包作物）---
function useAnimalFeed(plotId, feedId) {
    const plot = gameState.plots[plotId];
    const feed = ANIMAL_FEED_EFFECTS[feedId];

    if (!gameState.inventory[feedId] || gameState.inventory[feedId] < 1) {
        showToast('❌ 背包里没有这个作物！');
        return;
    }

    gameState.inventory[feedId]--;

    plot.appliedBuffs.speedBoost *= (feed.effects.speedBoost || 1);
    plot.appliedBuffs.yieldMulti *= (feed.effects.yieldMulti || 1);

    showToast(`✅ 喂食了 ${feed.emoji} ${feed.name}！`);
    saveGame();
    renderPlots();
    renderInventory();
}

// =====================================================================
//                        🌾 收获系统（含星级）
// =====================================================================

function harvestPlot(plotId) {
    const plot = gameState.plots[plotId];
    if (plot.status !== 'ready') return;

    const item = ITEMS_CONFIG[plot.item];
    const yieldMulti = Math.floor(plot.appliedBuffs.yieldMulti);

    let harvestLog = [];

    // 遍历所有产出物
    item.yieldItems.forEach(yieldDef => {
        const baseAmount = Math.floor(Math.random() * (yieldDef.max - yieldDef.min + 1)) + yieldDef.min;
        const finalAmount = baseAmount * yieldMulti;

        for (let i = 0; i < finalAmount; i++) {
            const productId = yieldDef.id;
            const product = PRODUCTS_CONFIG[productId];

            // 【星级判定】
            const canStar = item.canHaveStar;
            let star = 0;

          if (canStar) {
    if (plot.appliedBuffs.guaranteeStar > 0) {
        // 专属化肥保证星级
        star = plot.appliedBuffs.guaranteeStar;
    } else {
        // 根据品质等级选择概率表
        let chances;
        if (plot.appliedBuffs.qualityBoost) {
            if (plot.appliedBuffs.qualityLevel === -1) {
                // 💩 负面品质（泄芽翔）：降低高星概率
                chances = [0.8, 0.15, 0.05];  // 1星80%、2星15%、3星5%
            } else if (plot.appliedBuffs.qualityLevel === 2) {
                // 高级品质（小猫牌）
                chances = STAR_CHANCES.withQuality2;
            } else {    
                // 普通品质
                chances = STAR_CHANCES.withQuality1;
            }
        } else {
            // 基础概率
            chances = STAR_CHANCES.base;
        }
        
        const rand = Math.random();
        if (rand < chances[2]) star = 3;
        else if (rand < chances[1] + chances[2]) star = 2;
        else star = 1;
    }
}
            // 存储到背包（【重要】有星级的物品ID格式：产物ID_星级）
            const invKey = canStar ? `${productId}_${star}` : productId;
            if (!gameState.inventory[invKey]) gameState.inventory[invKey] = 0;
            gameState.inventory[invKey]++;

            harvestLog.push({ product, star, canStar });
        }
    });

    gameState.stats.totalHarvests++;

    // 显示收获消息
    const uniqueItems = {};
    harvestLog.forEach(h => {
        const key = h.canStar ? `${h.product.name}_${h.star}` : h.product.name;
        if (!uniqueItems[key]) uniqueItems[key] = { ...h, count: 0 };
        uniqueItems[key].count++;
    });

    let message = '🎉 收获了：\n';
    Object.values(uniqueItems).forEach(u => {
        const starStr = u.canStar ? '⭐'.repeat(u.star) : '';
        message += `${u.product.emoji} ${u.product.name}${starStr} x${u.count}\n`;
    });
    showToast(message);

    // 【彩蛋】检查是否收获了特殊作物
    if (item.special && !gameState.stats.cornHarvested) {
        gameState.stats.cornHarvested = true;
        setTimeout(() => {
            showBlessing();
            createFireworks();
        }, 500);
    }

    // 重置地块
    plot.status = 'empty';
    plot.item = null;
    plot.plantTime = 0;
    plot.growProgress = 0;
    plot.appliedBuffs = { speedBoost: 1.0, yieldMulti: 1, qualityBoost: false, qualityLevel: 0, guaranteeStar: 0 };

    saveGame();
    renderPlots();
}

// =====================================================================
//                        ⏱️ 游戏循环（成长更新）
// =====================================================================

function gameLoop() {
    let needUpdate = false;

    for (let plotId in gameState.plots) {
        const plot = gameState.plots[plotId];
        if (plot.status === 'growing') {
            const item = ITEMS_CONFIG[plot.item];
            const elapsed = (Date.now() - plot.plantTime) / 1000;  // 已过去的秒数
            const growSpeed = plot.appliedBuffs.speedBoost;        // 速度倍率
            const totalTime = item.growTime / growSpeed;          // 实际需要的时间

            plot.growProgress = Math.min(100, (elapsed / totalTime) * 100);

            if (plot.growProgress >= 100) {
                plot.status = 'ready';
                needUpdate = true;
            }
        }
    }

    if (needUpdate) {
        renderPlots();
        saveGame();
    }
}

// =====================================================================
//                        🛒 种子商店系统
// =====================================================================

function openBuyShop(type = 'farm') {
    gameState.currentShopTab = type;
    renderBuyShopItems();
    document.getElementById('shop-modal').classList.add('show');
}

function closeBuyShop() {
    document.getElementById('shop-modal').classList.remove('show');
    gameState.selectedPlot = null;
}

function switchShopTab(type) {
    gameState.currentShopTab = type;
    document.querySelectorAll('#shop-modal .shop-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.type === type);
    });
    renderBuyShopItems();
}

function renderBuyShopItems() {
    const container = document.getElementById('shop-items');
    const items = Object.values(ITEMS_CONFIG).filter(item => item.type === gameState.currentShopTab);
    const selectedPlot = gameState.selectedPlot ? gameState.plots[gameState.selectedPlot] : null;

    container.innerHTML = items.map(item => {
        const canBuy = !selectedPlot || selectedPlot.type === item.type;
        const rarity = RARITY_CONFIG[item.rarity];
        return `
            <div class="shop-item ${canBuy ? '' : 'disabled'}" onclick="${canBuy ? `buyAndPlant('${item.id}')` : ''}">
                <div class="shop-item-icon">${item.emoji}</div>
                <div class="shop-item-info">
                    <div class="shop-item-name" style="color: ${rarity.color}">${rarity.emoji} ${item.name}</div>
                    <div class="shop-item-desc">${item.desc} | ⏱️ ${item.growTime}秒</div>
                </div>
                <div class="shop-item-price">${item.price}💰</div>
            </div>
        `;
    }).join('');
}

// =====================================================================
//                        🧪 道具商店系统
// =====================================================================

function openItemShop() {
    gameState.currentItemTab = 'fertilizer';
    renderItemShopItems();
    document.getElementById('item-shop-modal').classList.add('show');
}

function closeItemShop() {
    document.getElementById('item-shop-modal').classList.remove('show');
}

function switchItemTab(type) {
    gameState.currentItemTab = type;
    document.querySelectorAll('#item-shop-modal .shop-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.type === type);
    });
    renderItemShopItems();
}

function renderItemShopItems() {
    const container = document.getElementById('item-shop-items');
    let items = [];

    if (gameState.currentItemTab === 'fertilizer') {
        items = Object.values(FERTILIZERS_CONFIG);
    } else if (gameState.currentItemTab === 'fishfood') {
        items = Object.values(FISHFOOD_CONFIG);
    }

    container.innerHTML = items.map(item => {
        return `
            <div class="shop-item" onclick="buyItem('${item.id}')">
                <div class="shop-item-icon">${item.emoji}</div>
                <div class="shop-item-info">
                    <div class="shop-item-name">${item.name}</div>
                    <div class="shop-item-desc">${item.desc}</div>
                </div>
                <div class="shop-item-price">${item.price}💰</div>
            </div>
        `;
    }).join('');
}

function buyItem(itemId) {
    const allItems = { ...FERTILIZERS_CONFIG, ...FISHFOOD_CONFIG };
    const item = allItems[itemId];

    if (gameState.gold < item.price) {
        showToast('💰 金币不足！');
        return;
    }

    gameState.gold -= item.price;
    if (!gameState.items[itemId]) gameState.items[itemId] = 0;
    gameState.items[itemId]++;

    updateGoldDisplay();
    saveGame();

    showToast(`✅ 购买了 ${item.emoji} ${item.name}！`);
}

// =====================================================================
//                        🎒 背包系统
// =====================================================================

function openInventory() {
    renderInventory();
    document.getElementById('inventory-modal').classList.add('show');
}

function closeInventory() {
    document.getElementById('inventory-modal').classList.remove('show');
}

function renderInventory() {
    const container = document.getElementById('inventory-items');
    const cropItems = Object.entries(gameState.inventory).filter(([id, count]) => count > 0);
    const toolItems = Object.entries(gameState.items || {}).filter(([id, count]) => count > 0);

    let html = '';

    if (cropItems.length > 0) {
        html += '<h3 style="margin: 10px 0; color: #666; font-size: 14px;">🌾 作物与产物</h3>';
        html += cropItems.map(([itemId, count]) => {
            // 【重要】解析星级（格式：产物ID_星级）
            const parts = itemId.split('_');
            const baseId = parts[0];
            const star = parts[1] ? parseInt(parts[1]) : 0;

            const product = PRODUCTS_CONFIG[baseId];
            if (!product) return '';

            const rarity = RARITY_CONFIG[product.rarity];
            const starStr = star > 0 ? '⭐'.repeat(star) : '';

            return `
                <div class="inventory-item">
                    <div class="inventory-item-icon">${product.emoji}</div>
                    <div class="inventory-item-info">
                        <div class="inventory-item-name" style="color: ${rarity.color}">
                            ${rarity.emoji} ${product.name} ${starStr}
                        </div>
                        <div class="inventory-item-count">持有: ${count}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    if (toolItems.length > 0) {
        html += '<h3 style="margin: 10px 0; color: #666; font-size: 14px;">🧪 道具</h3>';
        html += toolItems.map(([itemId, count]) => {
            const allItems = { ...FERTILIZERS_CONFIG, ...FISHFOOD_CONFIG };
            const item = allItems[itemId];
            if (!item) return '';

            return `
                <div class="inventory-item">
                    <div class="inventory-item-icon">${item.emoji}</div>
                    <div class="inventory-item-info">
                        <div class="inventory-item-name">${item.name}</div>
                        <div class="inventory-item-count">持有: ${count}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    if (cropItems.length === 0 && toolItems.length === 0) {
        html = '<div class="inventory-empty">背包空空如也~</div>';
    }

    container.innerHTML = html;
}

// =====================================================================
//                        💰 出售商店系统
// =====================================================================

function openSellShop() {
    renderSellShop();
    document.getElementById('sell-modal').classList.add('show');
}

function closeSellShop() {
    document.getElementById('sell-modal').classList.remove('show');
}

function renderSellShop() {
    const container = document.getElementById('sell-items');
    const items = Object.entries(gameState.inventory).filter(([id, count]) => {
    const baseId = id.split('_')[0];
    // 🍀 四叶草是珍贵物品，不能出售！
    if (baseId === 'clover') return false;
    return count > 0;
});
    if (items.length === 0) {
        container.innerHTML = '<div class="inventory-empty">没有可以出售的物品~</div>';
        return;
    }

    container.innerHTML = items.map(([itemId, count]) => {
        const parts = itemId.split('_');
        const baseId = parts[0];
        const star = parts[1] ? parseInt(parts[1]) : 0;

        const product = PRODUCTS_CONFIG[baseId];
        if (!product) return '';

        const rarity = RARITY_CONFIG[product.rarity];
        const starStr = star > 0 ? '⭐'.repeat(star) : '';

        // 【星级加价】2星 x1.5，3星 x2.5
        let priceMulti = 1;
        if (star === 2) priceMulti = 1.5;
        if (star === 3) priceMulti = 2.5;
        const sellPrice = Math.floor(product.sellPrice * priceMulti);

        return `
            <div class="sell-item">
                <div class="sell-item-icon">${product.emoji}</div>
                <div class="sell-item-info">
                    <div class="sell-item-name" style="color: ${rarity.color}">
                        ${rarity.emoji} ${product.name} ${starStr}
                    </div>
                    <div class="sell-item-count">持有: ${count}</div>
                </div>
                <div class="sell-item-actions">
                    <div class="sell-item-price">${sellPrice}💰</div>
                    <button class="sell-btn" onclick="sellItem('${itemId}', 1)">卖1</button>
                    ${count >= 5 ? `<button class="sell-btn" onclick="sellItem('${itemId}', 5)">卖5</button>` : ''}
                    <button class="sell-btn" onclick="sellItem('${itemId}', ${count})">全卖</button>
                </div>
            </div>
        `;
    }).join('');
}

function sellItem(itemId, amount) {
    if (!gameState.inventory[itemId] || gameState.inventory[itemId] < amount) {
        showToast('❌ 物品数量不足！');
        return;
    }

    const parts = itemId.split('_');
    const baseId = parts[0];
    const star = parts[1] ? parseInt(parts[1]) : 0;

    const product = PRODUCTS_CONFIG[baseId];

    let priceMulti = 1;
    if (star === 2) priceMulti = 1.5;
    if (star === 3) priceMulti = 2.5;
    const totalPrice = Math.floor(product.sellPrice * priceMulti * amount);

    gameState.inventory[itemId] -= amount;
    gameState.gold += totalPrice;

    showToast(`✅ 出售了 ${amount} 个，获得 ${totalPrice} 金币！`);

    updateGoldDisplay();
    saveGame();
    renderSellShop();
}

// =====================================================================
//                        🔨 制作台系统
// =====================================================================

function openCraftShop() {
    renderCraftShop();
    document.getElementById('craft-modal').classList.add('show');
}

function closeCraftShop() {
    document.getElementById('craft-modal').classList.remove('show');
}

function renderCraftShop() {
    const container = document.getElementById('craft-items');
    
    // 按类别分组
    const categories = {};
    Object.values(RECIPES_CONFIG).forEach(recipe => {
        if (!categories[recipe.category]) categories[recipe.category] = [];
        categories[recipe.category].push(recipe);
    });

    let html = '';
    for (let category in categories) {
        html += `<h3 style="margin: 12px 0 8px 0; color: #666; font-size: 14px;">${category}</h3>`;
        html += categories[category].map(recipe => {
            let canCraft = true;
            let ingredientsText = '';

            // 检查材料
            for (let ingId in recipe.ingredients) {
                const needAmount = recipe.ingredients[ingId];
                const haveAmount = gameState.inventory[ingId] || 0;
                
                const product = PRODUCTS_CONFIG[ingId.split('_')[0]];
                const star = ingId.includes('_') ? '⭐'.repeat(parseInt(ingId.split('_')[1])) : '';
                const enough = haveAmount >= needAmount;
                if (!enough) canCraft = false;

                ingredientsText += `${product.emoji}${product.name}${star} ${haveAmount}/${needAmount} `;
            }

            // 产物
            let resultsText = '';
            for (let resId in recipe.results) {
                const amount = recipe.results[resId];
                const product = PRODUCTS_CONFIG[resId];
                resultsText += `${product.emoji}${product.name} x${amount}`;
            }

            return `
                <div class="shop-item ${canCraft ? '' : 'disabled'}" onclick="${canCraft ? `craftItem('${recipe.id}')` : ''}">
                    <div class="shop-item-icon">🔨</div>
                    <div class="shop-item-info">
                        <div class="shop-item-name">${recipe.name} ${recipe.special ? '✨' : ''}</div>
                        <div class="shop-item-desc" style="font-size: 10px;">
                            需要: ${ingredientsText}<br>
                            产出: ${resultsText}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    container.innerHTML = html;
}

function craftItem(recipeId) {
    const recipe = RECIPES_CONFIG[recipeId];

    // 再次检查材料
    for (let ingId in recipe.ingredients) {
        const needAmount = recipe.ingredients[ingId];
        const haveAmount = gameState.inventory[ingId] || 0;
        if (haveAmount < needAmount) {
            showToast('❌ 材料不足！');
            return;
        }
    }

    // 扣除材料
    for (let ingId in recipe.ingredients) {
        gameState.inventory[ingId] -= recipe.ingredients[ingId];
    }

    // 增加产物
    for (let resId in recipe.results) {
        if (!gameState.inventory[resId]) gameState.inventory[resId] = 0;
        gameState.inventory[resId] += recipe.results[resId];
    }

    showToast(`✅ 制作成功！获得了 ${recipe.name}！`);

    // 【彩蛋】检查是否是四叶草
    if (recipe.id === 'clover') {
        setTimeout(() => {
            showCloverBlessing();
        }, 1000);
        
        // 记录合成时间（1分钟后送猫）
        gameState.cloverCraftTime = Date.now();
    }

    saveGame();
    renderCraftShop();
    renderInventory();
}

// =====================================================================
//                        📬 邮件系统
// =====================================================================

// --- 初始化邮件系统 ---
function initMailSystem() {
    // 如果是第一次进游戏，发送欢迎邮件
    if (gameState.mails.length === 0) {
        gameState.mails.push({
            id: 'welcome',
            from: '庄园管理局',
            subject: '欢迎来到你的庄园！',
            content: `亲爱的新庄园主：

恭喜你获得了这片美丽的土地！

这里将成为你和朋友们的专属天地。
种下希望的种子，收获珍贵的回忆。

在开始之前，请为你的庄园取一个名字吧~
这将是你们友谊的见证！

祝你：
种植顺利，收获满满！

——庄园管理局`,
            read: false,
            timestamp: Date.now(),
            special: 'farm-naming'
        });
        gameState.unreadMails = 1;
        saveGame();
        
        // 1秒后自动打开第一封信
        setTimeout(() => {
            openMailbox();
        }, 1000);
    }
    
    updateMailBadge();
}

function openMailbox() {
    renderMailList();
    document.getElementById('mailbox-modal').classList.add('show');
}

function closeMailbox() {
    document.getElementById('mailbox-modal').classList.remove('show');
}

function renderMailList() {
    const container = document.getElementById('mailbox-items');
    const mails = gameState.mails;

    if (mails.length === 0) {
        container.innerHTML = '<div class="inventory-empty">信箱空空如也~</div>';
        return;
    }

    container.innerHTML = mails.map((mail, index) => {
        const date = new Date(mail.timestamp);
        const timeStr = `${date.getMonth()+1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2,'0')}`;
        
        return `
            <div class="shop-item" onclick="readMail(${index})" style="background: ${mail.read ? '#f9f9f9' : '#fff9e6'}; border-left: 4px solid ${mail.read ? '#ddd' : '#FFD700'};">
                <div class="shop-item-icon">${mail.read ? '📭' : '📬'}</div>
                <div class="shop-item-info">
                    <div class="shop-item-name">${mail.subject} ${mail.read ? '' : '✨'}</div>
                    <div class="shop-item-desc">来自：${mail.from} | ${timeStr}</div>
                </div>
            </div>
        `;
    }).join('');
}

function readMail(index) {
    const mail = gameState.mails[index];
    
    // 标记为已读
    if (!mail.read) {
        mail.read = true;
        gameState.unreadMails = Math.max(0, gameState.unreadMails - 1);
        updateMailBadge();
        saveGame();
    }

    // 显示信件内容
    document.getElementById('mail-subject').textContent = mail.subject;
    document.getElementById('mail-from').textContent = mail.from;
    const date = new Date(mail.timestamp);
    document.getElementById('mail-time').textContent = date.toLocaleString('zh-CN');
    document.getElementById('mail-content').textContent = mail.content;

    // 特殊操作
    const actionDiv = document.getElementById('mail-special-action');
    if (mail.special === 'farm-naming' && !gameState.farmName) {
        actionDiv.innerHTML = `
            <div style="background: #f0f0f0; padding: 15px; border-radius: 10px;">
                <label style="display: block; margin-bottom: 8px; font-weight: bold;">为你的农场取个名字：</label>
                <input type="text" id="farm-name-input" placeholder="例如：阳光农场" style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 8px; font-size: 14px; margin-bottom: 10px;">
                <button class="sell-btn" style="width: 100%; background: #4CAF50;" onclick="submitFarmName()">确认命名</button>
            </div>
        `;
    } else if (mail.special === 'cat-gift') {
        actionDiv.innerHTML = `
            <button class="sell-btn" style="width: 100%; background: #FF69B4;" onclick="acceptCatGift()">接受这份礼物 😺</button>
        `;
    } else {
        actionDiv.innerHTML = '';
    }

    closeMailbox();
    document.getElementById('mail-detail-modal').classList.add('show');
}

function closeMailDetail() {
    document.getElementById('mail-detail-modal').classList.remove('show');
}

function submitFarmName() {
    const input = document.getElementById('farm-name-input');
    const name = input.value.trim();

    if (!name) {
        showToast('❌ 请输入农场名字！');
        return;
    }

    gameState.farmName = name;
    document.getElementById('farm-name-display').textContent = name;
    document.getElementById('farm-subtitle').textContent = `庄园主：孙钰`;
    
    showToast(`✅ 农场命名成功！\n欢迎来到【${name}】！`);
    
    saveGame();
    closeMailDetail();
}

function updateMailBadge() {
    const badge = document.getElementById('mail-badge');
    if (gameState.unreadMails > 0) {
        badge.textContent = gameState.unreadMails;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

function sendMail(mailData) {
    gameState.mails.push({
        ...mailData,
        read: false,
        timestamp: Date.now()
    });
    gameState.unreadMails++;
    updateMailBadge();
    saveGame();
    
    showToast('📬 你收到了一封新邮件！');
}

// =====================================================================
//                        ⏱️ 延迟事件检查
// =====================================================================

function checkDelayedEvents() {
    // 检查：合成四叶草1分钟后送猫
    if (gameState.cloverCraftTime > 0 && !gameState.cat.unlocked) {
        const elapsed = (Date.now() - gameState.cloverCraftTime) / 1000;
        if (elapsed >= 60) { // 60秒后
            sendCatMail();
        }
    }
}

function sendCatMail() {
    sendMail({
        id: 'cat-gift',
        from: '神秘的旅行者',
        subject: '一份特别的礼物...',
        content: `你好，勤劳的庄园主：

我是一位四处旅行的神秘人。

今天路过你的庄园时，
被那株传说中的四叶草深深吸引。

能培育出如此珍贵的植物，
你一定是一位充满爱心的人。

所以，我决定将我的旅伴托付给你——
一只可爱的小猫咪。

它有点调皮，但也很贴心。
希望它能陪伴你，让农场更有生气~

——神秘的旅行者

P.S. 它最喜欢吃玉米和生鱼片哦！`,
        special: 'cat-gift'
    });

    gameState.cloverCraftTime = 0; // 重置，避免重复触发
    saveGame();
}

function acceptCatGift() {
    if (gameState.cat.unlocked) {
        showToast('你已经有猫猫了！');
        return;
    }

    gameState.cat.unlocked = true;
    showCat();
    saveGame();
    
    closeMailDetail();
    
    showToast('🎉 猫猫加入了你的农场！\n\n点击右下角的猫猫可以互动哦~');
}

// =====================================================================
//                        🍀 四叶草彩蛋
// =====================================================================

function showCloverBlessing() {
    document.getElementById('clover-blessing-modal').classList.add('show');
    
    // 烟花效果
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const firework = document.createElement('div');
            firework.className = 'firework';
            firework.textContent = ['🍀', '✨', '🌟', '💫', '⭐'][Math.floor(Math.random() * 5)];
            firework.style.left = Math.random() * 100 + '%';
            firework.style.top = Math.random() * 100 + '%';
            document.getElementById('clover-blessing-modal').appendChild(firework);
            setTimeout(() => firework.remove(), 2000);
        }, i * 100);
    }
}

function closeCloverBlessing() {
    document.getElementById('clover-blessing-modal').classList.remove('show');
}

// =====================================================================
//                        🐱 猫猫系统
// =====================================================================

function showCat() {
    document.getElementById('cat-npc').classList.remove('hidden');
}

// --- 初始化猫猫拖拽 ---
function initCatDragging() {
    const catEl = document.getElementById('cat-npc');
    let isDragging = false;
    let startX, startY, initialX, initialY;

    // 点击事件（打开面板）
    catEl.addEventListener('click', (e) => {
        if (!isDragging && gameState.cat.unlocked) {
            openCatPanel();
        }
    });

    // PC端拖拽
    catEl.addEventListener('mousedown', (e) => {
        if (!gameState.cat.unlocked) return;
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        const rect = catEl.getBoundingClientRect();
        initialX = rect.left;
        initialY = rect.top;
        catEl.style.cursor = 'grabbing';
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            catEl.style.left = `${initialX + dx}px`;
            catEl.style.top = `${initialY + dy}px`;
            catEl.style.right = 'auto';
            catEl.style.bottom = 'auto';
        }
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            catEl.style.cursor = 'grab';
        }
    });

    // 移动端拖拽
    catEl.addEventListener('touchstart', (e) => {
        if (!gameState.cat.unlocked) return;
        if (e.touches.length === 1) {
            isDragging = true;
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            const rect = catEl.getBoundingClientRect();
            initialX = rect.left;
            initialY = rect.top;
        }
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
        if (isDragging && e.touches.length === 1) {
            const touch = e.touches[0];
            const dx = touch.clientX - startX;
            const dy = touch.clientY - startY;
            catEl.style.left = `${initialX + dx}px`;
            catEl.style.top = `${initialY + dy}px`;
            catEl.style.right = 'auto';
            catEl.style.bottom = 'auto';
        }
    }, { passive: true });

    document.addEventListener('touchend', () => {
        isDragging = false;
    });
}

function openCatPanel() {
    updateCatDisplay();
    document.getElementById('cat-modal').classList.add('show');
}

function closeCatPanel() {
    document.getElementById('cat-modal').classList.remove('show');
}

function updateCatDisplay() {
    const cat = gameState.cat;

    document.getElementById('cat-affection-text').textContent = `${Math.floor(cat.affection)}/100`;
    document.getElementById('cat-affection-bar').style.width = `${cat.affection}%`;
    
    document.getElementById('cat-mood-text').textContent = `${Math.floor(cat.mood)}/100`;
    document.getElementById('cat-mood-bar').style.width = `${cat.mood}%`;

    // 更新对话
    let dialogues = CAT_DIALOGUES.normal;
    if (cat.mood < 20) {
        dialogues = CAT_DIALOGUES.ignoring;
    } else if (cat.affection >= 80) {
        dialogues = CAT_DIALOGUES.happy;
    } else if (cat.mood < 50) {
        dialogues = CAT_DIALOGUES.upset;
    }

    const randomDialogue = dialogues[Math.floor(Math.random() * dialogues.length)];
    document.getElementById('cat-dialogue').textContent = `"${randomDialogue}"`;
}

function interactCat(action) {
    const cat = gameState.cat;

    // 情绪太低，不理人
    if (cat.mood < 20 && action !== 'feed') {
        showToast('😾 猫猫不理你...\n（情绪值太低了）');
        return;
    }

    if (action === 'pet') {
        cat.affection = Math.min(100, cat.affection + 2);
        cat.mood = Math.max(0, cat.mood - 5);
        cat.lastAction = 'pet';
        showToast('🤲 你摸了摸猫猫的头\n好感度 +2，情绪 -5');
    } else if (action === 'praise') {
        cat.affection = Math.min(100, cat.affection + 3);
        cat.mood = Math.max(0, cat.mood - 8);
        cat.lastAction = 'praise';
        
        const dialogue = CAT_DIALOGUES.afterPraise[Math.floor(Math.random() * CAT_DIALOGUES.afterPraise.length)];
        showToast(`👍 你夸奖了猫猫\n"${dialogue}"\n好感度 +3，情绪 -8`);
    } else if (action === 'hit') {
        cat.affection = Math.min(100, cat.affection + 5);
        cat.mood = Math.max(0, cat.mood - 15);
        cat.lastAction = 'hit';
        
        const dialogue = CAT_DIALOGUES.afterHit[Math.floor(Math.random() * CAT_DIALOGUES.afterHit.length)];
        showToast(`👊 你揍了猫猫一下！\n"${dialogue}"\n好感度 +5，情绪 -15`);
    }

    cat.lastInteraction = Date.now();
    saveGame();
    updateCatDisplay();
}

function openCatFeedMenu() {
    // 收集可喂食的作物
    const feedableCrops = Object.entries(gameState.inventory).filter(([id, count]) => {
        const baseId = id.split('_')[0];
        if (baseId === 'clover') return false;  // 四叶草不能喂
        return count > 0 && PRODUCTS_CONFIG[baseId];
    });

    // ✅ 新增：收集可喂的化肥（只有泄芽翔）
    const feedableFerts = Object.entries(gameState.items || {}).filter(([id, count]) => {
        return count > 0 && FERTILIZERS_CONFIG[id];
    });

    if (feedableCrops.length === 0 && feedableFerts.length === 0) {
        showToast('❌ 背包里没有可以喂的东西！');
        return;
    }

    const html = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 3000;" onclick="this.remove()">
            <div style="background: white; border-radius: 15px; padding: 15px; max-width: 350px; max-height: 80%; overflow-y: auto;" onclick="event.stopPropagation()">
                <h3 style="margin-bottom: 12px; font-size: 16px;">选择食物投喂</h3>
                
                ${feedableCrops.length > 0 ? '<div style="font-size: 12px; color: #999; margin: 8px 0;">🌾 作物：</div>' : ''}
                ${feedableCrops.map(([itemId, count]) => {
                    const baseId = itemId.split('_')[0];
                    const product = PRODUCTS_CONFIG[baseId];
                    return `
                        <div style="padding: 10px; margin: 6px 0; background: #f0f0f0; border-radius: 8px; cursor: pointer;" onclick="feedCat('${itemId}'); this.parentElement.parentElement.remove();">
                            <div style="font-size: 16px;">${product.emoji} ${product.name} (x${count})</div>
                        </div>
                    `;
                }).join('')}
                
                ${feedableFerts.length > 0 ? '<div style="font-size: 12px; color: #999; margin: 8px 0;">🧪 道具（慎用）：</div>' : ''}
                ${feedableFerts.map(([itemId, count]) => {
                    const fert = FERTILIZERS_CONFIG[itemId];
                    return `
                        <div style="padding: 10px; margin: 6px 0; background: #ffe0e0; border: 1px dashed #ff6b6b; border-radius: 8px; cursor: pointer;" onclick="feedCatFertilizer('${itemId}'); this.parentElement.parentElement.remove();">
                            <div style="font-size: 16px;">${fert.emoji} ${fert.name} (x${count})</div>
                            <div style="font-size: 11px; color: #999;">⚠️ 不建议喂这个...</div>
                        </div>
                    `;
                }).join('')}
                
                <button style="width: 100%; padding: 10px; margin-top: 8px; background: #ddd; border: none; border-radius: 8px; cursor: pointer; font-size: 13px;" onclick="this.parentElement.parentElement.remove()">取消</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
}
// ✅ 新增：喂化肥的函数（专门处理负面效果）
function feedCatFertilizer(itemId) {
    if (!gameState.items[itemId] || gameState.items[itemId] < 1) {
        showToast('❌ 没有这个道具！');
        return;
    }

    const fert = FERTILIZERS_CONFIG[itemId];
    const cat = gameState.cat;

    gameState.items[itemId]--;

    // 💩 喂粑粑的特殊处理
    if (itemId === 'poopFert') {
        cat.affection = Math.max(0, cat.affection - 100);
        cat.mood = Math.max(0, cat.mood - 50);
        
        showToast(`💩 你给猫猫喂了粑粑！\n\n猫猫：你他妈有病吧！！！！\n\n好感度 -100，情绪 -50`);
    } else {
        // 其他化肥（通用负面效果）
        cat.affection = Math.max(0, cat.affection - 20);
        cat.mood = Math.max(0, cat.mood - 30);
        
        showToast(`🧪 你给猫猫喂了化肥...\n猫猫很不高兴！\n好感度 -20，情绪 -30`);
    }

    cat.lastInteraction = Date.now();
    saveGame();
    updateCatDisplay();
    renderInventory();
    closeCatPanel();
    setTimeout(openCatPanel, 100);
}

function feedCat(itemId) {
    if (!gameState.inventory[itemId] || gameState.inventory[itemId] < 1) {
        showToast('❌ 没有这个食物！');
        return;
    }

    const baseId = itemId.split('_')[0];
    const product = PRODUCTS_CONFIG[baseId];
    const cat = gameState.cat;

    gameState.inventory[itemId]--;

    let affectionGain = 5;
    let moodGain = 10;
    let message = `${product.emoji} ${product.name}`;

    // 特殊食物判断
    if (baseId === 'corn' || baseId === 'sashimi') {
        affectionGain = 10;
        moodGain = 20;
        message += '\n猫猫最喜欢吃这个了！';
    } else if (baseId === 'fishMeat') {
        affectionGain = -10;
        moodGain = 5;
        message += '\n猫猫不太喜欢这个...';
    }

    cat.affection = Math.min(100, Math.max(0, cat.affection + affectionGain));
    cat.mood = Math.min(100, cat.mood + moodGain);

    showToast(`🍖 投喂了 ${message}\n好感度 ${affectionGain > 0 ? '+' : ''}${affectionGain}，情绪 +${moodGain}`);

    cat.lastInteraction = Date.now();
    saveGame();
    updateCatDisplay();
    renderInventory();
    closeCatPanel();
    setTimeout(openCatPanel, 100);
}

function catMoodRecover() {
    if (!gameState.cat.unlocked) return;

    const cat = gameState.cat;
    cat.mood = Math.min(100, cat.mood + 10);
    saveGame();
}

// =====================================================================
//                        🎨 UI 辅助函数
// =====================================================================

function updateGoldDisplay() {
    document.getElementById('gold-amount').textContent = gameState.gold;
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function showBlessing() {
    document.getElementById('blessing-modal').classList.add('show');
}

function closeBlessing() {
    document.getElementById('blessing-modal').classList.remove('show');
}

function createFireworks() {
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const firework = document.createElement('div');
            firework.className = 'firework';
            firework.textContent = ['🎆', '✨', '🎇', '💫', '🌟'][Math.floor(Math.random() * 5)];
            firework.style.left = Math.random() * 100 + '%';
            firework.style.top = Math.random() * 100 + '%';
            document.getElementById('blessing-modal').appendChild(firework);
            setTimeout(() => firework.remove(), 2000);
        }, i * 100);
    }
}

// =====================================================================
//                        💾 存档系统
// =====================================================================

function saveGame() {
    localStorage.setItem('farmGame', JSON.stringify(gameState));
}

function loadGame() {
    const saved = localStorage.getItem('farmGame');
    if (saved) {
        try {
            const loaded = JSON.parse(saved);
            gameState = { ...gameState, ...loaded };
            // 确保猫猫状态存在
            if (!gameState.cat) {
                gameState.cat = {
                    unlocked: false,
                    affection: 50,
                    mood: 100,
                    lastInteraction: 0,
                    lastAction: null,
                    status: 'normal'
                };
            }
            console.log('✅ 存档加载成功');
        } catch (e) {
            console.warn('⚠️ 存档损坏');
        }
    }
}

// =====================================================================
//                        🚀 游戏启动入口
// =====================================================================

window.addEventListener('load', initGame);              