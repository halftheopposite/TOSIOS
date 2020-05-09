import React, { CSSProperties, SyntheticEvent } from 'react';

const INPUT: CSSProperties = {
    fontSize: 16,
    borderRadius: 8,
    height: 48,
    paddingLeft: 8,
    paddingRight: 8,
    outline: 'none',
    border: '1px solid #efefef',
    boxSizing: 'border-box',
    width: '100%',
    maxWidth: '100%',
};

export function Input(props: {
    value?: string;
    placeholder?: string;
    maxLength?: number;
    style?: CSSProperties;
    onChange?: (event: SyntheticEvent) => void;
}): React.ReactElement {
    const { value, placeholder, style, maxLength, onChange } = props;

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
