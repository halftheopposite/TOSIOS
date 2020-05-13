import {
    Box,
    RoomFieldItem,
    Separator,
    Space,
    Table,
    TableCell,
    TableHeader,
    TableRow,
    Text,
    View,
} from '../../components';
import { Models, Sorts, Types } from '@tosios/common';
import React, { CSSProperties, Fragment } from 'react';

/**
 * A leaderboard of all players.
 */
export function Leaderboard(props: {
    roomName: string;
    mapName: string;
    mode: string;
    players?: Models.PlayerJSON[];
    playerId: string;
}): React.ReactElement {
    const { roomName, mapName, mode, players = [], playerId } = props;
    const isDeathmatch = mode === 'deathmatch';

    return (
        <View fullscreen backdrop flex center style={styles.leaderboard}>
            <Box style={styles.box}>
                {/* Header */}
                <View>
                    <RoomFieldItem title="Title" content={`"${roomName}"`} />
                    <Space size="xxs" />
                    <RoomFieldItem title="Map" content={`"${mapName}"`} />
                </View>
                <Space size="xs" />
                <Separator />
                <Space size="xs" />

                {/* Lists */}
                {isDeathmatch ? (
                    <DeathMatch players={players} playerId={playerId} />
                ) : (
                    <TeamDeathMatch players={players} playerId={playerId} />
                )}
            </Box>
        </View>
    );
}

/**
 * A single table of all players.
 */
function DeathMatch(props: { players: Models.PlayerJSON[]; playerId: string }): React.ReactElement {
    const { players, playerId } = props;

    return (
        <Table>
            <PlayersListHeader />
            <PlayersList players={players} playerId={playerId} />
        </Table>
    );
}

/**
 * Two tables representing each team.
 */
function TeamDeathMatch(props: { players: Models.PlayerJSON[]; playerId: string }): React.ReactElement {
    const { players, playerId } = props;

    const redPlayers: Models.PlayerJSON[] = [];
    const bluePlayers: Models.PlayerJSON[] = [];

    players.forEach((player) => {
        if (player.team === 'Red') {
            redPlayers.push(player);
        } else {
            bluePlayers.push(player);
        }
    });

    return (
        <>
            <Table>
                <PlayersListHeader team="Red" />
                <PlayersList players={redPlayers} playerId={playerId} />
            </Table>

            <Space size="m" />

            <Table>
                <PlayersListHeader team="Blue" />
                <PlayersList players={bluePlayers} playerId={playerId} />
            </Table>
        </>
    );
}

/**
 * Render a list of players.
 */
function PlayersListHeader(props: { team?: Types.Teams }): React.ReactElement {
    const { team } = props;
    const textStyle = {
        color: team || 'black',
    };

    return (
        <TableRow>
            <TableHeader>
                <Text style={textStyle}>#</Text>
            </TableHeader>
            <TableHeader>
                <Text style={textStyle}>Name</Text>
            </TableHeader>
            <TableHeader>
                <Text style={textStyle}>Kills</Text>
            </TableHeader>
        </TableRow>
    );
}

/**
 * Render a list of players.
 */
function PlayersList(props: { players: Models.PlayerJSON[]; playerId: string }): any {
    const { players, playerId } = props;

    return players
        .sort((a, b) => Sorts.sortNumberDesc(a.kills, b.kills))
        .map((player, index) => (
            <Fragment key={index}>
                <PlayerListItem key={player.playerId} index={index} player={player} playerId={playerId} />
            </Fragment>
        ));
}

/**
 * Render a player item.
 */
function PlayerListItem(props: { index: number; player: Models.PlayerJSON; playerId: string }): React.ReactElement {
    const { index, player, playerId } = props;
    const isMe = playerId === player.playerId;
    const isDead = player.lives === 0;
    const style = {
        ...(isDead ? styles.playerDead : {}),
    };

    return (
        <TableRow key={index}>
            <TableCell>
                <Text style={style}>{`${index + 1}`}</Text>
            </TableCell>
            <TableCell>
                <Text style={style}>{isMe ? 'You' : player.name}</Text>
            </TableCell>
            <TableCell>
                <Text style={style}>{player.kills}</Text>
            </TableCell>
        </TableRow>
    );
}

const styles: { [key: string]: CSSProperties } = {
    leaderboard: {
        position: 'fixed',
        padding: 16,
    },
    box: {
        boxSizing: 'border-box',
        maxHeight: '100%',
        overflowY: 'scroll',
    },
    playerDead: {
        opacity: 0.2,
    },
};
