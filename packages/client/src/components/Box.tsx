import React, { CSSProperties, ReactNode } from 'react';

const BOX = {
    background: '#FFFFFF',
    boxShadow: '0 8px 16px rgba(9,30,66,.5)',
    border: '1px solid rgba(9,30,66,.5)',
    borderRadius: 8,
    padding: 16,
    overflow: 'hidden',
};

export function Box(props: { style?: CSSProperties; children: ReactNode }): React.ReactElement {
    const { style, children } = props;

    return (
        <div
            style={{
                ...BOX,
                ...style,
            }}
        >
            {children}
        </div>
    );
}
