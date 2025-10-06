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

// --- 核心：检查密码并进入 OS (V2.0 性格版) ---
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
            errorMsg.textContent = ">> 进入管理员操作系统";
            setTimeout(proceedToDesktop, 1500); // 暂时先统一进入桌面
        } else {
            errorMsg.style.color = "#e74c3c";
            errorMsg.textContent = "连我生日都记不住！滚！";
            passwordScreen.classList.add('shake');
            setTimeout(() => { passwordScreen.classList.remove('shake'); }, 500);
        }
    }
}
function proceedToDesktop() {
    const gate = document.getElementById('login-gate');
    const desktop = document.getElementById('desktop');
    gate.classList.add('fade-out');
    desktop.classList.remove('hidden');
}

// --- OS 功能：打开窗口 ---
function openWindow(appName) {
    const windowEl = document.getElementById(`${appName}-window`);
    if (windowEl) {
        windowEl.classList.remove('hidden');
        // 把窗口带到最前面
        document.querySelectorAll('.window').forEach(win => win.style.zIndex--);
        windowEl.style.zIndex = 101;
    }
}

// --- OS 功能：关闭窗口 (带远程静音) ---
function closeWindow(appName) {
    const windowEl = document.getElementById(`${appName}-window`);
    if (windowEl) {
        windowEl.classList.add('hidden');
        if (appName === 'gallery') {
            const iframe = windowEl.querySelector('iframe');
            if (iframe) {
                const iframeContent = iframe.contentDocument || iframe.contentWindow.document;
                const audio = iframeContent.getElementById('bgMusic');
                if (audio && !audio.paused) {
                    audio.pause();
                }
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
});