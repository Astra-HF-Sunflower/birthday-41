// ==================== 这是 gallery_script.js 的最终、完整、干净版 ====================

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
    
    if (currentPage === 5 && typeof animateNumbers === 'function') animateNumbers();
    if (currentPage === 0 && typeof createFirework === 'function') setTimeout(createFirework, 500);
    
    setTimeout(() => { isScrolling = false; }, 800);
}

// --- 滚动与触摸控制 (带时间轴优化) ---
document.addEventListener('wheel', function(e) {
    if (isScrolling) return;
    if (currentPage === 2) {
        const timelinePage = document.querySelector('.page-3');
        if (timelinePage) {
            const isAtTop = timelinePage.scrollTop === 0;
            const isAtBottom = timelinePage.scrollTop + timelinePage.clientHeight >= timelinePage.scrollHeight - 1;
            if (e.deltaY > 0 && !isAtBottom) return;
            if (e.deltaY < 0 && !isAtTop) return;
        }
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
document.addEventListener('touchstart', (e) => { if(e.target.closest('.window-body')) { touchStart = e.touches[0].clientY; } });
document.addEventListener('touchend', (e) => {
    if (e.target.closest('.window-body')) {
        if (isScrolling) return;
        const touchEnd = e.changedTouches[0].clientY;
        const diff = touchStart - touchEnd;
        if (currentPage === 2) {
            const timelinePage = document.querySelector('.page-3');
            if (timelinePage) {
                const isAtTop = timelinePage.scrollTop === 0;
                const isAtBottom = timelinePage.scrollTop + timelinePage.clientHeight >= timelinePage.scrollHeight - 1;
                if (diff > 50 && !isAtBottom) return;
                if (diff < -50 && !isAtTop) return;
            }
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

// ==================== 关键词弹窗模块 ====================
const keywordData = {
    sunflower: { image: 'images/kw_sunflower.jpg', text: '41画的皇甫' },
    cat: { image: 'images/kw_cat.jpg', text: '“喵！”' },
    note: { image: 'images/kw_note.jpg', text: '上课传的小纸条，都还留着呢' },
    corn: { image: 'images/kw_corn.jpg', text: '松仁玉米！' },
    food: { image: 'images/kw_food.jpg', text: '难得一起吃一次的麻辣拌...但每次吃都超级幸福！' },
    library: { image: 'images/kw_library.jpg', text: '我上高中以来最幸福的一天 在图书馆的角落和41喝奶茶...' },
    snack: { image: 'images/kw_snack.jpg', text: '41零食永远吃不完！脆升升！41的食物！' },
    desk: { image: 'images/kw_desk.jpg', text: '同桌的你，感谢陪伴！' },
    diary: { image: 'images/kw_diary.jpg', text: '我们由日记开启的缘分....对一个人最大的信任 莫过于分享日记啦！' }
};

function showKeywordImage(keyword) {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const modalText = document.getElementById('modalText');
    const data = keywordData[keyword];
    if (data && modal && modalImage && modalText) {
        modalImage.src = data.image;
        modalText.textContent = data.text;
        modal.classList.add('show');
    }
}

// 【关键！】失踪的 closeModal 厨师，现在回来了！
function closeModal() {
    const modal = document.getElementById('imageModal');
    if (modal) {
        modal.classList.remove('show');
    }
}
document.addEventListener('keydown', function(e) { if (e.key === 'Escape') { closeModal(); } });


// ==================== 音乐控制 (画廊专属) ====================
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
        }).catch(error => { /* 在iframe内静默处理失败 */ });
    }
    document.removeEventListener('click', firstInteractionPlay);
    document.removeEventListener('touchstart', firstInteractionPlay);
}
document.addEventListener('click', firstInteractionPlay);
document.addEventListener('touchstart', firstInteractionPlay);
if(musicIcon) musicIcon.textContent = '🔇';


// ==================== 所有花里胡哨的特效函数 ====================
// 你需要把之前 common.js 或旧 script.js 里的所有特效函数粘贴到这里
// 例如：createFallingItem, createFirework, createShootingStar, createParticles, etc.


// --- 页面加载时，手动触发一次页面切换，以激活第一页 ---
changePage();
// ↓↓↓ 在文件最底部，changePage() 的前面，添加这两个新函数 ↓↓↓

// --- 手机专属按钮翻页 ---
function goPageUp() {
    if (currentPage > 0) {
        currentPage--;
        changePage();
    }
}

function goPageDown() {
    if (currentPage < totalPages - 1) {
        currentPage++;
        changePage();
    }
}


// --- 页面加载时，手动触发一次页面切换，以激活第一页 ---
changePage();