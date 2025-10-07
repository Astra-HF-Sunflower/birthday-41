// ==================== World.js (V2.0 - 双颜料盘版) ====================
export default class World {
    constructor() {
        // 【核心升级！】我们现在加载两张图片！
        this.grassImage = new Image();
        this.grassImage.src = '/images/grass.png'; 

        this.dirtImage = new Image();
        this.dirtImage.src = '/images/dirt.png';

        // 定义每块地砖的大小
        this.tileSize = 32;

        // 【核心！】定义我们的世界地图！
        // 0 = 草地, 1 = 泥土
        this.map = [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
            [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
            [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
            [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ];
    }

    draw(context) {
        // 遍历我们的地图数据
        for (let row = 0; row < this.map.length; row++) {
            for (let col = 0; col < this.map[row].length; col++) {
                const tileValue = this.map[row][col];
                let tileImage; // 我们不再关心裁剪位置，而是直接选择要画哪张图！

                // 根据地图数据，决定用哪个“颜料盘”
                if (tileValue === 0) { // 草地
                    tileImage = this.grassImage;
                } else if (tileValue === 1) { // 泥土
                    tileImage = this.dirtImage;
                }

                // 把选好的地砖图片，画到画布的对应位置上
                if (tileImage && tileImage.complete) { // 确保图片加载完再画
                    context.drawImage(
                        tileImage, // 直接画整张地砖图片！
                        col * this.tileSize, 
                        row * this.tileSize,
                        this.tileSize, 
                        this.tileSize
                    );
                }
            }
        }
    }
}