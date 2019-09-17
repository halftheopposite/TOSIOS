import React, { Component, CSSProperties, SyntheticEvent } from 'react';

const INPUT: CSSProperties = {
  fontSize: 16,
  borderRadius: 8,
  height: 48,
  paddingLeft: 8,
  paddingRight: 8,
  outline: 'none',
  border: '1px solid #efefef',
  boxSizing: 'border-box',
  minWidth: '100%',
};

interface IProps {
  value?: string;
  placeholder?: string;
  maxLength?: number;
  style?: CSSProperties;
  onChange?: (event: SyntheticEvent) => void;
}

export default class Input extends Component<IProps> {

  render() {
    const {
      value,
      placeholder,
      style,
      maxLength,
      onChange,
    } = this.props;

    return (
      <input
        type="text"
        value={value}
        style={{
          ...INPUT,
          ...style,
        }}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={onChange}
      />
    );
  }
}
