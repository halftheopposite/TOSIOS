import React, { CSSProperties, Fragment } from 'react';
import { View, Text, Inline, Space } from '../../components';

import { Container } from '.'
import { Types } from '@tosios/common';

/**
 * Render the messages from the server.
 */
export const Messages = React.memo((props: { 
    messages: Types.Message[];
    style?: CSSProperties;
}): React.ReactElement | null => {
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
            <View style={styles.hearts}>
                {messages.map((message, index) => (
                    <Fragment>
                        <Message key={message.ts} message={message} />
                        {messages.length > 1 && index < messages.length - 1 ? <Space size="xs" /> : null}
                    </Fragment>
                ))}
            </View>
        </Container>
    )
})

/**
 * Render a single message.
 */
function Message(props: {
    message: Types.Message;
}): React.ReactElement {
    const { message } = props;

    return (
        <View style={styles.message}>
            <Text style={styles.messageAuthorText}>{`${message.from}:`}</Text>
            <Inline size="xxs" />
            <Text style={styles.messageText}>{getFormattedMessage(message)}</Text>
        </View>
    );
}

function getFormattedMessage(message: Types.Message): string {
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
    },
    message: {
        display: 'flex',
        flexDirection: 'row',
    },
    messageAuthorText: {
        color: 'darkgray',
        fontSize: 16,
        textTransform: 'capitalize',
    },
    messageText: {
        color: 'white',
        fontSize: 16,
        alignItems: 'center',
    },
};
