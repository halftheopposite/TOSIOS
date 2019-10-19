import React from 'react';

const SEPARATOR = {
  backgroundColor: '#efefef',
  height: 2,
  minHeight: 2,
};

export default function (props: {

}): React.ReactElement {
  return (
    <div
      style={{
        ...SEPARATOR,
      }}
    />
  );
}
