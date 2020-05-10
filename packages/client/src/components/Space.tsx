import React from 'react';

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

export function Space(props: { size: SizeNames }): React.ReactElement {
    const { size } = props;

    return <div style={{ height: SIZES[size], minHeight: SIZES[size] }} />;
}
