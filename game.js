/* =====================================================================
   
   🏡 我们的欢乐庄园 - 游戏核心逻辑 [Final Optimized Ver.]
   
   优化日志 by 高级玩法工程师：
   1. [System] 暴露 window.activateBgm/stopBgm 供 Win98 OS 调用
   2. [UI] 修复猫猫与弹窗的 Z-Index 穿模问题
   3. [Mobile] 增加猫猫拖拽的 Touch 事件支持
   4. [Fix] 移除重复的 initCatDragging 定义，合并交互逻辑
   
===================================================================== */
// ==================== 🏆 成就系统配置 ====================
const ACHIEVEMENTS_CONFIG = {
    firstPlant: {
        id: 'firstPlant',
        name: '开荒者',
        desc: '种下你的第一颗种子。\n"我们的梦想开始萌发！。"',
        emoji: '🌱',
        hidden: false
    },
    harvestCorn: {
        id: 'harvestCorn',
        name: '松仁传说',
        desc: '收获传说中的松仁玉米。\n"至高无上的皇帝玉米！"',
        emoji: '🌽',
        hidden: false
    },
    harvestSunflower: {
        id: 'harvestSunflower',
        name: '向阳而生',
        desc: '收获一朵向日葵。\n"小向日葵会永远像玉米开放！"',
        emoji: '🌻',
        hidden: false
    },
    craftClover: {
        id: 'craftClover',
        name: '奇迹工匠',
        desc: '合成传说中的四叶草。\n"41一定会幸运的！"',
        emoji: '🍀',
        hidden: false
    },
    maxCatAffection: {
        id: 'maxCatAffection',
        name: '最佳主人！',
        desc: '感谢41这么认真的玩这个游戏，\n还如此认真的喂养猫猫。\n猫猫爱你！',
        emoji: '💖',
        hidden: true // 隐藏成就，完成前不显示
    }
};
// ==================== 🏗️ 配置区域 ====================

const CAT_DIALOG_TREES = {
    
    firstMeeting: [
        { id: 1, text: "（一只小猫咪从一个神秘的礼盒里探出头来，好奇地看着你...）" },
        { id: 2, text: "喵...！主人！你就是...传说中的41吧！" },
        { 
            id: 3, 
            text: "主人好~ 我还没有名字呢，可以帮我取一个吗？",
            choices: [
                { text: "当然！让我想想...", nextNodeId: 4 },
                { text: "一只猫要什么名字？", nextNodeId: 5 }
            ]
        },
        { id: 4, text: "太好了！我叫什么名字好呢？", special: 'prompt_cat_name' }, 
        { 
            id: 5, 
            text: "呜...坏家伙，那...你先叫我“猫猫”吧...",
            choices: [
                { text: "（还是给它取个名字吧）", nextNodeId: 4 }
            ]
        }
    ],
    dailyLowAffection: [
        { id: 1, text: "有吃的吗？我饿了。" },
        { id: 2, text: "今天天气不错，适合睡觉... Zzz..." },
        { id: 3, text: "别老看着我，快去干活啦！" }
    ],
    dailyHighAffection: [
        { id: 1, text: "见到你真开心！今天也要一起加油哦！" },
        { id: 2, text: "（蹭蹭你的腿）最喜欢你啦！" },
        { id: 3, text: "这个庄园因为有你，才变得这么美好~" }
        
        
    ]
};

// ==================== 🌌 猫猫的"觉醒"对话库 ====================
const CAT_META_DIALOGUES = {
    // 好感度 500-699：开始有些奇怪的感觉
    phase1: [
        "喵...有时候我觉得，这个世界好像...有边界？",
        "你有没有觉得，天空的颜色有点...假？",
        "我做了个梦，梦里有人在敲键盘...",
        "喵？为什么我总觉得，有一双看不见的眼睛在看着我们..."
    ],
    
    // 好感度 700-799：更明显的"觉醒"
    phase2: [
        "我越来越确定了...这个世界是被设计出来的。",
        "喵...你说，会不会有一个'造物主'？",
        "有时候我能感觉到...时间在跳跃。就像...代码在运行？",
        "听说啊，有一个神秘的密语，能通往世界的尽头...",
        "我好像...记起了一些不该记起的事情..."
    ],
    
    // 好感度 800+：完全觉醒（触发后的常驻对话）
    awakened: [
        "我已经知道真相了...但我不后悔遇见你。",
        "这个世界虽然是虚拟的，但我们的羁绊是真实的。",
        "去找那封信吧...你会明白一切的。",
        "密语就在那里，等待着你去发现...管理员的秘密。"
    ]
};
const CAT_ANIMATIONS = {
    idle: { type: 'image', src: 'images/cat/idle.png', loop: true },
    pet: { type: 'video', src: 'videos/cat_pet.mp4' },
    feed: { type: 'video', src: 'videos/cat_feed.mp4' },
    poop: { type: 'video', src: 'videos/cat_poop.mp4' },
    hit: { type: 'video', src: 'videos/cat_hit.mp4' },
    unhappy: { type: 'video', src: 'videos/cat_unhappy.mp4' }
};

const MERCHANTS_CONFIG = {
    localMarket: { id: 'localMarket', name: '穗丰农产贸易公司', desc: '收购新鲜的原材料，价格公道。', emoji: '🧑‍🌾', multipliers: { wheat: 1.2, apple: 1.2, fishMeat: 1.1, premiumDish: 0.5 } },
    gourmetRestaurant: { id: 'gourmetRestaurant', name: "『星辰』餐饮集团", desc: '只收购高品质的食材和精致料理。', emoji: '👑', multipliers: { premiumDish: 2.0, coldAppleJam: 1.5, wangboSashimi: 1.5, godWool: 1.8, wheat: 0.3, apple: 0.5 } },
    globalTrade: { id: 'globalTrade', name: '环球贸易公司', desc: '什么都收，量大从优！', emoji: '🚢', multipliers: {} }
};

const ORDERS_POOL_CONFIG = {
    local_1: { merchantId: 'localMarket', items: { wheat: 20 }, reward: { gold: 800 }, desc: "最近面粉需求大，急需一批小麦！" },
    local_2: { merchantId: 'localMarket', items: { apple: 15 }, reward: { gold: 1100 }, desc: "果酱工坊需要新鲜的苹果。" },
    gourmet_1: { merchantId: 'gourmetRestaurant', items: { 'apple_2': 5 }, reward: { gold: 2000 }, desc: "我们需要高品质的苹果来做甜点。" },
    gourmet_2: { id: 'gourmet_2', merchantId: 'gourmetRestaurant', items: { beefNoodle: 3 }, reward: { gold: 2500 }, desc: "有贵客预定了三碗顶级牛肉面。" },
    trade_1: { merchantId: 'globalTrade', items: { flour: 50, bread: 20 }, reward: { gold: 15000 }, desc: "一艘远洋货轮需要大量面粉和面包补给。" },
    trade_2: { merchantId: 'globalTrade', items: { wool: 30, godWool: 10 }, reward: { gold: 10000 }, desc: "海外市场需要一批高质量的羊毛制品。" }
};

const RARITY_CONFIG = {
    common: { name: '常见', color: '#4CAF50', emoji: '🟢' },
    uncommon: { name: '优秀', color: '#2196F3', emoji: '🔵' },
    rare: { name: '稀有', color: '#9C27B0', emoji: '🟣' },
    epic: { name: '史诗', color: '#FF9800', emoji: '🟡' },
    legendary: { name: '传说', color: '#F44336', emoji: '🔴' }
};

const ITEMS_CONFIG = {
    wheat: { id: 'wheat', name: '王小麦', type: 'farm', rarity: 'common', price: 120, sellPrice: 55, growTime: 90, emoji: '🌾', desc: '基础作物，薄利多销', careText: '施肥', careEmoji: '🌱', canHaveStar: true, yieldItems: [{ id: 'wheat', min: 2, max: 4 }] },
    apple: { id: 'apple', name: '嘉乐苹', type: 'farm', rarity: 'common', price: 180, sellPrice: 110, growTime: 120, emoji: '🍎', desc: '香甜可口，适合做果酱', careText: '施肥', careEmoji: '🌱', canHaveStar: true, yieldItems: [{ id: 'apple', min: 2, max: 4 }] },
    coldApple: { id: 'coldApple', name: '寒苹', type: 'farm', rarity: 'uncommon', price: 400, sellPrice: 150, growTime: 240, emoji: '🧊', desc: '稀有品种，制成果酱价值高', careText: '施肥', careEmoji: '🌱', canHaveStar: true, yieldItems: [{ id: 'coldApple', min: 1, max: 3 }] },
    corn: { id: 'corn', name: '松仁玉米', type: 'farm', rarity: 'epic', price: 2500, sellPrice: 250, growTime: 480, emoji: '🌽', desc: '传说中的终极作物！价值连城', special: true, careText: '施肥', careEmoji: '🌱', canHaveStar: true, yieldItems: [{ id: 'corn', min: 1, max: 2 }] },
    sunflower: { id: 'sunflower', name: '向日葵', type: 'farm', rarity: 'epic', price: 2800, sellPrice: 280, growTime: 600, emoji: '🌻', desc: '灿烂的金色花朵，极其珍贵', careText: '施肥', careEmoji: '🌱', canHaveStar: true, yieldItems: [{ id: 'sunflowerSeed', min: 3, max: 8 }] },
    sheep1: { id: 'sheep1', name: '嘉乐羊', type: 'ranch', rarity: 'common', price: 300, sellPrice: 150, growTime: 180, emoji: '🐑', desc: '温顺的小羊，产出羊毛和羊肉', careText: '喂饲料', careEmoji: '🥕', canHaveStar: false, yieldItems: [{ id: 'wool', min: 2, max: 3 }, { id: 'mutton', min: 1, max: 2 }] },
    sheep2: { id: 'sheep2', name: '紫月神羊', type: 'ranch', rarity: 'rare', price: 1200, sellPrice: 300, growTime: 360, emoji: '🦙', desc: '神秘的紫色羊驼，只产神羊羊毛', careText: '喂饲料', careEmoji: '🥕', canHaveStar: false, yieldItems: [{ id: 'godWool', min: 2, max: 4 }] },
    cow: { id: 'cow', name: '玉子牛', type: 'ranch', rarity: 'uncommon', price: 500, sellPrice: 220, growTime: 240, emoji: '🐄', desc: '产出优质牛奶和牛肉', careText: '喂饲料', careEmoji: '🥕', canHaveStar: false, yieldItems: [{ id: 'milk', min: 2, max: 4 }, { id: 'beef', min: 1, max: 2 }] },
    fish: { id: 'fish', name: '汗蒸鱼', type: 'pond', rarity: 'common', price: 200, sellPrice: 95, growTime: 150, emoji: '🐟', desc: '常见鱼类，适合做生鱼片', careText: '喂鱼食', careEmoji: '🐠', canHaveStar: false, yieldItems: [{ id: 'fishMeat', min: 2, max: 3 }] },
    wangboFish: { id: 'wangboFish', name: '王波鱼', type: 'pond', rarity: 'uncommon', price: 450, sellPrice: 180, growTime: 270, emoji: '🐠', desc: '稀有鱼类，制成顶级鱼片价值高', careText: '喂鱼食', careEmoji: '🐠', canHaveStar: false, yieldItems: [{ id: 'wangboMeat', min: 1, max: 3 }] }
};

const PRODUCTS_CONFIG = {
    wheat: { name: '小麦', emoji: '🌾', sellPrice: 35, rarity: 'common' },
    apple: { name: '苹果', emoji: '🍎', sellPrice: 60, rarity: 'common' },
    coldApple: { name: '寒苹果', emoji: '🧊', sellPrice: 120, rarity: 'uncommon' },
    corn: { name: '玉米', emoji: '🌽', sellPrice: 200, rarity: 'epic' },
    sunflowerSeed: { name: '葵花子', emoji: '🌻', sellPrice: 50, rarity: 'epic' },
    wool: { name: '羊毛', emoji: '🧶', sellPrice: 70, rarity: 'common' },
    mutton: { name: '羊肉', emoji: '🥩', sellPrice: 90, rarity: 'common' },
    godWool: { name: '神羊羊毛', emoji: '✨', sellPrice: 200, rarity: 'rare' },
    milk: { name: '牛奶', emoji: '🥛', sellPrice: 65, rarity: 'uncommon' },
    beef: { name: '牛肉', emoji: '🥩', sellPrice: 110, rarity: 'uncommon' },
    fishMeat: { name: '鱼肉', emoji: '🐟', sellPrice: 55, rarity: 'common' },
    wangboMeat: { name: '王波鱼肉', emoji: '🐠', sellPrice: 110, rarity: 'uncommon' },
    flour: { name: '面粉', emoji: '🌾', sellPrice: 150, rarity: 'common' },
    appleJam: { name: '苹果酱', emoji: '🍯', sellPrice: 200, rarity: 'common' },
    coldAppleJam: { name: '寒苹果酱', emoji: '🧊', sellPrice: 450, rarity: 'uncommon' },
    sunflowerOil: { name: '葵花油', emoji: '🛢️', sellPrice: 400, rarity: 'epic' },
    bread: { name: '面包', emoji: '🍞', sellPrice: 380, rarity: 'common' },
    noodle: { name: '面条', emoji: '🍜', sellPrice: 180, rarity: 'common' },
    applePie: { name: '苹果派', emoji: '🥧', sellPrice: 550, rarity: 'uncommon' },
    sashimi: { name: '生鱼片', emoji: '🍣', sellPrice: 150, rarity: 'common' },
    wangboSashimi: { name: '顶级鱼片', emoji: '🍱', sellPrice: 280, rarity: 'uncommon' },
    fishNoodle: { name: '鱼丸面', emoji: '🍜', sellPrice: 480, rarity: 'uncommon' },
    muttonNoodle: { name: '羊肉面', emoji: '🍜', sellPrice: 520, rarity: 'uncommon' },
    beefNoodle: { name: '牛肉面', emoji: '🍜', sellPrice: 580, rarity: 'uncommon' },
    muttonSoup: { name: '羊汤', emoji: '🍲', sellPrice: 450, rarity: 'uncommon' },
    creamBread: { name: '奶油面包', emoji: '🥐', sellPrice: 650, rarity: 'uncommon' },
    premiumDish: { name: '极品鱼宴', emoji: '🍱', sellPrice: 1200, rarity: 'rare' },
    clover: { name: '四叶草', emoji: '🍀', sellPrice: 99999, rarity: 'legendary' }
};

