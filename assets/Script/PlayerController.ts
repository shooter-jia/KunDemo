import Launch from "./Launch";
import GameConfig from './GameConfig';

const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayerController extends cc.Component {
    @property(cc.Node)
    public playerGroup: cc.Node = null; // 主角组

    private moveSpeed: number = 120; // 移动速度
    private touchStartPos: cc.Vec2 = cc.v2(0, 0); // 触摸起点（轮盘中心）
    private isTouching: boolean = false; // 是否触摸中
    private moveDir: cc.Vec2 = cc.v2(0, 0); // 移动方向

    onLoad() {
        // 注册触摸事件（注册在Canvas，全局响应触摸，修复原触摸区域限制问题）
        cc.Canvas.instance.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        cc.Canvas.instance.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        cc.Canvas.instance.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        cc.Canvas.instance.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    start() {
        // 初始化主角位置在地图中心
        const center = GameConfig.MAP_SIZE / 2;
        this.playerGroup.setPosition(center, center);
    }

    update(dt: number) {
        if (Launch.isGameOver || !this.isTouching) return;
        // 计算移动位置
        const moveX = this.playerGroup.x + this.moveDir.x * this.moveSpeed * dt;
        const moveY = this.playerGroup.y + this.moveDir.y * this.moveSpeed * dt;
        const limit = GameConfig.MAP_SIZE;

        // ✅ 修正：Cocos Creator 2.4.0 原生边界限制（无cc.clampf）
        const finalX = Math.max(0, Math.min(moveX, limit));
        const finalY = Math.max(0, Math.min(moveY, limit));
        this.playerGroup.setPosition(finalX, finalY);
    }

    // 触摸开始：记录轮盘中心
    private onTouchStart(event: cc.Touch) {
        this.touchStartPos = event.getLocation();
        this.isTouching = true;
    }

    // 触摸移动：计算移动方向
    private onTouchMove(event: cc.Touch) {
        const touchPos = event.getLocation();
        const dir = touchPos.sub(this.touchStartPos);
        if (dir.mag() > 0) {
            this.moveDir = dir.normalize();
        }
    }

    // 触摸结束：停止移动
    private onTouchEnd() {
        // this.isTouching = false;
        // this.moveDir = cc.v2(0, 0);
    }

    onDestroy() {
        // 销毁触摸事件，防止内存泄漏
        cc.Canvas.instance.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        cc.Canvas.instance.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        cc.Canvas.instance.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        cc.Canvas.instance.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }
}