import { Types } from '@tosios/common';

export class Message {
  public type: Types.MessageType;
  public ts: number;
  public params: any;

  constructor(
    type: Types.MessageType,
    params?: any,
  ) {
    this.type = type;
    this.ts = Date.now();
    this.params = params;
  }

  get JSON() {
    return {
      type: this.type,
      ts: this.ts,
      params: this.params,
    };
  }
}