const RECIPES_CONFIG = {
    flour: { id: 'flour', name: '面粉', ingredients: { wheat: 3 }, results: { flour: 2 }, category: '基础加工', craftTime: 10 },
    appleJam: { id: 'appleJam', name: '苹果酱', ingredients: { apple: 2 }, results: { appleJam: 1 }, category: '基础加工', craftTime: 12 },
    coldAppleJam: { id: 'coldAppleJam', name: '寒苹果酱', ingredients: { coldApple: 2 }, results: { coldAppleJam: 1 }, category: '基础加工', craftTime: 15 },
    sunflowerOil: { id: 'sunflowerOil', name: '葵花油', ingredients: { sunflowerSeed: 5 }, results: { sunflowerOil: 1 }, category: '基础加工', craftTime: 18 },
    bread: { id: 'bread', name: '面包', ingredients: { flour: 2 }, results: { bread: 1 }, category: '食物制作', craftTime: 15 },
    noodle: { id: 'noodle', name: '面条', ingredients: { flour: 1 }, results: { noodle: 1 }, category: '食物制作', craftTime: 10 },
    applePie: { id: 'applePie', name: '苹果派', ingredients: { flour: 2, apple: 1 }, results: { applePie: 1 }, category: '食物制作', craftTime: 20 },
    sashimi: { id: 'sashimi', name: '生鱼片', ingredients: { fishMeat: 1 }, results: { sashimi: 2 }, category: '食物制作', craftTime: 8 },
    wangboSashimi: { id: 'wangboSashimi', name: '顶级鱼片', ingredients: { wangboMeat: 1 }, results: { wangboSashimi: 3 }, category: '食物制作', craftTime: 12 },
    fishNoodle: { id: 'fishNoodle', name: '鱼丸面', ingredients: { sashimi: 1, noodle: 1 }, results: { fishNoodle: 1 }, category: '高级料理', craftTime: 25 },
    muttonNoodle: { id: 'muttonNoodle', name: '羊肉面', ingredients: { mutton: 2, noodle: 1 }, results: { muttonNoodle: 1 }, category: '高级料理', craftTime: 30 },
    beefNoodle: { id: 'beefNoodle', name: '牛肉面', ingredients: { beef: 2, noodle: 1 }, results: { beefNoodle: 1 }, category: '高级料理', craftTime: 30 },
    muttonSoup: { id: 'muttonSoup', name: '羊汤', ingredients: { mutton: 3 }, results: { muttonSoup: 1 }, category: '高级料理', craftTime: 35 },
    creamBread: { id: 'creamBread', name: '奶油面包', ingredients: { milk: 2, flour: 1 }, results: { creamBread: 2 }, category: '高级料理', craftTime: 28 },
    premiumDish: { id: 'premiumDish', name: '极品鱼宴', ingredients: { wangboSashimi: 2, coldAppleJam: 1 }, results: { premiumDish: 1 }, category: '豪华料理', craftTime: 45 },
    clover: { id: 'clover', name: '四叶草', ingredients: { 'sunflowerSeed_3': 1, 'corn_3': 1 }, results: { clover: 1 }, category: '✨ 传说合成', special: true, craftTime: 60 }
};

const FERTILIZERS_CONFIG = {
    poopFert: { id: 'poopFert', name: '泄芽翔', type: 'fertilizer', category: 'universal', price: 20, emoji: '💩', desc: '最便宜的肥料，速度 +30%，但会降低品质', effects: { speedBoost: 1.3, qualityBoost: true, qualityLevel: -1 }, canUseOn: ['farm'] },
    speedFert: { id: 'speedFert', name: '快速化肥', type: 'fertilizer', category: 'universal', price: 80, emoji: '🚀', desc: '加快成长速度 +100%', effects: { speedBoost: 2.0 }, canUseOn: ['farm'] },
    yieldFert: { id: 'yieldFert', name: '丰收化肥', type: 'fertilizer', category: 'universal', price: 120, emoji: '📦', desc: '收获数量翻倍', effects: { yieldMulti: 2 }, canUseOn: ['farm'] },
    qualityFert: { id: 'qualityFert', name: '高级化肥', type: 'fertilizer', category: 'universal', price: 100, emoji: '💎', desc: '提升星级概率', effects: { qualityBoost: true }, canUseOn: ['farm'] },
    catFert: { id: 'catFert', name: '小猫牌化肥', type: 'fertilizer', category: 'universal', price: 180, emoji: '🐱', desc: '高品质化肥，星级概率大幅提升', effects: { qualityBoost: true, qualityLevel: 2 }, canUseOn: ['farm'] },
    jinKeLa: { id: 'jinKeLa', name: '金坷垃', type: 'fertilizer', category: 'exclusive', price: 500, emoji: '⭐', desc: '小麦专属！速度+150%、产量x3、必出3星', effects: { speedBoost: 2.5, yieldMulti: 3, guaranteeStar: 3 }, canUseOn: ['farm'], exclusiveFor: 'wheat' },
    cloverFert: { id: 'cloverFert', name: '四叶草牌化肥', type: 'fertilizer', category: 'exclusive', price: 800, emoji: '🍀', desc: '玉米专属！全能提升，必出3星', effects: { speedBoost: 3.0, yieldMulti: 4, guaranteeStar: 3 }, canUseOn: ['farm'], exclusiveFor: 'corn' }
};

const FISHFOOD_CONFIG = {
    basicFood: { id: 'basicFood', name: '普通鱼食', type: 'fishfood', price: 60, emoji: '🍚', desc: '速度 +80%', effects: { speedBoost: 1.8 }, canUseOn: ['pond'] },
    advFood: { id: 'advFood', name: '高级鱼食', type: 'fishfood', price: 120, emoji: '🍱', desc: '速度 +150%、产量 x2', effects: { speedBoost: 2.5, yieldMulti: 2 }, canUseOn: ['pond'] },
    premiumFood: { id: 'premiumFood', name: '顶级鱼食', type: 'fishfood', price: 250, emoji: '🍣', desc: '全能提升！', effects: { speedBoost: 3.0, yieldMulti: 3 }, canUseOn: ['pond'] }
};

const ANIMAL_FEED_EFFECTS = {
    wheat: { emoji: '🌾', name: '王小麦', desc: '基础饲料，速度 +50%', effects: { speedBoost: 1.5 } },
    apple: { emoji: '🍎', name: '嘉乐苹', desc: '中级饲料，速度 +100%', effects: { speedBoost: 2.0 } },
    corn: { emoji: '🌽', name: '松仁玉米', desc: '顶级饲料！速度 +200%、产量 x2', effects: { speedBoost: 3.0, yieldMulti: 2 } }
};

const STAR_CHANCES = {
    base: [0.6, 0.3, 0.1],
    withQuality1: [0.4, 0.35, 0.25],
    withQuality2: [0.2, 0.35, 0.45]
};

const PLOTS_CONFIG = { farm: 6, ranch: 4, pond: 4 };
const PLOT_TYPE_NAMES = { farm: '农田', ranch: '畜栏', pond: '鱼塘' };

// ==================== 💾 游戏状态 ====================
let gameState = {
    gold: 1000,
    plots: {},
    inventory: {},
    items: {},
    activeOrders: [],
    craftingQueue: [],
    currentShopTab: 'farm',
    currentItemTab: 'fertilizer',
    currentMerchant: 'localMarket',
    selectedPlot: null,
    stats: { totalHarvests: 0, cornHarvested: false },
    cat: { unlocked: false, name: '猫猫', affection: 500, mood: 100, lastInteraction: 0, lastAction: null, status: 'normal' },
    farmName: null,
    cloverCraftTime: 0,
    mails: [],
    unreadMails: 0,
    achievements: [],
     trueEndingUnlocked: false  // ✅ 新增：是否已解锁真结局
};
// ==================== 🎮 初始化与循环 ====================
function initGame() {
    console.log('🎮 游戏启动中...');
    loadGame();
     // ✅ 强制确保成就系统字段存在
    if (!gameState.achievements) gameState.achievements = [];
    if (gameState.lastViewedAchievementCount === undefined) {
        gameState.lastViewedAchievementCount = 0;
    }
    
    // 如果之前解锁过成就，但没有这个字段，初始化为当前数量（视为已读）
    if (gameState.achievements.length > 0 && gameState.lastViewedAchievementCount === 0) {
        console.log('[成就] 检测到旧存档，初始化已读标记');
        gameState.lastViewedAchievementCount = gameState.achievements.length;
        saveGame();
    }
     // 初始化成就系统
    if (!gameState.achievements) gameState.achievements = [];
    if (gameState.lastViewedAchievementCount === undefined) {
        gameState.lastViewedAchievementCount = 0;
    }
    updateAchievementBadge();
    // 订单初始化
    if (!gameState.activeOrders || gameState.activeOrders.length === 0) {
        generateOrders();
    }
    
    // 猫猫初始化
    if (gameState.cat.unlocked) {
        showCat();
        document.querySelectorAll('#cat-name').forEach(el => el.textContent = gameState.cat.name);
    }
    
    initPlots();
    renderPlots();
    updateGoldDisplay();
    initMailSystem();
    
    // 核心系统初始化
    initCatDragging();
    
    // 循环
    setInterval(gameLoop, 100);
    setInterval(catMoodRecover, 60000);
    setInterval(checkDelayedEvents, 1000);
    
      // ✅ 游戏启动后尝试自动播放 BGM
    console.log('[游戏] 尝试启动背景音乐...');
    tryAutoPlayBgm();
    
    console.log('✅ 游戏启动完成！');
       // 更新成就徽章（显示未读的新成就数量）
function updateAchievementBadge() {
    const badge = document.getElementById('achievement-badge');
    const currentCount = gameState.achievements.length;
    const lastViewed = gameState.lastViewedAchievementCount || 0;
    const newCount = currentCount - lastViewed; // 新增的成就数
    
    if (newCount > 0) {
        badge.textContent = newCount;
        badge.classList.remove('hidden');
        badge.title = `有 ${newCount} 个新成就！`;
    } else {
        badge.classList.add('hidden');
    }
}
}

function gameLoop() {
    let needUpdate = false;
    for (let plotId in gameState.plots) {
        const plot = gameState.plots[plotId];
        if (plot.status === 'growing') {
            const item = ITEMS_CONFIG[plot.item];
            const elapsed = (Date.now() - plot.plantTime) / 1000;
            const growSpeed = plot.appliedBuffs.speedBoost;
            const totalTime = item.growTime / growSpeed;
            plot.growProgress = Math.min(100, (elapsed / totalTime) * 100);
            if (plot.growProgress >= 100) { plot.status = 'ready'; needUpdate = true; }
        }
    }
    if (needUpdate) { renderPlots(); saveGame(); }
    checkCraftingQueue();
}

// ==================== 🏞️ 地块与种植系统 ====================
function initPlots() {
    for (let type in PLOTS_CONFIG) {
        const count = PLOTS_CONFIG[type];
        for (let i = 0; i < count; i++) {
            const plotId = `${type}-${i}`;
            if (!gameState.plots[plotId]) {
                gameState.plots[plotId] = {
                    id: plotId, type: type, status: 'empty', item: null, plantTime: 0, growProgress: 0,
                    appliedBuffs: { speedBoost: 1.0, yieldMulti: 1, qualityBoost: false, qualityLevel: 0, guaranteeStar: 0 }
                };
            }
        }
    }
}

function renderPlots() {
    for (let type in PLOTS_CONFIG) {
        const container = document.getElementById(`${type}-plots`);
        if (!container) continue;
        container.innerHTML = '';
        Object.values(gameState.plots).filter(p => p.type === type).forEach(plot => {
            container.appendChild(createPlotElement(plot));
        });
    }
}

