import React from 'react';

// Table uses a single Context, all providers/consumers share it
// Each provider merges {...parentValue, ...ownValue}
const TableContext = React.createContext({});

export default TableContext;
