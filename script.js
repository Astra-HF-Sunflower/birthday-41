let currentPage = 0;
const totalPages = 8;
let isScrolling = false;

// ↓↓↓ 用下面这个最终版的代码块，替换你之前所有的音乐代码 ↓↓↓
// ==================== 音乐控制 (V10.0 破釜沉舟版) ====================
const bgMusic = document.getElementById('bgMusic');
const musicIcon = document.getElementById('musicIcon');
let musicPlaying = false;

// --- 按钮的切换功能 ---
// 这个函数现在变得非常简单
function toggleMusic() {
    if (musicPlaying) {
        bgMusic.pause();
        musicPlaying = false;
        musicIcon.textContent = '🔇';
    } else {
        bgMusic.play();
        musicPlaying = true;
        musicIcon.textContent = '🔊';
    }
}

// --- 核心逻辑：一次性的首次交互，只为了播放！ ---
function firstInteractionPlay() {
    // 直接播放！这是最关键、最直接的命令！
    const playPromise = bgMusic.play();

    if (playPromise !== undefined) {
        playPromise.then(() => {
            // 只要成功，就更新状态
            musicPlaying = true;
            musicIcon.textContent = '🔊';
            console.log("音乐授权成功并已播放！");
        }).catch(error => {
            // 如果连这都失败了，那真的就是环境问题了
            // 但我们依然要移除监听器，因为它已经完成了使命
            console.error("首次交互播放失败，这可能是 Live Server 的刷新问题或浏览器极端安全策略。请尝试手动点击右上角按钮。");
        });
    }
    // 无论成功失败，这个一次性的任务都完成了，移除自己！
    document.removeEventListener('click', firstInteractionPlay);
    document.removeEventListener('touchstart', firstInteractionPlay);
}

// 启动一次性的监听器，等待用户的“圣旨”
document.addEventListener('click', firstInteractionPlay);
document.addEventListener('touchstart', firstInteractionPlay);

// 页面加载时，图标是静音状态
musicIcon.textContent = '🔇';
// =====================================================================

// ↓↓↓ 用下面这些代码，完整替换掉你原来的“滚轮切换”和“触摸切换”两部分 ↓↓↓

// 滚轮切换页面
document.addEventListener('wheel', function(e) {
    if (isScrolling) return;

    // 针对时间轴页面的特殊处理
    if (currentPage === 2) { // 2代表第三页 (因为从0开始数)
        const timelinePage = document.querySelector('.page-3');
        const isAtTop = timelinePage.scrollTop === 0;
        const isAtBottom = timelinePage.scrollTop + timelinePage.clientHeight >= timelinePage.scrollHeight - 1; // -1是为了更精确

        // 如果在时间轴中间滚动，就不翻页
        if (e.deltaY > 0 && !isAtBottom) {
            return; // 往下滚，但没到底，不翻页
        }
        if (e.deltaY < 0 && !isAtTop) {
            return; // 往上滚，但没到顶，不翻页
        }
    }

    // 正常翻页逻辑
    if (e.deltaY > 0 && currentPage < totalPages - 1) {
        currentPage++;
        changePage();
    } else if (e.deltaY < 0 && currentPage > 0) {
        currentPage--;
        changePage();
    }
});

// 触摸切换
let touchStart = 0;
document.addEventListener('touchstart', (e) => {
    touchStart = e.touches[0].clientY;
});

document.addEventListener('touchend', (e) => {
    if (isScrolling) return;
    const touchEnd = e.changedTouches[0].clientY;
    const diff = touchStart - touchEnd;

    // 触摸的特殊处理逻辑和滚轮一样
    if (currentPage === 2) {
        const timelinePage = document.querySelector('.page-3');
        const isAtTop = timelinePage.scrollTop === 0;
        const isAtBottom = timelinePage.scrollTop + timelinePage.clientHeight >= timelinePage.scrollHeight - 1;

        if (diff > 50 && !isAtBottom) { // 向上滑动（内容向下滚）
            return;
        }
        if (diff < -50 && !isAtTop) { // 向下滑动（内容向上滚）
            return;
        }
    }
    
    // 正常翻页逻辑
    if (diff > 50 && currentPage < totalPages - 1) {
        currentPage++;
        changePage();
    } else if (diff < -50 && currentPage > 0) {
        currentPage--;
        changePage();
    }
});

// 切换页面
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
    if (currentPage === 0) setTimeout(createFirework, 500);
    
    setTimeout(() => { isScrolling = false; }, 800);
}

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

setInterval(createStar, 5000);

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
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const modalText = document.getElementById('modalText');
    
    const data = keywordData[keyword];
    if (data) {
        modalImage.src = data.image;
        modalText.textContent = data.text;
        modal.classList.add('show');
    }
}

function closeModal() {
    const modal = document.getElementById('imageModal');
    modal.classList.remove('show');
}

// ESC键关闭弹窗
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});// 显示“制作人彩蛋”弹窗
function showCodeModal() {
    const modal = document.getElementById('codeModal');
    modal.classList.add('show');
}

// 关闭“制作人彩蛋”弹窗
function closeCodeModal() {
    const modal = document.getElementById('codeModal');
    modal.classList.remove('show');
}
// ↓↓↓ 在文件最底部，添加这两个全新的函数 ↓↓↓

// 打开“图片放大镜”
function openImageViewer(imageSrc) {
    const viewerModal = document.getElementById('imageViewerModal');
    const viewerImage = document.getElementById('viewerImage');
    
    viewerImage.src = imageSrc; // 把点击的图片地址，赋给放大镜里的图片
    viewerModal.classList.add('show');
}

// 关闭“图片放大镜”
function closeImageViewer() {
    const viewerModal = document.getElementById('imageViewerModal');
    viewerModal.classList.remove('show');
}