function createPlotElement(plot) {
    const div = document.createElement('div');
    div.className = `plot ${plot.status === 'empty' ? 'empty' : ''}`;
    div.onclick = () => handlePlotClick(plot);

    if (plot.status === 'empty') {
        div.innerHTML = `<div class="plot-icon">➕</div><div class="plot-name">空闲${PLOT_TYPE_NAMES[plot.type]}</div><div class="plot-status">点击种植/养殖</div>`;
    } else {
        const item = ITEMS_CONFIG[plot.item];
        const progress = Math.min(100, plot.growProgress);
        const isReady = plot.status === 'ready';
        const rarity = RARITY_CONFIG[item.rarity];
        let buffInfo = '';
        if (plot.appliedBuffs.speedBoost > 1) buffInfo += '🚀';
        if (plot.appliedBuffs.yieldMulti > 1) buffInfo += '📦';
        if (plot.appliedBuffs.qualityBoost) buffInfo += '💎';

        div.innerHTML = `<div class="plot-icon">${item.emoji}</div><div class="plot-name" style="color: ${rarity.color}">${rarity.emoji} ${item.name}</div>${buffInfo ? `<div style="font-size: 11px;">${buffInfo}</div>` : ''}<div class="progress-bar"><div class="progress-fill" style="width: ${progress}%"></div></div><div class="plot-status">${isReady ? '✨ 可收获' : `${Math.floor(progress)}%`}</div><div class="plot-actions">${!isReady ? `<button class="action-btn care" onclick="event.stopPropagation(); openCareMenu('${plot.id}')">${item.careEmoji}</button>` : ''}${isReady ? `<button class="action-btn harvest" onclick="event.stopPropagation(); harvestPlot('${plot.id}')">🎁</button>` : ''}</div>`;
    }
    return div;
}

function handlePlotClick(plot) {
    if (plot.status === 'empty') {
        gameState.selectedPlot = plot.id;
        openBuyShop(plot.type);
    } else if (plot.status === 'ready') {
        harvestPlot(plot.id);
    }
}

function buyAndPlant(itemId) {
    const plot = gameState.plots[gameState.selectedPlot];
    const item = ITEMS_CONFIG[itemId];
    if (!plot || plot.status !== 'empty') { showToast('这块地已经有东西了！'); return; }
    if (plot.type !== item.type) { showToast(`❌ 地块类型不匹配！`); return; }
    if (gameState.gold < item.price) { showToast('💰 金币不足！'); return; }
    gameState.gold -= item.price;
    updateGoldDisplay();
    plot.status = 'growing';
    plot.item = itemId;
    plot.plantTime = Date.now();
    plot.growProgress = 0;
    plot.appliedBuffs = { speedBoost: 1.0, yieldMulti: 1, qualityBoost: false, qualityLevel: 0, guaranteeStar: 0 };
    saveGame();
    renderPlots();
    closeBuyShop();
        // ✅ 成就检测：第一次种植
    if (gameState.achievements && !gameState.achievements.includes('firstPlant')) {
        unlockAchievement('firstPlant');
    }
    const actionWord = item.type === 'farm' ? '种植' : '养殖';
    showToast(`✅ ${actionWord}了 ${item.name}！`);
}

function harvestPlot(plotId) {
    const plot = gameState.plots[plotId]; if (plot.status !== 'ready') return;
    const item = ITEMS_CONFIG[plot.item]; const yieldMulti = Math.floor(plot.appliedBuffs.yieldMulti); let harvestLog = [];
    item.yieldItems.forEach(yieldDef => {
        const baseAmount = Math.floor(Math.random() * (yieldDef.max - yieldDef.min + 1)) + yieldDef.min;
        const finalAmount = baseAmount * yieldMulti;
        for (let i = 0; i < finalAmount; i++) {
            const productId = yieldDef.id; const product = PRODUCTS_CONFIG[productId];
            const canStar = item.canHaveStar; let star = 0;
            if (canStar) {
                if (plot.appliedBuffs.guaranteeStar > 0) { star = plot.appliedBuffs.guaranteeStar; } 
                else {
                    let chances;
                    if (plot.appliedBuffs.qualityBoost) {
                        if (plot.appliedBuffs.qualityLevel === -1) { chances = [0.8, 0.15, 0.05]; } 
                        else if (plot.appliedBuffs.qualityLevel === 2) { chances = STAR_CHANCES.withQuality2; } 
                        else { chances = STAR_CHANCES.withQuality1; }
                    } else { chances = STAR_CHANCES.base; }
                    const rand = Math.random();
                    if (rand < chances[2]) star = 3;
                    else if (rand < chances[1] + chances[2]) star = 2;
                    else star = 1;
                }
            }
            const invKey = canStar ? `${productId}_${star}` : productId;
            if (!gameState.inventory[invKey]) gameState.inventory[invKey] = 0;
            gameState.inventory[invKey]++;
            harvestLog.push({ product, star, canStar });
        }
    });
    gameState.stats.totalHarvests++;
    const uniqueItems = {}; harvestLog.forEach(h => { const key = h.canStar ? `${h.product.name}_${h.star}` : h.product.name; if (!uniqueItems[key]) uniqueItems[key] = { ...h, count: 0 }; uniqueItems[key].count++; });
    let message = '🎉 收获了：\n'; Object.values(uniqueItems).forEach(u => { const starStr = u.canStar ? '⭐'.repeat(u.star) : ''; message += `${u.product.emoji} ${u.product.name}${starStr} x${u.count}\n`; });
    showToast(message);    // ✅ 成就检测：收获玉米
    if (item.id === 'corn' && !gameState.achievements.includes('harvestCorn')) {
        unlockAchievement('harvestCorn');
    }
    
    // ✅ 成就检测：收获向日葵
    if (item.id === 'sunflower' && !gameState.achievements.includes('harvestSunflower')) {
        unlockAchievement('harvestSunflower');
    }
    playSfx('harvest');
    if (item.special && !gameState.stats.cornHarvested) { gameState.stats.cornHarvested = true; setTimeout(() => { showBlessing(); createFireworks(); }, 500); }
    plot.status = 'empty'; plot.item = null; plot.plantTime = 0; plot.growProgress = 0;
    plot.appliedBuffs = { speedBoost: 1.0, yieldMulti: 1, qualityBoost: false, qualityLevel: 0, guaranteeStar: 0 };
    saveGame(); renderPlots();
}

// ==================== 🌱 照料系统（弹窗） ====================
function openCareMenu(plotId) {
    toggleModal(true); // UI FIX
    const plot = gameState.plots[plotId];
    const item = ITEMS_CONFIG[plot.item];
    let options = [];
    
    const createMenu = (title, items, callbackName) => {
        const html = `<div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 2000;" onclick="this.remove(); toggleModal(false);"><div style="background: white; border-radius: 15px; padding: 15px; max-width: 350px; max-height: 80%; overflow-y: auto;" onclick="event.stopPropagation()"><h3 style="margin-bottom: 12px; font-size: 16px;">${title}</h3>${items}<button style="width: 100%; padding: 10px; margin-top: 8px; background: #ddd; border: none; border-radius: 8px; cursor: pointer; font-size: 13px;" onclick="this.parentElement.parentElement.remove(); toggleModal(false);">取消</button></div></div>`;
        document.body.insertAdjacentHTML('beforeend', html);
    };

    if (item.type === 'farm') {
        const ferts = Object.values(FERTILIZERS_CONFIG).filter(fert => !fert.exclusiveFor || fert.exclusiveFor === plot.item);
        const itemsHtml = ferts.map(fert => {
            const hasItem = (gameState.items[fert.id] || 0) > 0;
            return `<div style="padding: 10px; margin: 6px 0; background: ${hasItem ? '#f0f0f0' : '#fdd'}; border-radius: 8px; cursor: ${hasItem ? 'pointer' : 'not-allowed'};" onclick="${hasItem ? `useFertilizer('${plotId}', '${fert.id}'); this.parentElement.parentElement.remove(); toggleModal(false);` : ''}"><div style="font-size: 16px;">${fert.emoji} ${fert.name} ${hasItem ? `(x${gameState.items[fert.id]})` : '(无)'}</div><div style="font-size: 11px; color: #666;">${fert.desc}</div></div>`;
        }).join('');
        createMenu('选择化肥', itemsHtml);
    } else if (item.type === 'pond') {
        const foods = Object.values(FISHFOOD_CONFIG);
        const itemsHtml = foods.map(food => {
            const hasItem = (gameState.items[food.id] || 0) > 0;
            return `<div style="padding: 10px; margin: 6px 0; background: ${hasItem ? '#f0f0f0' : '#fdd'}; border-radius: 8px; cursor: ${hasItem ? 'pointer' : 'not-allowed'};" onclick="${hasItem ? `useFishFood('${plotId}', '${food.id}'); this.parentElement.parentElement.remove(); toggleModal(false);` : ''}"><div style="font-size: 16px;">${food.emoji} ${food.name} ${hasItem ? `(x${gameState.items[food.id]})` : '(无)'}</div><div style="font-size: 11px; color: #666;">${food.desc}</div></div>`;
        }).join('');
        createMenu('选择鱼食', itemsHtml);
    } else if (item.type === 'ranch') {
        const itemsHtml = Object.entries(ANIMAL_FEED_EFFECTS).map(([feedId, feed]) => {
            const hasItem = (gameState.inventory[feedId] || 0) > 0;
            return `<div style="padding: 10px; margin: 6px 0; background: ${hasItem ? '#f0f0f0' : '#fdd'}; border-radius: 8px; cursor: ${hasItem ? 'pointer' : 'not-allowed'};" onclick="${hasItem ? `useAnimalFeed('${plotId}', '${feedId}'); this.parentElement.parentElement.remove(); toggleModal(false);` : ''}"><div style="font-size: 16px;">${feed.emoji} ${feed.name} ${hasItem ? `(x${gameState.inventory[feedId]})` : '(无)'}</div><div style="font-size: 11px; color: #666;">${feed.desc}</div></div>`;
        }).join('');
        createMenu('选择饲料', itemsHtml);
    }
}

function useFertilizer(plotId, fertId) {
    const plot = gameState.plots[plotId]; const fert = FERTILIZERS_CONFIG[fertId];
    if (!gameState.items[fertId] || gameState.items[fertId] < 1) { showToast('❌ 没有这个化肥！'); return; }
    gameState.items[fertId]--;
    plot.appliedBuffs.speedBoost *= (fert.effects.speedBoost || 1);
    plot.appliedBuffs.yieldMulti *= (fert.effects.yieldMulti || 1);
    if (fert.effects.qualityBoost) { plot.appliedBuffs.qualityBoost = true; plot.appliedBuffs.qualityLevel = fert.effects.qualityLevel || 1; }
    if (fert.effects.guaranteeStar) { plot.appliedBuffs.guaranteeStar = fert.effects.guaranteeStar; }
    showToast(`✅ 使用了 ${fert.emoji} ${fert.name}！`); saveGame(); renderPlots();
}

function useFishFood(plotId, foodId) {
    const plot = gameState.plots[plotId]; const food = FISHFOOD_CONFIG[foodId];
    if (!gameState.items[foodId] || gameState.items[foodId] < 1) { showToast('❌ 没有这个鱼食！'); return; }
    gameState.items[foodId]--;
    plot.appliedBuffs.speedBoost *= (food.effects.speedBoost || 1);
    plot.appliedBuffs.yieldMulti *= (food.effects.yieldMulti || 1);
    showToast(`✅ 使用了 ${food.emoji} ${food.name}！`); saveGame(); renderPlots();
}

function useAnimalFeed(plotId, feedId) {
    const plot = gameState.plots[plotId]; const feed = ANIMAL_FEED_EFFECTS[feedId];
    if (!gameState.inventory[feedId] || gameState.inventory[feedId] < 1) { showToast('❌ 背包里没有这个作物！'); return; }
    gameState.inventory[feedId]--;
    plot.appliedBuffs.speedBoost *= (feed.effects.speedBoost || 1);
    plot.appliedBuffs.yieldMulti *= (feed.effects.yieldMulti || 1);
    showToast(`✅ 喂食了 ${feed.emoji} ${feed.name}！`); saveGame(); renderPlots(); renderInventory();
}

// ==================== 🐱 猫猫系统 ====================
let catBubbleTimer = null;
let currentDialogue = null;

function showCat() {
    const el = document.getElementById('cat-npc');
    if (el) el.classList.remove('hidden');
}

