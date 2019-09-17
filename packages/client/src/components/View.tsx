import React, { Component, CSSProperties, ReactNode } from 'react';

const FLEX: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
};

const CENTER_FLEX: CSSProperties = {
  justifyContent: 'center',
};

interface IProps {
  flex?: boolean;
  center?: boolean;
  children: ReactNode;
  style?: CSSProperties;
}

class View extends Component<IProps> {

  render() {
    const {
      flex = false,
      center = false,
      children,
      style,
    } = this.props;

    return (
      <div
        style={{
          ...(flex && FLEX),
          ...(center && CENTER_FLEX),
          ...style,
        }}
      >
        {children}
      </div>
    );
  }
}

export default View;
