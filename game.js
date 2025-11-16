/* =====================================================================
   
   🏡 我们的欢乐庄园 - 游戏核心逻辑 V2.1
   
   包含系统：
   - 种植、畜牧、水产系统
   - 经济系统（分钟级）
   - 化肥 & 鱼食系统
   - 制作台系统（带时间）
   - 星级 & 稀有度系统
   - 猫猫互动系统（可拖拽、基础互动）
   - 信箱系统（农场命名、延迟送猫）
   
===================================================================== */
// =====================================================================
//                        💬 对话树配置
// =====================================================================

const CAT_DIALOG_TREES = {
    // --- 首次见面的对话 ---
     // --- 首次见面的对话 ---
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
    { id: 4, text: "太好了！我叫什么名字好呢？", special: 'prompt_cat_name' }, // ✅ 特殊事件改成给猫取名
    { 
        id: 5, 
        text: "呜...坏家伙，那...你先叫我“猫猫”吧...",
        choices: [
            { text: "（还是给它取个名字吧）", nextNodeId: 4 }
        ]
    }
],
    // --- 日常对话（好感度 < 200） ---
    dailyLowAffection: [
        { id: 1, text: "有吃的吗？我饿了。" },
        { id: 2, text: "今天天气不错，适合睡觉... Zzz..." },
        { id: 3, text: "别老看着我，快去干活啦！" }
    ],
    
    // --- 日常对话（好感度 >= 800） ---
    dailyHighAffection: [
        { id: 1, text: "见到你真开心！今天也要一起加油哦！" },
        { id: 2, text: "（蹭蹭你的腿）最喜欢你啦！" },
        { id: 3, text: "这个庄园因为有你，才变得这么美好~" }
    ]
    // ... 以后可以加更多对话树，比如 catTheft, specialOrder, etc.
};
// ==================== 🐱 猫猫动画配置 ====================

const CAT_ANIMATIONS = {
    idle: {
        type: 'image',
        src: 'images/cat/idle.png',
        loop: true
    },
    pet: {
        type: 'video',
        src: 'videos/cat_pet.mp4'
    },
    feed: {
        type: 'video',
        src: 'videos/cat_feed.mp4'
    },
    poop: {
        type: 'video',
        src: 'videos/cat_poop.mp4'
    },
    hit: {
        type: 'video',
        src: 'videos/cat_hit.mp4'
    },
    unhappy: {
        type: 'video',
        src: 'videos/cat_unhappy.mp4'
    }
    // 以后如果你加别的动作，按这个结构往上加就行
}// 播放/切换猫猫动画（图片或视频）
function setCatState(state) {
    const cfg = CAT_ANIMATIONS[state] || CAT_ANIMATIONS.idle;
    const imgEl = document.getElementById('cat-image');
    const videoEl = document.getElementById('cat-video');
    if (!imgEl || !videoEl) return;

    // 停掉上一段视频（如果有）
    try {
        videoEl.pause();
    } catch (e) {}
    videoEl.onended = null;

    if (cfg.type === 'video') {
        // 显示视频，隐藏立绘
        imgEl.style.display   = 'none';
        videoEl.style.display = 'block';

        // 切换视频源
        videoEl.src = cfg.src;
        videoEl.currentTime = 0;

        const playPromise = videoEl.play();
        if (playPromise && playPromise.catch) {
            playPromise.catch(err => {
                // 🔑 关键：忽略主动打断导致的 AbortError
                if (err.name === 'AbortError') {
                    // 这是正常的：我们自己在别处又切了状态
                    return;
                }
                // 其他错误再打印出来，方便你以后排查
                console.error('[CatVideo] play error:', err);
            });
        }

        // 播放结束后自动回到 idle 立绘
        videoEl.onended = () => {
            setCatState('idle');
        };

    } else {
        // 显示立绘，隐藏视频
        videoEl.style.display = 'none';
        videoEl.src = '';
        imgEl.style.display   = 'block';
        imgEl.src             = cfg.src;
    }
}
// ==================== 🏪 收购商配置 ====================

const MERCHANTS_CONFIG = {
    localMarket: {
        id: 'localMarket',
        name: '穗丰农产贸易公司',
        desc: '收购新鲜的原材料，价格公道。',
        emoji: '🧑‍🌾',
        multipliers: {
            // 对常见原料有轻微加成
            wheat: 1.2,
            apple: 1.2,
            fishMeat: 1.1,
            // 对高级料理不感兴趣
            premiumDish: 0.5
        }
    },
    gourmetRestaurant: {
        id: 'gourmetRestaurant',
        name: "『星辰』餐饮集团",
        desc: '只收购高品质的食材和精致料理。',
        emoji: '👑',
        multipliers: {
            // 对高级料理和稀有品有巨大加成
            premiumDish: 2.0,
            coldAppleJam: 1.5,
            wangboSashimi: 1.5,
            godWool: 1.8,
            // 不收低级原料
            wheat: 0.3,
            apple: 0.5
        }
    },
    globalTrade: {
        id: 'globalTrade',
        name: '环球贸易公司',
        desc: '什么都收，量大从优！',
        emoji: '🚢',
        multipliers: {} // 没有特殊偏好，价格稳定
    }
};
// ==================== 📜 订单池配置 ====================
// 系统会从这里随机抽取订单

const ORDERS_POOL_CONFIG = {
    // 老王农贸市场订单
    local_1: {
        merchantId: 'localMarket',
        items: { wheat: 20 }, // 需要20个小麦
        reward: { gold: 800 },   // 奖励800金币
        desc: "最近面粉需求大，急需一批小麦！"
    },
    local_2: {
        merchantId: 'localMarket',
        items: { apple: 15 },
        reward: { gold: 1100 },
        desc: "果酱工坊需要新鲜的苹果。"
    },

    // 餐厅订单
    gourmet_1: {
        merchantId: 'gourmetRestaurant',
        items: { 'apple_2': 5 }, // 需要5个2星苹果
        reward: { gold: 2000 },
        desc: "我们需要高品质的苹果来做甜点。"
    },
    gourmet_2: {
        id: 'gourmet_2',
        merchantId: 'gourmetRestaurant',
        items: { beefNoodle: 3 },
        reward: { gold: 2500 },
        desc: "有贵客预定了三碗顶级牛肉面。"
    },

    // 贸易公司订单
    trade_1: {
        merchantId: 'globalTrade',
        items: { flour: 50, bread: 20 }, // 复合订单
        reward: { gold: 15000 },
        desc: "一艘远洋货轮需要大量面粉和面包补给。"
    },
    trade_2: {
        merchantId: 'globalTrade',
        items: { wool: 30, godWool: 10 },
        reward: { gold: 10000 },
        desc: "海外市场需要一批高质量的羊毛制品。"
    }
};
// ==================== 📋 稀有度配置 ====================
const RARITY_CONFIG = {
    common: { name: '常见', color: '#4CAF50', emoji: '🟢' },
    uncommon: { name: '优秀', color: '#2196F3', emoji: '🔵' },
    rare: { name: '稀有', color: '#9C27B0', emoji: '🟣' },
    epic: { name: '史诗', color: '#FF9800', emoji: '🟡' },
    legendary: { name: '传说', color: '#F44336', emoji: '🔴' }
};

