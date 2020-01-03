import React, { CSSProperties } from 'react';

import { GitHubIcon } from '../images/icons';
import {
  Inline,
  View,
} from './';
import { Text } from './Text';

const URL = 'https://github.com/halftheopposite/tosios';

const GITHUB: CSSProperties = {
  color: 'white',
  fontSize: 14,
};

export function GitHub(props: {
}): React.ReactElement {
  return (
    <a href={URL}>
      <View
        flex={true}
        center={true}
        style={GITHUB}
      >
        <GitHubIcon />
        <Inline size="xxs" />
        <Text>GitHub</Text>
      </View>
    </a>
  );
}
