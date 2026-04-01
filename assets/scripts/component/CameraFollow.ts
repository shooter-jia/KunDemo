// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import GameMainCtr from "../game/GameMainCtr";
import GameConfig from '../config/GameConfig';

const {ccclass, property} = cc._decorator;

@ccclass
export default class CameraFollow extends cc.Component {

    @property(cc.Node)
    public target: cc.Node = null; // 跟随目标：PlayerGroup

    /**
     * 水平方向（X轴）相机边界留白
     * 面板独立配置，运行时可修改
     */
    @property({
        tooltip: "相机左右边界留白距离（X轴）",
        min: 0
    })
    public cameraBorderOffsetX: number = 200;

    /**
     * 垂直方向（Y轴）相机边界留白
     * 面板独立配置，运行时可修改
     */
    @property({
        tooltip: "相机上下边界留白距离（Y轴）",
        min: 0
    })
    public cameraBorderOffsetY: number = 200;

    // 所有物体移动完成后最后更新相机，彻底无抖动
    lateUpdate() {
        if (!this.target || GameMainCtr.isGameOver) return;

        // 地图总尺寸 3000x3000
        const mapSize = GameConfig.MAP_SIZE;
        const targetX = this.target.x;
        const targetY = this.target.y;

        // ======================
        // X轴 独立边界限制（纯原生JS）
        // ======================
        const finalX = Math.max(
            this.cameraBorderOffsetX,
            Math.min(targetX, mapSize - this.cameraBorderOffsetX)
        );

        // ======================
        // Y轴 独立边界限制（纯原生JS）
        // ======================
        const finalY = Math.max(
            this.cameraBorderOffsetY,
            Math.min(targetY, mapSize - this.cameraBorderOffsetY)
        );

        // 应用相机位置
        this.node.setPosition(finalX, finalY);
    }
}
