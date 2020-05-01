import React, { CSSProperties } from 'react';
import { View } from '../../components';
import { Health, Messages, Players, Time } from './';
import { Types } from '@tosios/common';
import { Announce } from './Announce';
import { IPlayer } from '../../entities';

const HUD_PADDING = 24;

export interface HUDProps {
    gameMode: string;
    gameMap: string;
    gameModeEndsAt: number;
    roomName: string;
    playerId: string;
    playerName: string;
    playerLives: number;
    playerMaxLives: number;
    players: IPlayer[];
    playersCount: number;
    playersMaxCount: number;
    messages: Types.Message[];
    announce: string;
}

/**
 * The interface displaying important information to the user:
 * - Lives
 * - Time left
 * - Chat
 */
export const HUD = React.memo((props: HUDProps): React.ReactElement => {
    const { 
        gameMode,
        gameModeEndsAt,
        playerName, 
        playerLives, 
        playerMaxLives,
        playersCount,
        playersMaxCount,
        messages,
        announce,
    } = props;

    return (
        <View style={styles.hud}>
            <Health 
                name={playerName}
                lives={playerLives}
                maxLives={playerMaxLives}
                style={styles.health}
            />
            <Time
                mode={gameMode}
                endsAt={gameModeEndsAt}
                style={styles.time}
            />
            <Players
                count={playersCount}
                maxCount={playersMaxCount}
                style={styles.players}
            />
            <Messages
                messages={messages}
                style={styles.messages}
            />
            <Announce
                announce={announce}
                style={styles.announce}
            />
        </View>
    )
});

const styles: { [key: string]: CSSProperties } = {
    hud: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        padding: HUD_PADDING,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    health: {
        position: 'absolute',
        left: HUD_PADDING,
        top: HUD_PADDING,
    },
    time: {
        position: 'absolute',
        top: HUD_PADDING,
        alignSelf: 'center',
    },
    players: {
        position: 'absolute',
        right: HUD_PADDING,
        top: HUD_PADDING,
    },
    messages: {
        position: 'absolute',
        left: HUD_PADDING,
        bottom: HUD_PADDING,
    },
    announce: {
        position: 'absolute',
    },
}