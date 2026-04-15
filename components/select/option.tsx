import React from 'react';
import type { OptionProps } from './types';

/**
 * Select.Option
 */
export default class Option extends React.Component<OptionProps> {
    static _typeMark = 'next_select_option';

    static displayName = 'Option';

    render() {
        return this.props.children;
    }
}
