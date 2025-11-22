//==================== 这是首都 script.js 的最终、完整版 ====================

// ==================== 登录门 & OS 内核 ====================
let selectedUser = null;
let minimizedWindows = {}; // 追踪哪些窗口被最小化了

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

// --- 功能：输入密码并登录 ---
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
        if (password === "Eternal") {
            errorMsg.style.color = "#58a6ff";
            errorMsg.textContent = ">> Access Granted. Entering Admin Panel...";
            setTimeout(proceedToAdmin, 1500);
        } else {
            errorMsg.style.color = "#e74c3c";
            errorMsg.textContent = "error！Insufficient permissions";
            passwordScreen.classList.add('shake');
            setTimeout(() => { passwordScreen.classList.remove('shake'); }, 500);
        }
    }
}

// --- "进入桌面"函数 ---
function proceedToDesktop() {
    const gate = document.getElementById('login-gate');
    const desktop = document.getElementById('desktop');
    gate.classList.add('fade-out');
    desktop.classList.remove('hidden');
}

// --- "进入管理员后台"函数 ---
function proceedToAdmin() {
    const gate = document.getElementById('login-gate');
    const adminPanel = document.getElementById('admin-panel');
    gate.classList.add('fade-out');
    adminPanel.classList.remove('hidden');
}

// --- "从后台进入桌面"函数 ---
function proceedToHub() {
    const adminPanel = document.getElementById('admin-panel');
    const desktop = document.getElementById('desktop');
    adminPanel.classList.add('hidden');
    desktop.classList.remove('hidden');
}

// ==================== 窗口管理系统 ====================

// --- 打开窗口（合并版，修复了重复定义问题）---
function openWindow(appName) {
    const windowEl = document.getElementById(`${appName}-window`);
    const taskbarApps = document.getElementById('taskbar-apps');
    if (!windowEl || !taskbarApps) return;

    // 如果窗口是最小化的，则还原
    if (minimizedWindows[appName]) {
        windowEl.classList.remove('hidden');
        minimizedWindows[appName] = false;
    }

    // 显示窗口并带到最前面
    windowEl.classList.remove('hidden');
    document.querySelectorAll('.window').forEach(win => win.style.zIndex = 100);
    windowEl.style.zIndex = 101;

    // 检查任务栏上是否已经有这个App的按钮了
    let taskbarBtn = document.getElementById(`task-${appName}`);
    if (!taskbarBtn) {
        // 如果没有，就创建一个新的
        taskbarBtn = document.createElement('button');
        taskbarBtn.id = `task-${appName}`;
        taskbarBtn.className = 'taskbar-btn';
        
        // 从桌面图标复制图片和文字
        const iconEl = document.querySelector(`.icon[ondblclick*="${appName}"]`);
        if (iconEl) {
            const iconImg = iconEl.querySelector('img').src;
            const iconText = iconEl.querySelector('span').textContent;
            taskbarBtn.innerHTML = `<img src="${iconImg}"> <span>${iconText.replace('.exe','')}</span>`;
        }
        
        // 给新按钮加上点击切换最小化/还原 的功能（行为更像真实系统）
        taskbarBtn.onclick = () => {
            const winEl = document.getElementById(`${appName}-window`);
            if (!winEl) return;
            // 如果当前是最小化或隐藏，则打开并聚焦
            if (minimizedWindows[appName] || winEl.classList.contains('hidden')) {
                openWindow(appName);
                minimizedWindows[appName] = false;
                winEl.classList.remove('hidden');
                document.querySelectorAll('.taskbar-btn').forEach(b=>b.classList.remove('active'));
                taskbarBtn.classList.add('active');
            } else {
                // 否则最小化
                minimizeWindow(appName);
            }
        };
        
        taskbarApps.appendChild(taskbarBtn);
    }
    
    // 激活当前App的任务栏按钮
    document.querySelectorAll('.taskbar-btn').forEach(btn => btn.classList.remove('active'));
    taskbarBtn.classList.add('active');
}

