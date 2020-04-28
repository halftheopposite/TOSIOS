import React, { CSSProperties } from 'react';
import { View, Text, Space } from '../../components';

import { Container } from './'
import heartEmpty from '../../images/textures/gui/heart-empty.png'
import heartFull from '../../images/textures/gui/heart-full.png'

const HEART_SIZE = 36;

/**
 * Render the health of the player.
 */
export const Health = React.memo((props: { 
    name: string;
    lives: number;
    maxLives: number;
    style?: CSSProperties;
}) => {
    const { name, lives, maxLives, style } = props;

    // Create list of hearts
    const hearts = [];
    for (let i = 0; i < maxLives; i++) {
        const isFull = i < lives;

        hearts.push(
            <img 
                src={isFull ? heartFull : heartEmpty} 
                alt={isFull ? 'full-heart' : 'empty-heart'}
                width={HEART_SIZE}
                height={HEART_SIZE}
            />
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
            <View style={styles.hearts}>
                {hearts}
            </View>
        </Container>
    )
})

const styles: { [key: string]: CSSProperties } = {
    health: {
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    nameText: {
        color: 'white',
        fontSize: 16,
    },
    hearts: {
        display: 'flex',
        alignItems: 'center',
    },
};
