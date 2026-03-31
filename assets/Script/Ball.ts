const { ccclass, property } = cc._decorator;

@ccclass
export default class Ball extends cc.Component {
    @property(cc.Label) public label: cc.Label = null;
    public level: number = 1;
    private group: string = '';

    public initBall(level: number, group: string) {
        this.label = this.node.getChildByName('lv')?.getComponent(cc.Label) || null;
        this.level = level;
        this.group = group;
        this.updateSize();
        this.updateLabel();
        this.setGroup();
    }

    private updateSize() {
        const size = 20 + (this.level - 1) * 10;
        this.node.setContentSize(size, size);
        const collider = this.getComponent(cc.CircleCollider);
        if (collider) collider.radius = size / 2;
    }

    private updateLabel() {
        if (this.label) this.label.string = this.level.toString();
    }

    private setGroup() {
        // const collider = this.getComponent(cc.CircleCollider);
        // if (collider) collider.group = this.group;
        this.node.active = false;
        this.node.group = this.group;
        this.node.active = true;

    }
}