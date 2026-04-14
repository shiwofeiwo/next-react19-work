import React from 'react';
import type { ValueItem } from './types';

export interface CheckboxGroupContextValue {
    onChange: (value: ValueItem, e: React.ChangeEvent<HTMLInputElement>) => void;
    __group__: boolean;
    selectedValue: ValueItem[];
    disabled: boolean;
    prefix: string;
}

const CheckboxGroupContext = React.createContext<CheckboxGroupContextValue | null>(null);

export default CheckboxGroupContext;
