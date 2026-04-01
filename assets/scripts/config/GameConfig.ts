// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameConfig  {
    static readonly MAP_SIZE = 3000;
    static readonly MAX_BALL_LEVEL = 10;
    static readonly PLAYER_BALL_RADIUS = 25; // 玩家球生成范围半径（直径50）
    static readonly WILD_MAX_COUNT = 150;
    static readonly WILD_INIT_COUNT = 40;
    static readonly SPAWN_INTERVAL = 1;
    static readonly PLAYER_INIT_LEVEL = 1; // 玩家初始等级
}

