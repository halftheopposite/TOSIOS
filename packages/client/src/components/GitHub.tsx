import React, { CSSProperties } from 'react';
import { version } from '../../../../package.json';
import { GitHubIcon } from '../icons';
import { Inline, View } from './';
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
                <Text>GitHub (v{version})</Text>
            </View>
        </a>
    );
}
