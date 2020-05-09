import React, { CSSProperties, ReactNode } from 'react';

export const View = React.forwardRef(
    (
        props: {
            flex?: boolean;
            center?: boolean;
            column?: boolean;
            fullscreen?: boolean;
            backdrop?: boolean;
            children: ReactNode;
            style?: CSSProperties;
            onMouseEnter?: () => void;
            onMouseLeave?: () => void;
            onClick?: () => void;
        },
        ref: React.Ref<HTMLDivElement>,
    ): React.ReactElement => {
        const {
            flex = false,
            center = false,
            column = false,
            fullscreen = false,
            backdrop = false,
            children,
            style,
            onMouseEnter,
            onMouseLeave,
            onClick,
        } = props;

        return (
            <div
                ref={ref}
                style={{
                    ...(flex && FLEX),
                    ...(center && CENTER_FLEX),
                    ...(column && COLUMN_FLEX),
                    ...(fullscreen && FULLSCREEN),
                    ...(backdrop && BACKDROP),
                    ...style,
                }}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                onClick={onClick}
            >
                {children}
            </div>
        );
    },
);

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

const FULLSCREEN: CSSProperties = {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
};

const BACKDROP: CSSProperties = {
    backgroundColor: 'rgba(0,0,0,0.5)',
};
