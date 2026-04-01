// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Ball from "./Ball";
import GameMainCtr from "../game/GameMainCtr";
import Util from "../common/Util";
import BallPools from "../game/BallPools";

const {ccclass, property} = cc._decorator;

@ccclass
export default class BallCollision extends cc.Component {

    // 接收代理转发的碰撞
    public onCollisionEnter(other: cc.Collider, self: cc.Collider) {
        console.log("碰撞检测触发", self.node.name, "碰到了", other.node.name);
        if (GameMainCtr.isGameOver) return;

        const pair = Util.getCollisionPair(other, self);
        if (!pair) return;

        if (pair.type === 'playerWild') {
            const wildBall = pair.wild.node.getComponent(Ball);
            const playerBall = pair.player.node.getComponent(Ball);
            if (!wildBall || !playerBall) return;

            if (playerBall.level >= wildBall.level) {
                const gameCtr = cc.find("Canvas").getComponent(GameMainCtr);
                if (gameCtr) {
                    gameCtr.eatWildBall(pair.wild.node, wildBall.level);
                }
            } else {
                BallPools.put(pair.player.node, 'ball');
                const gameCtr = cc.find("Canvas").getComponent(GameMainCtr);
                if (gameCtr) {
                    gameCtr.checkGameOver();
                }
            }

            return;
        }

        if (pair.type === 'wildWild') {
            const ballA = pair.a.node.getComponent(Ball);
            const ballB = pair.b.node.getComponent(Ball);
            if (!ballA || !ballB) return;
            if (ballA.level === ballB.level) {
                return;
            }

            const dead = ballA.level < ballB.level ? pair.a.node : pair.b.node;
            BallPools.put(dead, 'ball');
            return;
        }
    }
}
