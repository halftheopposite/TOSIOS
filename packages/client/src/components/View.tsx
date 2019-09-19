import React, { CSSProperties, ReactNode } from 'react';

const FLEX: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
};

const CENTER_FLEX: CSSProperties = {
  justifyContent: 'center',
};

export default function (props: {
  flex?: boolean;
  center?: boolean;
  children: ReactNode;
  style?: CSSProperties;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
}): React.ReactElement {
  const {
    flex = false,
    center = false,
    children,
    style,
    onMouseEnter,
    onMouseLeave,
    onClick,
  } = props;

  return (
    <div
      style={{
        ...(flex && FLEX),
        ...(center && CENTER_FLEX),
        ...style,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
