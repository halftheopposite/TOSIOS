import React, { CSSProperties } from 'react';

import { Container } from './';

const BUTTON_SIZE = 56;

/**
 * Render the players count.
 */
export const IconButton = React.memo(
    (props: {
        icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
        style?: CSSProperties;
        onClick: () => void;
    }): React.ReactElement => {
        const { icon: Icon, style, onClick } = props;
        const [hovered, setHovered] = React.useState(false);

        return (
            <Container
                style={{
                    ...styles.iconButton,
                    ...(hovered ? styles.iconButtonHovered : {}),
                    ...style,
                }}
                onHovered={(value: boolean) => setHovered(value)}
                onClick={onClick}
            >
                <Icon width={30} height={30} />
            </Container>
        );
    },
);

const styles: { [key: string]: CSSProperties } = {
    iconButton: {
        width: BUTTON_SIZE,
        height: BUTTON_SIZE,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        padding: 0,
        border: '1px solid rgba(255,255,255,0.5)',
    },
    iconButtonHovered: {
        cursor: 'pointer',
        color: 'black',
        backgroundColor: 'white',
        border: '1px solid rgba(255,255,255,1)',
    },
};
