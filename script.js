//==================== 这是首都 script.js 的最终、完整版 ====================

// ==================== 登录门 & OS 内核 ====================
let selectedUser = null;

// --- 动画：页面加载后，先显示开机动画，然后切换到用户选择 ---
window.onload = function() {
    setTimeout(() => {
        const bootScreen = document.getElementById('boot-screen');
        if (bootScreen) {
            bootScreen.style.opacity = '0';
            setTimeout(() => {
                bootScreen.classList.add('hidden');
                document.getElementById('user-selection-screen').classList.remove('hidden');
            }, 500);
        }
    }, 2500);
};

// --- 功能：选择用户 ---
function selectUser(user) {
    selectedUser = user;
    document.getElementById('user-selection-screen').classList.add('hidden');
    document.getElementById('password-screen').classList.remove('hidden');

    const avatar = document.getElementById('password-avatar');
    const username = document.getElementById('password-username');
    if (user === 'sunflower') {
        avatar.src = 'images/sunflower-avatar.png';
        username.textContent = '小向日葵喵（管理员）';
    } else {
        avatar.src = 'images/corn-avatar.png';
        username.textContent = '松仁玉米';
    }
    document.getElementById('login-password').value = '';
    document.getElementById('login-error').textContent = '';
    document.getElementById('login-password').focus();
}

// --- 功能：返回用户选择 ---
function backToUserSelection() {
    document.getElementById('password-screen').classList.add('hidden');
    document.getElementById('user-selection-screen').classList.remove('hidden');
}
// ↓↓↓ 用下面这个全新的代码块，替换掉你旧的 enterOS 和 proceedToDesktop 函数 ↓↓↓

function enterOS() {
    const passwordInput = document.getElementById('login-password');
    const errorMsg = document.getElementById('login-error');
    const passwordScreen = document.getElementById('password-screen');
    const password = passwordInput.value.trim();

    if (selectedUser === 'corn') {
        if (password === "071130") {
            errorMsg.style.color = "#2ecc71";
            errorMsg.textContent = "41！欢迎光临你的虚拟庄园！";
            setTimeout(proceedToDesktop, 1500);
        } else {
            errorMsg.style.color = "#FFC0CB";
            errorMsg.textContent = "走开！你不是41！";
            passwordScreen.classList.add('shake');
            setTimeout(() => { passwordScreen.classList.remove('shake'); }, 500);
        }
    } else if (selectedUser === 'sunflower') {
        if (password === "080130") {
            errorMsg.style.color = "#58a6ff";
            errorMsg.textContent = ">> Access Granted. Entering Admin Panel...";
            // 【核心！】密码正确后，不再直接进桌面，而是调用“进入后台”函数
            setTimeout(proceedToAdmin, 1500);
        } else {
            errorMsg.style.color = "#e74c3c";
            errorMsg.textContent = "连我生日都记不住！滚！";
            passwordScreen.classList.add('shake');
            setTimeout(() => { passwordScreen.classList.remove('shake'); }, 500);
        }
    }
}

// “进入桌面”函数，保持不变
function proceedToDesktop() {
    const gate = document.getElementById('login-gate');
    const desktop = document.getElementById('desktop');
    gate.classList.add('fade-out');
    desktop.classList.remove('hidden');
}

// 【全新的“进入后台”函数！】
function proceedToAdmin() {
    const gate = document.getElementById('login-gate');
    const adminPanel = document.getElementById('admin-panel');
    gate.classList.add('fade-out');
    adminPanel.classList.remove('hidden');
}

// 【全新的“从后台进入桌面”函数！】
function proceedToHub() {
    const adminPanel = document.getElementById('admin-panel');
    const desktop = document.getElementById('desktop');
    adminPanel.classList.add('hidden'); // 隐藏后台
    desktop.classList.remove('hidden'); // 显示桌面
}
// --- OS 功能：打开窗口 (V2.0 - 带任务栏联动) ---
function openWindow(appName) {
    const windowEl = document.getElementById(`${appName}-window`);
    const taskbarApps = document.getElementById('taskbar-apps');
    if (!windowEl || !taskbarApps) return;

    // 1. 显示窗口并带到最前面
    windowEl.classList.remove('hidden');
    document.querySelectorAll('.window').forEach(win => win.style.zIndex = 100);
    windowEl.style.zIndex = 101;

    // 2. 【核心！】检查任务栏上是否已经有这个App的按钮了
    let taskbarBtn = document.getElementById(`task-${appName}`);
    if (!taskbarBtn) {
        // 如果没有，就创建一个新的！
        taskbarBtn = document.createElement('button');
        taskbarBtn.id = `task-${appName}`;
        taskbarBtn.className = 'taskbar-btn';
        // 从桌面图标复制图片和文字
        const iconImg = document.querySelector(`.icon[ondblclick="openWindow('${appName}')"] img`).src;
        const iconText = document.querySelector(`.icon[ondblclick="openWindow('${appName}')"] span`).textContent;
        taskbarBtn.innerHTML = `<img src="${iconImg}"> <span>${iconText.replace('.exe','')}</span>`;
        
        // 给新按钮加上“点击带到最前”的功能
        taskbarBtn.onclick = () => openWindow(appName);
        
        taskbarApps.appendChild(taskbarBtn);
    }
    // 激活当前App的任务栏按钮
    document.querySelectorAll('.taskbar-btn').forEach(btn => btn.classList.remove('active'));
    taskbarBtn.classList.add('active');
}

