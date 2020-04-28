import React, { CSSProperties } from 'react';
import { Text, Space } from '../../components';

import { Container } from './'

/**
 * Render the time left in current game mode.
 */
export const Time = React.memo((props: { 
    mode?: string;
    endsAt?: number;
    style?: CSSProperties;
}) => {
    const { mode, endsAt, style } = props;

    // Compute time left
    const delta = endsAt ? endsAt - Date.now() : 0;
    let timeText = '00:00';
    if (delta > 0) {
        const minutesLeft = getMinutes(delta / 1000);
        const secondsLeft = getSeconds(delta / 1000);
  
        timeText = `${getPadded(minutesLeft)}:${getPadded(secondsLeft)}`;
    }

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
})

function getMinutes(seconds: number): number {
    return Math.floor(seconds / 60);
  };
  
function getSeconds(seconds: number): number {
    const left = Math.floor(seconds % 60);
    return left < 0 ? 0 : left;
};

function getPadded(time: number, padding: number = 2): string {
    return time.toString().padStart(padding, '0');
};

const styles: { [key: string]: CSSProperties } = {
    time: {
        flexDirection: 'column',
        alignItems: 'center',
    },
    modeText: {
        color: 'white',
        fontSize: 16,
        textTransform: 'capitalize',
    },
    timeText: {
        color: 'white',
        fontSize: 25,
    },
}
