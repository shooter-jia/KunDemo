// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

/**
 * 对象池类，用于管理游戏对象的复用
 */
export default class BallPools {
    private static pools: Map<string, cc.Node[]> = new Map();

    /**
     * 从对象池获取对象，如果池中没有则创建新对象
     * @param prefab 预制体
     * @param poolName 池名称
     * @param parent 父节点
     * @returns 对象节点
     */
    public static get(prefab: cc.Prefab, poolName: string, parent?: cc.Node): cc.Node {
        let pool = this.pools.get(poolName);
        if (!pool) {
            pool = [];
            this.pools.set(poolName, pool);
        }

        let node: cc.Node;
        if (pool.length > 0) {
            // 从池中取出一个对象
            node = pool.pop();
            node.active = true;
        } else {
            // 池中没有对象，创建新对象
            node = cc.instantiate(prefab);
        }

        if (parent) {
            node.parent = parent;
        }

        return node;
    }

    /**
     * 将对象放回对象池
     * @param node 要回收的节点
     * @param poolName 池名称
     */
    public static put(node: cc.Node, poolName: string): void {
        if (!node || !cc.isValid(node)) return;

        // 找到自定义脚本组件（有 reset 方法）并执行 reset
        const components = node.getComponents(cc.Component);
        for (const comp of components) {
            if (comp && typeof (comp as any).reset === 'function') {
                try {
                    (comp as any).reset();
                } catch (e) {
                    cc.error('reset 失败：', comp, e);
                }
            }
        }

        // 重置节点状态
        node.active = false;
        node.removeFromParent();

        // 放回池中
        let pool = this.pools.get(poolName);
        if (!pool) {
            pool = [];
            this.pools.set(poolName, pool);
        }
        pool.push(node);
    }

    /**
     * 清空指定池
     * @param poolName 池名称
     */
    public static clear(poolName: string): void {
        const pool = this.pools.get(poolName);
        if (pool) {
            for (const node of pool) {
                if (cc.isValid(node)) {
                    node.destroy();
                }
            }
            pool.length = 0;
        }
    }

    /**
     * 清空所有池
     */
    public static clearAll(): void {
        this.pools.forEach((pool, poolName) => {
            this.clear(poolName);
        });
        this.pools.clear();
    }

    /**
     * 获取池中对象数量
     * @param poolName 池名称
     * @returns 对象数量
     */
    public static size(poolName: string): number {
        const pool = this.pools.get(poolName);
        return pool ? pool.length : 0;
    }
}