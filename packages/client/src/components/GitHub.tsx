import { Inline, View } from './';
import React, { CSSProperties } from 'react';
import { GitHubIcon } from '../icons';
import { Text } from './Text';

const URL = 'https://github.com/halftheopposite/tosios';

const GITHUB: CSSProperties = {
    color: 'white',
    fontSize: 14,
};

export function GitHub(): React.ReactElement {
    return (
        <a href={URL}>
            <View flex center style={GITHUB}>
                <GitHubIcon />
                <Inline size="xxs" />
                <Text>GitHub (v0.14.0)</Text>
            </View>
        </a>
    );
}
