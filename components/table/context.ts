import React from 'react';

// Table uses a single Context, all providers/consumers share it
// Each provider merges {...parentValue, ...ownValue}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TableContext = React.createContext<Record<string, any>>({});

export default TableContext;
