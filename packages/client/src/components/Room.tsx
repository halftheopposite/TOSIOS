import React from 'react';
import { isMobile } from 'react-device-detect';
import {
  Button,
  Space,
  View,
} from './';

const ROOM = {
  border: '2px solid rgba(9,30,66,.1)',
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

export function Room(props: {
  id: string;
  roomName: string;
  roomMap: string;
  clients: number;
  maxClients: number;
  mode: string;
  onClick: (id: string) => void;
}): React.ReactElement {
  const {
    id,
    roomName,
    roomMap,
    clients,
    maxClients,
    mode,
    onClick,
  } = props;
  const [hovered, setHovered] = React.useState(false);

  return (
    <View
      style={{
        ...ROOM,
        flexDirection: isMobile ? 'column' : 'row',
        ...(hovered && ROOM_HOVERED),
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onClick(id)}
    >
      <View>
        <p><b>{`Name: "${roomName || `Unknown's room`}"`}</b></p>
        <Space size="xxs" />
        <p><b>{`Players: [${clients}/${maxClients}]`}</b></p>
        <Space size="xxs" />
        <p><b>{`Map: "${roomMap}"`}</b></p>
        <Space size="xxs" />
        <p><b>{`Mode: "${mode}"`}</b></p>
      </View>
      {isMobile && <Space size="xs" />}
      <Button
        type="button"
        style={{
          marginLeft: 'auto',
          width: isMobile ? '100%' : 'fit-content',
        }}
      >
        Join
      </Button>
    </View>
  );
}
