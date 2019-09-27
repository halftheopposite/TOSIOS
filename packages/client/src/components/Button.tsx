import React, { CSSProperties, ReactNode } from 'react';

const BUTTON_COLOR = '#375a7f';

const BUTTON: CSSProperties = {
  fontSize: 16,
  borderRadius: 8,
  padding: '8px 16px 8px 16px',
  outline: 'none',
  border: 'none',
  cursor: 'pointer',
  backgroundColor: BUTTON_COLOR,
  color: 'white',
  minHeight: 48,
  width: '100%',
  maxWidth: '100%',
};

const BUTTON_HOVERED: CSSProperties = {
  filter: 'brightness(90%)',
};

const BUTTON_REVERSED: CSSProperties = {
  backgroundColor: 'white',
  color: BUTTON_COLOR,
  border: `2px solid ${BUTTON_COLOR}`,
};

const BUTTON_ICON: CSSProperties = {
  width: 20,
  height: 20,
};

export default function (props: {
  type?: 'button' | 'submit';
  text?: string;
  children?: ReactNode;
  style?: CSSProperties;
  icon?: string;
  title?: string;
  reversed?: boolean;
  onClick?: () => void;
}): React.ReactElement {
  const {
    type = 'button',
    text,
    children,
    style,
    icon,
    title,
    reversed = false,
    onClick,
  } = props;
  const [hovered, setHovered] = React.useState(false);

  return (
    <button
      type={type}
      style={{
        ...BUTTON,
        ...(hovered && BUTTON_HOVERED),
        ...(reversed && BUTTON_REVERSED),
        ...style,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={title}
      onClick={onClick}
    >
      {icon ?
        <img src={icon} alt="icon" style={BUTTON_ICON} /> :
        text || children
      }
    </button>
  );
}
