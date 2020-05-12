export type ActionType = 'move' | 'rotate' | 'shoot';

export interface ActionJSON {
    type: ActionType;
    ts: number;
    playerId: string;
    value: any;
}
