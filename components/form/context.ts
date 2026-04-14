import React from 'react';

import type { default as NextField } from '../field';

export interface FormContextValue {
    _formField: NextField | null;
    _formSize: 'large' | 'small' | 'medium';
    _formDisabled: boolean;
    _formPreview: boolean;
    _formFullWidth: boolean;
    _formLabelForErrorMessage: boolean;
    _formMarginToDisplayHelp: boolean;
}

const FormContext = React.createContext<FormContextValue | null>(null);

export default FormContext;
