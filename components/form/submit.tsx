import React from 'react';
import Button from '../button';
import { func, obj } from '../util';
import FormContext, { type FormContextValue } from './context';
import type { SubmitProps } from './types';

const SUBMIT_PROP_KEYS = ['onClick', 'validate', 'field', 'children'];

class Submit extends React.Component<SubmitProps> {
    static displayName = 'Submit';
    static defaultProps = {
        onClick: func.noop,
    };

    static contextType = FormContext;

    declare context: FormContextValue | null;

    handleClick = () => {
        const { onClick, validate } = this.props;
        const field = this.context?._formField || this.props.field;

        if (!field) {
            onClick!();
            return;
        }

        if (validate === true) {
            field.validate((errors: any) => {
                onClick!(field.getValues(), errors, field);
            });
        } else if (Array.isArray(validate)) {
            field.validate(validate, (errors: any) => {
                onClick!(field.getValues(), errors, field);
            });
        } else {
            onClick!(field.getValues(), null, field);
        }
    };

    render() {
        const { children } = this.props;

        return (
            <Button
                {...(obj.pickOthers(SUBMIT_PROP_KEYS, this.props) as any)}
                onClick={this.handleClick}
            >
                {children}
            </Button>
        );
    }
}

export default Submit;
