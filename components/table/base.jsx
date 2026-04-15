import React from 'react';
import classnames from 'classnames';
import shallowElementEquals from 'shallow-element-equals';
import { polyfill } from 'react-lifecycles-compat';
import Loading from '../loading';
import ConfigProvider from '../config-provider';
import zhCN from '../locale/zh-cn';
import { log, obj, dom } from '../util';
import BodyComponent from './base/body';
import HeaderComponent from './base/header';
import WrapperComponent from './base/wrapper';
import RowComponent from './base/row';
import CellComponent from './base/cell';
import FilterComponent from './base/filter';
import SortComponent from './base/sort';
import Column from './column';
import ColumnGroup from './column-group';
import TableContext from './context';

const Children = React.Children,
    noop = () => {};

// All prop keys for Table component (includes ConfigProvider keys)
const TABLE_PROP_KEYS = [
    // ConfigProvider keys
    'prefix',
    'locale',
    'defaultPropsConfig',
    'errorBoundary',
    'pure',
    'warning',
    'rtl',
    'device',
    'children',
    'popupContainer',
    // Table-specific keys
    'tableLayout',
    'tableWidth',
    'className',
    'style',
    'size',
    'dataSource',
    'entireDataSource',
    'onRowClick',
    'onRowMouseEnter',
    'onRowMouseLeave',
    'onSort',
    'onFilter',
    'onResizeChange',
    'rowProps',
    'getRowClassName',
    'primaryKey',
    'sort',
    'crossHeight',
    'hasHeader',
    'hasBorder',
    'isLoading',
    'loading',
    'emptyContent',
    'noCol',
    'fixedHeader',
    'maxIndex',
    'offsetTop',
    'scrollToEnd',
    'onScroll',
    'stickyFooter',
    'footerHeight',
    'expandedRowRender',
    'expandedRowIndent',
    'indent',
    'filterMode',
    'filterProps',
    'pagination',
    'sortIcons',
    'showHover',
    'highlightRow',
    'rowSelection',
    'operation',
    'hidden',
    'lockType',
    'expandedIndexRender',
];

//<Table>
//    <Table.Column/>
//    <Table.ColumnGroup>
//      <Table.Column/>
//      <Table.Column/>
//    </Table.ColumnGroup>
//</Table>

/** Table */
class Table extends React.Component {
    static Column = Column;
    static ColumnGroup = ColumnGroup;
    static Header = HeaderComponent;
    static Body = BodyComponent;
    static Wrapper = WrapperComponent;
    static Row = RowComponent;
    static Cell = CellComponent;
    static Filter = FilterComponent;
    static Sort = SortComponent;

    static defaultProps = {
        dataSource: [],
        onRowClick: noop,
        onRowMouseEnter: noop,
        onRowMouseLeave: noop,
        onSort: noop,
        onFilter: noop,
        onResizeChange: noop,
        size: 'medium',
        rowProps: noop,
        cellProps: noop,
        prefix: 'next-',
        hasBorder: true,
        keepForwardRenderRows: 10,
        hasHeader: true,
        isZebra: false,
        loading: false,
        expandedIndexSimulate: false,
        primaryKey: 'id',
        components: {},
        locale: zhCN.Table,
        crossline: false,
    };

    static contextType = TableContext;

    constructor(props, context) {
        super(props, context);
        const {
            getTableInstance,
            getTableInstanceForVirtual,
            getTableInstanceForFixed,
            getTableInstanceForExpand,
        } = this.context || {};
        getTableInstance && getTableInstance(props.lockType, this);
        getTableInstanceForFixed && getTableInstanceForFixed(props.lockType, this);
        getTableInstanceForVirtual && getTableInstanceForVirtual(props.lockType, this);
        getTableInstanceForExpand && getTableInstanceForExpand(this);
        this.notRenderCellIndex = [];
    }

    state = {
        sort: this.props.sort || {},
    };

    static getDerivedStateFromProps(nextProps) {
        const state = {};

        if (typeof nextProps.sort !== 'undefined') {
            state.sort = nextProps.sort;
        }

        return state;
    }

