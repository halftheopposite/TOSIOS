import React, { CSSProperties } from 'react';

import { githubIcon } from '../images/icons';
import {
  Inline,
  View,
} from './';

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
        <img
          src={githubIcon}
          alt="TOSIOS GitHub repository"
        />
        <Inline size="xxs" />
        <p>GitHub</p>
      </View>
    </a>
  );
}
