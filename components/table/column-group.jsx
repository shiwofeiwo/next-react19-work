import React from 'react';
import PropTypes from 'prop-types';
import TableContext from './context';

/**
 * Table.ColumnGroup
 * @order 1
 **/
export default class ColumnGroup extends React.Component {
    static propTypes = {
        /**
         * 表头显示的内容
         */
        title: PropTypes.oneOfType([PropTypes.element, PropTypes.node, PropTypes.func]),
    };

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
