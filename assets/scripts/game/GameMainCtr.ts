import WildBallMove from "../component/WildBallMove";
import GameConfig from '../config/GameConfig';
import Ball from "../component/Ball";
import BallCollision from "../component/BallCollision";
import MergeManager from "./MergeManager";
import Util from "../common/Util";
import BallPools from "./BallPools";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameMainCtr extends cc.Component {
    public static isGameOver = false;
    public static playerMaxLevel = GameConfig.PLAYER_INIT_LEVEL;

    // 节点引用
    @property(cc.Node)
    public playerGroup: cc.Node = null; // 主角组
    @property(cc.Node)
    public wildBallRoot: cc.Node = null; // 野生球父节点
    @property(cc.Prefab)
    public wildBallPrefab: cc.Prefab = null; // 野生球预制体
    @property(cc.Node)
    public uiPanel: cc.Node = null; // UI面板

    private wildCount = 0;
    private spawnTimer = 0;
    megerMgr: MergeManager;

    onLoad() {

    }

    start() {
        this.initUIElements();
        this.initCollision();
        this.initPlayerBall();
        this.initWildBalls();
    }

    private initUIElements() {
        this.uiPanel.active = false;
        this.megerMgr = this.node.getComponent(MergeManager);
        const btn = this.uiPanel.getChildByName('btnRestart')?.getComponent(cc.Button);
        if (btn) {
            btn.node.on('click', this.onRestartGame, this);
        }
    }

    private initCollision() {
        const manager = cc.director.getCollisionManager();
        manager.enabled = true;
        manager.enabledDebugDraw = true;
    }

    private initPlayerBall() {
        const ballNode = BallPools.get(this.wildBallPrefab, 'ball', this.playerGroup);
        const ball = Util.getOrAddComponent(ballNode, Ball);
        ball.init(GameMainCtr.playerMaxLevel, 'playerBall');
        Util.getOrAddComponent(ballNode, BallCollision);
        ballNode.setPosition(0, 0);
    }

    private initWildBalls() {
        for (let i = 0; i < GameConfig.WILD_INIT_COUNT; i++) this.spawnWildBall();
    }

    update(dt: number) {
        if (GameMainCtr.isGameOver || this.wildCount >= GameConfig.WILD_MAX_COUNT) return;
        this.spawnTimer += dt;
        if (this.spawnTimer >= GameConfig.SPAWN_INTERVAL) {
            this.spawnWildBall();
            this.spawnTimer = 0;
        }
    }


    // 🔥 核心：代码动态挂载所有组件（无手动操作）
    private spawnWildBall() {
        // 1. 从对象池获取野生球节点
        const ballNode = BallPools.get(this.wildBallPrefab, 'ball', this.wildBallRoot);
        ballNode.anchorX = 0.5;
        ballNode.anchorY = 0.5;

        // 2. 随机位置（边界安全）
        const x = Util.randomRange(50, GameConfig.MAP_SIZE - 50);
        const y = Util.randomRange(50, GameConfig.MAP_SIZE - 50);
        ballNode.setPosition(x, y);

        // ======================
        // 代码自动挂载所有组件
        // ======================

        // 挂载小球基类组件
        const ballComp = Util.getOrAddComponent(ballNode, Ball);
        
        // 代码挂载野生球随机移动组件（你的核心需求）
        const moveComp = Util.getOrAddComponent(ballNode, WildBallMove);
        moveComp.init();

        Util.getOrAddComponent(ballNode, BallCollision);

        // 初始化等级
        const maxLv = Math.min(GameMainCtr.playerMaxLevel + 2, GameConfig.MAX_BALL_LEVEL);
        const lv = Util.randomInt(1, maxLv);
        ballComp.init(lv, 'wildBall');

        this.wildCount++;
    }


    // 减少野生球计数
    public reduceWildBallCount() {
        this.wildCount = Math.max(0, this.wildCount - 1);
    }

        // 吞噬野生球 → 生成玩家球
    public eatWildBall(wildNode: cc.Node, level: number) {
        // 将野生球放回对象池
        BallPools.put(wildNode, 'ball');
        this.reduceWildBallCount();

        // 玩家节点下 50px 范围内随机生成
        const ball = BallPools.get(this.wildBallPrefab, 'ball', this.playerGroup);
        const ballComp = Util.getOrAddComponent(ball, Ball);
        // 设置分组+等级
        ballComp.init(level, 'playerBall');
        Util.getOrAddComponent(ball, BallCollision);
        ball.setAnchorPoint(0.5, 0.5);

        const rad = Math.random() * GameConfig.PLAYER_BALL_RADIUS;
        const angle = Math.random() * Math.PI * 2;
        const x = rad * Math.cos(angle);
        const y = rad * Math.sin(angle);
        ball.setPosition(x, y);
        this.megerMgr.checkMergeImmediately(level);
    }

    public onRestartGame() {
        // 1. 恢复场景运行
        cc.director.resume();
        // 2. 重置全局状态
        GameMainCtr.isGameOver = false;
        GameMainCtr.playerMaxLevel = GameConfig.PLAYER_INIT_LEVEL;
        this.spawnTimer = 0;

        // 3. 将所有野生球放回对象池
        const wildBalls = this.wildBallRoot.children.slice();
        for (const ball of wildBalls) {
            BallPools.put(ball, 'ball');
        }
        this.wildCount = 0;

        // 4. 将所有玩家球放回对象池
        const playerBalls = this.playerGroup.children.slice();
        for (const ball of playerBalls) {
            BallPools.put(ball, 'ball');
        }

        // 5. 重新生成初始野生球
        this.initPlayerBall();
        this.initWildBalls();

        // 6. 隐藏失败弹窗
        if (this.uiPanel) {
            this.uiPanel.active = false;
        }

        const playerController = this.playerGroup.getComponent('PlayerController');
        if (playerController) {
            playerController.init();
        }

        cc.log('游戏已重置！');
    }

    private showWinView() {
        this.uiPanel.active = true;
        this.uiPanel.getChildByName('lb').getComponent(cc.Label).string = '游戏胜利';
    }

    private showLoseView() {
        this.uiPanel.active = true;
        this.uiPanel.getChildByName('lb').getComponent(cc.Label).string = '游戏失败';
    }

    public checkGameOver() {
        // 游戏失败
        const balls = this.playerGroup.childrenCount;
        console.log("检查游戏结束，玩家球数量：", balls);
        if (balls == 0) {
            this.gameOver();
        }
    }

    // 游戏失败
    public gameOver() {
        GameMainCtr.isGameOver = true;
        cc.director.pause();
        this.showLoseView();
        cc.log('游戏失败！场景已暂停');
    }

    public gameWin() {
        GameMainCtr.isGameOver = true;
        cc.director.pause();
        this.showWinView();
        cc.log('游戏胜利！场景已暂停');
    }
}
