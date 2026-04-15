import React from 'react';
import TableContext from './context';

/**
 * Table.ColumnGroup
 * @order 1
 **/
export default class ColumnGroup extends React.Component {
    static contextType = TableContext;

    static defaultProps = {
        title: 'column-group',
    };

    static _typeMark = 'columnGroup';

    render() {
        return (
            <TableContext.Provider value={{ ...(this.context || {}), parent: this }}>
                {null}
            </TableContext.Provider>
        );
    }
}
