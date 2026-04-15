import React, { Component } from 'react';
import CheckableItem from './checkable-item';
import type { CheckboxItemProps } from '../types';

export default class CheckboxItem extends Component<CheckboxItemProps> {
    static menuChildType = 'item';

    static defaultProps = {
        checked: false,
        indeterminate: false,
        disabled: false,
        onChange: () => {},
        checkboxDisabled: false,
    };

    render() {
        const { checkboxDisabled, ...others } = this.props;
        return (
            <CheckableItem
                role="menuitemcheckbox"
                checkType="checkbox"
                checkDisabled={checkboxDisabled}
                {...others}
            />
        );
    }
}
