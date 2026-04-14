import React from 'react';

export interface NavContextValue {
    prefix?: string;
    mode?: string;
    iconOnly?: boolean;
    iconOnlyWidth?: string | number;
    iconTextOnly?: boolean;
    hasTooltip?: boolean;
    hasArrow?: boolean;
    isCollapse?: boolean;
}

const NavContext = React.createContext<NavContextValue>({});

export default NavContext;