    componentDidMount() {
        this.notRenderCellIndex = [];
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        if (nextProps.pure) {
            const isEqual =
                shallowElementEquals(nextProps, this.props) &&
                obj.shallowEqual(nextState, this.state) &&
                obj.shallowEqual(nextContext, this.context);
            return !isEqual;
        }

        return true;
    }

    componentDidUpdate() {
        this.notRenderCellIndex = [];
    }

    normalizeChildrenState(props) {
        let columns = props.columns;
        if (props.children) {
            columns = this.normalizeChildren(props);
        }
        return this.fetchInfoFromBinaryChildren(columns);
    }

    // 将React结构化数据提取props转换成数组
    normalizeChildren(props) {
        let { columns } = props;
        const getChildren = children => {
            const ret = [];
            Children.forEach(children, child => {
                if (child) {
                    const props = { ...child.props };

                    if (child.ref) {
                        props.ref = child.ref;
                    }

                    if (
                        !(
                            child &&
                            ['function', 'object'].indexOf(typeof child.type) > -1 &&
                            (child.type._typeMark === 'column' || child.type._typeMark === 'columnGroup')
                        )
                    ) {
                        log.warning('Use <Table.Column/>, <Table.ColumnGroup/> as child.');
                    }
                    ret.push(props);
                    if (child.props.children) {
                        props.children = getChildren(child.props.children);
                    }
                }
            });
            return ret;
        };
        if (props.children) {
            columns = getChildren(props.children);
        }
        return columns;
    }

    fetchInfoFromBinaryChildren(children) {
        let hasGroupHeader = false;
        const flatChildren = [],
            groupChildren = [],
            getChildren = (propsChildren = [], level) => {
                groupChildren[level] = groupChildren[level] || [];
                propsChildren.forEach(child => {
                    child.headerCellRowIndex = level;
                    child.headerCellColIndex = groupChildren[level].length;
                    if (child.children) {
                        hasGroupHeader = true;
                        getChildren(child.children, level + 1);
                    } else {
                        flatChildren.push(child);
                    }
                    groupChildren[level].push(child);
                });
            },
            getColSpan = (children, colSpan) => {
                colSpan = colSpan || 0;
                children.forEach(child => {
                    if (child.children) {
                        colSpan = getColSpan(child.children, colSpan);
                    } else {
                        colSpan += 1;
                    }
                });
                return colSpan;
            };

        getChildren(children, 0);

        groupChildren.forEach((groupChild, i) => {
            groupChild.forEach((child, j) => {
                let colSpan;
                const children = child.children;

                if (children) {
                    colSpan = getColSpan(children);
                    child.colSpan = colSpan;
                    groupChildren[i][j] = child;
                }
            });
        });

        const { lockType, lengths } = this.props;
        const start = lockType === 'right' ? lengths.origin - lengths.right : 0;
        this.addColIndex(flatChildren, start);

        return {
            flatChildren,
            groupChildren,
            hasGroupHeader,
        };
    }

    renderColGroup(flatChildren) {
        const cols = flatChildren.map((col, index) => {
            const width = col.width;
            let style = {};
            if (width) {
                style = {
                    width: width,
                };
            }

            return <col style={style} key={index} />;
        });
        return <colgroup key="table-colgroup">{cols}</colgroup>;
    }

    onSort = (dataIndex, order, sort) => {
        if (typeof this.props.sort === 'undefined') {
            this.setState(
                {
                    sort: sort,
                },
                () => {
                    this.props.onSort(dataIndex, order, sort);
                }
            );
        } else {
            this.props.onSort(dataIndex, order, sort);
        }
    };

    onFilter = filterParams => {
        this.props.onFilter(filterParams);
    };

    onResizeChange = (dataIndex, value) => {
        this.props.onResizeChange(dataIndex, value);
    };

