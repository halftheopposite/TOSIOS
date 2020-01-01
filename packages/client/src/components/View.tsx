import React, { CSSProperties, ReactNode } from 'react';

const FLEX: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
};

const CENTER_FLEX: CSSProperties = {
  justifyContent: 'center',
};

const COLUMN_FLEX: CSSProperties = {
  flexDirection: 'column',
};

export function View(props: {
  flex?: boolean;
  center?: boolean;
  column?: boolean;
  children: ReactNode;
  style?: CSSProperties;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
}): React.ReactElement {
  const {
    flex = false,
    center = false,
    column = false,
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
        ...(column && COLUMN_FLEX),
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
