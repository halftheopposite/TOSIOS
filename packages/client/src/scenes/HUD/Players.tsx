import React, { CSSProperties } from 'react';
import { Text } from '../../components';

import { Container } from './'

/**
 * Render the players count.
 */
export const Players = React.memo((props: { 
    count?: number;
    maxCount?: number;
    style?: CSSProperties;
}) => {
    const { count, maxCount, style } = props;
    const playersText = `Players (${count}/${maxCount})`

    return (
        <Container 
            style={{
                ...styles.players,
                ...style,
            }}
        >
            <Text style={styles.playersText}>{playersText}</Text>
        </Container>
    );
})

const styles: { [key: string]: CSSProperties } = {
    players: {
    },
    playersText: {
        color: 'white',
        fontSize: 16,
    },
}