    // 通过头部和扁平的结构渲染表格
    renderTable(groupChildren, flatChildren) {
        if (flatChildren.length || (!flatChildren.length && !this.props.lockType)) {
            const {
                hasHeader,
                components,
                prefix,
                wrapperContent,
                filterParams,
                locale,
                dataSource,
                emptyContent,
                loading,
                primaryKey,
                cellProps,
                rowProps,
                onRowClick,
                onRowMouseEnter,
                onRowMouseLeave,
                expandedIndexSimulate,
                pure,
                rtl,
                crossline,
                sortIcons,
                tableWidth,
            } = this.props;
            const { sort } = this.state;
            const { Header = HeaderComponent, Wrapper = WrapperComponent, Body = BodyComponent } = components;
            const colGroup = this.renderColGroup(flatChildren);

            return [
                <div
                    key={`${prefix}table-column-resize-proxy`}
                    ref={this.getResizeProxyDomRef}
                    className={`${prefix}table-column-resize-proxy`}
                />,
                <Wrapper
                    key={`${prefix}table-wrapper`}
                    colGroup={colGroup}
                    ref={this.getWrapperRef}
                    prefix={prefix}
                    tableWidth={tableWidth}
                >
                    {hasHeader ? (
                        <Header
                            prefix={prefix}
                            rtl={rtl}
                            pure={pure}
                            affixRef={this.getAffixRef}
                            colGroup={colGroup}
                            className={`${prefix}table-header`}
                            filterParams={filterParams}
                            tableEl={this.tableEl}
                            columns={groupChildren}
                            locale={locale}
                            headerCellRef={this.getHeaderCellRef}
                            components={components}
                            onFilter={this.onFilter}
                            sort={sort}
                            onResizeChange={this.onResizeChange}
                            onSort={this.onSort}
                            sortIcons={sortIcons}
                            tableWidth={tableWidth}
                            resizeProxyDomRef={this.resizeProxyDomRef}
                        />
                    ) : null}
                    <Body
                        prefix={prefix}
                        rtl={rtl}
                        pure={pure}
                        crossline={crossline}
                        colGroup={colGroup}
                        className={`${prefix}table-body`}
                        components={components}
                        loading={loading}
                        emptyContent={emptyContent}
                        getCellProps={cellProps}
                        primaryKey={primaryKey}
                        getRowProps={rowProps}
                        columns={flatChildren}
                        rowRef={this.getRowRef}
                        cellRef={this.getCellRef}
                        onRowClick={onRowClick}
                        expandedIndexSimulate={expandedIndexSimulate}
                        tableEl={this.tableEl}
                        onRowMouseEnter={onRowMouseEnter}
                        onRowMouseLeave={onRowMouseLeave}
                        dataSource={dataSource}
                        locale={locale}
                        onBodyMouseOver={this.onBodyMouseOver}
                        onBodyMouseOut={this.onBodyMouseOut}
                        tableWidth={tableWidth}
                    />
                    {wrapperContent}
                </Wrapper>,
            ];
        } else {
            return null;
        }
    }

    getResizeProxyDomRef = resizeProxyDom => {
        if (!resizeProxyDom) {
            return this.resizeProxyDomRef;
        }
        this.resizeProxyDomRef = resizeProxyDom;
    };

    getWrapperRef = wrapper => {
        if (!wrapper) {
            return this.wrapper;
        }
        this.wrapper = wrapper;
    };

    getAffixRef = affixRef => {
        if (!affixRef) {
            return this.affixRef;
        }
        this.affixRef = affixRef;
    };

    getHeaderCellRef = (i, j, cell) => {
        const cellRef = `header_cell_${i}_${j}`;
        if (!cell) {
            return this[cellRef];
        }
        this[cellRef] = cell;
    };

    getRowRef = (i, row) => {
        const rowRef = `row_${i}`;
        if (!row) {
            return this[rowRef];
        }
        this[rowRef] = row;
    };

    getCellRef = (i, j, cell) => {
        const cellRef = `cell_${i}_${j}`;
        if (!cell) {
            return this[cellRef];
        }
        this[cellRef] = cell;
    };

    handleColHoverClass = (rowIndex, colIndex, isAdd) => {
        const { crossline } = this.props;
        const funcName = isAdd ? 'addClass' : 'removeClass';
        if (crossline) {
            this.props.entireDataSource.forEach((val, index) => {
                try {
                    // in case of finding an unmounted component due to cached data
                    // need to clear refs of this.tableInc when dataSource Changed
                    // in virtual table
                    const cellRef = this.getCellRef(index, colIndex);
                    const currentCol = cellRef && cellRef.getDOMNode ? cellRef.getDOMNode() : cellRef;
                    currentCol && dom[funcName](currentCol, 'hovered');
                } catch (error) {
                    return null;
                }
            });
        }
    };

