import React, { Component } from 'react';

const SEPARATOR = {
  backgroundColor: '#efefef',
  height: 1,
  minHeight: 1,
};

class Separator extends Component {

  render() {
    return (
      <div
        style={{
          ...SEPARATOR,
        }}
      />
    );
  }
}

export default Separator;
