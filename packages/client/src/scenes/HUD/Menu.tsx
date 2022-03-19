import { Box, Button, Inline, Input, KeyboardKey, Space, Text, View } from '../../components';
import React, { CSSProperties } from 'react';
import { ArrowLeft } from '../../icons';
import { useAnalytics } from '../../hooks';

/**
 * A menu displaying important room actions and informations.
 */
export function Menu(props: { onClose?: () => void; onLeave?: () => void }): React.ReactElement {
    const { onClose, onLeave } = props;
    const roomURL = window.location.href;
    const inputRef = React.useRef<HTMLInputElement>(null);
    const analytics = useAnalytics();

    // Copy the room's link to the clipboard
    const copyToClipboard = () => {
        if (!inputRef.current) {
            return;
        }

        inputRef.current.select();
        window.document.execCommand('copy');
        inputRef.current.blur();

        analytics.track({
            category: 'Game',
            action: 'Share',
        });
    };

    return (
        <View fullscreen flex center backdrop style={styles.menu}>
            <Box style={styles.box}>
                {/* Share */}
                <Text style={styles.sectionTitle}>Share</Text>
                <Space size="xxs" />
                <Text style={styles.sectionDescription}>Copy this link to play with your friends.</Text>
                <Space size="xxs" />
                <View flex center>
                    <Input ref={inputRef} value={roomURL} />
                    <Inline size="xs" />
                    <Button text="Copy" style={{ width: 'fit-content' }} onClick={copyToClipboard} />
                </View>
                <Space size="m" />

                {/* Keys */}
                <Text style={styles.sectionTitle}>Keys</Text>
                <Space size="xxs" />
                <Text style={styles.sectionDescription}>The list of keys to play the game.</Text>
                <Space size="s" />

                {/* Keys: Move */}
                <Text style={styles.sectionKey}>Move:</Text>
                <Space size="xxs" />
                <View flex>
                    <KeyboardKey value="W" />
                    <Inline size="xxs" />
                    <KeyboardKey value="A" />
                    <Inline size="xxs" />
                    <KeyboardKey value="S" />
                    <Inline size="xxs" />
                    <KeyboardKey value="D" />
                    <Inline size="xxs" />

                    <Text>or</Text>

                    <Inline size="xxs" />
                    <KeyboardKey value="↑" />
                    <Inline size="xxs" />
                    <KeyboardKey value="←" />
                    <Inline size="xxs" />
                    <KeyboardKey value="↓" />
                    <Inline size="xxs" />
                    <KeyboardKey value="→" />
                </View>
                <Space size="s" />

                {/* Keys: Aim */}
                <Text style={styles.sectionKey}>Aim:</Text>
                <Space size="xxs" />
                <View flex>
                    <KeyboardKey value="Mouse" />
                </View>
                <Space size="s" />

                {/* Keys: Shoot */}
                <Text style={styles.sectionKey}>Shoot:</Text>
                <Space size="xxs" />
                <View flex>
                    <KeyboardKey value="Left click" />
                    <Inline size="xxs" />

                    <Text>or</Text>

                    <Inline size="xxs" />
                    <KeyboardKey value="Space" />
                </View>
                <Space size="s" />

                {/* Keys: Leaderboard */}
                <Text style={styles.sectionKey}>Leaderboard:</Text>
                <Space size="xxs" />
                <View flex>
                    <KeyboardKey value="Tab" />
                </View>
                <Space size="s" />

                {/* Keys: Menu */}
                <Text style={styles.sectionKey}>Menu:</Text>
                <Space size="xxs" />
                <View flex>
                    <KeyboardKey value="Escape" />
                </View>
                <Space size="m" />

                <View flex>
                    <Button onClick={onLeave} icon={ArrowLeft}>
                        Leave
                    </Button>
                    <Inline size="xxs" />
                    <Button reversed onClick={onClose}>
                        Close
                    </Button>
                </View>
            </Box>
        </View>
    );
}

const styles: { [key: string]: CSSProperties } = {
    menu: {
        position: 'fixed',
        padding: 16,
        zIndex: 1000,
        pointerEvents: 'all',
    },
    box: {
        boxSizing: 'border-box',
        maxHeight: '100%',
        maxWidth: 500,
        overflowY: 'scroll',
    },
    sectionTitle: {
        color: 'black',
        fontSize: 18,
    },
    sectionDescription: {
        color: '#A9A9A9',
    },
    sectionKey: {
        fontSize: 14,
    },
};
