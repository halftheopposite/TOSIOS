import { Button, Space, View } from './';
import { Inline } from './Inline';
import React from 'react';
import { Text } from './Text';
import { isMobile } from 'react-device-detect';

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
    const { id, roomName, roomMap, clients, maxClients, mode, onClick } = props;
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
                <RoomFieldItem title="Name" content={`"${roomName || `Unknown's room`}"`} />
                <Space size="xxs" />
                <RoomFieldItem title="Players" content={`"${clients}/${maxClients}"`} />
                <Space size="xxs" />
                <RoomFieldItem title="Map" content={`"${roomMap}"`} />
                <Space size="xxs" />
                <RoomFieldItem title="Mode" content={`"${mode}"`} />
            </View>
            {isMobile && <Space size="xs" />}

            {/* Button */}
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

export function RoomFieldItem(props: { title: string; content: string }): React.ReactElement {
    const { title, content } = props;

    return (
        <View style={{ display: 'flex', flexWrap: 'wrap' }}>
            <Text style={{ display: 'inline-block', fontWeight: 'bold' }}>{` ${title}:`}</Text>
            <Inline size="thin" />
            <Text style={{ display: 'inline-block', color: '#A9A9A9' }}>{content}</Text>
        </View>
    );
}