// --- OS 功能：关闭窗口 (V2.0 - 带任务栏联动) ---
function closeWindow(appName) {
    const windowEl = document.getElementById(`${appName}-window`);
    if (windowEl) {
        windowEl.classList.add('hidden');

        // 【核心！】从任务栏上移除对应的按钮
        const taskbarBtn = document.getElementById(`task-${appName}`);
        if (taskbarBtn) {
            taskbarBtn.remove();
        }

        // 远程静音 (保持不变)
        if (appName === 'gallery' && typeof bgMusic !== 'undefined' && bgMusic && !bgMusic.paused) {
            // 我们需要找到 gallery 内部的 toggleMusic 函数来正确切换状态
            const iframe = windowEl.querySelector('iframe');
            if(iframe && iframe.contentWindow && typeof iframe.contentWindow.toggleMusic === 'function'){
                iframe.contentWindow.toggleMusic();
            }
        }
    }
}

// --- OS 功能：注销 ---
function logOut() {
    const gate = document.getElementById('login-gate');
    const desktop = document.getElementById('desktop');
    document.querySelectorAll('.window').forEach(win => win.classList.add('hidden'));
    desktop.classList.add('hidden');
    gate.classList.remove('fade-out');
    document.getElementById('user-selection-screen').classList.remove('hidden');
    document.getElementById('password-screen').classList.add('hidden');
    document.getElementById('boot-screen').classList.add('hidden');
}

// --- OS 魔法：让窗口可以被拖动 & 开始菜单逻辑 (V2.0 外交版) ---
document.addEventListener('DOMContentLoaded', () => {
    const windows = document.querySelectorAll('.window');
    windows.forEach((win, index) => {
        const titleBar = win.querySelector('.title-bar');
        if (!titleBar) return;
        
        let isDragging = false;
        let startX, startY, initialX, initialY;

        // --- 电脑端：只允许通过标题栏拖动 ---
        titleBar.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            initialX = win.offsetLeft;
            initialY = win.offsetTop;
            
            document.querySelectorAll('.window').forEach(w => w.style.zIndex = 100);
            win.style.zIndex = 101;
        });

        // --- 手机端：专属的触摸拖动逻辑 ---
        titleBar.addEventListener('touchstart', (e) => {
            // 只处理单指触摸
            if (e.touches.length === 1) {
                isDragging = true;
                const touch = e.touches[0];
                startX = touch.clientX;
                startY = touch.clientY;
                initialX = win.offsetLeft;
                initialY = win.offsetTop;
                
                document.querySelectorAll('.window').forEach(w => w.style.zIndex = 100);
                win.style.zIndex = 101;
            }
        }, { passive: true });


        // --- 统一的移动逻辑 ---
        function handleMove(clientX, clientY) {
            if (isDragging) {
                const dx = clientX - startX;
                const dy = clientY - startY;
                win.style.left = `${initialX + dx}px`;
                win.style.top = `${initialY + dy}px`;
            }
        }

        document.addEventListener('mousemove', (e) => handleMove(e.clientX, e.clientY));
        document.addEventListener('touchmove', (e) => {
            // 【核心外交协议！】如果事件起源于标题栏，我们才处理拖动！
            if (isDragging && e.target.closest('.title-bar')) {
                // 阻止页面默认的滚动行为（比如整个网页上下弹动）
                e.preventDefault();
                if (e.touches.length === 1) {
                    const touch = e.touches[0];
                    handleMove(touch.clientX, touch.clientY);
                }
            }
        }, { passive: false });


        // --- 统一的停止逻辑 ---
        function stopDragging() {
            isDragging = false;
        }
        document.addEventListener('mouseup', stopDragging);
        document.addEventListener('touchend', stopDragging);
    });

    // --- 开始菜单逻辑 (保持不变) ---
    const startButton = document.getElementById('start-button');
    const startMenu = document.getElementById('start-menu');
    startButton.addEventListener('click', (e) => {
        e.stopPropagation();
        startMenu.classList.toggle('hidden');
    });
    document.addEventListener('click', (e) => {
        if (!startMenu.classList.contains('hidden') && !startButton.contains(e.target)) {
            startMenu.classList.add('hidden');
        }
    });
});// ↓↓↓ 在文件最底部，添加这两个全新的函数 ↓↓↓

// --- 放大镜功能 ---
function openImageViewer(imageSrc) {
    const viewerModal = document.getElementById('imageViewerModal');
    const viewerImage = document.getElementById('viewerImage');
    if(viewerModal && viewerImage) {
        viewerImage.src = imageSrc;
        viewerModal.classList.remove('hidden');
    }
}
function closeImageViewer() {
    const viewerModal = document.getElementById('imageViewerModal');
    if(viewerModal) {
        viewerModal.classList.add('hidden');
    }
}