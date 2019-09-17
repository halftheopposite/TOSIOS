import React, { Component, CSSProperties, ReactNode } from 'react';

const BOX = {
  background: '#FFFFFF',
  boxShadow: '0 8px 16px rgba(9,30,66,.5)',
  border: '1px solid rgba(9,30,66,.5)',
  borderRadius: 8,
  padding: 16,
  overflow: 'hidden',
};

interface IProps {
  children: ReactNode;
  style?: CSSProperties;
}

class Box extends Component<IProps> {

  render() {
    const {
      style,
      children,
    } = this.props;

    return (
      <div
        style={{
          ...BOX,
          ...style,
        }}
      >
        {children}
      </div>
    );
  }
}

export default Box;
