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