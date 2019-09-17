import { Types } from '@tosios/common';

export class Action {
  public playerId: string;
  public ts: number;
  public type: Types.ActionType;
  public value: any;

  constructor(
    playerId: string,
    ts: number,
    type: Types.ActionType,
    value: any,
  ) {
    this.playerId = playerId;
    this.ts = ts;
    this.type = type;
    this.value = value;
  }
}
