import React, { CSSProperties } from 'react';

const SEPARATOR = {
    backgroundColor: '#efefef',
};

const HORIZONTAL: CSSProperties = {
    height: 2,
    minHeight: 2,
};

const VERTICAL: CSSProperties = {
    width: 2,
    minWidth: 2,
    display: 'inline-block',
};

export function Separator(props: { mode?: 'vertical' | 'horizontal' }): React.ReactElement {
    const { mode = 'horizontal' } = props;

    return (
        <div
            style={{
                ...SEPARATOR,
                ...(mode === 'horizontal' ? HORIZONTAL : VERTICAL),
            }}
        />
    );
}
