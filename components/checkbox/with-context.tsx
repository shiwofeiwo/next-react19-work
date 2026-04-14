import * as React from 'react';
import CheckboxGroupContext, { type CheckboxGroupContextValue } from './context';
import { type PrivateCheckboxProps } from './checkbox';
import { type CheckboxProps } from './types';

export type CheckboxContext = CheckboxGroupContextValue | Partial<CheckboxGroupContextValue>;

export default function withCheckboxContext(
    Checkbox: React.ComponentType<PrivateCheckboxProps>
): React.ComponentType<CheckboxProps> {
    return class WrappedComp extends React.Component<CheckboxProps> {
        static displayName = 'Checkbox';
        static contextType = CheckboxGroupContext;

        declare context: CheckboxGroupContextValue | null;

        render() {
            return <Checkbox {...this.props} context={this.context || {}} />;
        }
    };
}
