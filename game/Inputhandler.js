// ==================== InputHandler.js (手柄驱动程序) ====================

// 同样，我们把它打包成一个可以“进口”的模块
export default class InputHandler {
    constructor() {
        this.keys = []; // 一个数组，用来记录当前有哪些按键被按下了

        // 【核心！】监听“按键按下”的事件
        window.addEventListener('keydown', (e) => {
            // e.key 会告诉我们是哪个键被按下了，比如 "w", "a", "s", "d"
            // 我们只记录我们关心的那几个键
            if (
                (e.key === 's' || e.key === 'w' || e.key === 'a' || e.key === 'd') 
                && this.keys.indexOf(e.key) === -1 // 并且确保这个键之前没被记录过
            ) {
                this.keys.push(e.key); // 把按下的键，加到我们的数组里
            }
        });

        // 【核心！】监听“按键抬起”的事件
        window.addEventListener('keyup', (e) => {
            if (
                e.key === 's' || e.key === 'w' || e.key === 'a' || e.key === 'd'
            ) {
                // 当按键抬起时，把它从我们的数组里移除
                this.keys.splice(this.keys.indexOf(e.key), 1);
            }
        });
    }
}