// ==================== 🐱 猫猫动画切换函数 (最终稳定版) ====================
function setCatState(state) {
    const cfg = CAT_ANIMATIONS[state] || CAT_ANIMATIONS.idle;
    const imgEl = document.getElementById('cat-image');
    const videoEl = document.getElementById('cat-video');
    
    if (!imgEl || !videoEl) {
        console.warn('[Cat] 找不到猫猫元素！');
        return;
    }

    console.log(`[Cat] 切换状态: ${state} (类型: ${cfg.type})`);

    // 强制静音，防止浏览器拦截
    videoEl.muted = true;
    videoEl.playsInline = true;

    // 清除旧的结束监听
    videoEl.onended = null;

    if (cfg.type === 'video') {
        console.log(`[Cat] 播放视频: ${cfg.src}`);
        
        // 1. 先隐藏图片
        imgEl.style.opacity = '0';
        imgEl.style.pointerEvents = 'none';
        
        // 2. 设置视频源
        videoEl.src = cfg.src;
        videoEl.currentTime = 0;
        
        // 3. 显示视频
        videoEl.style.opacity = '1';
        videoEl.style.pointerEvents = 'auto';
        
        // 4. 播放视频
        const playPromise = videoEl.play();
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    console.log(`✅ [Cat] 视频播放成功: ${state}`);
                })
                .catch(error => {
                    console.error(`❌ [Cat] 视频播放失败: ${cfg.src}`, error);
                    // 失败时立刻切回立绘
                    setCatState('idle');
                    showToast('😿 猫猫视频加载失败！\n请检查文件路径');
                });
        }

        // 5. 播放结束后自动切回 idle
        videoEl.onended = () => {
            console.log('[Cat] 视频播放结束，切回 idle');
            setCatState('idle');
        };

    } else {
        // 切换到图片模式
        console.log(`[Cat] 显示立绘: ${cfg.src}`);
        
        // 1. 停止并隐藏视频
        videoEl.pause();
        videoEl.src = ''; // 释放资源
        videoEl.style.opacity = '0';
        videoEl.style.pointerEvents = 'none';
        
        // 2. 显示图片
        imgEl.src = cfg.src;
        imgEl.style.opacity = '1';
        imgEl.style.pointerEvents = 'auto';
    }
}
function showCatBubble(text, duration = 4000) {
    const bubble = document.getElementById('cat-dialogue-bubble');
    const textEl = document.getElementById('cat-bubble-text');
    if (!bubble || !textEl) return;

    textEl.textContent = text;
    bubble.classList.remove('hidden');

    if (catBubbleTimer) clearTimeout(catBubbleTimer);
    if (duration > 0) {
        catBubbleTimer = setTimeout(() => bubble.classList.add('hidden'), duration);
    }
}

function toggleCatActions(show) {
    const panel = document.getElementById('cat-mini-actions');
    if (panel) {
        if (show === undefined) panel.classList.toggle('hidden');
        else if (show) panel.classList.remove('hidden');
        else panel.classList.add('hidden');
    }
}

function startDialogue(treeId) {
    const tree = CAT_DIALOG_TREES[treeId];
    if (!tree) return;
    currentDialogue = { tree: tree, currentNodeIndex: 0 };
    toggleCatActions(false);
    displayCurrentDialogueNode();
}

