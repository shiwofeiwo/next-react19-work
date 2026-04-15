import React, { Component } from 'react';
import classNames from 'classnames';

import ConfigProvider from '../config-provider';
import FormContext, { type FormContextValue } from './context';
import type { ErrorProps } from './types';
import type NextField from '../field';

class Error extends Component<ErrorProps> {
    static displayName = 'Error';
    static defaultProps = {
        prefix: 'next-',
        preferMarginToDisplayHelp: false,
    };

    static contextType = FormContext;

    static _typeMark = 'form_error';

    declare context: FormContextValue | null;

    itemRender = (errors: React.ReactNode[]) => {
        return errors.length ? errors : null;
    };

    render() {
        const {
            children,
            name,
            prefix,
            style,
            className,
            field: _field,
            preferMarginToDisplayHelp,
            ...others
        } = this.props;

        if (children && typeof children !== 'function') {
            return (
                <div className={`${prefix}form-item-help`}>
                    {children}
                    {!!preferMarginToDisplayHelp && (
                        <div className={`${prefix}form-item-help-margin-offset`} />
                    )}
                </div>
            );
        }

        const field: NextField | undefined = this.context?._formField || _field;

        if (!field || !name) {
            return null;
        }

        const isSingle = typeof name === 'string';

        const names = isSingle ? [name] : name;
        const errorArr: React.ReactNode[] = [];

        if (names.length) {
            const errors = field.getErrors(names);
            Object.keys(errors).forEach(key => {
                if (errors[key]) {
                    errorArr.push(errors[key] as React.ReactNode);
                }
            });
        }

        let result = null;
        if (typeof children === 'function') {
            result = children(
                errorArr as unknown as Record<string, object>,
                isSingle ? field.getState(name) : undefined
            );
        } else {
            result = this.itemRender(errorArr);
        }

        if (!result) {
            return null;
        }

        const cls = classNames({
            [`${prefix}form-item-help`]: true,
            [className!]: className,
        });

        return (
            <div {...others} className={cls} style={style} role="alert">
                {result}
                {!!preferMarginToDisplayHelp && (
                    <div className={`${prefix}form-item-help-margin-offset`} />
                )}
            </div>
        );
    }
}

export default ConfigProvider.config(Error);
