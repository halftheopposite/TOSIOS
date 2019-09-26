import React from 'react';

import Button from './Button';
import View from './View';

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

export default function (props: {
  id: string;
  roomName: string;
  roomMap: string;
  clients: number;
  maxClients: number;
  onClick: (id: string) => void;
}): React.ReactElement {
  const {
    id,
    roomName,
    roomMap,
    clients,
    maxClients,
    onClick,
  } = props;
  const [hovered, setHovered] = React.useState(false);

  return (
    <View
      style={{
        ...ROOM,
        ...(hovered && ROOM_HOVERED),
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onClick(id)}
    >
      <div>
        <p><b>{`${roomName} [${clients}/${maxClients}]`}</b></p>
      </div>
      <Button
        type="button"
        style={{ marginLeft: 'auto', width: 'fit-content' }}
      >
        Join
      </Button>
    </View>
  );
}