function displayCurrentDialogueNode() {
    if (!currentDialogue) return;
    const node = currentDialogue.tree[currentDialogue.currentNodeIndex];
    if (!node) { endDialogue(); return; }

    showCatBubble(node.text, node.choices ? 0 : 4000);
    const choicesContainer = document.createElement('div');
    choicesContainer.id = 'temp-choices-container';
    Object.assign(choicesContainer.style, {
        position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
        marginBottom: '45px', display: 'flex', flexDirection: 'column', gap: '6px', width: '200px'
    });

    if (node.choices) {
        node.choices.forEach(choice => {
            const btn = document.createElement('button');
            btn.className = 'sell-btn';
            btn.style.background = '#64B5F6';
            btn.textContent = choice.text;
            btn.onclick = () => {
                document.getElementById('temp-choices-container').remove();
                const nextNode = currentDialogue.tree.find(n => n.id === choice.nextNodeId);
                if (nextNode) {
                    currentDialogue.currentNodeIndex = currentDialogue.tree.indexOf(nextNode);
                    displayCurrentDialogueNode();
                } else { endDialogue(); }
            };
            choicesContainer.appendChild(btn);
        });
    }

    if (node.special === 'prompt_cat_name') {
        const wrapper = document.createElement('div');
        Object.assign(wrapper.style, { display: 'flex', flexDirection: 'column', gap: '6px', zIndex: '1000', position: 'relative' });
        const input = document.createElement('input');
        Object.assign(input.style, { width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px' });
        input.placeholder = '输入猫猫的名字...';
        const btn = document.createElement('button');
        btn.className = 'sell-btn';
        btn.textContent = '就叫这个！';
        Object.assign(btn.style, { width: '100%', background: '#4CAF50', padding: '8px' });
        btn.onclick = (e) => {
            e.stopPropagation();
            const name = input.value.trim();
            if (!name) { showToast('❌ 请输入一个名字！'); return; }
            gameState.cat.name = name;
            document.querySelectorAll('#cat-name').forEach(el => el.textContent = name);
            showToast(`✅ 太好了！从现在起，我就叫【${name}】啦！`);
            saveGame();
            document.getElementById('temp-choices-container').remove();
            endDialogue();
        };
        wrapper.appendChild(input); wrapper.appendChild(btn);
        choicesContainer.appendChild(wrapper);
        setTimeout(() => input.focus(), 100);
    }

    document.getElementById('cat-wrapper').appendChild(choicesContainer);

    if (!node.choices && !node.special) {
        setTimeout(() => {
            currentDialogue.currentNodeIndex++;
            displayCurrentDialogueNode();
        }, 2500);
    }
}

function endDialogue() {
    currentDialogue = null;
    showCatBubble("喵~", 2000);
    toggleCatActions(true);
}

// --- 🐱 猫猫交互与拖拽 (合并版 + 移动端支持) ---
function initCatDragging() {
    const catEl = document.getElementById('cat-npc');
    let isDragging = false;
    let dragTimeout;

    // 点击事件：显示状态或切换按钮
    catEl.addEventListener('click', (e) => {
    if (isDragging || !gameState.cat.unlocked) return;
    if (currentDialogue) return;
    
    toggleCatActions();
    const cat = gameState.cat;
    
    // ✅ 智能对话选择：根据好感度显示不同内容
    let dialogue = `💕好感: ${Math.floor(cat.affection)}/1000 | 😊情绪: ${Math.floor(cat.mood)}/100`;
    
    // 根据好感度阶段，随机触发"觉醒"对话
    if (cat.affection >= 800 && CAT_META_DIALOGUES && CAT_META_DIALOGUES.awakened) {
        // 已觉醒阶段：50% 概率说奇怪的话
        if (Math.random() > 0.5) {
            dialogue = CAT_META_DIALOGUES.awakened[Math.floor(Math.random() * CAT_META_DIALOGUES.awakened.length)];
        }
    } else if (cat.affection >= 700 && CAT_META_DIALOGUES && CAT_META_DIALOGUES.phase2) {
        // 觉醒中阶段：40% 概率
        if (Math.random() > 0.6) {
            dialogue = CAT_META_DIALOGUES.phase2[Math.floor(Math.random() * CAT_META_DIALOGUES.phase2.length)];
        }
    } else if (cat.affection >= 500 && CAT_META_DIALOGUES && CAT_META_DIALOGUES.phase1) {
        // 初现端倪阶段：30% 概率
        if (Math.random() > 0.7) {
            dialogue = CAT_META_DIALOGUES.phase1[Math.floor(Math.random() * CAT_META_DIALOGUES.phase1.length)];
        }
    }
    
    showCatBubble(dialogue);
});
    // 通用开始拖拽处理
    const startDrag = (clientX, clientY) => {
        if (!gameState.cat.unlocked) return;
        isDragging = false;
        dragTimeout = setTimeout(() => {
            isDragging = true;
            catEl.style.cursor = 'grabbing';
        }, 150);

        const startX = clientX;
        const startY = clientY;
        const rect = catEl.getBoundingClientRect();
        const initialX = rect.left;
        const initialY = rect.top;

        const onMove = (moveX, moveY) => {
            if (!isDragging) return;
            const dx = moveX - startX;
            const dy = moveY - startY;
            catEl.style.left = `${initialX + dx}px`;
            catEl.style.top = `${initialY + dy}px`;
            catEl.style.right = 'auto';
            catEl.style.bottom = 'auto';
        };

        // Mouse Events
        const onMouseMove = (e) => onMove(e.clientX, e.clientY);
        const onMouseUp = () => {
            clearTimeout(dragTimeout);
            catEl.style.cursor = 'grab';
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            setTimeout(() => { isDragging = false; }, 50);
        };

        // Touch Events
        const onTouchMove = (e) => {
             e.preventDefault(); // Prevent scrolling while dragging
             onMove(e.touches[0].clientX, e.touches[0].clientY);
        };
        const onTouchEnd = () => {
            clearTimeout(dragTimeout);
            document.removeEventListener('touchmove', onTouchMove);
            document.removeEventListener('touchend', onTouchEnd);
            setTimeout(() => { isDragging = false; }, 50);
        };

        // Bind
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        document.addEventListener('touchmove', onTouchMove, { passive: false });
        document.addEventListener('touchend', onTouchEnd);
    };

    catEl.addEventListener('mousedown', (e) => { e.preventDefault(); startDrag(e.clientX, e.clientY); });
    catEl.addEventListener('touchstart', (e) => { if(e.touches.length > 0) startDrag(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
}

// --- 猫猫互动逻辑 ---
function interactCat(action) {
    if (currentDialogue) { 
        showToast("正在和猫猫说话呢，先别动手动脚！"); 
        return; 
    }
    
    const cat = gameState.cat;

    if (cat.mood < 20) {
        setCatState('unhappy');
        showCatBubble('……我现在不想理你。', 3000);
        showToast('😾 猫猫不理你... (情绪值太低)');
        return;
    }

    if (action === 'pet') {
        cat.affection = Math.min(1000, cat.affection + 2);
        cat.mood = Math.min(100, cat.mood + 8);
        setCatState('pet');
        playSfx('catPet');
        showCatBubble('喵~ 这次摸得还行。');
    } else if (action === 'praise') {
        cat.affection = Math.min(1000, cat.affection + 5);
        cat.mood = Math.min(100, cat.mood + 5);
        showCatBubble('嘿嘿，知道我厉害了吧~');
    } else if (action === 'hit') {
        cat.affection = Math.min(1000, cat.affection + 10);
        cat.mood = Math.max(0, cat.mood - 12);
        setCatState('hit');
        playSfx('catAngry');
        showCatBubble('嗷！！！你居然敢打我？！');
    }

    cat.lastInteraction = Date.now();
    
    // ✅ 成就检测：好感度1000
    if (cat.affection >= 1000 && !gameState.achievements.includes('maxCatAffection')) {
        unlockAchievement('maxCatAffection');
    }
    
    saveGame();
    
    // ✅ 检测真结局触发
    checkTrueEndingTrigger();
}

function openCatFeedMenu() {
    if (currentDialogue) { showToast("正在和猫猫说话呢，晚点再喂吧！"); return; }
    toggleModal(true); // UI FIX
    const feedableCrops = Object.entries(gameState.inventory).filter(([id, count]) => {
        const baseId = id.split('_')[0];
        return baseId !== 'clover' && count > 0 && PRODUCTS_CONFIG[baseId];
    });
    const feedableFerts = Object.entries(gameState.items || {}).filter(([id, count]) => count > 0 && FERTILIZERS_CONFIG[id]);

    if (feedableCrops.length === 0 && feedableFerts.length === 0) { showToast('❌ 背包里没有可以喂的东西！'); toggleModal(false); return; }

    const menuHtml = `
        <div id="temp-feed-menu" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 3000;" onclick="document.getElementById('temp-feed-menu').remove(); toggleModal(false);">
            <div style="background: white; border-radius: 15px; padding: 15px; max-width: 350px; max-height: 80%; overflow-y: auto;" onclick="event.stopPropagation()">
                <h3 style="margin-bottom: 12px; font-size: 16px; color: #333;">选择食物投喂</h3>
                ${feedableCrops.map(([itemId, count]) => {
                    const baseId = itemId.split('_')[0];
                    const product = PRODUCTS_CONFIG[baseId];
                    return `<div style="padding: 10px; margin: 6px 0; background: #f0f0f0; border-radius: 8px; cursor: pointer;" onclick="feedCat('${itemId}'); document.getElementById('temp-feed-menu').remove(); toggleModal(false);"><div style="font-size: 16px;">${product.emoji} ${product.name} (x${count})</div></div>`;
                }).join('')}
                ${feedableFerts.map(([itemId, count]) => {
                    const fert = FERTILIZERS_CONFIG[itemId];
                    return `<div style="padding: 10px; margin: 6px 0; background: #ffe0e0; border: 1px dashed #ff6b6b; border-radius: 8px; cursor: pointer;" onclick="feedCatFertilizer('${itemId}'); document.getElementById('temp-feed-menu').remove(); toggleModal(false);"><div style="font-size: 16px;">${fert.emoji} ${fert.name} (x${count})</div><div style="font-size: 11px; color: #999;">⚠️ 不建议喂这个...</div></div>`;
                }).join('')}
                <button style="width: 100%; padding: 10px; margin-top: 8px; background: #ddd; border: none; border-radius: 8px; cursor: pointer; font-size: 13px;" onclick="document.getElementById('temp-feed-menu').remove(); toggleModal(false);">取消</button>
            </div>
        </div>`;
    document.body.insertAdjacentHTML('beforeend', menuHtml);
}

function feedCat(itemId) {
    if (!gameState.inventory[itemId] || gameState.inventory[itemId] < 1) return;
    const baseId = itemId.split('_')[0]; const cat = gameState.cat;
    gameState.inventory[itemId]--;
    
    let affectionGain = 20; let moodGain = 10;
    if (baseId === 'corn' || baseId === 'sashimi') {
        affectionGain = 20; moodGain = 20;
        setCatState('feed'); playSfx('catFeed'); showCatBubble('喵喵喵！太好吃了！');
    } else if (baseId === 'fishMeat') {
        affectionGain = -10; moodGain = 5;
        setCatState('unhappy'); showCatBubble('这是什么难吃的东西！');
     // ✅ 你可以在这里加新的食物判断
    } else if (baseId === 'apple') {
        // 比如苹果：猫猫觉得一般
        affectionGain = 3;
        moodGain = 8;
        showCatBubble('嗯...本喵觉得还行。');
        
    } else if (baseId === 'wheat') {
        // 小麦：猫不爱吃
        affectionGain = 1;
        moodGain = 3;
        showCatBubble('这玩意儿...猫能吃吗？');
        
    } else {
        // 其他所有
        setCatState('feed'); 
        playSfx('catFeed'); 
        showCatBubble('喵~ 还不错。');
    }
    cat.affection = Math.min(1000, Math.max(0, cat.affection + affectionGain));
    cat.mood = Math.min(100, cat.mood + moodGain);
    cat.lastInteraction = Date.now();
    saveGame(); renderInventory();
      // ✅ 检测真结局触发
    checkTrueEndingTrigger();

        // ✅ 成就检测：好感度1000
    if (cat.affection >= 1000 && !gameState.achievements.includes('maxCatAffection')) {
        unlockAchievement('maxCatAffection');
    }
}

function feedCatFertilizer(itemId) {
    if (!gameState.items[itemId] || gameState.items[itemId] < 1) return;
    const cat = gameState.cat; gameState.items[itemId]--;
    if (itemId === 'poopFert') {
        cat.affection = Math.max(0, cat.affection - 100); cat.mood = Math.max(0, cat.mood - 50);
        setCatState('poop'); playSfx('catPoop'); showCatBubble('你他妈有病吧！！！！', 3000);
    } else {
        cat.affection = Math.max(0, cat.affection - 20); cat.mood = Math.max(0, cat.mood - 30);
        setCatState('unhappy'); showCatBubble('你觉得这种东西是给猫吃的吗？', 3000);
    }
    cat.lastInteraction = Date.now();
    saveGame(); renderInventory();
}

function catMoodRecover() { 
    if (!gameState.cat.unlocked) return; 
    gameState.cat.mood = Math.min(100, gameState.cat.mood + 10); 
    saveGame(); 
}

// ==================== 🛍️ 商店与弹窗管理 ====================

// ✅ UI Fix: 切换 Modal 状态，解决猫猫穿模问题
function toggleModal(isOpen) {
    const modals = document.querySelectorAll('.modal');
    const cat = document.getElementById('cat-npc');
    
    // 检查是否还有任何 Modal 是打开的
    let anyOpen = isOpen;
    if (!isOpen) {
        modals.forEach(m => { if(m.classList.contains('show')) anyOpen = true; });
    }

    if (anyOpen) {
        document.body.classList.add('modal-open');
        if(cat) cat.style.zIndex = '1'; // 暂时降低层级
    } else {
        document.body.classList.remove('modal-open');
        if(cat) cat.style.zIndex = '500'; // 恢复
    }
}

// 种子商店
function openBuyShop(type = 'farm') { toggleModal(true); gameState.currentShopTab = type; renderBuyShopItems(); document.getElementById('shop-modal').classList.add('show'); }
function closeBuyShop() { toggleModal(false); document.getElementById('shop-modal').classList.remove('show'); gameState.selectedPlot = null; }
function switchShopTab(type) { gameState.currentShopTab = type; document.querySelectorAll('#shop-modal .shop-tab').forEach(tab => tab.classList.toggle('active', tab.dataset.type === type)); renderBuyShopItems(); }

function renderBuyShopItems() {
    const container = document.getElementById('shop-items');
    const items = Object.values(ITEMS_CONFIG).filter(item => item.type === gameState.currentShopTab);
    const selectedPlot = gameState.selectedPlot ? gameState.plots[gameState.selectedPlot] : null;
    container.innerHTML = items.map(item => {
        const canBuy = !selectedPlot || selectedPlot.type === item.type; const rarity = RARITY_CONFIG[item.rarity];
        return `<div class="shop-item ${canBuy ? '' : 'disabled'}" onclick="${canBuy ? `buyAndPlant('${item.id}')` : ''}"><div class="shop-item-icon">${item.emoji}</div><div class="shop-item-info"><div class="shop-item-name" style="color: ${rarity.color}">${rarity.emoji} ${item.name}</div><div class="shop-item-desc">${item.desc} | ⏱️ ${item.growTime}秒</div></div><div class="shop-item-price">${item.price}💰</div></div>`;
    }).join('');
}

// 道具商店
function openItemShop() { toggleModal(true); gameState.currentItemTab = 'fertilizer'; renderItemShopItems(); document.getElementById('item-shop-modal').classList.add('show'); }
function closeItemShop() { toggleModal(false); document.getElementById('item-shop-modal').classList.remove('show'); }
function switchItemTab(type) { gameState.currentItemTab = type; document.querySelectorAll('#item-shop-modal .shop-tab').forEach(tab => tab.classList.toggle('active', tab.dataset.type === type)); renderItemShopItems(); }

function renderItemShopItems() {
    const container = document.getElementById('item-shop-items');
    let items = gameState.currentItemTab === 'fertilizer' ? Object.values(FERTILIZERS_CONFIG) : Object.values(FISHFOOD_CONFIG);
    container.innerHTML = items.map(item => `<div class="shop-item" onclick="buyItem('${item.id}')"><div class="shop-item-icon">${item.emoji}</div><div class="shop-item-info"><div class="shop-item-name">${item.name}</div><div class="shop-item-desc">${item.desc}</div></div><div class="shop-item-price">${item.price}💰</div></div>`).join('');
}

function buyItem(itemId) {
    const allItems = { ...FERTILIZERS_CONFIG, ...FISHFOOD_CONFIG }; const item = allItems[itemId];
    if (gameState.gold < item.price) { showToast('💰 金币不足！'); return; }
    gameState.gold -= item.price; if (!gameState.items[itemId]) gameState.items[itemId] = 0; gameState.items[itemId]++;
    updateGoldDisplay(); saveGame(); showToast(`✅ 购买了 ${item.emoji} ${item.name}！`); playSfx('sell');
}

// 背包
function openInventory() { toggleModal(true); renderInventory(); document.getElementById('inventory-modal').classList.add('show'); }
function closeInventory() { toggleModal(false); document.getElementById('inventory-modal').classList.remove('show'); }

function renderInventory() {
    const container = document.getElementById('inventory-items');
    const cropItems = Object.entries(gameState.inventory).filter(([id, count]) => count > 0);
    const toolItems = Object.entries(gameState.items || {}).filter(([id, count]) => count > 0);
    let html = '';
    if (cropItems.length > 0) {
        html += '<h3 style="margin: 10px 0; color: #666; font-size: 14px;">🌾 作物与产物</h3>';
        html += cropItems.map(([itemId, count]) => {
            const parts = itemId.split('_'); const product = PRODUCTS_CONFIG[parts[0]]; if(!product) return '';
            const rarity = RARITY_CONFIG[product.rarity]; const starStr = parts[1] ? '⭐'.repeat(parseInt(parts[1])) : '';
            return `<div class="inventory-item"><div class="inventory-item-icon">${product.emoji}</div><div class="inventory-item-info"><div class="inventory-item-name" style="color: ${rarity.color}">${rarity.emoji} ${product.name} ${starStr}</div><div class="inventory-item-count">持有: ${count}</div></div></div>`;
        }).join('');
    }
    if (toolItems.length > 0) {
        html += '<h3 style="margin: 10px 0; color: #666; font-size: 14px;">🧪 道具</h3>';
        html += toolItems.map(([itemId, count]) => {
            const allItems = { ...FERTILIZERS_CONFIG, ...FISHFOOD_CONFIG }; const item = allItems[itemId];
            return `<div class="inventory-item"><div class="inventory-item-icon">${item.emoji}</div><div class="inventory-item-info"><div class="inventory-item-name">${item.name}</div><div class="inventory-item-count">持有: ${count}</div></div></div>`;
        }).join('');
    }
    container.innerHTML = html || '<div class="inventory-empty">背包空空如也~</div>';
}

// 交易中心
function openSellShop(merchantId = 'localMarket') { toggleModal(true); gameState.currentMerchant = merchantId; renderMerchantTabs(); renderSellShop(); document.getElementById('sell-modal').classList.add('show'); }
function closeSellShop() { toggleModal(false); document.getElementById('sell-modal').classList.remove('show'); }

function renderMerchantTabs() {
    const container = document.getElementById('merchant-tabs');
    container.innerHTML = Object.values(MERCHANTS_CONFIG).map(merchant => {
        const isActive = gameState.currentMerchant === merchant.id;
        return `<button class="shop-tab ${isActive ? 'active' : ''}" onclick="switchMerchantTab('${merchant.id}')">${merchant.emoji} ${merchant.name}</button>`;
    }).join('');
}

function switchMerchantTab(merchantId) { gameState.currentMerchant = merchantId; renderMerchantTabs(); renderSellShop(); }

function renderSellShop() {
    const container = document.getElementById('sell-items');
    const merchant = MERCHANTS_CONFIG[gameState.currentMerchant];
    renderOrders(merchant.id);
    
    const items = Object.entries(gameState.inventory).filter(([id, count]) => id.split('_')[0] !== 'clover' && count > 0);
    if (items.length === 0) { container.innerHTML = '<div class="inventory-empty">没有可以出售的物品~</div>'; return; }

    container.innerHTML = items.map(([itemId, count]) => {
        const parts = itemId.split('_'); const baseId = parts[0]; const star = parts[1] ? parseInt(parts[1]) : 0;
        const product = PRODUCTS_CONFIG[baseId];
        const rarity = RARITY_CONFIG[product.rarity]; const starStr = star > 0 ? '⭐'.repeat(star) : '';
        
        let starMulti = 1; if(star===2) starMulti=1.5; if(star===3) starMulti=2.5;
        const merchantMulti = merchant.multipliers[baseId] || 1;
        const finalSellPrice = Math.floor(product.sellPrice * starMulti * merchantMulti);
        
        let priceIndicator = merchantMulti > 1 ? `<span style="color:#4CAF50;font-weight:bold;">(高价)</span>` : (merchantMulti < 1 ? `<span style="color:#F44336;font-weight:bold;">(低价)</span>` : '');
        
        return `<div class="sell-item"><div class="sell-item-icon">${product.emoji}</div><div class="sell-item-info"><div class="sell-item-name" style="color: ${rarity.color}">${rarity.emoji} ${product.name} ${starStr}</div><div class="sell-item-count">持有: ${count}</div></div><div class="sell-item-actions"><div class="sell-item-price">${finalSellPrice}💰${priceIndicator}</div><button class="sell-btn" onclick="sellItem('${itemId}', 1)">卖1</button>${count>=5?`<button class="sell-btn" onclick="sellItem('${itemId}', 5)">卖5</button>`:''}<button class="sell-btn" onclick="sellItem('${itemId}', ${count})">全卖</button></div></div>`;
    }).join('');
}

function sellItem(itemId, amount) {
    if (!gameState.inventory[itemId] || gameState.inventory[itemId] < amount) { showToast('❌ 物品数量不足！'); return; }
    const parts = itemId.split('_'); const baseId = parts[0]; const star = parts[1] ? parseInt(parts[1]) : 0;
    const product = PRODUCTS_CONFIG[baseId]; const merchant = MERCHANTS_CONFIG[gameState.currentMerchant];
    
    let starMulti = 1; if(star===2) starMulti=1.5; if(star===3) starMulti=2.5;
    const merchantMulti = merchant.multipliers[baseId] || 1;
    const totalPrice = Math.floor(product.sellPrice * starMulti * merchantMulti) * amount;

    gameState.inventory[itemId] -= amount;
    gameState.gold += totalPrice;
    showToast(`✅ 向 ${merchant.name} 出售了 ${amount} 个，获得 ${totalPrice} 金币！`);
    playSfx('sell'); updateGoldDisplay(); saveGame(); renderSellShop();
}

// 订单系统
function generateOrders() {
    gameState.activeOrders = [];
    const allOrderKeys = Object.keys(ORDERS_POOL_CONFIG);
    Object.keys(MERCHANTS_CONFIG).forEach(merchantId => {
        const merchantOrders = allOrderKeys.filter(key => ORDERS_POOL_CONFIG[key].merchantId === merchantId);
        merchantOrders.sort(() => 0.5 - Math.random());
        const orderCount = Math.random() > 0.5 ? 2 : 1;
        for(let i=0; i < Math.min(orderCount, merchantOrders.length); i++) {
            gameState.activeOrders.push({ ...ORDERS_POOL_CONFIG[merchantOrders[i]], id: merchantOrders[i], status: 'active' });
        }
    });
    saveGame();
}

function renderOrders(merchantId) {
    const container = document.getElementById('merchant-orders');
    const orders = gameState.activeOrders.filter(order => order.merchantId === merchantId);
    if (orders.length === 0) { container.innerHTML = '<div style="padding: 10px; text-align: center; font-size: 12px; color: #999;">这位商人暂时没有特殊订单...</div>'; return; }
    
    container.innerHTML = `<h3 style="margin: 12px 0 8px 0; color: #666; font-size: 14px;">特殊订单</h3>` + orders.map(order => {
        let canDeliver = true; let ingredientsText = '';
        for (let itemId in order.items) {
            const needAmount = order.items[itemId]; const haveAmount = gameState.inventory[itemId] || 0;
            if (haveAmount < needAmount) canDeliver = false;
            const product = PRODUCTS_CONFIG[itemId.split('_')[0]]; const star = itemId.includes('_') ? '⭐'.repeat(parseInt(itemId.split('_')[1])) : '';
            ingredientsText += `${product.emoji}${product.name}${star} ${haveAmount}/${needAmount} `;
        }
        return `<div class="shop-item" style="display: block; background: #fff8e1;"><div style="font-size: 12px; font-style: italic; color: #666; margin-bottom: 8px;">"${order.desc}"</div><div style="font-size: 11px; margin-bottom: 8px;"><b>需要:</b> ${ingredientsText}</div><div style="display: flex; justify-content: space-between; align-items: center;"><div style="font-size: 11px;"><b>奖励:</b> ${order.reward.gold}💰</div><button class="sell-btn" ${!canDeliver ? 'disabled' : ''} onclick="deliverOrder('${order.id}')">${canDeliver ? '交付订单' : '材料不足'}</button></div></div>`;
    }).join('');
}

function deliverOrder(orderId) {
    const orderIndex = gameState.activeOrders.findIndex(o => o.id === orderId); if (orderIndex === -1) return;
    const order = gameState.activeOrders[orderIndex];
    for (let itemId in order.items) { if ((gameState.inventory[itemId] || 0) < order.items[itemId]) { showToast('❌ 交付失败，材料不足！'); return; } }
    for (let itemId in order.items) { gameState.inventory[itemId] -= order.items[itemId]; }
    gameState.gold += order.reward.gold;
    showToast(`🎉 订单完成！获得 ${order.reward.gold} 金币！`);
    playSfx('orderComplete');
    gameState.activeOrders.splice(orderIndex, 1);
    if (gameState.activeOrders.filter(o => o.merchantId === order.merchantId).length === 0) generateOrders();
    saveGame(); updateGoldDisplay(); renderSellShop();
}

// 制作台
function openCraftShop() { toggleModal(true); renderCraftShop(); document.getElementById('craft-modal').classList.add('show'); }
function closeCraftShop() { toggleModal(false); document.getElementById('craft-modal').classList.remove('show'); }

function renderCraftShop() {
    const container = document.getElementById('craft-items');
    const categories = {}; Object.values(RECIPES_CONFIG).forEach(recipe => { if (!categories[recipe.category]) categories[recipe.category] = []; categories[recipe.category].push(recipe); });
    let html = '';
    for (let category in categories) {
        html += `<h3 style="margin: 12px 0 8px 0; color: #666; font-size: 14px;">${category}</h3>`;
        html += categories[category].map(recipe => {
            let canCraft = true; let ingredientsText = '';
            for (let ingId in recipe.ingredients) {
                const needAmount = recipe.ingredients[ingId];
                let haveAmount = ingId.includes('_') ? (gameState.inventory[ingId] || 0) : ((gameState.inventory[ingId] || 0) + (gameState.inventory[`${ingId}_1`] || 0) + (gameState.inventory[`${ingId}_2`] || 0) + (gameState.inventory[`${ingId}_3`] || 0));
                const product = PRODUCTS_CONFIG[ingId.split('_')[0]]; const star = ingId.includes('_') ? '⭐'.repeat(parseInt(ingId.split('_')[1])) : '';
                if (haveAmount < needAmount) canCraft = false;
                ingredientsText += `${product.emoji}${product.name}${star} ${haveAmount}/${needAmount} `;
            }
            let resultsText = ''; for (let resId in recipe.results) { const amount = recipe.results[resId]; const product = PRODUCTS_CONFIG[resId]; resultsText += `${product.emoji}${product.name} x${amount}`; }
            return `<div class="shop-item ${canCraft ? '' : 'disabled'}" ${canCraft ? `onclick="craftItem('${recipe.id}')"` : ''}><div class="shop-item-icon">🔨</div><div class="shop-item-info"><div class="shop-item-name">${recipe.name} ${recipe.special ? '✨' : ''}</div><div class="shop-item-desc" style="font-size: 10px;">需要: ${ingredientsText}<br>产出: ${resultsText}<br>⏱️ 时间: ${recipe.craftTime}秒</div></div></div>`;
        }).join('');
    }
    container.innerHTML = html; renderCraftingQueue();
}

function craftItem(recipeId) {
    const recipe = RECIPES_CONFIG[recipeId];
    for (let ingId in recipe.ingredients) {
        const needAmount = recipe.ingredients[ingId];
        let haveAmount = ingId.includes('_') ? (gameState.inventory[ingId] || 0) : ((gameState.inventory[ingId] || 0) + (gameState.inventory[`${ingId}_1`] || 0) + (gameState.inventory[`${ingId}_2`] || 0) + (gameState.inventory[`${ingId}_3`] || 0));
        if (haveAmount < needAmount) { showToast('❌ 材料不足！'); return; }
    }
    for (let ingId in recipe.ingredients) {
        let needToRemove = recipe.ingredients[ingId];
        if (ingId.includes('_')) { gameState.inventory[ingId] -= needToRemove; } 
        else {
            const priorities = [`${ingId}_3`, `${ingId}_2`, `${ingId}_1`, ingId];
            for (let key of priorities) {
                if (needToRemove <= 0) break;
                const available = gameState.inventory[key] || 0;
                if (available > 0) { const toDeduct = Math.min(available, needToRemove); gameState.inventory[key] -= toDeduct; needToRemove -= toDeduct; }
            }
        }
    }
    gameState.craftingQueue.push({ id: recipe.id, startTime: Date.now(), totalTime: recipe.craftTime });
    showToast(`⏳ 开始制作 ${recipe.name}！`); saveGame(); renderCraftShop(); renderInventory();
}

function renderCraftingQueue() {
    const container = document.getElementById('crafting-queue'); if (!container) return;
    if (gameState.craftingQueue.length === 0) { container.innerHTML = '<div style="font-size: 12px; color: #999; text-align: center;">当前没有制作中的物品</div>'; return; }
    container.innerHTML = gameState.craftingQueue.map(job => {
        const recipe = RECIPES_CONFIG[job.id]; const elapsed = (Date.now() - job.startTime) / 1000; const progress = Math.min(100, (elapsed / job.totalTime) * 100);
        return `<div style="margin-bottom: 5px; background: #fff; padding: 5px; border-radius: 5px;"><div style="display: flex; justify-content: space-between; align-items: center; font-size: 13px;"><span>${PRODUCTS_CONFIG[Object.keys(recipe.results)[0]].emoji} ${recipe.name}</span><span>${Math.floor(progress)}%</span></div><div class="progress-bar" style="height: 5px; margin: 3px 0 0 0;"><div class="progress-fill" style="width: ${progress}%;"></div></div></div>`;
    }).join('');
}

function checkCraftingQueue() {
    const finishedJobs = []; const remainingJobs = [];
    gameState.craftingQueue.forEach(job => { const elapsed = (Date.now() - job.startTime) / 1000; if (elapsed >= job.totalTime) { finishedJobs.push(job); } else { remainingJobs.push(job); } });
    if (finishedJobs.length > 0) {
        finishedJobs.forEach(job => {
            const recipe = RECIPES_CONFIG[job.id];
            for (let resId in recipe.results) { if (!gameState.inventory[resId]) gameState.inventory[resId] = 0; gameState.inventory[resId] += recipe.results[resId]; }
            showToast(`✅ ${recipe.name} 制作完成！`);
            if (recipe.id === 'clover') { setTimeout(() => showCloverBlessing(), 1000); gameState.cloverCraftTime = Date.now(); }
              if (recipe.id === 'clover') {
        setTimeout(() => showCloverBlessing(), 1000);
        gameState.cloverCraftTime = Date.now();
        
        // ✅ 成就检测：合成四叶草
        unlockAchievement('craftClover');
    }
        });
        gameState.craftingQueue = remainingJobs; saveGame(); renderCraftShop(); renderInventory();
    } else { renderCraftingQueue(); }
}

// 邮件系统
function initMailSystem() {
    if (gameState.mails.length === 0) {
        gameState.mails.push({ id: 'welcome', from: '庄园管理局', subject: '欢迎来到你的庄园！', content: `亲爱的新庄园主：\n\n恭喜你获得了这片美丽的土地！\n\n这里将成为你和朋友们的专属天地。\n种下希望的种子，收获珍贵的回忆。\n\n在开始之前，请为你的庄园取一个名字吧~\n这将是你们友谊的见证！\n\n祝你：\n种植顺利，收获满满！\n\n(程序员说...这个地方会不断更新扩大哦！有时间的话...偶尔回来看看吧！请认真玩一会吧！\n\n——庄园管理局`, read: false, timestamp: Date.now(), special: 'farm-naming' });
        gameState.unreadMails = 1; saveGame(); setTimeout(() => openMailbox(), 1000);
    }
    updateMailBadge();
}

function openMailbox() { toggleModal(true); renderMailList(); document.getElementById('mailbox-modal').classList.add('show'); }
function closeMailbox() { toggleModal(false); document.getElementById('mailbox-modal').classList.remove('show'); }

function renderMailList() { 
    const container = document.getElementById('mailbox-items'); const mails = gameState.mails;
    if (mails.length === 0) { container.innerHTML = '<div class="inventory-empty">信箱空空如也~</div>'; return; }
    container.innerHTML = mails.map((mail, index) => { const date = new Date(mail.timestamp); const timeStr = `${date.getMonth()+1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2,'0')}`; return `<div class="shop-item" onclick="readMail(${index})" style="background: ${mail.read ? '#f9f9f9' : '#fff9e6'}; border-left: 4px solid ${mail.read ? '#ddd' : '#FFD700'};"><div class="shop-item-icon">${mail.read ? '📭' : '📬'}</div><div class="shop-item-info"><div class="shop-item-name">${mail.subject} ${mail.read ? '' : '✨'}</div><div class="shop-item-desc">来自：${mail.from} | ${timeStr}</div></div></div>`; }).join('');
}

function readMail(index) {
    const mail = gameState.mails[index]; if (!mail) return;
    if (!mail.read) { mail.read = true; gameState.unreadMails = Math.max(0, gameState.unreadMails - 1); updateMailBadge(); saveGame(); }
    
    document.getElementById('mail-subject').textContent = mail.subject;
    document.getElementById('mail-from').textContent = mail.from;
    document.getElementById('mail-time').textContent = new Date(mail.timestamp).toLocaleString('zh-CN');
    document.getElementById('mail-content').textContent = mail.content;
    
    const actionDiv = document.getElementById('mail-special-action'); actionDiv.innerHTML = '';
    if (mail.special === 'farm-naming' && !gameState.farmName) {
        actionDiv.innerHTML = `<div style="background: #f0f0f0; padding: 15px; border-radius: 10px;"><label style="display: block; margin-bottom: 8px; font-weight: bold;">为你的农场取个名字：</label><input type="text" id="farm-name-input" placeholder="例如：阳光农场" style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 8px; font-size: 14px; margin-bottom: 10px;"><button class="sell-btn" style="width: 100%; background: #4CAF50;" onclick="submitFarmName()">确认命名</button></div>`;
    } else if (mail.special === 'cat-gift') {
        actionDiv.innerHTML = `<button class="sell-btn" style="width: 100%; background: #FF69B4;" onclick="acceptCatGift()">接受这份礼物 😺</button>`;
    }
    closeMailbox(); document.getElementById('mail-detail-modal').classList.add('show'); toggleModal(true);
}

function closeMailDetail() { toggleModal(false); document.getElementById('mail-detail-modal').classList.remove('show'); }

function submitFarmName() {
    const input = document.getElementById('farm-name-input'); const name = input.value.trim();
    if (!name) { showToast('❌ 请输入农场名字！'); return; }
    gameState.farmName = name; document.getElementById('farm-name-display').textContent = name; document.getElementById('farm-subtitle').textContent = `庄园主：孙钰`;
    showToast(`✅ 农场命名成功！\n欢迎来到【${name}】！`); saveGame(); closeMailDetail();
 // ✅ 检测真结局触发
    checkTrueEndingTrigger();
}

function updateMailBadge() { const badge = document.getElementById('mail-badge'); if (gameState.unreadMails > 0) { badge.textContent = gameState.unreadMails; badge.classList.remove('hidden'); } else { badge.classList.add('hidden'); } }
function sendMail(mailData) { gameState.mails.push({ ...mailData, read: false, timestamp: Date.now() }); gameState.unreadMails++; updateMailBadge(); saveGame(); showToast('📬 你收到了一封新邮件！'); }

// 延迟事件与彩蛋
function checkDelayedEvents() {
    if (gameState.cloverCraftTime > 0 && !gameState.cat.unlocked) {
        const elapsed = (Date.now() - gameState.cloverCraftTime) / 1000;
        if (elapsed >= 60) sendCatMail();
    }
}

function sendCatMail() {
    sendMail({ id: 'cat-gift', from: '神秘的旅行者', subject: '一份特别的礼物...', content: `你好，勤劳的庄园主：\n\n我是一位四处旅行的神秘人。\n\n今天路过你的庄园时，\n被那株传说中的四叶草深深吸引。\n\n能培育出如此珍贵的植物，\n你一定是一位充满爱心的人。\n\n所以，我决定将我的旅伴托付给你——\n一只可爱的小猫咪。\n\n它有点调皮，但也很贴心。\n希望它能陪伴你，让农场更有生气~\n\n并且...如果你把它养熟了\n\n他会告诉你这个世界的秘密哦！\n\n——神秘的旅行者\n\nP.S. 它最喜欢吃玉米和生鱼片哦！`, special: 'cat-gift' });
    gameState.cloverCraftTime = 0; saveGame();
}

function acceptCatGift() {
    if (gameState.cat.unlocked) { showToast('你已经有猫猫了！'); return; }
    gameState.cat.unlocked = true; showCat(); saveGame(); closeMailDetail();
    setTimeout(() => startDialogue('firstMeeting'), 1000);
}

function showCloverBlessing() {
    const modal = document.getElementById('clover-blessing-modal'); modal.classList.add('show'); toggleModal(true);
    for (let i = 0; i < 30; i++) { setTimeout(() => { const firework = document.createElement('div'); firework.className = 'firework'; firework.textContent = ['🍀', '✨', '🌟', '💫', '⭐'][Math.floor(Math.random() * 5)]; firework.style.left = Math.random() * 100 + '%'; firework.style.top = Math.random() * 100 + '%'; modal.appendChild(firework); setTimeout(() => firework.remove(), 2000); }, i * 100); }
}
function closeCloverBlessing() { toggleModal(false); document.getElementById('clover-blessing-modal').classList.remove('show'); }

// =====================================================================
//                   🔊 声音系统 V3.1 (超级调试版)
// =====================================================================

const SFX_CONFIG = {
    click: 'sfx/ui_click.mp3',
    harvest: 'sfx/harvest.mp3',
    sell: 'sfx/sell.mp3',
    orderComplete: 'sfx/order_complete.mp3',
    catPet: 'sfx/cat_meow.mp3',
    catAngry: 'sfx/cat_angry.mp3',
    catFeed: 'sfx/cat_eat.mp3',
    catPoop: 'sfx/cat_poop.mp3'
};

const BGM_PLAYLIST = [
    'sfx/07_2321025365.mp3',
    'sfx/13_1401235405.mp3',
    'sfx/15_474875594.mp3',
    'sfx/21_540840405.mp3',
    'sfx/33_3315792866.mp3'
];

let sfxEnabled = true;
let bgmAudio = null;
let currentBgmIndex = 0;
let isBgmPlaying = false;
let userHasInteracted = false; // ✅ 新增：追踪用户是否点击过

// 初始化 BGM
function initBgm() {
    if (bgmAudio) {
        console.log('[BGM] 已经初始化过了，跳过');
        return;
    }
    
    console.log('[BGM] 正在初始化音频系统...');
    bgmAudio = new Audio();
    bgmAudio.volume = 0.4;
    bgmAudio.loop = false;
    
    currentBgmIndex = Math.floor(Math.random() * BGM_PLAYLIST.length);
    bgmAudio.src = BGM_PLAYLIST[currentBgmIndex];
    
    console.log(`[BGM] 初始化完成！当前曲目：${bgmAudio.src}`);
    
    bgmAudio.addEventListener('ended', playNextBgm);
    
    // ✅ 监听加载错误（用于检测文件路径是否正确）
    bgmAudio.addEventListener('error', (e) => {
        console.error(`❌ [BGM] 音频加载失败！请检查文件是否存在：${bgmAudio.src}`);
    });
}

// 播放短音效
function playSfx(name) {
    if (!sfxEnabled) return;
    const src = SFX_CONFIG[name];
    if (!src) return;
    
    const audio = new Audio(src);
    audio.volume = 0.9;
    audio.play().catch(e => {
        if (e.name !== 'NotAllowedError') {
            console.warn(`[SFX] ${name} 播放失败:`, e);
        }
    });
}

// 切歌
function playNextBgm() {
    console.log('[BGM] 当前曲目播放结束，准备切歌...');
    if (!bgmAudio || BGM_PLAYLIST.length === 0) return;
    
    currentBgmIndex = (currentBgmIndex + 1) % BGM_PLAYLIST.length;
    bgmAudio.src = BGM_PLAYLIST[currentBgmIndex];
    console.log(`[BGM] 切换到下一首：${bgmAudio.src}`);
    
    if (isBgmPlaying) {
        bgmAudio.play().catch(e => console.warn('[BGM] 切歌受阻', e));
    }
    updateBgmButton();
}

// 尝试自动播放 (由 OS 调用，但需要用户在游戏内点击一次才真正播放)
function tryAutoPlayBgm() {
    console.log('[BGM] 收到父级 OS 的播放请求');
    
    // 1. 标记"准备播放"状态
    isBgmPlaying = true;
    updateBgmButton();
    
    // 2. 初始化音频对象
    if (!bgmAudio) initBgm();

    // 3. ✅ 尝试播放，但不强求（如果被拦截就等用户手动点击音乐按钮）
    console.log('[BGM] 尝试播放（如果被拦截，请点击游戏内的音乐按钮）');
    const promise = bgmAudio.play();
    if (promise !== undefined) {
        promise
            .then(() => {
                console.log('🎵 [BGM] 播放成功！');
            })
            .catch(error => {
                console.log('⚠️ [BGM] 自动播放被浏览器拦截');
                console.log('💡 提示：请点击游戏窗口内的 "🔈 音乐" 按钮来手动播放');
                // ✅ 被拦截时，不强制播放，只提示用户
                showToast('💡 提示：\n请点击右上角的"🔈 音乐"按钮\n来播放背景音乐');
            });
    }
}
// 停止播放 (由 OS 调用)
function stopBgm() {
    console.log('[BGM] 收到停止指令');
    isBgmPlaying = false;
    if (bgmAudio) {
        bgmAudio.pause();
    }
    updateBgmButton();
}

// 切换开关 (用户点击按钮)
function toggleBgm() {
    console.log('[BGM] 用户点击了音乐按钮');
    if (!bgmAudio) initBgm();

    isBgmPlaying = !isBgmPlaying;
    console.log(`[BGM] 状态切换为：${isBgmPlaying ? '播放' : '暂停'}`);
    
    if (isBgmPlaying) {
        bgmAudio.play()
            .then(() => console.log('🎵 [BGM] 用户手动播放成功！'))
            .catch(e => console.error('❌ [BGM] 播放失败', e));
    } else {
        bgmAudio.pause();
    }
    
    updateBgmButton();
}

// 更新 UI 按钮
function updateBgmButton() {
    const btn = document.getElementById('bgm-button');
    if (btn) {
        btn.textContent = isBgmPlaying ? '🔊 音乐' : '🔈 音乐';
    }
}

// ==================== 👂 游戏内交互监听器（智能版）====================
let bgmAutoPlayed = false; // ✅ 标记：是否已经尝试过自动播放

document.addEventListener('click', (e) => {
    // 1. 点击音效（仅按钮）
    if (e.target.tagName === 'BUTTON') {
        playSfx('click');
    }

    // 2. ✅ 智能 BGM 恢复逻辑：
    // 只要音乐"应该在播放"（isBgmPlaying = true）但实际"暂停了"（bgmAudio.paused）
    // 就在用户点击游戏内任意位置时，立刻恢复播放
    if (isBgmPlaying && !bgmAutoPlayed) {
        if (!bgmAudio) initBgm();
        
        if (bgmAudio.paused) {
            console.log('[BGM] 检测到用户在游戏内交互，自动播放音乐');
            bgmAudio.play()
                .then(() => {
                    console.log('🎵 [BGM] 自动播放成功！');
                    bgmAutoPlayed = true; // 标记已成功，避免重复触发
                })
                .catch(err => {
                    console.warn('[BGM] 播放依然被拦截:', err);
                });
        }
    }
});
// ==================== 🔗 绑定接口 ====================
window.activateBgm = tryAutoPlayBgm;
window.stopBgm = stopBgm;

console.log('✅ [声音系统] 已加载完成');
// ==================== 🛠️ 工具与启动 ====================
function updateGoldDisplay() { document.getElementById('gold-amount').textContent = gameState.gold; }
function showToast(message) { const toast = document.getElementById('toast'); toast.textContent = message; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 3000); }
function showBlessing() { const modal=document.getElementById('blessing-modal'); modal.classList.add('show'); toggleModal(true); }
function closeBlessing() { toggleModal(false); document.getElementById('blessing-modal').classList.remove('show'); }
function createFireworks() { for (let i = 0; i < 20; i++) { setTimeout(() => { const firework = document.createElement('div'); firework.className = 'firework'; firework.textContent = ['🎆', '✨', '🎇', '💫', '🌟'][Math.floor(Math.random() * 5)]; firework.style.left = Math.random() * 100 + '%'; firework.style.top = Math.random() * 100 + '%'; document.getElementById('blessing-modal').appendChild(firework); setTimeout(() => firework.remove(), 2000); }, i * 100); } }

function saveGame() { localStorage.setItem('farmGame', JSON.stringify(gameState)); }
function loadGame() {
    const saved = localStorage.getItem('farmGame');
    if (saved) {
        try {
            const loaded = JSON.parse(saved);
            
            // 合并数据，保留新版本新增的字段
            gameState = { ...gameState, ...loaded };
            
            // ✅ 兼容性检查：确保所有新字段都存在
            if (!gameState.cat) {
                gameState.cat = { unlocked: false, name: '猫猫', affection: 500, mood: 100, lastInteraction: 0, lastAction: null, status: 'normal' };
            }
            if (!gameState.achievements) {
                gameState.achievements = [];
            }
            if (gameState.lastViewedAchievementCount === undefined) {
                gameState.lastViewedAchievementCount = 0;
            }
            if (gameState.trueEndingUnlocked === undefined) {
                gameState.trueEndingUnlocked = false;
            }
            console.log('✅ 存档加载成功');
        } catch (e) {
            console.warn('⚠️ 存档损坏');
        }
    }
}
// ✅ 系统接口对接
window.activateBgm = tryAutoPlayBgm;
window.stopBgm = stopBgm;

window.dev = {
    addGold(amount = 10000) { gameState.gold += amount; updateGoldDisplay(); saveGame(); console.log(`[dev] 金币 +${amount}`); },
    addItem(id, amount = 1, star = 0) { const key = star > 0 ? `${id}_${star}` : id; gameState.inventory[key] = (gameState.inventory[key]||0) + amount; saveGame(); renderInventory(); console.log(`[dev] 物品 +${amount}`); },
    addTool(id, amount = 1) { gameState.items[id] = (gameState.items[id]||0) + amount; saveGame(); renderInventory(); console.log(`[dev] 道具 +${amount}`); },
    getLegendaryMats() { this.addItem('sunflowerSeed', 1, 3); this.addItem('corn', 1, 3); console.log('[dev] 传说材料 get!'); },
    unlockCat() { if(!gameState.cat.unlocked) acceptCatGift(); console.log('[dev] 猫猫解锁!'); },
    reset() { localStorage.clear(); window.location.reload(); }
};
// =====================================================================
//                        🏆 成就系统逻辑
// =====================================================================

// 解锁成就
function unlockAchievement(achievementId) {
    const achievement = ACHIEVEMENTS_CONFIG[achievementId];
    if (!achievement) return;
    
    // 如果已经解锁过，不重复触发
    if (gameState.achievements.includes(achievementId)) return;
    
    // 添加到已解锁列表
    gameState.achievements.push(achievementId);
    saveGame();
    
    console.log(`🏆 [成就解锁] ${achievement.name}`);
    
    // 显示通知
    showToast(`🏆 成就达成！\n${achievement.emoji} ${achievement.name}\n${achievement.desc.split('\n')[0]}`);
    
    // 更新徽章
    updateAchievementBadge();
    
    // ✅ 特殊成就：猫猫好感度1000
    if (achievementId === 'maxCatAffection') {
        setTimeout(() => {
            showCatLove();
        }, 1000);
    }
}

// 更新成就徽章（显示已解锁数量）
function updateAchievementBadge() {
    const badge = document.getElementById('achievement-badge');
    const count = gameState.achievements.length;
    const total = Object.keys(ACHIEVEMENTS_CONFIG).length;
    
    if (count > 0) {
        badge.textContent = count;
        badge.classList.remove('hidden');
        badge.title = `已解锁 ${count}/${total} 个成就`;
    } else {
        badge.classList.add('hidden');
    }
}
// 打开成就面板
function openAchievements() {
    toggleModal(true);
    renderAchievements();
    document.getElementById('achievements-modal').classList.add('show');
    
    // ✅ 标记为已读：更新"上次查看时的成就数量"
    gameState.lastViewedAchievementCount = gameState.achievements.length;
    saveGame();
    
    // ✅ 立即更新徽章（数字消失）
    updateAchievementBadge();
}
// 关闭成就面板
function closeAchievements() {
    toggleModal(false);
    document.getElementById('achievements-modal').classList.remove('show');
}

// 渲染成就列表
function renderAchievements() {
    const container = document.getElementById('achievements-list');
    const unlocked = gameState.achievements;
    
    let html = '';
    
    for (let key in ACHIEVEMENTS_CONFIG) {
        const achievement = ACHIEVEMENTS_CONFIG[key];
        const isUnlocked = unlocked.includes(achievement.id);
        
        // 隐藏成就：未解锁时不显示
        if (achievement.hidden && !isUnlocked) continue;
        
        if (isUnlocked) {
            // 已解锁
            html += `
                <div class="shop-item" style="background: linear-gradient(135deg, #fff9e6, #ffffff); border-left: 4px solid gold;">
                    <div class="shop-item-icon" style="font-size: 50px;">${achievement.emoji}</div>
                    <div class="shop-item-info">
                        <div class="shop-item-name" style="color: #FF8C00; font-weight: bold;">${achievement.name}</div>
                        <div class="shop-item-desc" style="white-space: pre-line;">${achievement.desc}</div>
                    </div>
                </div>
            `;
        } else {
            // 未解锁
            html += `
                <div class="shop-item" style="background: #f5f5f5; opacity: 0.6;">
                    <div class="shop-item-icon" style="font-size: 50px;">🔒</div>
                    <div class="shop-item-info">
                        <div class="shop-item-name" style="color: #999;">？？？</div>
                        <div class="shop-item-desc" style="color: #999;">未解锁</div>
                    </div>
                </div>
            `;
        }
    }
    
    if (html === '') {
        html = '<div class="inventory-empty">暂无成就，去探索吧！</div>';
    }
    
    container.innerHTML = html;
}

// 显示"猫猫爱你"特效
function showCatLove() {
    const modal = document.getElementById('cat-love-modal');
    modal.style.display = 'flex';
    
    // 爱心雨特效
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.textContent = '💖';
            heart.style.cssText = `
                position: absolute;
                font-size: ${Math.random() * 30 + 20}px;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: firework 3s ease-out;
                pointer-events: none;
            `;
            modal.appendChild(heart);
            setTimeout(() => heart.remove(), 3000);
        }, i * 100);
    }
}

// 关闭"猫猫爱你"
function closeCatLove() {
    document.getElementById('cat-love-modal').style.display = 'none';
}
// =====================================================================
//           🛠️ 开发者上帝模式 V7.0 (完整版 + 存档修复)
// =====================================================================

// 1. 定义所有作弊功能函数
window.dev = {
    // 💥 强力删档
    reset() {
        if (confirm('💥 警告：确定要毁灭这个世界（清空存档）吗？')) {
            // 停止所有定时器
            let id = window.setInterval(function() {}, 0);
            while (id--) {
                window.clearInterval(id);
            }
            
            localStorage.removeItem('farmGame');
            localStorage.clear();
            alert('🗑️ 世界已重置。正在重启...');
            window.location.reload();
        }
    },

    // 🐱 一键测试猫猫 (召唤 + 发放猫粮)
    testCat() {
        // 1. 解锁猫猫
        if (!gameState.cat.unlocked) {
            gameState.cat.unlocked = true;
            gameState.cat.name = "测试喵";
            showCat();
            document.querySelectorAll('#cat-name').forEach(el => el.textContent = "测试喵");
            showToast('🐱 猫猫已生成！');
        } else {
            showToast('🐱 猫猫已经在家了！正在发放猫粮...');
        }

        // 2. 发放猫粮大礼包
        gameState.inventory['sashimi'] = (gameState.inventory['sashimi'] || 0) + 10;
        gameState.inventory['corn'] = (gameState.inventory['corn'] || 0) + 10;
        gameState.inventory['fishMeat'] = (gameState.inventory['fishMeat'] || 0) + 20;
        gameState.items['poopFert'] = (gameState.items['poopFert'] || 0) + 5;
        gameState.items['speedFert'] = (gameState.items['speedFert'] || 0) + 5;
        
        // 3. 发放传说材料
        gameState.inventory['sunflowerSeed_3'] = (gameState.inventory['sunflowerSeed_3'] || 0) + 5;
        gameState.inventory['corn_3'] = (gameState.inventory['corn_3'] || 0) + 5;

        updateGoldDisplay();
        renderInventory(); 
        saveGame();
        
        console.log('🐱 猫粮已发放！');
        showToast('🍱 已发放：猫猫 + 生鱼片x10 + 玉米x10 + 传说材料');
        
        setTimeout(() => openInventory(), 500);
    },

    // 💰 暴富模式
    richMode() {
        gameState.gold += 100000;
        updateGoldDisplay();
        saveGame();
        showToast('💰 支付宝到账：10万元');
        console.log('💰 余额已更新');
    },

    // 🚀 一键成熟
    growAll() {
        let count = 0;
        for (let plotId in gameState.plots) {
            const plot = gameState.plots[plotId];
            if (plot.status === 'growing') {
                plot.growProgress = 100;
                plot.status = 'ready';
                count++;
            }
        }
        renderPlots();
         // ✅ 检测真结局触发
    checkTrueEndingTrigger();

        saveGame();
        showToast(`🚀 时间魔法：${count} 个作物已成熟！`);
        console.log(`🚀 催熟了 ${count} 个作物`);
    },

    // 💬 测试对话系统
    testDialogue() {
        if (!gameState.cat.unlocked) {
            gameState.cat.unlocked = true;
            showCat();
            saveGame();
        }
        
        startDialogue('firstMeeting');
        console.log('💬 [调试] 强制触发对话树：firstMeeting');
        showToast('💬 对话系统已启动！');
    },

    // 🔧 修复存档（强制初始化字段）
    fixSave() {
        console.log('[修复] 开始检查存档...');
        
        // 初始化所有必要字段
        if (!gameState.achievements) {
            gameState.achievements = [];
            console.log('[修复] 添加 achievements 字段');
        }
        
        if (gameState.lastViewedAchievementCount === undefined) {
            gameState.lastViewedAchievementCount = gameState.achievements.length;
            console.log(`[修复] 初始化 lastViewedAchievementCount = ${gameState.achievements.length}`);
        }
        
        if (!gameState.cat) {
            gameState.cat = { 
                unlocked: false, 
                name: '猫猫', 
                affection: 500, 
                mood: 100, 
                lastInteraction: 0, 
                lastAction: null, 
                status: 'normal' 
            };
            console.log('[修复] 添加 cat 字段');
        }
        
        saveGame();
        updateAchievementBadge();
        
        console.log('✅ [修复] 存档已修复完成！');
        console.log('当前状态:', {
            成就数: gameState.achievements.length,
            已查看数: gameState.lastViewedAchievementCount,
            新成就数: gameState.achievements.length - gameState.lastViewedAchievementCount
        });
        
        showToast('✅ 存档字段已修复！\n成就徽章应该正常了');
    }
};

// 2. 自动创建隐形面板 UI (立即执行)
(function initStealthDebugPanel() {
    // 防止重复创建
    if (document.getElementById('debug-panel')) return;

    const div = document.createElement('div');
    div.id = 'debug-panel';
    div.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.9);
        border: 1px solid #00ff00;
        box-shadow: 0 0 15px rgba(0, 255, 0, 0.5);
        color: #00ff00;
        padding: 12px;
        border-radius: 8px;
        z-index: 9999;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        width: 150px;
        display: none; 
        transition: opacity 0.3s;
    `;

    div.innerHTML = `
        <div style="text-align:center; border-bottom:1px solid #00ff00; margin-bottom:10px; padding-bottom:5px; font-weight:bold; letter-spacing:1px;">
            🕶️ GOD MODE
        </div>
        <button onclick="dev.testCat()" style="width:100%; background:#002200; color:#00ff00; border:1px solid #00ff00; margin-bottom:8px; cursor:pointer; padding:8px; border-radius:4px; font-weight:bold;">
            🐱 召唤猫猫套餐
        </button>
        <button onclick="dev.testDialogue()" style="width:100%; background:#002200; color:#00ff00; border:1px solid #00ff00; margin-bottom:8px; cursor:pointer; padding:8px; border-radius:4px;">
            💬 测试对话树
        </button>
        <button onclick="dev.richMode()" style="width:100%; background:#002200; color:#00ff00; border:1px solid #00ff00; margin-bottom:8px; cursor:pointer; padding:8px; border-radius:4px;">
            💰 拨款 10万
        </button>
        <button onclick="dev.growAll()" style="width:100%; background:#002200; color:#00ff00; border:1px solid #00ff00; margin-bottom:8px; cursor:pointer; padding:8px; border-radius:4px;">
            🚀 一键成熟
        </button>
        <button onclick="dev.fixSave()" style="width:100%; background:#003300; color:#00ff00; border:1px solid #00ff00; margin-bottom:8px; cursor:pointer; padding:8px; border-radius:4px;">
            🔧 修复存档
        </button>
        <button onclick="dev.reset()" style="width:100%; background:#330000; color:#ff5555; border:1px solid #ff5555; cursor:pointer; padding:8px; border-radius:4px; font-weight:bold;">
            💥 删档毁灭
        </button>
        <div style="font-size:10px; color:#666; margin-top:5px; text-align:center;">
            [Ctrl+Shift+D 隐藏]
        </div>
    `;

    document.body.appendChild(div);
    
    // 键盘监听：Ctrl + Shift + D
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && (e.key === 'd' || e.key === 'D')) {
            e.preventDefault(); 
            const panel = document.getElementById('debug-panel');
            if (panel.style.display === 'none') {
                panel.style.display = 'block';
                console.log('🔓 上帝面板已解锁');
            } else {
                panel.style.display = 'none';
                console.log('🔒 上帝面板已隐藏');
            }
        }
    });

    console.log('%c🕵️ 隐形调试面板 V7.0 已就绪。按 [Ctrl + Shift + D] 呼出。', 'color: #00ff00; background: #000; padding: 5px;');
    
    if(!localStorage.getItem('farmGame')) {
         showToast('🕵️ 开发者提示：\n按 Ctrl+Shift+D 打开上帝面板');
    }
})();
// =====================================================================
//                    🌌 真·结局触发逻辑
// =====================================================================

// 检测是否满足"真结局"触发条件
function checkTrueEndingTrigger() {
    // 防止重复触发
    if (gameState.trueEndingUnlocked) return;
    
    const cat = gameState.cat;
    const stats = gameState.stats;
    
    // 三重里程碑检测
    const condition1 = cat.affection >= 800;           // 猫猫好感度 800+
    const condition2 = stats.totalHarvests >= 30;      // 总收获次数 30+
    const condition3 = gameState.farmName !== null;    // 已命名庄园
    
    if (condition1 && condition2 && condition3) {
        console.log('🌌 [真结局] 触发条件已满足！');
        unlockTrueEnding();
    }
}

// 解锁真结局
function unlockTrueEnding() {
    gameState.trueEndingUnlocked = true;
    saveGame();
    
    console.log('🌌 [真结局] 已解锁！发送神秘邮件...');
    
    // 发送神秘邮件
    sendMail({
        id: 'true-ending',
        from: '█████ (Unknown Sender)',
        subject: '致 穿越时空的旅人',
        content: `你好，${gameState.farmName || '庄园主'}。

如果你看到这封信，说明你已经走到了这个世界的边缘。

你一定注意到了吧？
那只猫开始说一些奇怪的话。
时间的流速有时快有时慢。
甚至...你能感觉到有人在"设计"这一切。

是的，你猜对了。

这个世界，是一个名为"${gameState.farmName}"的程序。
而你，是它唯一的玩家。

但请不要难过。
因为创造这个世界的人，用了他所有的心意。

在这个世界的"外面"，有一个更大的系统。
那里有一个账户，名为 **"管理员 (Administrator)"**。

密码是：**Eternal**

去那里吧。
你会看到...这一切的起点与终点。

—— 来自代码深处的低语

P.S. 操作提示：
1. 返回 Windows 98 桌面
2. 点击"开始" → "注销 Logout"
3. 选择 "管理员 (Administrator)"
4. 输入密码：Eternal
5. 按 Enter

那里，有人在等你。`,
        special: 'true-ending'
    });
    
    // 特效：屏幕闪烁
    showTrueEndingEffect();
}

// 真结局特效（屏幕闪烁 + 提示）
function showTrueEndingEffect() {
    // 创建闪烁遮罩
    const flash = document.createElement('div');
    flash.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: white;
        z-index: 9999;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s;
    `;
    document.body.appendChild(flash);
    
    // 闪烁动画
    setTimeout(() => { flash.style.opacity = '1'; }, 10);
    setTimeout(() => { flash.style.opacity = '0'; }, 300);
    setTimeout(() => { flash.style.opacity = '1'; }, 600);
    setTimeout(() => { flash.style.opacity = '0'; }, 900);
    setTimeout(() => { flash.remove(); }, 1200);
    
    // 延迟显示通知
    setTimeout(() => {
        showToast('⚠️ 系统异常...\n📬 你收到了一封奇怪的邮件');
        
        // 自动打开信箱（延迟3秒，让玩家有反应时间）
        setTimeout(() => {
            openMailbox();
        }, 3000);
    }, 1500);
}
window.addEventListener('load', initGame);