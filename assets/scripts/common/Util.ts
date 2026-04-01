// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

export default class Util {

    /**
     * 生成指定范围内的随机浮点数
     * @param min 最小值
     * @param max 最大值
     * @returns 随机浮点数
     */
    public static randomRange(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }

    /**
     * 生成指定范围内的随机整数
     * @param min 最小值（包含）
     * @param max 最大值（包含）
     * @returns 随机整数
     */
    public static randomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * 将值限制在指定范围内
     * @param value 要限制的值
     * @param min 最小值
     * @param max 最大值
     * @returns 限制后的值
     */
    public static clamp(value: number, min: number, max: number): number {
        return Math.max(min, Math.min(value, max));
    }

    /**
     * 获取碰撞对
     * @param a 碰撞器A
     * @param b 碰撞器B
     * @returns 碰撞对对象，如果不匹配则返回null
     */
    public static getCollisionPair(a: cc.Collider, b: cc.Collider) {
        // 玩家球 vs 野生球
        if (b.node.group === 'playerBall' && a.node.group === 'wildBall') {
            return { type: 'playerWild', player: b, wild: a };
        }
        if (a.node.group === 'playerBall' && b.node.group === 'wildBall') {
            return { type: 'playerWild', player: a, wild: b };
        }

        // 野生球 vs 野生球
        if (a.node.group === 'wildBall' && b.node.group === 'wildBall') {
            return { type: 'wildWild', a, b };
        }

        return null;
    }

    // 获取组件，如果不存在则添加
    // public static getOrAddComponent(node: cc.Node, type: typeof cc.Component): cc.Component {
    //     let comp = node.getComponent(type);
    //     if (!comp) {
    //         comp = node.addComponent(type);
    //     }
    //     return comp;
    // }
    public static getOrAddComponent<T extends cc.Component>(
        node: cc.Node,
        ctor: new () => T
    ): T {
        let comp = node.getComponent(ctor);
        if (!comp) {
            comp = node.addComponent(ctor);
        }
        return comp;
    }
}