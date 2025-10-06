// --- 翻页逻辑 ---
let currentPage = 0;
const totalPages = 8;
let isScrolling = false;

function changePage() {
    isScrolling = true;
    const pages = document.querySelectorAll('.page');
    const dots = document.querySelectorAll('.nav-dot');
    
    pages.forEach((page, index) => {
        page.classList.remove('active');
        if (index === currentPage) page.classList.add('active');
    });
    
    dots.forEach((dot, index) => {
        dot.classList.remove('active');
        if (index === currentPage) dot.classList.add('active');
    });
    
    if (currentPage === 5) animateNumbers();
    if (currentPage === 0) {
        // 确保 createFirework 函数存在
        if (typeof createFirework === 'function') {
            setTimeout(createFirework, 500);
        }
    }
    
    setTimeout(() => { isScrolling = false; }, 800);
}

// --- 滚动与触摸控制 (带时间轴优化) ---
document.addEventListener('wheel', function(e) {
    if (isScrolling) return;
    if (currentPage === 2) {
        const timelinePage = document.querySelector('.page-3');
        const isAtTop = timelinePage.scrollTop === 0;
        const isAtBottom = timelinePage.scrollTop + timelinePage.clientHeight >= timelinePage.scrollHeight - 1;
        if (e.deltaY > 0 && !isAtBottom) return;
        if (e.deltaY < 0 && !isAtTop) return;
    }
    if (e.deltaY > 0 && currentPage < totalPages - 1) {
        currentPage++;
        changePage();
    } else if (e.deltaY < 0 && currentPage > 0) {
        currentPage--;
        changePage();
    }
});
let touchStart = 0;
document.addEventListener('touchstart', (e) => { touchStart = e.touches[0].clientY; });
document.addEventListener('touchend', (e) => {
    // 增加一个判断，防止和OS的触摸事件冲突
    if (e.target.closest('.window-body')) {
        if (isScrolling) return;
        const touchEnd = e.changedTouches[0].clientY;
        const diff = touchStart - touchEnd;
        if (currentPage === 2) {
            const timelinePage = document.querySelector('.page-3');
            const isAtTop = timelinePage.scrollTop === 0;
            const isAtBottom = timelinePage.scrollTop + timelinePage.clientHeight >= timelinePage.scrollHeight - 1;
            if (diff > 50 && !isAtBottom) return;
            if (diff < -50 && !isAtTop) return;
        }
        if (diff > 50 && currentPage < totalPages - 1) {
            currentPage++;
            changePage();
        } else if (diff < -50 && currentPage > 0) {
            currentPage--;
            changePage();
        }
    }
});

// --- 数字动画 ---
function animateNumbers() {
    document.querySelectorAll('.stat-number').forEach((num) => {
        const endValue = num.textContent.trim();
        if (!isNaN(parseInt(endValue))) {
            let current = 0;
            const target = parseInt(endValue);
            const timer = setInterval(() => {
                current += Math.ceil(target / 50);
                if (current >= target) {
                    num.textContent = target;
                    clearInterval(timer);
                } else {
                    num.textContent = current;
                }
            }, 40);
        } else {
            num.textContent = endValue;
        }
    });
}

// --- 照片切换 ---
function showPhoto(index) {
    const photos = document.querySelectorAll('.photo-item');
    const dots = document.querySelectorAll('.photo-nav .dot');
    photos.forEach((p, i) => { p.classList.remove('active'); if (i === index) p.classList.add('active'); });
    dots.forEach((d, i) => { d.classList.remove('active'); if (i === index) d.classList.add('active'); });
}

console.log('✨ 特效已加载！');// ========== 关键词点击显示图片 ==========

const keywordData = {
       sunflower: {
        image: 'images/kw_sunflower.jpg',
        text: '41画的皇甫'
    },
    cat: {
        image: 'images/kw_cat.jpg', 
        text: '“喵！”'
    },
    note: {
        image: 'images/kw_note.jpg',
        text: '上课传的小纸条，都还留着呢'
    },
    corn: {
        image: 'images/kw_corn.jpg',
        text: '松仁玉米！'
    },
    food: {
        image: 'images/kw_food.jpg',
        text: '难得一起吃一次的麻辣拌...但每次吃都超级幸福！'
    },
    library: {
        image: 'images/kw_library.jpg',
        text: '我上高中以来最幸福的一天 在图书馆的角落和41喝奶茶...'
    },
    snack: {
        image: 'images/kw_snack.jpg',
        text: '41零食永远吃不完！脆升升！41的食物！'
    },
    desk: {
        image: 'images/kw_desk.jpg',
        text: '同桌的你，感谢陪伴！'
    },
    diary: {
        image: 'images/kw_diary.jpg',
        text: '我们由日记开启的缘分....对一个人最大的信任 莫过于分享日记啦！'
    }
};
function showKeywordImage(keyword) {
    // 1. 先定义好所有的“演员”
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const modalText = document.getElementById('modalText');
    
    // 2. 【核心修复！】先从“食材库”里，把 data 这个“食材”拿出来！
    const data = keywordData[keyword];

    // 3. 现在，我们可以放心地检查“演员”和“食材”是否都准备好了！
    if (data && modal && modalImage && modalText) {
        // 4. 一切就绪，开始“做菜”！
        modalImage.src = data.image;
        modalText.textContent = data.text;
        modal.classList.add('show');
    } else {
        // 增加一个调试信息，万一还有问题我们能知道
        console.error("无法显示关键词图片：缺少元素或数据。");
    }
}

