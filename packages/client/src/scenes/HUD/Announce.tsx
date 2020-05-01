import React, { CSSProperties } from 'react';
import { Text } from '../../components';

import { Container } from './'

const ANNOUNCE_LIFETIME = 3000;
const ANNOUNCE_ANIM_TICK = 50;
const TICK = ANNOUNCE_ANIM_TICK / ANNOUNCE_LIFETIME;

/**
 * Render the players count.
 */
export const Announce = React.memo((props: { 
    announce: string;
    style?: CSSProperties;
}) => {
    const { announce, style } = props;
    const [opacity, setOpacity] = React.useState(0)

    // Whenever the announce changes
    React.useEffect(() => {
        if (!announce) {
            return;
        }

        setOpacity(1);
        const startedAt = Date.now();

        // Calculate how much we must take off each tick
        const intervalId = setInterval(() => {
            // Animation ended
            const delta = Date.now() - startedAt;
            if (delta > ANNOUNCE_LIFETIME) {
                setOpacity(0);
                clearInterval(intervalId);
                return;
            }

            setOpacity(prev => prev - TICK);
        }, ANNOUNCE_ANIM_TICK);
    }, [announce])

    return (
        <Container 
            style={{
                ...styles.announce,
                ...style,
                opacity,
            }}
        >
            <Text style={styles.announceText}>{announce}</Text>
        </Container>
    );
})

const styles: { [key: string]: CSSProperties } = {
    announce: {
    },
    announceText: {
        color: 'white',
        fontSize: 16,
    },
}
