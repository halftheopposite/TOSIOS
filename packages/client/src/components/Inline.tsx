import React, { Component } from 'react';

const SIZES = {
  thin: 4,
  xxs: 8,
  xs: 16,
  s: 24,
  m: 32,
  l: 48,
  xl: 64,
  xxl: 96,
  giant: 128,
};

type SizeNames = 'thin' | 'xxs' | 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl' | 'giant';

interface IProps {
  size: SizeNames;
}

class Inline extends Component<IProps> {

  render() {
    const {
      size,
    } = this.props;

    return (
      <span style={{ width: SIZES[size], minWidth: SIZES[size] }} />
    );
  }
}

export default Inline;