// ==================== 🌾 作物/动物配置 ====================
const ITEMS_CONFIG = {
    // --- 🌾 种植类 ---
    wheat: {
        id: 'wheat', name: '王小麦', type: 'farm', rarity: 'common', price: 120, sellPrice: 55, growTime: 90, emoji: '🌾',
        desc: '基础作物，薄利多销', careText: '施肥', careEmoji: '🌱', canHaveStar: true, yieldItems: [{ id: 'wheat', min: 2, max: 4 }]
    },
    apple: {
        id: 'apple', name: '嘉乐苹', type: 'farm', rarity: 'common', price: 180, sellPrice: 110, growTime: 120, emoji: '🍎',
        desc: '香甜可口，适合做果酱', careText: '施肥', careEmoji: '🌱', canHaveStar: true, yieldItems: [{ id: 'apple', min: 2, max: 4 }]
    },
    coldApple: {
        id: 'coldApple', name: '寒苹', type: 'farm', rarity: 'uncommon', price: 400, sellPrice: 150, growTime: 240, emoji: '🧊',
        desc: '稀有品种，制成果酱价值高', careText: '施肥', careEmoji: '🌱', canHaveStar: true, yieldItems: [{ id: 'coldApple', min: 1, max: 3 }]
    },
    corn: {
        id: 'corn', name: '松仁玉米', type: 'farm', rarity: 'epic', price: 2500, sellPrice: 250, growTime: 480, emoji: '🌽',
        desc: '传说中的终极作物！价值连城', special: true, careText: '施肥', careEmoji: '🌱', canHaveStar: true, yieldItems: [{ id: 'corn', min: 1, max: 2 }]
    },
    sunflower: {
        id: 'sunflower', name: '向日葵', type: 'farm', rarity: 'epic', price: 2800, sellPrice: 280, growTime: 600, emoji: '🌻',
        desc: '灿烂的金色花朵，极其珍贵', careText: '施肥', careEmoji: '🌱', canHaveStar: true, yieldItems: [{ id: 'sunflowerSeed', min: 3, max: 8 }]
    },

    // --- 🐑 畜牧类 ---
    sheep1: {
        id: 'sheep1', name: '嘉乐羊', type: 'ranch', rarity: 'common', price: 300, sellPrice: 150, growTime: 180, emoji: '🐑',
        desc: '温顺的小羊，产出羊毛和羊肉', careText: '喂饲料', careEmoji: '🥕', canHaveStar: false, yieldItems: [{ id: 'wool', min: 2, max: 3 }, { id: 'mutton', min: 1, max: 2 }]
    },
    sheep2: {
        id: 'sheep2', name: '紫月神羊', type: 'ranch', rarity: 'rare', price: 1200, sellPrice: 300, growTime: 360, emoji: '🦙',
        desc: '神秘的紫色羊驼，只产神羊羊毛', careText: '喂饲料', careEmoji: '🥕', canHaveStar: false, yieldItems: [{ id: 'godWool', min: 2, max: 4 }]
    },
    cow: {
        id: 'cow', name: '玉子牛', type: 'ranch', rarity: 'uncommon', price: 500, sellPrice: 220, growTime: 240, emoji: '🐄',
        desc: '产出优质牛奶和牛肉', careText: '喂饲料', careEmoji: '🥕', canHaveStar: false, yieldItems: [{ id: 'milk', min: 2, max: 4 }, { id: 'beef', min: 1, max: 2 }]
    },

    // --- 🐟 水产类 ---
    fish: {
        id: 'fish', name: '汗蒸鱼', type: 'pond', rarity: 'common', price: 200, sellPrice: 95, growTime: 150, emoji: '🐟',
        desc: '常见鱼类，适合做生鱼片', careText: '喂鱼食', careEmoji: '🐠', canHaveStar: false, yieldItems: [{ id: 'fishMeat', min: 2, max: 3 }]
    },
    wangboFish: {
        id: 'wangboFish', name: '王波鱼', type: 'pond', rarity: 'uncommon', price: 450, sellPrice: 180, growTime: 270, emoji: '🐠',
        desc: '稀有鱼类，制成顶级鱼片价值高', careText: '喂鱼食', careEmoji: '🐠', canHaveStar: false, yieldItems: [{ id: 'wangboMeat', min: 1, max: 3 }]
    }
};

// ==================== 📦 产物配置 ====================
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

// ==================== 🔨 配方配置 ====================
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

// ==================== 🧪 化肥配置 ====================
const FERTILIZERS_CONFIG = {
    poopFert: { id: 'poopFert', name: '泄芽翔', type: 'fertilizer', category: 'universal', price: 20, emoji: '💩', desc: '最便宜的肥料，速度 +30%，但会降低品质', effects: { speedBoost: 1.3, qualityBoost: true, qualityLevel: -1 }, canUseOn: ['farm'] },
    speedFert: { id: 'speedFert', name: '快速化肥', type: 'fertilizer', category: 'universal', price: 80, emoji: '🚀', desc: '加快成长速度 +100%', effects: { speedBoost: 2.0 }, canUseOn: ['farm'] },
    yieldFert: { id: 'yieldFert', name: '丰收化肥', type: 'fertilizer', category: 'universal', price: 120, emoji: '📦', desc: '收获数量翻倍', effects: { yieldMulti: 2 }, canUseOn: ['farm'] },
    qualityFert: { id: 'qualityFert', name: '高级化肥', type: 'fertilizer', category: 'universal', price: 100, emoji: '💎', desc: '提升星级概率', effects: { qualityBoost: true }, canUseOn: ['farm'] },
    catFert: { id: 'catFert', name: '小猫牌化肥', type: 'fertilizer', category: 'universal', price: 180, emoji: '🐱', desc: '高品质化肥，星级概率大幅提升', effects: { qualityBoost: true, qualityLevel: 2 }, canUseOn: ['farm'] },
    jinKeLa: { id: 'jinKeLa', name: '金坷垃', type: 'fertilizer', category: 'exclusive', price: 500, emoji: '⭐', desc: '小麦专属！速度+150%、产量x3、必出3星', effects: { speedBoost: 2.5, yieldMulti: 3, guaranteeStar: 3 }, canUseOn: ['farm'], exclusiveFor: 'wheat' },
    cloverFert: { id: 'cloverFert', name: '四叶草牌化肥', type: 'fertilizer', category: 'exclusive', price: 800, emoji: '🍀', desc: '玉米专属！全能提升，必出3星', effects: { speedBoost: 3.0, yieldMulti: 4, guaranteeStar: 3 }, canUseOn: ['farm'], exclusiveFor: 'corn' }
};

// ==================== 🐟 鱼食配置 ====================
const FISHFOOD_CONFIG = {
    basicFood: { id: 'basicFood', name: '普通鱼食', type: 'fishfood', price: 60, emoji: '🍚', desc: '速度 +80%', effects: { speedBoost: 1.8 }, canUseOn: ['pond'] },
    advFood: { id: 'advFood', name: '高级鱼食', type: 'fishfood', price: 120, emoji: '🍱', desc: '速度 +150%、产量 x2', effects: { speedBoost: 2.5, yieldMulti: 2 }, canUseOn: ['pond'] },
    premiumFood: { id: 'premiumFood', name: '顶级鱼食', type: 'fishfood', price: 250, emoji: '🍣', desc: '全能提升！', effects: { speedBoost: 3.0, yieldMulti: 3 }, canUseOn: ['pond'] }
};

// ==================== 🥕 动物饲料效果配置 ====================
const ANIMAL_FEED_EFFECTS = {
    wheat: { emoji: '🌾', name: '王小麦', desc: '基础饲料，速度 +50%', effects: { speedBoost: 1.5 } },
    apple: { emoji: '🍎', name: '嘉乐苹', desc: '中级饲料，速度 +100%', effects: { speedBoost: 2.0 } },
    corn: { emoji: '🌽', name: '松仁玉米', desc: '顶级饲料！速度 +200%、产量 x2', effects: { speedBoost: 3.0, yieldMulti: 2 } }
};

// ==================== ⭐ 星级概率配置 ====================
const STAR_CHANCES = {
    base: [0.6, 0.3, 0.1],
    withQuality1: [0.4, 0.35, 0.25],
    withQuality2: [0.2, 0.35, 0.45]
};

// ==================== 🏞️ 地块配置 ====================
const PLOTS_CONFIG = {
    farm: 6,
    ranch: 4,
    pond: 4
};

const PLOT_TYPE_NAMES = {
    farm: '农田',
    ranch: '畜栏',
    pond: '鱼塘'
};

// ==================== 🐱 猫猫对话库 ====================
const CAT_DIALOGUES = {
    normal: ["喵~ 你好呀！", "今天天气真不错喵~", "有好吃的吗？", "陪我玩一会儿嘛~"],
    happy: ["好开心喵！❤️", "你对我真好！", "我最喜欢你了！", "呼噜呼噜~"],
    upset: ["哼，不理你了...", "别烦我...", "...", "喵..."],
    ignoring: ["......", "（转过头去）", "（假装看不见你）", "喵？（冷漠）"],
    afterHit: ["嗷！痛痛痛！", "你、你居然敢打我！", "嘶...不过好像还挺爽的...", "再来一下试试？"],
    afterPraise: ["嘿嘿，知道我厉害了吧~", "当然啦，我可是皇甫喵！", "夸得不够！再夸！", "（得意地摇尾巴）"]
};

// ==================== 💾 游戏状态数据 ====================
let gameState = {
    gold: 1000,
    plots: {},
    inventory: {},
    items: {},
    activeOrders: [],         // ✅ 新增：当前激活的订单列表
    craftingQueue: [],
    currentShopTab: 'farm',
    currentItemTab: 'fertilizer',
    selectedPlot: null,
    stats: { totalHarvests: 0, cornHarvested: false },
    cat: { unlocked: false,  name: '猫猫',affection: 500, mood: 100, lastInteraction: 0, lastAction: null, status: 'normal' },
    farmName: null,
    cloverCraftTime: 0,
    mails: [],
    unreadMails: 0
    
};

// ==================== 🎮 游戏初始化 ====================
function initGame() {
    console.log('🎮 游戏启动中...');
    loadGame();
   // 如果没有激活的订单，就生成新的
    if (!gameState.activeOrders || gameState.activeOrders.length === 0) {
        generateOrders();
            if (gameState.cat.unlocked) {
        showCat();
        // ✅ 确保猫猫名字被正确设置
        document.querySelectorAll('#cat-name').forEach(el => el.textContent = gameState.cat.name);
    }

    }
    
    initPlots();
    renderPlots();
    updateGoldDisplay();
    initMailSystem();
    if (gameState.cat.unlocked) showCat();
    initCatDragging();
    setInterval(gameLoop, 100);
    setInterval(catMoodRecover, 60000);
    setInterval(checkDelayedEvents, 1000);
    console.log('✅ 游戏启动完成！');
}

