import React, { Component } from 'react';
/* eslint-disable react/prefer-stateless-function */
export default class Wrapper extends Component {
    render() {
        const { colGroup, children, tableWidth, component: Tag } = this.props;
        return (
            <Tag role="table" style={{ width: tableWidth }}>
                {colGroup}
                {children}
            </Tag>
        );
    }
}

Wrapper.defaultProps = {
    component: 'table',
};
