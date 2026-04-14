import React from 'react';
import type { ContextState } from './types';

const ConfigContext = React.createContext<ContextState>({});

export default ConfigContext;
