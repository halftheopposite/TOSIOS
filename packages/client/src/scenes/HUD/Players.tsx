import React, { CSSProperties } from 'react';
import { Text, Inline } from '../../components';

import { Container } from './'
import { IconButton } from './IconButton';
import { MagicWand } from '../../images/icons';
import { isMobile } from 'react-device-detect';

/**
 * Render the players count.
 */
export const Players = React.memo((props: { 
    count?: number;
    maxCount?: number;
    style?: CSSProperties;
}): React.ReactElement => {
    const { count, maxCount, style } = props;
    const playersText = isMobile ? `${count}/${maxCount}` : `Players (${count}/${maxCount})`;

    return (
        <Container 
            style={{
                ...styles.players,
                ...style,
            }}
        >
            <Text style={styles.playersText}>{playersText}</Text>
            <Inline size="xs" />
            <IconButton 
                icon={MagicWand}
                onClick={() => {}}
                style={{
                    ...styles.menuButton,
                    ...(isMobile ? { width: 40, height: 40 } : {}),
                }}
            />
        </Container>
    );
})

const styles: { [key: string]: CSSProperties } = {
    players: {
        flexDirection: 'row',
    },
    playersText: {
        color: 'white',
        fontSize: isMobile ? 14 : 16,
    },
    menuButton: {
    },
}
