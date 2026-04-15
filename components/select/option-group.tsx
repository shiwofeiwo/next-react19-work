import React from 'react';
import type { OptionGroupProps } from './types';

/**
 * Select.OptionGroup
 */
export default class OptionGroup extends React.Component<OptionGroupProps> {
    static _typeMark = 'next_select_option_group';

    static displayName = 'OptionGroup';

    render() {
        return this.props.children;
    }
}
