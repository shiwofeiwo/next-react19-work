import React from 'react';
import TableContext from './context';

/**
 * Table.Column
 * @order 0
 **/
export default class Column extends React.Component {
    static contextType = TableContext;

    static defaultProps = {
        cell: value => value,
        filterMode: 'multiple',
        filterMenuProps: {
            subMenuSelectable: false,
        },
        filterProps: {},
        resizable: false,
        asyncResizable: false,
    };

    static _typeMark = 'column';

    render() {
        return null;
    }
}