// ==================== 🏞️ 地块系统 ====================
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

// ==================== 🛒 购买系统 ====================
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
    const actionWord = item.type === 'farm' ? '种植' : '养殖';
    showToast(`✅ ${actionWord}了 ${item.name}！`);
}

// ==================== 🌱 照料系统 ====================
function openCareMenu(plotId) {
    const plot = gameState.plots[plotId];
    const item = ITEMS_CONFIG[plot.item];
    let options = [];
    if (item.type === 'farm') {
        options = Object.values(FERTILIZERS_CONFIG).filter(fert => !fert.exclusiveFor || fert.exclusiveFor === plot.item);
        const html = `<div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 2000;" onclick="this.remove()"><div style="background: white; border-radius: 15px; padding: 15px; max-width: 350px; max-height: 80%; overflow-y: auto;" onclick="event.stopPropagation()"><h3 style="margin-bottom: 12px; font-size: 16px;">选择化肥</h3>${options.map(fert => { const hasItem = (gameState.items[fert.id] || 0) > 0; return `<div style="padding: 10px; margin: 6px 0; background: ${hasItem ? '#f0f0f0' : '#fdd'}; border-radius: 8px; cursor: ${hasItem ? 'pointer' : 'not-allowed'};" onclick="${hasItem ? `useFertilizer('${plotId}', '${fert.id}'); this.parentElement.parentElement.remove();` : ''}"><div style="font-size: 16px;">${fert.emoji} ${fert.name} ${hasItem ? `(x${gameState.items[fert.id]})` : '(无)'}</div><div style="font-size: 11px; color: #666;">${fert.desc}</div></div>`; }).join('')}<button style="width: 100%; padding: 10px; margin-top: 8px; background: #ddd; border: none; border-radius: 8px; cursor: pointer; font-size: 13px;" onclick="this.parentElement.parentElement.remove()">取消</button></div></div>`;
        document.body.insertAdjacentHTML('beforeend', html);
    } else if (item.type === 'pond') {
        options = Object.values(FISHFOOD_CONFIG);
        const html = `<div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 2000;" onclick="this.remove()"><div style="background: white; border-radius: 15px; padding: 15px; max-width: 350px; max-height: 80%; overflow-y: auto;" onclick="event.stopPropagation()"><h3 style="margin-bottom: 12px; font-size: 16px;">选择鱼食</h3>${options.map(food => { const hasItem = (gameState.items[food.id] || 0) > 0; return `<div style="padding: 10px; margin: 6px 0; background: ${hasItem ? '#f0f0f0' : '#fdd'}; border-radius: 8px; cursor: ${hasItem ? 'pointer' : 'not-allowed'};" onclick="${hasItem ? `useFishFood('${plotId}', '${food.id}'); this.parentElement.parentElement.remove();` : ''}"><div style="font-size: 16px;">${food.emoji} ${food.name} ${hasItem ? `(x${gameState.items[food.id]})` : '(无)'}</div><div style="font-size: 11px; color: #666;">${food.desc}</div></div>`; }).join('')}<button style="width: 100%; padding: 10px; margin-top: 8px; background: #ddd; border: none; border-radius: 8px; cursor: pointer; font-size: 13px;" onclick="this.parentElement.parentElement.remove()">取消</button></div></div>`;
        document.body.insertAdjacentHTML('beforeend', html);
    } else if (item.type === 'ranch') {
        const html = `<div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 2000;" onclick="this.remove()"><div style="background: white; border-radius: 15px; padding: 15px; max-width: 350px; max-height: 80%; overflow-y: auto;" onclick="event.stopPropagation()"><h3 style="margin-bottom: 12px; font-size: 16px;">选择饲料</h3>${Object.entries(ANIMAL_FEED_EFFECTS).map(([feedId, feed]) => { const hasItem = (gameState.inventory[feedId] || 0) > 0; return `<div style="padding: 10px; margin: 6px 0; background: ${hasItem ? '#f0f0f0' : '#fdd'}; border-radius: 8px; cursor: ${hasItem ? 'pointer' : 'not-allowed'};" onclick="${hasItem ? `useAnimalFeed('${plotId}', '${feedId}'); this.parentElement.parentElement.remove();` : ''}"><div style="font-size: 16px;">${feed.emoji} ${feed.name} ${hasItem ? `(x${gameState.inventory[feedId]})` : '(无)'}</div><div style="font-size: 11px; color: #666;">${feed.desc}</div></div>`; }).join('')}<button style="width: 100%; padding: 10px; margin-top: 8px; background: #ddd; border: none; border-radius: 8px; cursor: pointer; font-size: 13px;" onclick="this.parentElement.parentElement.remove()">取消</button></div></div>`;
        document.body.insertAdjacentHTML('beforeend', html);
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

// ==================== 🌾 收获系统 ====================
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
    showToast(message);
        playSfx('harvest');   // ✅ 收获音效
    if (item.special && !gameState.stats.cornHarvested) { gameState.stats.cornHarvested = true; setTimeout(() => { showBlessing(); createFireworks(); }, 500); }
    plot.status = 'empty'; plot.item = null; plot.plantTime = 0; plot.growProgress = 0;
    plot.appliedBuffs = { speedBoost: 1.0, yieldMulti: 1, qualityBoost: false, qualityLevel: 0, guaranteeStar: 0 };
    saveGame(); renderPlots();
}

// ==================== ⏱️ 游戏循环 ====================
function gameLoop() {
    let needUpdate = false;
    for (let plotId in gameState.plots) {
        const plot = gameState.plots[plotId];
        if (plot.status === 'growing') {
            const item = ITEMS_CONFIG[plot.item]; const elapsed = (Date.now() - plot.plantTime) / 1000; const growSpeed = plot.appliedBuffs.speedBoost; const totalTime = item.growTime / growSpeed;
            plot.growProgress = Math.min(100, (elapsed / totalTime) * 100);
            if (plot.growProgress >= 100) { plot.status = 'ready'; needUpdate = true; }
        }
    }
    if (needUpdate) { renderPlots(); saveGame(); }
    checkCraftingQueue();
}

// ==================== 🛒 种子商店 ====================
function openBuyShop(type = 'farm') {
    gameState.currentShopTab = type; renderBuyShopItems(); document.getElementById('shop-modal').classList.add('show');
}
function closeBuyShop() { document.getElementById('shop-modal').classList.remove('show'); gameState.selectedPlot = null; }
function switchShopTab(type) {
    gameState.currentShopTab = type; document.querySelectorAll('#shop-modal .shop-tab').forEach(tab => tab.classList.toggle('active', tab.dataset.type === type)); renderBuyShopItems();
}
function renderBuyShopItems() {
    const container = document.getElementById('shop-items');
    const items = Object.values(ITEMS_CONFIG).filter(item => item.type === gameState.currentShopTab);
    const selectedPlot = gameState.selectedPlot ? gameState.plots[gameState.selectedPlot] : null;
    container.innerHTML = items.map(item => {
        const canBuy = !selectedPlot || selectedPlot.type === item.type; const rarity = RARITY_CONFIG[item.rarity];
        return `<div class="shop-item ${canBuy ? '' : 'disabled'}" onclick="${canBuy ? `buyAndPlant('${item.id}')` : ''}"><div class="shop-item-icon">${item.emoji}</div><div class="shop-item-info"><div class="shop-item-name" style="color: ${rarity.color}">${rarity.emoji} ${item.name}</div><div class="shop-item-desc">${item.desc} | ⏱️ ${item.growTime}秒</div></div><div class="shop-item-price">${item.price}💰</div></div>`;
    }).join('');
}

// ==================== 🧪 道具商店 ====================
function openItemShop() { gameState.currentItemTab = 'fertilizer'; renderItemShopItems(); document.getElementById('item-shop-modal').classList.add('show'); }
function closeItemShop() { document.getElementById('item-shop-modal').classList.remove('show'); }
function switchItemTab(type) { gameState.currentItemTab = type; document.querySelectorAll('#item-shop-modal .shop-tab').forEach(tab => tab.classList.toggle('active', tab.dataset.type === type)); renderItemShopItems(); }
function renderItemShopItems() {
    const container = document.getElementById('item-shop-items'); let items = [];
    if (gameState.currentItemTab === 'fertilizer') { items = Object.values(FERTILIZERS_CONFIG); } 
    else if (gameState.currentItemTab === 'fishfood') { items = Object.values(FISHFOOD_CONFIG); }
    container.innerHTML = items.map(item => `<div class="shop-item" onclick="buyItem('${item.id}')"><div class="shop-item-icon">${item.emoji}</div><div class="shop-item-info"><div class="shop-item-name">${item.name}</div><div class="shop-item-desc">${item.desc}</div></div><div class="shop-item-price">${item.price}💰</div></div>`).join('');
}
function buyItem(itemId) {
    const allItems = { ...FERTILIZERS_CONFIG, ...FISHFOOD_CONFIG }; const item = allItems[itemId];
    if (gameState.gold < item.price) { showToast('💰 金币不足！'); return; }
    gameState.gold -= item.price; if (!gameState.items[itemId]) gameState.items[itemId] = 0; gameState.items[itemId]++;
    updateGoldDisplay(); saveGame(); showToast(`✅ 购买了 ${item.emoji} ${item.name}！`);
}

// ==================== 🎒 背包系统 ====================
function openInventory() { renderInventory(); document.getElementById('inventory-modal').classList.add('show'); }
function closeInventory() { document.getElementById('inventory-modal').classList.remove('show'); }
function renderInventory() {
    const container = document.getElementById('inventory-items');
    const cropItems = Object.entries(gameState.inventory).filter(([id, count]) => count > 0);
    const toolItems = Object.entries(gameState.items || {}).filter(([id, count]) => count > 0);
    let html = '';
    if (cropItems.length > 0) {
        html += '<h3 style="margin: 10px 0; color: #666; font-size: 14px;">🌾 作物与产物</h3>';
        html += cropItems.map(([itemId, count]) => {
            const parts = itemId.split('_'); const baseId = parts[0]; const star = parts[1] ? parseInt(parts[1]) : 0;
            const product = PRODUCTS_CONFIG[baseId]; if (!product) return '';
            const rarity = RARITY_CONFIG[product.rarity]; const starStr = star > 0 ? '⭐'.repeat(star) : '';
            return `<div class="inventory-item"><div class="inventory-item-icon">${product.emoji}</div><div class="inventory-item-info"><div class="inventory-item-name" style="color: ${rarity.color}">${rarity.emoji} ${product.name} ${starStr}</div><div class="inventory-item-count">持有: ${count}</div></div></div>`;
        }).join('');
    }
    if (toolItems.length > 0) {
        html += '<h3 style="margin: 10px 0; color: #666; font-size: 14px;">🧪 道具</h3>';
        html += toolItems.map(([itemId, count]) => {
            const allItems = { ...FERTILIZERS_CONFIG, ...FISHFOOD_CONFIG }; const item = allItems[itemId]; if (!item) return '';
            return `<div class="inventory-item"><div class="inventory-item-icon">${item.emoji}</div><div class="inventory-item-info"><div class="inventory-item-name">${item.name}</div><div class="inventory-item-count">持有: ${count}</div></div></div>`;
        }).join('');
    }
    if (cropItems.length === 0 && toolItems.length === 0) { html = '<div class="inventory-empty">背包空空如也~</div>'; }
    container.innerHTML = html;
}

// =====================================================================
//                        💰 交易中心（收购商）
// =====================================================================

// --- 打开交易中心 ---
function openSellShop(merchantId = 'localMarket') {
    // 默认打开第一个收购商
    gameState.currentMerchant = merchantId; 
    renderMerchantTabs();
    renderSellShop();
    document.getElementById('sell-modal').classList.add('show');
}

// --- 关闭交易中心 ---
function closeSellShop() {
    document.getElementById('sell-modal').classList.remove('show');
}

// --- 渲染收购商标签页 ---
function renderMerchantTabs() {
    const container = document.getElementById('merchant-tabs');
    container.innerHTML = Object.values(MERCHANTS_CONFIG).map(merchant => {
        const isActive = gameState.currentMerchant === merchant.id;
        return `
            <button 
                class="shop-tab ${isActive ? 'active' : ''}" 
                onclick="switchMerchantTab('${merchant.id}')"
            >
                ${merchant.emoji} ${merchant.name}
            </button>
        `;
    }).join('');
}

// --- 切换收购商 ---
function switchMerchantTab(merchantId) {
    gameState.currentMerchant = merchantId;
    renderMerchantTabs(); // 重新渲染标签，更新高亮
    renderSellShop();     // 重新渲染商品列表和价格   renderSellShop(); // ✅ 这个函数内部已经包含了 renderOrders()，所以不用额外加
}


// --- 渲染出售列表 ---
function renderSellShop() {
    const container = document.getElementById('sell-items');
    const merchant = MERCHANTS_CONFIG[gameState.currentMerchant];
   
    // ✅ 新增：渲染当前商人的订单
    renderOrders(merchant.id);
    const items = Object.entries(gameState.inventory).filter(([id, count]) => {
        const baseId = id.split('_')[0];
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

        // 【核心】计算价格
        let starMulti = 1;
        if (star === 2) starMulti = 1.5;
        if (star === 3) starMulti = 2.5;

        // 获取商家的价格乘数，如果没有特殊乘数，则默认为1
        const merchantMulti = merchant.multipliers[baseId] || 1;
        
        const finalSellPrice = Math.floor(product.sellPrice * starMulti * merchantMulti);

        let priceIndicator = '';
        if (merchantMulti > 1) {
            priceIndicator = `<span style="color: #4CAF50; font-weight: bold;"> (高价)</span>`;
        } else if (merchantMulti < 1) {
            priceIndicator = `<span style="color: #F44336; font-weight: bold;"> (低价)</span>`;
        }
        
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
                    <div class="sell-item-price">${finalSellPrice}💰${priceIndicator}</div>
                    <button class="sell-btn" onclick="sellItem('${itemId}', 1)">卖1</button>
                    ${count >= 5 ? `<button class="sell-btn" onclick="sellItem('${itemId}', 5)">卖5</button>` : ''}
                    <button class="sell-btn" onclick="sellItem('${itemId}', ${count})">全卖</button>
                </div>
            </div>
        `;
    }).join('');
}

// --- 出售物品逻辑 ---
function sellItem(itemId, amount) {
    if (!gameState.inventory[itemId] || gameState.inventory[itemId] < amount) {
        showToast('❌ 物品数量不足！');
        return;
    }

    const parts = itemId.split('_');
    const baseId = parts[0];
    const star = parts[1] ? parseInt(parts[1]) : 0;

    const product = PRODUCTS_CONFIG[baseId];
    const merchant = MERCHANTS_CONFIG[gameState.currentMerchant];

    let starMulti = 1;
    if (star === 2) starMulti = 1.5;
    if (star === 3) starMulti = 2.5;

    const merchantMulti = merchant.multipliers[baseId] || 1;
    
    const finalSellPrice = Math.floor(product.sellPrice * starMulti * merchantMulti);
    const totalPrice = finalSellPrice * amount;

    gameState.inventory[itemId] -= amount;
    gameState.gold += totalPrice;

    showToast(`✅ 向 ${merchant.name} 出售了 ${amount} 个，获得 ${totalPrice} 金币！`);
    playSfx('sell');  // ✅ 出售音效
    updateGoldDisplay();
    saveGame();
    renderSellShop();
}

// ==================== 🔨 制作台系统 ====================
function openCraftShop() { renderCraftShop(); document.getElementById('craft-modal').classList.add('show'); }
function closeCraftShop() { document.getElementById('craft-modal').classList.remove('show'); }
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
                let haveAmount = 0;
                if (ingId.includes('_')) { haveAmount = gameState.inventory[ingId] || 0; } 
                else { haveAmount = (gameState.inventory[ingId] || 0) + (gameState.inventory[`${ingId}_1`] || 0) + (gameState.inventory[`${ingId}_2`] || 0) + (gameState.inventory[`${ingId}_3`] || 0); }
                const product = PRODUCTS_CONFIG[ingId.split('_')[0]]; const star = ingId.includes('_') ? '⭐'.repeat(parseInt(ingId.split('_')[1])) : '';
                const enough = haveAmount >= needAmount; if (!enough) canCraft = false;
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
        let haveAmount = 0; if (ingId.includes('_')) { haveAmount = gameState.inventory[ingId] || 0; } else { haveAmount = (gameState.inventory[ingId] || 0) + (gameState.inventory[`${ingId}_1`] || 0) + (gameState.inventory[`${ingId}_2`] || 0) + (gameState.inventory[`${ingId}_3`] || 0); }
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
    showToast(`⏳ 开始制作 ${recipe.name}！`);
    saveGame(); renderCraftShop(); renderInventory();
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
        });
        gameState.craftingQueue = remainingJobs; saveGame(); renderCraftShop(); renderInventory();
    } else { renderCraftingQueue(); }
}

// ==================== 📬 邮件系统 ====================
function initMailSystem() {
    if (gameState.mails.length === 0) {
        gameState.mails.push({ id: 'welcome', from: '庄园管理局', subject: '欢迎来到你的庄园！', content: `亲爱的新庄园主：\n\n恭喜你获得了这片美丽的土地！\n\n这里将成为你和朋友们的专属天地。\n种下希望的种子，收获珍贵的回忆。\n\n在开始之前，请为你的庄园取一个名字吧~\n这将是你们友谊的见证！\n\n祝你：\n种植顺利，收获满满！\n\n(程序员说...这个地方会不断更新扩大哦！有时间的话...偶尔回来看看吧！\n\n——庄园管理局`, read: false, timestamp: Date.now(), special: 'farm-naming' });
        gameState.unreadMails = 1; saveGame();
        setTimeout(() => { openMailbox(); }, 1000);
    }
    updateMailBadge();
}
function openMailbox() { renderMailList(); document.getElementById('mailbox-modal').classList.add('show'); }
function closeMailbox() { document.getElementById('mailbox-modal').classList.remove('show'); }
function renderMailList() { 
    const container = document.getElementById('mailbox-items'); const mails = gameState.mails;
    if (mails.length === 0) { container.innerHTML = '<div class="inventory-empty">信箱空空如也~</div>'; return; }
    container.innerHTML = mails.map((mail, index) => { const date = new Date(mail.timestamp); const timeStr = `${date.getMonth()+1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2,'0')}`; return `<div class="shop-item" onclick="readMail(${index})" style="background: ${mail.read ? '#f9f9f9' : '#fff9e6'}; border-left: 4px solid ${mail.read ? '#ddd' : '#FFD700'};"><div class="shop-item-icon">${mail.read ? '📭' : '📬'}</div><div class="shop-item-info"><div class="shop-item-name">${mail.subject} ${mail.read ? '' : '✨'}</div><div class="shop-item-desc">来自：${mail.from} | ${timeStr}</div></div></div>`; }).join('');
}
// ==================== 读取邮件 ====================
function readMail(index) {
    const mail = gameState.mails[index];
    if (!mail) return; // 安全检查

    // 1. 标记为已读
    if (!mail.read) {
        mail.read = true;
        gameState.unreadMails = Math.max(0, gameState.unreadMails - 1);
        updateMailBadge();
        saveGame();
    }

    // 2. 更新读信弹窗的内容
    document.getElementById('mail-subject').textContent = mail.subject;
    document.getElementById('mail-from').textContent = mail.from;
    const date = new Date(mail.timestamp);
    document.getElementById('mail-time').textContent = date.toLocaleString('zh-CN');
    document.getElementById('mail-content').textContent = mail.content;

    // 3. 处理邮件的特殊操作（比如命名、收礼物）
    const actionDiv = document.getElementById('mail-special-action');
    actionDiv.innerHTML = ''; // 每次都先清空

    // --- 如果是“农场命名”邮件，并且还没命名 ---
    if (mail.special === 'farm-naming' && !gameState.farmName) {
        actionDiv.innerHTML = `
            <div style="background: #f0f0f0; padding: 15px; border-radius: 10px;">
                <label style="display: block; margin-bottom: 8px; font-weight: bold;">为你的农场取个名字：</label>
                <input type="text" id="farm-name-input" placeholder="例如：阳光农场" style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 8px; font-size: 14px; margin-bottom: 10px;">
                <button class="sell-btn" style="width: 100%; background: #4CAF50;" onclick="submitFarmName()">确认命名</button>
            </div>
        `;
    } 
    // --- 如果是“接受猫猫礼物”邮件 ---
    else if (mail.special === 'cat-gift') {
        actionDiv.innerHTML = `<button class="sell-btn" style="width: 100%; background: #FF69B4;" onclick="acceptCatGift()">接受这份礼物 😺</button>`;
    }
    // (未来可以加 else if 来处理更多特殊邮件)

    // 4. 关闭信箱，打开读信弹窗
    closeMailbox();
    document.getElementById('mail-detail-modal').classList.add('show');
}
function closeMailDetail() { document.getElementById('mail-detail-modal').classList.remove('show'); }
function submitFarmName() {
    const input = document.getElementById('farm-name-input'); const name = input.value.trim();
    if (!name) { showToast('❌ 请输入农场名字！'); return; }
    gameState.farmName = name; document.getElementById('farm-name-display').textContent = name; document.getElementById('farm-subtitle').textContent = `庄园主：孙钰`;
    showToast(`✅ 农场命名成功！\n欢迎来到【${name}】！`); saveGame(); closeMailDetail();
}
function updateMailBadge() {
    const badge = document.getElementById('mail-badge');
    if (gameState.unreadMails > 0) { badge.textContent = gameState.unreadMails; badge.classList.remove('hidden'); } else { badge.classList.add('hidden'); }
}
function sendMail(mailData) {
    gameState.mails.push({ ...mailData, read: false, timestamp: Date.now() });
    gameState.unreadMails++; updateMailBadge(); saveGame(); showToast('📬 你收到了一封新邮件！');
}

// ==================== ⏱️ 延迟事件 ====================
function checkDelayedEvents() {
    if (gameState.cloverCraftTime > 0 && !gameState.cat.unlocked) {
        const elapsed = (Date.now() - gameState.cloverCraftTime) / 1000;
        if (elapsed >= 60) { sendCatMail(); }
    }
}
function sendCatMail() {
    sendMail({ id: 'cat-gift', from: '神秘的旅行者', subject: '一份特别的礼物...', content: `你好，勤劳的庄园主：\n\n我是一位四处旅行的神秘人。\n\n今天路过你的庄园时，\n被那株传说中的四叶草深深吸引。\n\n能培育出如此珍贵的植物，\n你一定是一位充满爱心的人。\n\n所以，我决定将我的旅伴托付给你——\n一只可爱的小猫咪。\n\n它有点调皮，但也很贴心。\n希望它能陪伴你，让农场更有生气~\n\n——神秘的旅行者\n\nP.S. 它最喜欢吃玉米和生鱼片哦！`, special: 'cat-gift' });
    gameState.cloverCraftTime = 0; saveGame();
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
    
    // ✅ 【核心修改】不再弹窗，而是开始首次见面对话
    setTimeout(() => {
        startDialogue('firstMeeting');
    }, 1000); // 延迟1秒，让猫猫先出现
}
 closeMailDetail();
  
// ==================== 🍀 彩蛋弹窗 ====================
function showCloverBlessing() {
    const modal = document.getElementById('clover-blessing-modal'); modal.classList.add('show');
    for (let i = 0; i < 30; i++) { setTimeout(() => { const firework = document.createElement('div'); firework.className = 'firework'; firework.textContent = ['🍀', '✨', '🌟', '💫', '⭐'][Math.floor(Math.random() * 5)]; firework.style.left = Math.random() * 100 + '%'; firework.style.top = Math.random() * 100 + '%'; modal.appendChild(firework); setTimeout(() => firework.remove(), 2000); }, i * 100); }
}
function closeCloverBlessing() { document.getElementById('clover-blessing-modal').classList.remove('show'); }

// =====================================================================
//                        🐱 猫猫系统 V2.1 (对话树版)
// =====================================================================

let catBubbleTimer = null;
let currentDialogue = null; // ✅ 新增：追踪当前对话状态

// --- 显示猫猫 ---
function showCat() {
    const el = document.getElementById('cat-npc');
    if (el) el.classList.remove('hidden');
}

// --- 播放动画/切换立绘 ---
function setCatState(state) {
    // ... (这个函数保持不变，所以这里省略了)
}

// --- 显示对话气泡 ---
function showCatBubble(text, duration = 4000) {
    const bubble = document.getElementById('cat-dialogue-bubble');
    const textEl = document.getElementById('cat-bubble-text');
    if (!bubble || !textEl) return;

    textEl.textContent = text;
    bubble.classList.remove('hidden');

    if (catBubbleTimer) clearTimeout(catBubbleTimer);
    if (duration > 0) {
        catBubbleTimer = setTimeout(() => {
            bubble.classList.add('hidden');
        }, duration);
    }
}

// --- 切换小按钮显示/隐藏 ---
function toggleCatActions(show) {
    const panel = document.getElementById('cat-mini-actions');
    if (panel) {
        if (show) {
            panel.classList.remove('hidden');
        } else {
            panel.classList.add('hidden');
        }
    }
}

// ✅ 【核心重构】开始一段对话
function startDialogue(treeId) {
    const tree = CAT_DIALOG_TREES[treeId];
    if (!tree) return;

    currentDialogue = {
        tree: tree,
        currentNodeIndex: 0
    };
    
    // 开始对话时，先隐藏互动按钮
    toggleCatActions(false);
    
    displayCurrentDialogueNode();
}

// ✅ 【核心重构】显示当前对话节点
function displayCurrentDialogueNode() {
    if (!currentDialogue) return;

    const node = currentDialogue.tree[currentDialogue.currentNodeIndex];
    if (!node) {
        // 对话结束
        endDialogue();
        return;
    }

    showCatBubble(node.text, node.choices ? 0 : 4000); // 如果有选项，气泡不自动消失

    // 创建选项按钮
    const choicesContainer = document.createElement('div');
    choicesContainer.id = 'temp-choices-container';
    choicesContainer.style.position = 'absolute';
    choicesContainer.style.bottom = '100%';
    choicesContainer.style.left = '50%';
    choicesContainer.style.transform = 'translateX(-50%)';
    choicesContainer.style.marginBottom = '45px';
    choicesContainer.style.display = 'flex';
    choicesContainer.style.flexDirection = 'column';
    choicesContainer.style.gap = '6px';
    choicesContainer.style.width = '200px';

    if (node.choices) {
        node.choices.forEach(choice => {
            const btn = document.createElement('button');
            btn.className = 'sell-btn';
            btn.style.background = '#64B5F6';
            btn.textContent = choice.text;
            btn.onclick = () => {
                // 移除选项按钮
                document.getElementById('temp-choices-container').remove();
                // 寻找下一个节点
                const nextNode = currentDialogue.tree.find(n => n.id === choice.nextNodeId);
                if (nextNode) {
                    currentDialogue.currentNodeIndex = currentDialogue.tree.indexOf(nextNode);
                    displayCurrentDialogueNode();
                } else {
                    endDialogue();
                }
            };
            choicesContainer.appendChild(btn);
        });
    }

    // 处理特殊事件：猫猫取名
    if (node.special === 'prompt_cat_name') {
        const nameInputWrapper = document.createElement('div');
        nameInputWrapper.style.display = 'flex';
        nameInputWrapper.style.flexDirection = 'column';
        nameInputWrapper.style.gap = '6px';
        nameInputWrapper.style.zIndex = '1000';
        nameInputWrapper.style.position = 'relative';
        
        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.id = 'cat-name-input-dialogue';
        inputField.placeholder = '输入猫猫的名字...';
        inputField.style.width = '100%';
        inputField.style.padding = '8px';
        inputField.style.borderRadius = '6px';
        inputField.style.border = '1px solid #ccc';
        inputField.style.boxSizing = 'border-box';
        inputField.style.fontSize = '14px';
        
        const submitBtn = document.createElement('button');
        submitBtn.className = 'sell-btn';
        submitBtn.textContent = '就叫这个！';
        submitBtn.style.width = '100%';
        submitBtn.style.background = '#4CAF50';
        submitBtn.style.padding = '8px';
        submitBtn.style.cursor = 'pointer';
        submitBtn.style.zIndex = '1001';
        submitBtn.style.pointerEvents = 'auto';
        
        submitBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const name = inputField.value.trim();
            
            if (!name) {
                showToast('❌ 请输入一个名字！');
                return;
            }
            
            gameState.cat.name = name;
            document.querySelectorAll('#cat-name').forEach(el => el.textContent = name);
            showToast(`✅ 太好了！从现在起，我就叫【${name}】啦！`);
            saveGame();
            
            // 移除输入框，结束对话
            document.getElementById('temp-choices-container').remove();
            endDialogue();
        });
        
        nameInputWrapper.appendChild(inputField);
        nameInputWrapper.appendChild(submitBtn);
        choicesContainer.appendChild(nameInputWrapper);
        
        // 自动聚焦到输入框
        setTimeout(() => inputField.focus(), 100);
    }
    
    document.getElementById('cat-wrapper').appendChild(choicesContainer);

    // 如果没有选项，自动进入下一句
    if (!node.choices && !node.special) {
        setTimeout(() => {
            currentDialogue.currentNodeIndex++;
            displayCurrentDialogueNode();
        }, 2500); // 每句话停留2.5秒
    }
}

// ✅ 【核心重构】结束对话
function endDialogue() {
    currentDialogue = null;
    showCatBubble("喵~", 2000); // 显示一个简短的默认气泡
    toggleCatActions(true);    // 恢复互动按钮
}

// --- 初始化猫猫拖拽和点击 ---
function initCatDragging() {
    const catEl = document.getElementById('cat-npc');
    let isDragging = false;
    let dragTimeout;

    catEl.addEventListener('click', (e) => {
        if (isDragging || !gameState.cat.unlocked) return;
        
        // 如果正在对话，点击猫猫可以跳过当前对话
        if (currentDialogue) {
            // (未来可以加这个功能，暂时先不加)
            return;
        }

        // 切换互动按钮
        toggleCatActions();
        const cat = gameState.cat;
        showCatBubble(`💕好感: ${Math.floor(cat.affection)}/1000 | 😊情绪: ${Math.floor(cat.mood)}/100`);
    });

    // ... (拖拽逻辑保持不变)
}

// --- 猫猫互动逻辑 ---
function interactCat(action) {
    if (currentDialogue) {
        showToast("正在和猫猫说话呢，先别动手动脚！");
        return;
    }
    // ... (后面的逻辑保持不变)
}

// --- 投喂菜单和逻辑 ---
function openCatFeedMenu() {
    if (currentDialogue) {
        showToast("正在和猫猫说话呢，晚点再喂吧！");
        return;
    }
    // ... (后面的逻辑保持不变)
}

// --- 显示对话气泡 ---
function showCatBubble(text, duration = 3000) {
    const bubble = document.getElementById('cat-dialogue-bubble');
    const textEl = document.getElementById('cat-bubble-text');
    if (!bubble || !textEl) return;

    textEl.textContent = text;
    bubble.classList.remove('hidden');

    if (catBubbleTimer) clearTimeout(catBubbleTimer);
    catBubbleTimer = setTimeout(() => {
        bubble.classList.add('hidden');
    }, duration);
}

// --- 切换小按钮显示/隐藏 ---
function toggleCatActions() {
    const panel = document.getElementById('cat-mini-actions');
    if (panel) panel.classList.toggle('hidden');
}

// --- 初始化猫猫拖拽和点击 ---
function initCatDragging() {
    const catEl = document.getElementById('cat-npc');
    let isDragging = false;
    let dragTimeout;

   catEl.addEventListener('click', (e) => {
    if (!isDragging && gameState.cat.unlocked) {
        toggleCatActions();
        // ✅ 显示好感度和情绪值
        const cat = gameState.cat;
        showCatBubble(`💕好感: ${Math.floor(cat.affection)}/1000 | 😊情绪: ${Math.floor(cat.mood)}/100`);
    }
});
   

    catEl.addEventListener('mousedown', (e) => {
        if (!gameState.cat.unlocked) return;
        isDragging = false; // 重置
        // 延迟判断是否为拖拽，避免和点击冲突
        dragTimeout = setTimeout(() => {
            isDragging = true;
            catEl.style.cursor = 'grabbing';
        }, 150);
        
        // ... (拖拽逻辑)
        let startX = e.clientX, startY = e.clientY;
        const rect = catEl.getBoundingClientRect();
        let initialX = rect.left, initialY = rect.top;

        function onMouseMove(moveEvent) {
            if (!isDragging) return;
            const dx = moveEvent.clientX - startX;
            const dy = moveEvent.clientY - startY;
            catEl.style.left = `${initialX + dx}px`;
            catEl.style.top = `${initialY + dy}px`;
            catEl.style.right = 'auto';
            catEl.style.bottom = 'auto';
        }

        function onMouseUp() {
            clearTimeout(dragTimeout);
            catEl.style.cursor = 'grab';
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            // 延迟一小会儿再设置 isDragging=false，确保 click 事件能正确判断
            setTimeout(() => { isDragging = false; }, 50);
        }

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        e.preventDefault();
    });
    // ... 手机端拖拽逻辑类似，这里先简化
}

// --- 猫猫互动逻辑 ---
function interactCat(action) {
    const cat = gameState.cat;

    if (cat.mood < 20) {
        setCatState('unhappy');
        showCatBubble('……我现在不想理你。', 3000);
        showToast('😾 猫猫不理你...\n（情绪值太低了）');
        return;
    }

    if (action === 'pet') {
        cat.affection = Math.min(1000, cat.affection + 2);
        cat.mood = Math.min(100, cat.mood + 8);
        setCatState('pet');
        showCatBubble('喵~ 这次摸得还行。');
    } else if (action === 'praise') {
        cat.affection = Math.min(1000, cat.affection + 3);
        cat.mood = Math.min(100, cat.mood + 5);
        showCatBubble('嘿嘿，知道我厉害了吧~');
    } else if (action === 'hit') {
        cat.affection = Math.min(1000, cat.affection + 5);
        cat.mood = Math.max(0, cat.mood - 12);
        setCatState('hit');
        showCatBubble('嗷！！！你居然敢打我？！');
    }

    cat.lastInteraction = Date.now();
    saveGame();
}

// ==================== 打开投喂菜单 ====================
function openCatFeedMenu() {
    const feedableCrops = Object.entries(gameState.inventory).filter(([id, count]) => {
        const baseId = id.split('_')[0];
        if (baseId === 'clover') return false;
        return count > 0 && PRODUCTS_CONFIG[baseId];
    });

    const feedableFerts = Object.entries(gameState.items || {}).filter(([id, count]) => {
        return count > 0 && FERTILIZERS_CONFIG[id];
    });

    if (feedableCrops.length === 0 && feedableFerts.length === 0) {
        showToast('❌ 背包里没有可以喂的东西！');
        return;
    }

    // ✅ 【核心】创建并显示一个临时的弹窗菜单
    const menuHtml = `
        <div id="temp-feed-menu" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                    background: rgba(0,0,0,0.7); display: flex; align-items: center; 
                    justify-content: center; z-index: 3000;" 
             onclick="document.getElementById('temp-feed-menu').remove()">
             
            <div style="background: white; border-radius: 15px; padding: 15px; 
                        max-width: 350px; max-height: 80%; overflow-y: auto;" 
                 onclick="event.stopPropagation()">
                 
                <h3 style="margin-bottom: 12px; font-size: 16px; color: #333;">选择食物投喂</h3>
                
                ${feedableCrops.length > 0 ? '<div style="font-size: 12px; color: #999; margin: 8px 0;">🌾 作物：</div>' : ''}
                ${feedableCrops.map(([itemId, count]) => {
                    const baseId = itemId.split('_')[0];
                    const product = PRODUCTS_CONFIG[baseId];
                    return `
                        <div style="padding: 10px; margin: 6px 0; background: #f0f0f0; 
                                    border-radius: 8px; cursor: pointer;"
                             onclick="feedCat('${itemId}'); document.getElementById('temp-feed-menu').remove();">
                            <div style="font-size: 16px;">${product.emoji} ${product.name} (x${count})</div>
                        </div>
                    `;
                }).join('')}
                
                ${feedableFerts.length > 0 ? '<div style="font-size: 12px; color: #999; margin: 8px 0;">🧪 道具（慎用）：</div>' : ''}
                ${feedableFerts.map(([itemId, count]) => {
                    const fert = FERTILIZERS_CONFIG[itemId];
                    return `
                        <div style="padding: 10px; margin: 6px 0; background: #ffe0e0; 
                                    border: 1px dashed #ff6b6b; border-radius: 8px; cursor: pointer;"
                             onclick="feedCatFertilizer('${itemId}'); document.getElementById('temp-feed-menu').remove();">
                            <div style="font-size: 16px;">${fert.emoji} ${fert.name} (x${count})</div>
                            <div style="font-size: 11px; color: #999;">⚠️ 不建议喂这个...</div>
                        </div>
                    `;
                }).join('')}
                
                <button style="width: 100%; padding: 10px; margin-top: 8px; background: #ddd; 
                               border: none; border-radius: 8px; cursor: pointer; font-size: 13px;"
                        onclick="document.getElementById('temp-feed-menu').remove()">
                    取消
                </button>
            </div>
        </div>
    `;
    
    // 将菜单添加到页面上
    document.body.insertAdjacentHTML('beforeend', menuHtml);
}
    // ... (后面的菜单 HTML 逻辑保持不变)


function feedCat(itemId) {
    // ... (原有的 feedCat 逻辑，在最后调用 setCatState 和 showCatBubble)
    if (!gameState.inventory[itemId] || gameState.inventory[itemId] < 1) return;
    const baseId = itemId.split('_')[0]; const cat = gameState.cat;
    gameState.inventory[itemId]--;
    let affectionGain = 5; let moodGain = 10;
    
    if (baseId === 'corn' || baseId === 'sashimi') {
        affectionGain = 10; moodGain = 20;
        setCatState('feed'); showCatBubble('喵喵喵！太好吃了！');
    } else if (baseId === 'fishMeat') {
        affectionGain = -10; moodGain = 5;
        setCatState('unhappy'); showCatBubble('这是什么难吃的东西！');
    } else {
        setCatState('feed'); showCatBubble('喵~ 还不错。');
    }
    
    cat.affection = Math.min(1000, Math.max(0, cat.affection + affectionGain));
    cat.mood = Math.min(100, cat.mood + moodGain);
    cat.lastInteraction = Date.now();
    saveGame(); renderInventory();
}

function feedCatFertilizer(itemId) {
    // ... (原有的 feedCatFertilizer 逻辑，在最后调用 setCatState 和 showCatBubble)
    if (!gameState.items[itemId] || gameState.items[itemId] < 1) return;
    const cat = gameState.cat; gameState.items[itemId]--;
    
    if (itemId === 'poopFert') {
        cat.affection = Math.max(0, cat.affection - 100); cat.mood = Math.max(0, cat.mood - 50);
        setCatState('poop'); showCatBubble('你他妈有病吧！！！！', 3000);
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
function catMoodRecover() { if (!gameState.cat.unlocked) return; gameState.cat.mood = Math.min(100, gameState.cat.mood + 10); saveGame(); }

// ==================== 🎨 UI 辅助函数 ====================
function updateGoldDisplay() { document.getElementById('gold-amount').textContent = gameState.gold; }
function showToast(message) { const toast = document.getElementById('toast'); toast.textContent = message; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 3000); }
function showBlessing() { document.getElementById('blessing-modal').classList.add('show'); }
function closeBlessing() { document.getElementById('blessing-modal').classList.remove('show'); }
function createFireworks() { for (let i = 0; i < 20; i++) { setTimeout(() => { const firework = document.createElement('div'); firework.className = 'firework'; firework.textContent = ['🎆', '✨', '🎇', '💫', '🌟'][Math.floor(Math.random() * 5)]; firework.style.left = Math.random() * 100 + '%'; firework.style.top = Math.random() * 100 + '%'; document.getElementById('blessing-modal').appendChild(firework); setTimeout(() => firework.remove(), 2000); }, i * 100); } }

// ==================== 💾 存档系统 ====================
function saveGame() { localStorage.setItem('farmGame', JSON.stringify(gameState)); }
function loadGame() {
    const saved = localStorage.getItem('farmGame');
    if (saved) {
        try {
            const loaded = JSON.parse(saved); gameState = { ...gameState, ...loaded };
            if (!gameState.cat) { gameState.cat = { unlocked: false, affection: 500, mood: 100, lastInteraction: 0, lastAction: null, status: 'normal' }; }
            console.log('✅ 存档加载成功');
        } catch (e) { console.warn('⚠️ 存档损坏'); }
    }
}
// =====================================================================
//                        📜 订单系统函数
// =====================================================================

// --- 生成新订单 ---
function generateOrders() {
    gameState.activeOrders = []; // 清空旧订单
    const allOrderKeys = Object.keys(ORDERS_POOL_CONFIG);
    
    // 每个商人随机分配1-2个订单
    Object.keys(MERCHANTS_CONFIG).forEach(merchantId => {
        const merchantOrders = allOrderKeys.filter(key => ORDERS_POOL_CONFIG[key].merchantId === merchantId);
        
        // 打乱顺序，取前一两个
        merchantOrders.sort(() => 0.5 - Math.random()); 
        
        const orderCount = Math.random() > 0.5 ? 2 : 1;
        for(let i=0; i < Math.min(orderCount, merchantOrders.length); i++) {
            const orderKey = merchantOrders[i];
            const order = ORDERS_POOL_CONFIG[orderKey];
            gameState.activeOrders.push({
                ...order,
                id: orderKey, // 用配置的key作为唯一ID
                status: 'active'
            });
        }
    });
    saveGame();
}

// --- 渲染订单列表 ---
function renderOrders(merchantId) {
    const container = document.getElementById('merchant-orders');
    const orders = gameState.activeOrders.filter(order => order.merchantId === merchantId);

    if (orders.length === 0) {
        container.innerHTML = '<div style="padding: 10px; text-align: center; font-size: 12px; color: #999;">这位商人暂时没有特殊订单...</div>';
        return;
    }

    container.innerHTML = `<h3 style="margin: 12px 0 8px 0; color: #666; font-size: 14px;">特殊订单</h3>` +
        orders.map(order => {
            let canDeliver = true;
            let ingredientsText = '';

            // 检查材料
            for (let itemId in order.items) {
                const needAmount = order.items[itemId];
                const haveAmount = gameState.inventory[itemId] || 0;
                if (haveAmount < needAmount) canDeliver = false;
                
                const product = PRODUCTS_CONFIG[itemId.split('_')[0]];
                const star = itemId.includes('_') ? '⭐'.repeat(parseInt(itemId.split('_')[1])) : '';
                ingredientsText += `${product.emoji}${product.name}${star} ${haveAmount}/${needAmount} `;
            }

            return `
                <div class="shop-item" style="display: block; background: #fff8e1;">
                    <div style="font-size: 12px; font-style: italic; color: #666; margin-bottom: 8px;">"${order.desc}"</div>
                    <div style="font-size: 11px; margin-bottom: 8px;"><b>需要:</b> ${ingredientsText}</div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="font-size: 11px;"><b>奖励:</b> ${order.reward.gold}💰</div>
                        <button class="sell-btn" ${!canDeliver ? 'disabled' : ''} onclick="deliverOrder('${order.id}')">
                            ${canDeliver ? '交付订单' : '材料不足'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
}

// --- 交付订单 ---
function deliverOrder(orderId) {
    const orderIndex = gameState.activeOrders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) return;
    
    const order = gameState.activeOrders[orderIndex];

    // 再次检查材料
    for (let itemId in order.items) {
        if ((gameState.inventory[itemId] || 0) < order.items[itemId]) {
            showToast('❌ 交付失败，材料不足！');
            return;
        }
    }

    // 扣除材料
    for (let itemId in order.items) {
        gameState.inventory[itemId] -= order.items[itemId];
    }

    // 发放奖励
    gameState.gold += order.reward.gold;
    showToast(`🎉 订单完成！获得 ${order.reward.gold} 金币！`);
    playSfx('orderComplete');  // ✅ 订单完成音效
    // 移除已完成的订单
    gameState.activeOrders.splice(orderIndex, 1);
    
    // 如果是当天最后一个订单，可以考虑刷新
    if (gameState.activeOrders.filter(o => o.merchantId === order.merchantId).length === 0) {
        // 简单处理：直接重新生成所有订单
        generateOrders();
    }

    saveGame();
    updateGoldDisplay();
    renderSellShop(); // 重新渲染出售界面
}
// =====================================================================
//                        🧪 调试 / 控制台模式 V2.0
// =====================================================================

window.dev = {
    /**
     * 增加金币
     * dev.addGold() 或 dev.addGold(50000)
     */
    addGold(amount = 10000) {
        gameState.gold += amount;
        updateGoldDisplay();
        saveGame();
        console.log(`[dev] 金币 +${amount}，当前：${gameState.gold}`);
    },

    /**
     * 增加产物/作物到背包
     * dev.addItem('wheat', 20)       // 20个小麦(无星级)
     * dev.addItem('corn', 5, 3)      // 5个三星玉米
     * dev.addItem('flour', 10)       // 10份面粉
     */
    addItem(id, amount = 1, star = 0) {
        if (!PRODUCTS_CONFIG[id]) {
            console.warn(`[dev] 未找到物品：${id}，请用 dev.listItems() 查看可用ID`);
            return;
        }
        const key = star > 0 ? `${id}_${star}` : id;
        if (!gameState.inventory[key]) gameState.inventory[key] = 0;
        gameState.inventory[key] += amount;

        saveGame();
        if (typeof renderInventory === 'function') renderInventory();
        console.log(`[dev] 背包物品 +${amount}：${key}`);
    },

    /**
     * 增加道具到背包
     * dev.addTool('poopFert', 5)     // 5个泄芽翔
     * dev.addTool('cloverFert')      // 1个四叶草化肥
     */
    addTool(id, amount = 1) {
        const tool = FERTILIZERS_CONFIG[id] || FISHFOOD_CONFIG[id];
        if (!tool) {
            console.warn(`[dev] 未找到道具：${id}，请用 dev.listTools() 查看可用ID`);
            return;
        }
        if (!gameState.items[id]) gameState.items[id] = 0;
        gameState.items[id] += amount;

        saveGame();
        if (typeof renderInventory === 'function') renderInventory();
        console.log(`[dev] 道具 +${amount}：${id}`);
    },
    
    /**
     * ✅【新增】一键获取传说合成材料
     * dev.getLegendaryMats()
     */
    getLegendaryMats() {
        this.addItem('sunflowerSeed', 1, 3);
        this.addItem('corn', 1, 3);
        console.log('[dev] 已添加 1个三星向日葵种子 和 1个三星玉米！');
    },

    /**
     * ✅【新增】解锁猫猫（跳过四叶草合成）
     * dev.unlockCat()
     */
    unlockCat() {
        if (typeof acceptCatGift === 'function' && !gameState.cat.unlocked) {
            acceptCatGift();
            console.log('[dev] 已通过作弊码解锁猫猫！');
        } else {
            console.log('[dev] 猫猫已经解锁了。');
        }
    },

    /**
     * ✅【新增】重置游戏（清空存档）
     * dev.reset()
     */
    reset() {
        if (confirm('你确定要重置游戏吗？所有进度将丢失！')) {
            localStorage.clear();
            window.location.reload();
        }
    },

    listItems() { console.log('[dev] 可用产物ID：', Object.keys(PRODUCTS_CONFIG)); },
    listTools() { console.log('[dev] 可用道具ID：', Object.keys({...FERTILIZERS_CONFIG, ...FISHFOOD_CONFIG})); },
    cat(state = 'idle') { if (typeof setCatState === 'function') setCatState(state); }
};

// 启动时在控制台提示一下
console.log(
    '%c[dev] 调试模式 V2.0 已启用：',
    'color:#FF69B4;font-weight:bold;',
    '\n  dev.addGold(50000)',
    '\n  dev.addItem("wheat", 20)',
    '\n  dev.addItem("corn", 5, 3)',
    '\n  dev.addTool("cloverFert")',
    '\n  dev.getLegendaryMats()  // 一键获取传说材料',
    '\n  dev.unlockCat()         // 直接解锁猫猫',
    '\n  dev.reset()             // 清空存档',
    '\n  dev.cat("pet")'
);
// =====================================================================
//                        🔊 声音系统配置 V2.5 (自动播放+关闭)
// =====================================================================

const SFX_CONFIG = {
    click:          'sfx/ui_click.mp3',
    harvest:        'sfx/harvest.mp3',
    sell:           'sfx/sell.mp3',
    orderComplete:  'sfx/order_complete.mp3',
    catPet:         'sfx/cat_meow.mp3',
    catAngry:       'sfx/cat_angry.mp3',
    catFeed:        'sfx/cat_eat.mp3',
    catPoop:        'sfx/cat_poop.mp3'
};

// 【✅ 新增】BGM 播放列表
const BGM_PLAYLIST = [
    'sfx/07_2321025365.mp3',
    'sfx/13_1401235405.mp3',
    'sfx/15_474875594.mp3',
    'sfx/21_540840405.mp3',
    'sfx/33_3315792866.mp3'
    // 你可以继续往里加...
];

let sfxEnabled = true;
let bgmAudio = null;
let currentBgmIndex = 0;
let isBgmPlaying = false;
let userInteracted = false; // ✅ 新增：标记用户是否已交互

// 播放短音效
function playSfx(name, volume = 0.9) {
    if (!sfxEnabled) return;
    const src = SFX_CONFIG[name];
    if (!src) {
        console.warn(`[SFX] Config not found for: ${name}`);
        return;
    }
    const audio = new Audio(src);
    audio.volume = volume;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            if (error.name !== 'NotAllowedError') {
                console.error(`[SFX] Playback failed for ${name}:`, error);
            }
        });
    }
}

