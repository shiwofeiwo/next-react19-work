import React, { Component } from 'react';
import ConfigProvider from '../config-provider';
import { obj } from '../util';
import type { CellProps } from './types';

const { pickOthers } = obj;

const CELL_PROP_KEYS = ['device', 'colSpan', 'rowSpan', 'component'];

/**
 * ResponsiveGrid.Cell
 */
class Cell extends Component<CellProps> {
    static _typeMark = 'responsive_grid_cell';
    static defaultProps = {
        component: 'div',
        device: 'desktop',
    };

    static displayName = 'Cell';

    render() {
        const { component, children } = this.props;
        const View = component!;

        const others = pickOthers(CELL_PROP_KEYS, this.props);

        return <View {...others}>{children}</View>;
    }
}

export default ConfigProvider.config(Cell);
