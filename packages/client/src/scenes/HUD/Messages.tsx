import { Inline, Space, Text, View } from '../../components';
import React, { CSSProperties, Fragment } from 'react';
import { Container } from '.';
import { Models } from '@tosios/common';
import { isMobile } from 'react-device-detect';

/**
 * Render the messages from the server.
 */
export const Messages = React.memo(
    (props: { messages: Models.MessageJSON[]; style?: CSSProperties }): React.ReactElement | null => {
        const { messages, style } = props;

        if (!messages.length) {
            return null;
        }

        return (
            <Container
                style={{
                    ...styles.messages,
                    ...style,
                }}
            >
                {messages.map((message, index) => (
                    <Fragment key={index}>
                        <Message key={message.ts} message={message} />
                        {messages.length > 1 && index < messages.length - 1 ? <Space size="xs" /> : null}
                    </Fragment>
                ))}
            </Container>
        );
    },
);

/**
 * Render a single message.
 */
function Message(props: { message: Models.MessageJSON }): React.ReactElement {
    const { message } = props;

    return (
        <View style={styles.message}>
            <Text style={styles.messageAuthorText}>{`${message.from}:`}</Text>
            <Inline size="xxs" />
            <Text style={styles.messageText}>{getFormattedMessage(message)}</Text>
        </View>
    );
}

function getFormattedMessage(message: Models.MessageJSON): string {
    switch (message.type) {
        case 'waiting':
            return 'Waiting for other players...';
        case 'start':
            return 'Game starts!';
        case 'stop':
            return 'Game ends...';
        case 'joined':
            return `${message.params.name} joins.`;
        case 'killed':
            return `${message.params.killerName} killed ${message.params.killedName}.`;
        case 'won':
            return `${message.params.name} wins!`;
        case 'left':
            return `${message.params.name} left.`;
        case 'timeout':
            return `Timeout...`;
        default:
            return '';
    }
}

const styles: { [key: string]: CSSProperties } = {
    messages: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        minHeight: 40,
    },
    message: {
        display: 'flex',
        flexDirection: 'row',
        opacity: isMobile ? 0.5 : 1,
    },
    messageAuthorText: {
        color: 'darkgray',
        fontSize: isMobile ? 12 : 16,
        textTransform: 'capitalize',
    },
    messageText: {
        color: 'white',
        fontSize: isMobile ? 12 : 16,
        alignItems: 'center',
    },
};
