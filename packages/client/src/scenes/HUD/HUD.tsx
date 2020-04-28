import React, { CSSProperties } from 'react';
import { View } from '../../components';
import { Health, Messages, Players, Time } from './';
import { Types } from '@tosios/common';

const HUD_PADDING = 24;

/**
 * The interface displaying important information to the user:
 * - Lives
 * - Time left
 * - Chat
 */
export function HUD(props: {
    gameMode?: string;
    gameModeEndsAt?: number;
    playerName?: string;
    playerLives?: number;
    playerMaxLives?: number;
    playersCount?: number;
    playersMaxCount?: number;
    messages: Types.Message[];
}): React.ReactElement {
    const { 
        gameMode = 'team deathmatch',
        gameModeEndsAt = (new Date()).setMinutes(59),
        playerName = 'HalfTheOpposite', 
        playerLives = 2, 
        playerMaxLives = 5,
        playersCount = 3,
        playersMaxCount = 8,
        messages = [],
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
        </View>
    )
}

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
}