// 播放下一首 BGM
function playNextBgm() {
    if (!isBgmPlaying || BGM_PLAYLIST.length === 0) return;
    currentBgmIndex = (currentBgmIndex + 1) % BGM_PLAYLIST.length;
    bgmAudio.src = BGM_PLAYLIST[currentBgmIndex];
    bgmAudio.play().catch(err => {
        console.warn('BGM auto-play next error:', err);
        isBgmPlaying = false;
        updateBgmButton();
    });
}

// ✅ 【核心修改】尝试自动播放 BGM
function tryAutoPlayBgm() {
    if (!userInteracted || isBgmPlaying || !bgmAudio) return; // 必须交互过 + 未在播放
    
    isBgmPlaying = true;
    
    if (bgmAudio.src === '') {
        currentBgmIndex = Math.floor(Math.random() * BGM_PLAYLIST.length);
        bgmAudio.src = BGM_PLAYLIST[currentBgmIndex];
    }

    bgmAudio.play().catch(() => {
        // 如果失败，就重置状态，等待用户手动点击
        isBgmPlaying = false;
    }).then(() => {
        updateBgmButton();
    });
}

// 切换 BGM 播放/暂停
function toggleBgm() {
    if (!bgmAudio) {
        bgmAudio = new Audio();
        bgmAudio.volume = 0.4;
        bgmAudio.addEventListener('ended', playNextBgm);
    }

    isBgmPlaying = !isBgmPlaying;

    if (isBgmPlaying) {
        if (bgmAudio.paused) {
            if (bgmAudio.src === '') {
                currentBgmIndex = Math.floor(Math.random() * BGM_PLAYLIST.length);
                bgmAudio.src = BGM_PLAYLIST[currentBgmIndex];
            }
            bgmAudio.play().catch(err => {
                console.error('[BGM] Playback failed:', err);
                isBgmPlaying = false;
            });
        }
    } else {
        bgmAudio.pause();
    }
    
    updateBgmButton();
}

// ✅ 新增：停止 BGM 的函数
function stopBgm() {
    if (bgmAudio) {
        bgmAudio.pause();
        bgmAudio.currentTime = 0; // 重置到开头
        isBgmPlaying = false;
        updateBgmButton();
    }
}

// 更新 BGM 按钮显示
function updateBgmButton() {
    const btn = document.getElementById('bgm-button');
    if (!btn) return;
    btn.textContent = isBgmPlaying ? '🔊 音乐' : '🔈 音乐';
}

// 全局按钮点击音效
document.addEventListener('click', (e) => {
    // ✅ 标记用户已交互
    if (!userInteracted) {
        userInteracted = true;
        // 第一次交互后，尝试自动播放BGM
        setTimeout(tryAutoPlayBgm, 100); 
    }
    
    if (e.target.tagName === 'BUTTON') {
        playSfx('click');
    }
});
// ==================== 🚀 游戏启动入口 ====================
window.addEventListener('load', initGame);      
