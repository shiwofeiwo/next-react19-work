import React, { Component } from 'react';
import CheckableItem from './checkable-item';
import type { RadioItemProps } from '../types';

export default class RadioItem extends Component<RadioItemProps> {
    static menuChildType = 'item';

    static defaultProps = {
        checked: false,
        disabled: false,
        onChange: () => {},
    };

    render() {
        return <CheckableItem role="menuitemradio" checkType="radio" {...this.props} />;
    }
}
