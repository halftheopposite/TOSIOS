import React, { Component } from 'react';

import {
  lockIcon,
  lockOpenIcon,
} from '../images/icons';
import Button from './Button';
import Inline from './Inline';

const ROOM = {
  border: '1px solid rgba(9,30,66,.1)',
  borderRadius: 8,
  padding: 8,
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
};

const ROOM_HOVERED = {
  backgroundColor: '#efefef33',
  filter: 'brightness(90%)',
  cursor: 'pointer',
};

interface IProps {
  id: string;
  roomName: string;
  roomMap: string;
  clients: number;
  maxClients: number;
  isPrivate: boolean;
  onClick: (id: string) => void;
}

interface IState {
  isHovered: boolean;
}

class Room extends Component<IProps, IState> {

  state: IState = {
    isHovered: false,
  };

  render() {
    const {
      isHovered,
    } = this.state;
    const {
      id,
      roomName,
      roomMap,
      clients,
      maxClients,
      isPrivate,
      onClick,
    } = this.props;

    return (
      <div
        style={{
          ...ROOM,
          ...(isHovered && ROOM_HOVERED),
        }}
        onMouseEnter={() => this.setState({ isHovered: true })}
        onMouseLeave={() => this.setState({ isHovered: false })}
        onClick={() => onClick(id)}
      >
        <img
          src={isPrivate ? lockIcon : lockOpenIcon}
          alt={isPrivate ? 'locked' : 'open'}
        />
        <Inline size="xxs" />
        <div>
          <p><b>{`${roomName} [${clients}/${maxClients}]`}</b></p>
        </div>
        <Button
          type="button"
          style={{ marginLeft: 'auto' }}
        >
          Join
        </Button>
      </div >
    );
  }
}

export default Room;
