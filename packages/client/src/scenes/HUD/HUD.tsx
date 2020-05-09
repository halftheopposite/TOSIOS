import { Health, Leaderboard, Menu, Messages, Players, Time } from './';
import React, { CSSProperties } from 'react';
import { Announce } from './Announce';
import { IPlayer } from '../../entities';
import { Types } from '@tosios/common';
import { View } from '../../components';
import { isMobile } from 'react-device-detect';

const HUD_PADDING = isMobile ? 16 : 24;

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
    leaderboardOpened: boolean;
}

/**
 * The interface displaying important information to the user:
 * - Lives
 * - Time left
 * - Number of players
 * - Chat
 * - Leaderboard
 * - Menu
 */
export const HUD = React.memo(
    (props: HUDProps): React.ReactElement => {
        const {
            playerId,
            gameMode,
            gameMap,
            gameModeEndsAt,
            roomName,
            playerName,
            playerLives,
            playerMaxLives,
            players,
            playersCount,
            playersMaxCount,
            messages,
            announce,
            leaderboardOpened,
        } = props;
        const [menuOpened, setMenuOpened] = React.useState(false);

        return (
            <View flex center fullscreen style={styles.hud}>
                {/* Health */}
                <Health name={playerName} lives={playerLives} maxLives={playerMaxLives} style={styles.health} />

                {/* Time */}
                <Time mode={gameMode} endsAt={gameModeEndsAt} style={styles.time} />

                {/* Players */}
                <Players
                    count={playersCount}
                    maxCount={playersMaxCount}
                    style={styles.players}
                    onMenuClicked={() => setMenuOpened(true)}
                />

                {/* Messages */}
                {isMobile ? null : <Messages messages={messages} style={styles.messages} />}

                {/* Announce */}
                <Announce announce={announce} style={styles.announce} />

                {/* Menu */}
                {menuOpened ? <Menu onClose={() => console.log('CLOSE')} /> : null}

                {/* Leaderboard */}
                {leaderboardOpened ? (
                    <Leaderboard
                        roomName={roomName}
                        mapName={gameMap}
                        mode={gameMode}
                        players={players}
                        playerId={playerId}
                    />
                ) : null}
            </View>
        );
    },
);

const styles: { [key: string]: CSSProperties } = {
    hud: {
        padding: HUD_PADDING,
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
};
