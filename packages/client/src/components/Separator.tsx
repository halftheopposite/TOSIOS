import React from 'react';

const SEPARATOR = {
  backgroundColor: '#efefef',
  height: 2,
  minHeight: 2,
};

export function Separator(props: {}): React.ReactElement {
  return (
    <div
      style={{
        ...SEPARATOR,
      }}
    />
  );
}