    /**
     * @param event
     * @returns {Object} { rowIndex: string; colIndex: string }
     */
    findEventTarget = e => {
        const { prefix } = this.props;
        const target = dom.getClosest(e.target, `td.${prefix}table-cell`);
        const colIndex = target && target.getAttribute('data-next-table-col');
        const rowIndex = target && target.getAttribute('data-next-table-row');

        try {
            // in case of finding an unmounted component due to cached data
            // need to clear refs of this.tableInc when dataSource Changed
            // in virtual table
            const cellRef = this.getCellRef(rowIndex, colIndex);
            const currentCol = cellRef && cellRef.getDOMNode ? cellRef.getDOMNode() : cellRef;
            if (currentCol === target) {
                return {
                    colIndex,
                    rowIndex,
                };
            }
        } catch (error) {
            return {};
        }

        return {};
    };

    onBodyMouseOver = e => {
        const { crossline } = this.props;
        if (!crossline) {
            return;
        }

        const { colIndex, rowIndex } = this.findEventTarget(e);
        // colIndex, rowIndex are string
        if (!colIndex || !rowIndex) {
            return;
        }
        this.handleColHoverClass(rowIndex, colIndex, true);
        this.colIndex = colIndex;
        this.rowIndex = rowIndex;
    };

    onBodyMouseOut = e => {
        const { crossline } = this.props;
        if (!crossline) {
            return;
        }

        const { colIndex, rowIndex } = this.findEventTarget(e);
        // colIndex, rowIndex are string
        if (!colIndex || !rowIndex) {
            return;
        }
        this.handleColHoverClass(this.rowIndex, this.colIndex, false);
        this.colIndex = -1;
        this.rowIndex = -1;
    };

    addColIndex = (children, start = 0) => {
        children.forEach((child, i) => {
            child.__colIndex = start + i;
        });
    };

    getTableEl = ref => {
        this.tableEl = ref;
    };

    getDOMNode() {
        return this.tableEl;
    }

    render() {
        const ret = this.normalizeChildrenState(this.props);
        this.groupChildren = ret.groupChildren;
        this.flatChildren = ret.flatChildren;
        /* eslint-disable no-unused-vars, prefer-const */
        let table = this.renderTable(ret.groupChildren, ret.flatChildren),
            {
                className,
                style,
                hasBorder,
                isZebra,
                loading,
                size,
                hasHeader,
                prefix,
                dataSource,
                entireDataSource,
                onSort,
                onResizeChange,
                onRowClick,
                onRowMouseEnter,
                onRowMouseLeave,
                onFilter,
                rowProps,
                cellProps,
                scrollToRow,
                primaryKey,
                components,
                wrapperContent,
                lockType,
                locale,
                expandedIndexSimulate,
                refs,
                pure,
                rtl,
                emptyContent,
                filterParams,
                columns,
                sortIcons,
                loadingComponent: LoadingComponent = Loading,
                tableLayout,
                tableWidth,
                ref,
                ...others
            } = this.props,
            cls = classnames({
                [`${prefix}table`]: true,
                [`${prefix}table-${size}`]: size,
                [`${prefix}table-layout-${tableLayout}`]: tableLayout,
                [`${prefix}table-loading`]: loading,
                'only-bottom-border': !hasBorder,
                'no-header': !hasHeader,
                zebra: isZebra,
                [className]: className,
            });

        if (rtl) {
            others.dir = 'rtl';
        }

        const loadingcls = classnames({
            [`${prefix}table-loading-content`]: true,
        });

        return (
            <TableContext.Provider
                value={{
                    ...(this.context || {}),
                    notRenderCellIndex: this.notRenderCellIndex || [],
                    lockType: this.props.lockType,
                }}
            >
                <div
                    className={cls}
                    style={style}
                    ref={ref || this.getTableEl}
                    {...obj.pickOthers(TABLE_PROP_KEYS, others)}
                >
                    {table}
                    {loading ? <LoadingComponent className={loadingcls} /> : null}
                </div>
            </TableContext.Provider>
        );
    }
}

export default polyfill(Table);
