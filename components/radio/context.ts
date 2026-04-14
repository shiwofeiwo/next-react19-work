import React from 'react';
import type { RadioValue } from './types';

export interface RadioGroupContextValue {
    onChange: (value: RadioValue, e: React.ChangeEvent<HTMLInputElement>) => void;
    __group__: boolean;
    isButton: boolean;
    selectedValue: RadioValue | undefined;
    disabled: boolean;
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null);

export default RadioGroupContext;
