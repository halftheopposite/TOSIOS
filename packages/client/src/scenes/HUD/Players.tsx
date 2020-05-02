import React, { CSSProperties } from 'react';
import { Text, Inline } from '../../components';

import { Container } from './'
import { IconButton } from './IconButton';
import { MagicWand } from '../../images/icons';

/**
 * Render the players count.
 */
export const Players = React.memo((props: { 
    count?: number;
    maxCount?: number;
    style?: CSSProperties;
}): React.ReactElement => {
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
            <Inline size="xs" />
            <IconButton icon={MagicWand} onClick={() => {}} style={styles.menuButton} />
        </Container>
    );
})

const styles: { [key: string]: CSSProperties } = {
    players: {
        flexDirection: 'row',
    },
    playersText: {
        color: 'white',
        fontSize: 16,
    },
    menuButton: {
    },
}
