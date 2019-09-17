import React, { Component, CSSProperties, SyntheticEvent } from 'react';

const SELECT: CSSProperties = {
  fontSize: 16,
  borderRadius: 8,
  height: 48,
  paddingLeft: 8,
  paddingRight: 8,
  outline: 'none',
  border: '1px solid #efefef',
};

interface IProps {
  value?: string;
  values: Array<{
    value: string;
    title: string;
  }>;
  style?: CSSProperties;
  onChange?: (event: SyntheticEvent) => void;
}

export default class Select extends Component<IProps> {

  render() {
    const {
      value,
      values = [],
      style,
      onChange,
    } = this.props;

    const list = values.map(item => (
      <option
        key={item.value}
        value={item.value}
      >
        {item.title}
      </option>
    ));

    return (
      <select
        style={{
          ...SELECT,
          ...style,
        }}
        value={value}
        onChange={onChange}
      >
        {list}
      </select>
    );
  }
}
