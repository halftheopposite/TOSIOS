import React, { CSSProperties } from 'react';
import { View } from '../../components';

/**
 * A menu displaying important room actions and informations.
 */
export const Menu = React.memo(
    (props: { onClose?: () => void }): React.ReactElement => {
        const { onClose } = props;

        return (
            <View fullscreen flex center backdrop style={styles.menu}>
                WIP
            </View>
        );
    },
);

const styles: { [key: string]: CSSProperties } = {
    menu: {
        padding: 16,
    },
};
