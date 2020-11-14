import React, { CSSProperties } from 'react';
import { Container } from './';
import { Text } from '../../components';
import { isMobile } from 'react-device-detect';

const ANNOUNCE_LIFETIME = 3000;
const ANNOUNCE_ANIM_TICK = 50;
const TICK = ANNOUNCE_ANIM_TICK / ANNOUNCE_LIFETIME;

/**
 * Render an announce.
 */
export const Announce = React.memo((props: { announce?: string; style?: CSSProperties }): React.ReactElement | null => {
    const { announce, style } = props;
    const [opacity, setOpacity] = React.useState<number>(0);
    const [display, setDisplay] = React.useState<'none' | 'flex'>('none');
    const [displayedText, setDisplayedText] = React.useState(announce);
    const intervalRef = React.useRef<number>(0);

    const launchFade = () => {
        const startedAt = Date.now();

        // Calculate how much we must take off each tick
        intervalRef.current = window.setInterval(() => {
            const delta = Date.now() - startedAt;
            if (delta > ANNOUNCE_LIFETIME) {
                setOpacity(0);
                setDisplay('none');
                clearInterval(intervalRef.current);
                return;
            }

            setOpacity((prev) => prev - TICK);
        }, ANNOUNCE_ANIM_TICK);
    };

    // Whenever the announce changes
    React.useEffect(() => {
        if (!announce) {
            return;
        }

        setDisplayedText(announce);
        clearInterval(intervalRef.current);
        setOpacity(1);
        setDisplay('flex');
        launchFade();
    }, [announce]);

    if (!displayedText) {
        return null;
    }

    return (
        <Container
            style={{
                ...styles.announce,
                ...style,
                opacity,
                display,
            }}
        >
            <Text style={styles.announceText}>{displayedText}</Text>
        </Container>
    );
});

const styles: { [key: string]: CSSProperties } = {
    announce: {},
    announceText: {
        color: 'white',
        fontSize: isMobile ? 16 : 24,
    },
};
