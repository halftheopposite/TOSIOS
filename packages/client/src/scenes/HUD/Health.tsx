import React, { CSSProperties } from 'react';
import { Space, Text, View } from '../../components';

import { heartEmptyImage, heartFullImage } from '../../images';
import { Container } from './';
import { isMobile } from 'react-device-detect';

const HEART_SIZE = isMobile ? 24 : 36;

/**
 * Render the health of the player.
 */
export const Health = React.memo(
    (props: { name: string; lives: number; maxLives: number; style?: CSSProperties }): React.ReactElement => {
        const { name, lives, maxLives = 3, style } = props;

        // Create list of hearts
        const hearts = [];
        for (let i = 0; i < maxLives; i++) {
            const isFull = i < lives;

            hearts.push(
                <img
                    key={i}
                    src={isFull ? heartFullImage : heartEmptyImage}
                    alt={isFull ? 'full-heart' : 'empty-heart'}
                    width={HEART_SIZE}
                    height={HEART_SIZE}
                />,
            );
        }

        return (
            <Container
                style={{
                    ...styles.health,
                    ...style,
                }}
            >
                <Text style={styles.nameText}>{name}</Text>
                <Space size="xxs" />
                <View style={styles.hearts}>{hearts}</View>
            </Container>
        );
    },
);

const styles: { [key: string]: CSSProperties } = {
    health: {
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    nameText: {
        color: 'white',
        fontSize: isMobile ? 14 : 16,
    },
    hearts: {
        display: 'flex',
        alignItems: 'center',
    },
};
