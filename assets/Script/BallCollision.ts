// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Ball from "./Ball";
import Launch from "./Launch";

const {ccclass, property} = cc._decorator;

@ccclass
export default class BallCollision extends cc.Component {

    // 🔥 唯一正确：接收代理转发的碰撞（CC2.4.0原生）
    public onCollisionEnter(other: cc.Collider, self: cc.Collider) {
        console.log("碰撞检测触发", self.node.name, "碰到了", other.node.name);
        if (Launch.isGameOver) return;

        const pair = this.getCollisionPair(other, self);
        if (!pair) return;

        const wildBall = pair.wild.node.getComponent(Ball);
        const playerBall = pair.player.node.getComponent(Ball);

        if (playerBall.level >= wildBall.level) {
            let launch = cc.find("Canvas").getComponent(Launch); 
            let lv = wildBall.level;
            launch.eatWildBall(pair.wild.node, lv);
        } else {
            pair.player.node.removeFromParent();
            cc.find("Canvas").getComponent(Launch).checkGameOver();
        }
    }

    // 匹配玩家球和野生球碰撞
    private getCollisionPair(a: cc.Collider, b: cc.Collider) {
        if (b.node.group === 'playerBall' && a.node.group === 'wildBall') {
            return { player: b, wild: a };
        }
        return null;
    }
}
