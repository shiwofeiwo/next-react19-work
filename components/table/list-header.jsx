import React from 'react';
/**
 * Table.GroupHeader
 * @order 2
 **/
export default class ListHeader extends React.Component {
    static defaultProps = {
        cell: () => '',
        hasSelection: true,
        hasChildrenSelection: false,
        useFirstLevelDataWhenNoChildren: false,
    };

    static _typeMark = 'listHeader';

    render() {
        return null;
    }
}
