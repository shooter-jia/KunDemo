// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Launch from "./Launch";
import GameConfig from './GameConfig';

const {ccclass, property} = cc._decorator;

@ccclass
export default class WildBallMove extends cc.Component {
    private moveSpeed: number = 60;
    private moveDir: cc.Vec2 = cc.v2(0, 0);

    onLoad() {
        this.randomDir();
        this.scheduleOnce(() => {
            this.schedule(this.randomDir, 2);
        }, 0);
    }

    update(dt: number) {
        if (Launch.isGameOver) return;
        this.node.x += this.moveDir.x * this.moveSpeed * dt;
        this.node.y += this.moveDir.y * this.moveSpeed * dt;
        this.checkBorder();
    }

    // 随机移动方向
    private randomDir() {
        const angle = randomRange(0, Math.PI * 2);
        this.moveDir = cc.v2(Math.cos(angle), Math.sin(angle));
    }

    // 边界反弹
    private checkBorder() {
        const limit = GameConfig.MAP_SIZE;
        if (this.node.x <= 0 || this.node.x >= limit) this.moveDir.x *= -1;
        if (this.node.y <= 0 || this.node.y >= limit) this.moveDir.y *= -1;
    }
}

// 原生随机函数
function randomRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}
function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}