import React, { Component, CSSProperties, ReactNode } from 'react';

const BUTTON: CSSProperties = {
  fontSize: 16,
  borderRadius: 8,
  padding: '8px 16px 8px 16px',
  outline: 'none',
  border: 'none',
  cursor: 'pointer',
  backgroundColor: '#375a7f',
  color: 'white',
  minHeight: 48,
};

const BUTTON_HOVERED: CSSProperties = {
  filter: 'brightness(90%)',
};

const ICON: CSSProperties = {
  width: 20,
  height: 20,
};

interface IState {
  hovered: boolean;
}

interface IProps {
  type?: 'button' | 'submit';
  text?: string;
  children?: ReactNode;
  style?: CSSProperties;
  icon?: string;
  title?: string;
  onClick?: () => void;
}

export default class Button extends Component<IProps, IState> {

  state: IState = {
    hovered: false,
  };

  render() {
    const {
      hovered,
    } = this.state;
    const {
      type = 'button',
      text,
      children,
      style,
      icon,
      title,
      onClick,
    } = this.props;

    return (
      <button
        type={type}
        style={{
          ...BUTTON,
          ...(hovered && BUTTON_HOVERED),
          ...style,
        }}
        onMouseEnter={() => this.setState({ hovered: true })}
        onMouseLeave={() => this.setState({ hovered: false })}
        title={title}
        onClick={onClick}
      >
        {icon ?
          <img src={icon} alt="icon" style={ICON} /> :
          text || children
        }
      </button>
    );
  }
}