function closeWindow(appName) {
    const windowEl = document.getElementById(`${appName}-window`);
    if (windowEl) {
        windowEl.classList.add('hidden');

        const taskbarBtn = document.getElementById(`task-${appName}`);
        if (taskbarBtn) {
            taskbarBtn.remove();
        }

        const iframe = windowEl.querySelector('iframe');

        // 如果是回忆画廊，调用它的 toggleMusic
        if (appName === 'gallery' && iframe && iframe.contentWindow && typeof iframe.contentWindow.toggleMusic === 'function') {
            iframe.contentWindow.toggleMusic();
        }

        // ✅ 【核心修改】如果是庄园游戏，调用它的 stopBgm
        if (appName === 'manor' && iframe && iframe.contentWindow && typeof iframe.contentWindow.stopBgm === 'function') {
            iframe.contentWindow.stopBgm();
        }
    }
}

// --- 最小化窗口 ---
function minimizeWindow(appName) {
    const windowEl = document.getElementById(`${appName}-window`);
    const taskbarBtn = document.getElementById(`task-${appName}`);
    
    if (windowEl) {
        windowEl.classList.add('hidden'); 
        if (taskbarBtn) {
            taskbarBtn.classList.remove('active'); 
        }
        minimizedWindows[appName] = true;
    }
}

// --- 最大化/还原窗口 ---
function maximizeWindow(appName) {
    const windowEl = document.getElementById(`${appName}-window`);
    if (!windowEl) return;
    
    // 如果已经最大化，则还原到之前的尺寸和位置
    if (windowEl.classList.contains('maximized')) {
        windowEl.classList.remove('maximized');

        // 恢复之前保存的位置和大小
        const prevLeft = windowEl.dataset.prevLeft;
        const prevTop = windowEl.dataset.prevTop;
        const prevWidth = windowEl.dataset.prevWidth;
        const prevHeight = windowEl.dataset.prevHeight;
        if (prevLeft) windowEl.style.left = prevLeft;
        if (prevTop) windowEl.style.top = prevTop;
        if (prevWidth) windowEl.style.width = prevWidth;
        if (prevHeight) windowEl.style.height = prevHeight;

        // 清理保存的数据
        delete windowEl.dataset.prevLeft;
        delete windowEl.dataset.prevTop;
        delete windowEl.dataset.prevWidth;
        delete windowEl.dataset.prevHeight;

        // 恢复可调整大小
        windowEl.style.resize = '';
        windowEl.style.boxShadow = '';
    } else {
        // 保存当前位置和大小以便还原
        const rect = windowEl.getBoundingClientRect();
        windowEl.dataset.prevLeft = windowEl.style.left || `${rect.left}px`;
        windowEl.dataset.prevTop = windowEl.style.top || `${rect.top}px`;
        windowEl.dataset.prevWidth = windowEl.style.width || `${rect.width}px`;
        windowEl.dataset.prevHeight = windowEl.style.height || `${rect.height}px`;

        // 设置为最大化
        windowEl.classList.add('maximized');
        document.querySelectorAll('.window').forEach(win => win.style.zIndex = 100);
        windowEl.style.zIndex = 101;

        // 禁用调整大小并移除阴影以更真实
        windowEl.style.resize = 'none';
        windowEl.style.boxShadow = 'none';
    }
}

// --- 注销 ---
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

// ==================== 图片查看器 ====================

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

// ==================== 桌面设置：壁纸更换 ====================

function setWallpaper(imagePath) {
    const desktop = document.getElementById('desktop');
    if (imagePath) {
        desktop.style.backgroundImage = `url('${imagePath}')`;
        desktop.style.backgroundSize = 'cover';
        desktop.style.backgroundPosition = 'center';
    } else {
        desktop.style.backgroundImage = '';
    }
}

// ==================== 窗口拖动 & 开始菜单 ====================