// ==================== 音乐控制 (V10.0 破釜沉舟版) ====================
const bgMusic = document.getElementById('bgMusic');
const musicIcon = document.getElementById('musicIcon');
let musicPlaying = false;
function toggleMusic() {
    if (musicPlaying) {
        bgMusic.pause(); musicPlaying = false; musicIcon.textContent = '🔇';
    } else {
        bgMusic.play(); musicPlaying = true; musicIcon.textContent = '🔊';
    }
}
function firstInteractionPlay() {
    const playPromise = bgMusic.play();
    if (playPromise !== undefined) {
        playPromise.then(() => {
            musicPlaying = true; musicIcon.textContent = '🔊';
        }).catch(error => { console.error("画廊内首次交互播放失败"); });
    }
    document.removeEventListener('click', firstInteractionPlay);
    document.removeEventListener('touchstart', firstInteractionPlay);
}
document.addEventListener('click', firstInteractionPlay);
document.addEventListener('touchstart', firstInteractionPlay);
if(musicIcon) musicIcon.textContent = '🔇';


// ==================== 所有花里胡哨的特效函数 ====================
// ↓↓↓ 用下面这个完整的函数，替换掉你原来的 animateNumbers 函数 ↓↓↓
function animateNumbers() {
    document.querySelectorAll('.stat-number').forEach((num) => {
        const endValue = num.textContent.trim();
        // 检查一下内容是不是一个纯数字
        if (!isNaN(parseInt(endValue))) {
            // 如果是数字，就播放动画
            let current = 0;
            const target = parseInt(endValue);
            const timer = setInterval(() => {
                current += Math.ceil(target / 50);
                if (current >= target) {
                    num.textContent = target;
                    clearInterval(timer);
                } else {
                    num.textContent = current;
                }
            }, 40);
        } else {
            // 如果不是数字（是汉字或字母），就直接显示，不做动画
            num.textContent = endValue;
        }
    });
}

// 照片切换
function showPhoto(index) {
    const photos = document.querySelectorAll('.photo-item');
    const dots = document.querySelectorAll('.photo-nav .dot');
    photos.forEach((p, i) => {
        p.classList.remove('active');
        if (i === index) p.classList.add('active');
    });
    dots.forEach((d, i) => {
        d.classList.remove('active');
        if (i === index) d.classList.add('active');
    });
}

// 点击爱心
document.addEventListener('click', function(e) {
    const heart = document.createElement('div');
    heart.className = 'heart';
    heart.textContent = ['💚', '💛', '🤍', '💙'][Math.floor(Math.random() * 4)];
    heart.style.left = e.clientX + 'px';
    heart.style.top = e.clientY + 'px';
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 1500);
    
    for (let i = 0; i < 6; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = e.clientX + 'px';
        p.style.top = e.clientY + 'px';
        const angle = (Math.PI * 2 * i) / 6;
        const dist = 50 + Math.random() * 30;
        p.style.setProperty('--px', Math.cos(angle) * dist + 'px');
        p.style.setProperty('--py', Math.sin(angle) * dist + 'px');
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 800);
    }
});

// 飘落物
function createFallingItem() {
    const item = document.createElement('div');
    item.className = 'falling-item';
    item.textContent = ['🌻', '🌽', '🎂', '🎉','🎁','✨','🌹','41'][Math.floor(Math.random() * 4)];
      item.style.top = '-50px';
    item.style.left = Math.random() * 100 + '%';
    item.style.fontSize = (20 + Math.random() * 20) + 'px';
    item.style.animationDuration = (8 + Math.random() * 4) + 's';
    document.body.appendChild(item);
    setTimeout(() => item.remove(), 12000);
}

setInterval(createFallingItem, 1500);
for (let i = 0; i < 5; i++) setTimeout(createFallingItem, i * 300);

// 鼠标光晕
const glow = document.createElement('div');
glow.className = 'cursor-glow';
document.body.appendChild(glow);
document.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
});

// 烟花
function createFirework() {
    const colors = ['#FFD700', '#FF6B9D', '#66CDAA', '#87CEEB', '#FFA500'];
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight * 0.6;
    for (let i = 0; i < 30; i++) {
        const fw = document.createElement('div');
        fw.className = 'firework';
        fw.style.left = x + 'px';
        fw.style.top = y + 'px';
        fw.style.backgroundColor = colors[Math.floor(Math.random() * 5)];
        const angle = (Math.PI * 2 * i) / 30;
        const dist = 80 + Math.random() * 40;
        fw.style.setProperty('--tx', Math.cos(angle) * dist + 'px');
        fw.style.setProperty('--ty', Math.sin(angle) * dist + 'px');
        document.body.appendChild(fw);
        setTimeout(() => fw.remove(), 1500);
    }
}

setTimeout(createFirework, 1000);

// 流星
function createStar() {
    const star = document.createElement('div');
    star.className = 'shooting-star';
    star.style.left = Math.random() * window.innerWidth + 'px';
    star.style.top = Math.random() * 50 + 'px';
    document.body.appendChild(star);
    setTimeout(() => star.remove(), 2000);
    }
// --- 页面加载时，手动触发一次页面切换，以激活第一页 ---
changePage();