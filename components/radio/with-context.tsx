import React from 'react';
import RadioGroupContext from './context';
import type { RadioGroupContextValue } from './context';
import type { RadioContext, RadioProps, WrappedRadio, Radio as RadioClass } from './types';

export default function withContext(Radio: typeof RadioClass) {
    class WrappedComp extends React.Component<RadioProps> implements WrappedRadio {
        static displayName = 'Radio';
        static contextType = RadioGroupContext;
        declare context: RadioGroupContextValue | null;

        radioRef: RadioClass | null;

        constructor(props: RadioProps) {
            super(props);
            this.radioRef = null;
        }

        focus() {
            if (this.radioRef) {
                this.radioRef.focus();
            }
        }

        render() {
            return (
                <Radio
                    ref={el => {
                        this.radioRef = el;
                    }}
                    {...this.props}
                    context={(this.context || {}) as RadioContext}
                />
            );
        }
    }

    return WrappedComp as typeof WrappedRadio;
}