document.addEventListener('DOMContentLoaded', () => {
    const windows = document.querySelectorAll('.window');
    windows.forEach((win) => {
        const titleBar = win.querySelector('.title-bar');
        if (!titleBar) return;
        
        let isDragging = false;
        let startX, startY, initialX, initialY;

        // 电脑端拖动
        titleBar.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            initialX = win.offsetLeft;
            initialY = win.offsetTop;
            
            document.querySelectorAll('.window').forEach(w => w.style.zIndex = 100);
            win.style.zIndex = 101;
        });

        // 手机端拖动
        titleBar.addEventListener('touchstart', (e) => {
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

        // 统一的移动逻辑
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
            if (isDragging && e.target.closest('.title-bar')) {
                e.preventDefault();
                if (e.touches.length === 1) {
                    const touch = e.touches[0];
                    handleMove(touch.clientX, touch.clientY);
                }
            }
        }, { passive: false });

        // 停止拖动
        function stopDragging() {
            isDragging = false;
        }
        document.addEventListener('mouseup', stopDragging);
        document.addEventListener('touchend', stopDragging);
        
        // 标题栏上的窗口控制按钮（最小化/最大化/关闭）绑定
        const appId = win.id || '';
        const appName = appId.replace(/-window$/, '');
        const btnMin = win.querySelector('.title-bar-controls button[aria-label="Minimize"]');
        const btnMax = win.querySelector('.title-bar-controls button[aria-label="Maximize"]');
        const btnClose = win.querySelector('.title-bar-controls button[aria-label="Close"]');
        if (btnMin) {
            btnMin.addEventListener('click', (e) => {
                e.stopPropagation();
                minimizeWindow(appName);
            });
        }
        if (btnMax) {
            btnMax.addEventListener('click', (e) => {
                e.stopPropagation();
                maximizeWindow(appName);
            });
        }
        if (btnClose) {
            btnClose.addEventListener('click', (e) => {
                e.stopPropagation();
                closeWindow(appName);
            });
        }

        // 双击标题栏切换最大化（桌面端行为）
        titleBar.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            maximizeWindow(appName);
        });
    });

    // 开始菜单逻辑
    const startButton = document.getElementById('start-button');
    const startMenu = document.getElementById('start-menu');
    if (startButton && startMenu) {
        startButton.addEventListener('click', (e) => {
            e.stopPropagation();
            startMenu.classList.toggle('hidden');
        });
        document.addEventListener('click', (e) => {
            if (!startMenu.classList.contains('hidden') && !startButton.contains(e.target)) {
                startMenu.classList.add('hidden');
            }
        });
    }
});
// ==================== 全局交互监听，用于激活BGM ====================

let hasInteracted = false;

function handleFirstInteraction() {
    if (hasInteracted) {
        // 只需要触发一次
        document.removeEventListener('click', handleFirstInteraction);
        document.removeEventListener('keydown', handleFirstInteraction);
        return;
    }
    
    hasInteracted = true;
    console.log('[Desktop] First user interaction detected!');
    
    // 尝试激活庄园游戏的BGM
    const manorWindow = document.getElementById('manor-window');
    if (manorWindow) {
        const iframe = manorWindow.querySelector('iframe');
        // 检查函数是否存在，然后调用
        if (iframe && iframe.contentWindow && typeof iframe.contentWindow.activateBgm === 'function') {
            console.log('[Desktop] Activating manor BGM...');
            iframe.contentWindow.activateBgm();
        }
    }
    
    // 移除监听器
    document.removeEventListener('click', handleFirstInteraction);
    document.removeEventListener('keydown', handleFirstInteraction);
}

// 监听整个页面的点击和键盘事件
document.addEventListener('click', handleFirstInteraction);
document.addEventListener('keydown', handleFirstInteraction);
// ==================== 移动端适配：图标单击打开 ====================
document.addEventListener('DOMContentLoaded', () => {
    // 检测是否为移动设备（简单判断触摸能力）
    const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (isMobile) {
        console.log('[OS] Mobile device detected. Switching icons to single-click.');
        const icons = document.querySelectorAll('.icon');
        icons.forEach(icon => {
            // 获取原本的双击指令
            const dblclickAttr = icon.getAttribute('ondblclick');
            if (dblclickAttr) {
                // 移除双击，改为单击
                icon.removeAttribute('ondblclick');
                icon.setAttribute('onclick', dblclickAttr);
            }
        });
    }
});