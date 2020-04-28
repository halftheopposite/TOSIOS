import React, { CSSProperties } from 'react';
import { View } from '../../components';

const VIEW_HEIGHT = 56;

/**
 * Render the health of the player.
 */
export function Container(props: { 
    children: React.ReactNode;
    style?: CSSProperties;
}) {
    const { children, style } = props;

    return (
        <View 
            style={{
                ...styles.container,
                ...style,
            }}
        >
            {children}
        </View>
    )
}

const styles: { [key: string]: CSSProperties } = {
    container: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 8,
        padding: 8,
        paddingLeft: 16,
        paddingRight: 16,
        minHeight: VIEW_HEIGHT,
    },
}
