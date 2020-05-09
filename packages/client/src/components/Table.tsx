import React, { CSSProperties } from 'react';

export function Table(props: { children?: React.ReactNode; style?: CSSProperties }): React.ReactElement {
    const { children, style } = props;

    return (
        <table
            style={{
                ...styles.table,
                ...style,
            }}
        >
            <tbody>{children}</tbody>
        </table>
    );
}

export function TableRow(props: { children?: React.ReactNode; style?: CSSProperties }): React.ReactElement {
    const { children, style } = props;

    return (
        <tr
            style={{
                ...styles.row,
                ...style,
            }}
        >
            {children}
        </tr>
    );
}

export function TableHeader(props: { children?: React.ReactNode; style?: CSSProperties }): React.ReactElement {
    const { children, style } = props;

    return (
        <th
            style={{
                ...styles.header,
                ...style,
            }}
        >
            {children}
        </th>
    );
}

export function TableCell(props: { children?: React.ReactNode; style?: CSSProperties }): React.ReactElement {
    const { children, style } = props;

    return (
        <td
            style={{
                ...styles.cell,
                ...style,
            }}
        >
            {children}
        </td>
    );
}

const styles: { [key: string]: CSSProperties } = {
    table: {
        border: '2px solid gray',
        borderRadius: 8,
        borderCollapse: 'collapse',
        width: '100%',
    },
    row: {
        height: 48,
        borderBottom: '2px solid gray',
    },
    header: {
        textAlign: 'center',
        padding: 8,
    },
    cell: {
        textAlign: 'center',
        padding: 8,
    },
};
