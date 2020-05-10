import React, { CSSProperties } from 'react';
import { Space, Text } from '../../components';
import { Container } from './';
import { isMobile } from 'react-device-detect';

/**
 * Render the time left in current game mode.
 */
export const Time = React.memo(
    (props: { mode: string; endsAt: number; style?: CSSProperties }): React.ReactElement => {
        const { mode, endsAt, style } = props;
        const [timeText, setTimeText] = React.useState('00:00');

        React.useEffect(() => {
            const interval = setInterval(() => {
                const delta = endsAt ? endsAt - Date.now() : 0;
                if (delta > 0) {
                    const minutesLeft = getMinutes(delta / 1000);
                    const secondsLeft = getSeconds(delta / 1000);

                    setTimeText(`${getPadded(minutesLeft)}:${getPadded(secondsLeft)}`);
                } else {
                    setTimeText('00:00');
                    clearInterval(interval);
                }
            }, 500);

            return () => clearInterval(interval);
        }, [endsAt]);

        return (
            <Container
                style={{
                    ...styles.time,
                    ...style,
                }}
            >
                <Text style={styles.modeText}>{mode}</Text>
                <Space size="xs" />
                <Text style={styles.timeText}>{timeText}</Text>
            </Container>
        );
    },
);

function getMinutes(seconds: number): number {
    return Math.floor(seconds / 60);
}

function getSeconds(seconds: number): number {
    const left = Math.floor(seconds % 60);
    return left < 0 ? 0 : left;
}

function getPadded(time: number, padding: number = 2): string {
    return time.toString().padStart(padding, '0');
}

const styles: { [key: string]: CSSProperties } = {
    time: {
        flexDirection: 'column',
        alignItems: 'center',
    },
    modeText: {
        color: 'white',
        fontSize: isMobile ? 14 : 16,
        textTransform: 'capitalize',
    },
    timeText: {
        color: 'white',
        fontSize: isMobile ? 16 : 24,
    },
};
