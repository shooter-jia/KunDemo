// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

import Ball from './Ball';
import BallCollision from './BallCollision';
import GameConfig from './GameConfig';
import Launch from './Launch';

@ccclass
export default class MergeManager extends cc.Component {
    @property(cc.Node) public player: cc.Node = null;
    @property(cc.Prefab) public ballPrefab: cc.Prefab = null;

    // ======================
    // 🔥 外部调用：传入等级，一次性合成最终结果
    // ======================
    public checkMergeImmediately(targetLevel: number) {
        if (Launch.isGameOver) return;
        // 开始递归合成（只处理指定等级）
        this.mergeLoop(targetLevel);
    }

    // 递归合成：直到无法合成为止
    private mergeLoop(currentLevel: number) {
        // 1. 获取当前等级所有玩家球
        const allBalls = this.player.getComponentsInChildren(Ball);
        const targetBalls = allBalls.filter(ball => 
            ball && ball.isValid && ball.level === currentLevel
        );

        if (currentLevel > GameConfig.MAX_BALL_LEVEL) {
            let launch = cc.find("Canvas").getComponent(Launch);
            launch.gameWin();
            return;
        }

        // 不满足合成条件 → 终止
        if (targetBalls.length < 3 ) {
            return;
        }

        // ======================
        // 🔥 第一步：纯数据计算（不操作任何节点）
        // ======================
        const mergeCount = Math.floor(targetBalls.length / 3); // 可合成次数
        const needDestroyBalls = targetBalls.slice(0, mergeCount * 3); // 待销毁列表
        const newLevel = currentLevel + 1;
        const needGenerateCount = mergeCount; // 待生成数量

        // ======================
        // 🔥 第二步：统一销毁节点
        // ======================
        needDestroyBalls.forEach(ball => {
            if (ball && ball.isValid) ball.node.destroy();
        });

        // ======================
        // 🔥 第三步：统一生成高级球
        // ======================
        for (let i = 0; i < needGenerateCount; i++) {
            const newBall = cc.instantiate(this.ballPrefab);
            newBall.parent = this.player;
            // 生成在中心点附近
            newBall.setPosition(this.getRandomPosNearCenter());
            let ballComp = newBall.addComponent(Ball);
            ballComp.initBall(newLevel, 'playerBall');
            newBall.addComponent(BallCollision);
        }

        // 更新最高等级
        Launch.playerMaxLevel = Math.max(Launch.playerMaxLevel, newLevel);

        // 递归：继续检查新等级是否可合成
        this.mergeLoop(newLevel);
    }

    // 获取中心点附近随机位置（50px范围）
    private getRandomPosNearCenter(): cc.Vec2 {
        const radius = GameConfig.PLAYER_BALL_RADIUS;
        const angle = Math.random() * Math.PI * 2;
        const x = (Math.random() * radius) * Math.cos(angle);
        const y = (Math.random() * radius) * Math.sin(angle);
        return cc.v2(x, y);
    }
}
