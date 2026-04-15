import React from 'react';
import Button from '../button';
import { func, obj } from '../util';
import FormContext, { type FormContextValue } from './context';
import type { ResetProps } from './types';

const RESET_PROP_KEYS = ['names', 'onClick', 'toDefault', 'field', 'children'];

class Reset extends React.Component<ResetProps> {
    static displayName = 'Reset';
    static defaultProps = {
        onClick: func.noop,
    };

    static contextType = FormContext;

    declare context: FormContextValue | null;

    handleClick = () => {
        const { names, toDefault, onClick } = this.props;
        const field = this.context?._formField || this.props.field;

        if (!field) {
            onClick!();
            return;
        }

        if (toDefault) {
            field.resetToDefault(names);
        } else {
            field.reset(names);
        }

        onClick!();
    };

    render() {
        const { children } = this.props;

        return (
            <Button {...obj.pickOthers(RESET_PROP_KEYS, this.props)} onClick={this.handleClick}>
                {children}
            </Button>
        );
    }
}

export default Reset;
