import React from 'react';
/* eslint-disable react/prefer-stateless-function */
export default class FixedWrapper extends React.Component {    render() {
        const { children, wrapperContent, prefix } = this.props;
        return (
            <div className={`${prefix}table-inner`}>
                {children}
                {wrapperContent}
            </div>
        );
    }
}
