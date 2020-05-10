import React, { CSSProperties } from 'react';
import { View } from '../../components';
import { isMobile } from 'react-device-detect';
import { useHover } from '../../hooks';

const VIEW_HEIGHT = 56;

/**
 * Render the health of the player.
 */
export function Container(props: {
    children: React.ReactNode;
    style?: CSSProperties;
    onHovered?: (hovered: boolean) => void;
    onClick?: () => void;
}) {
    const { children, style, onHovered, onClick } = props;
    const [ref, hovered] = useHover();

    React.useEffect(() => {
        if (onHovered) {
            onHovered(hovered);
        }
    }, [hovered, onHovered]);

    return (
        <View
            ref={ref}
            style={{
                ...styles.container,
                ...(isMobile ? { padding: 8, minHeight: 0 } : {}),
                ...style,
            }}
            onClick={onClick}
        >
            {children}
        </View>
    );
}

const styles: { [key: string]: CSSProperties } = {
    container: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 8,
        paddingTop: 8,
        paddingBottom: 8,
        paddingLeft: 16,
        paddingRight: 16,
        minHeight: VIEW_HEIGHT,
    },
};
