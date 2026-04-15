import React, { Children } from 'react';
import classnames from 'classnames';
import { polyfill } from 'react-lifecycles-compat';
import Icon from '../icon';
import { KEYCODE, dom, events } from '../util';
import RowComponent from './expanded/row';
import Col from './column';
import { statics } from './util';
import TableContext from './context';

const noop = () => {};

export default function expanded(BaseComponent, stickyLock) {
    /** Table */
    class ExpandedTable extends React.Component {
        static ExpandedRow = RowComponent;
        static defaultProps = {
            ...BaseComponent.defaultProps,
            getExpandedColProps: noop,
            onRowOpen: noop,
            hasExpandedRowCtrl: true,
            components: {},
            expandedRowIndent: stickyLock ? [0, 0] : [1, 0],
            prefix: 'next-',
        };

        static contextType = TableContext;

        state = {
            openRowKeys: this.props.openRowKeys || this.props.defaultOpenRowKeys || [],
        };

        static getDerivedStateFromProps(nextProps) {
            if ('openRowKeys' in nextProps) {
                return {
                    openRowKeys: nextProps.openRowKeys || [],
                };
            }

            return null;
        }

        componentDidMount() {
            this.setExpandedWidth();
            events.on(window, 'resize', this.setExpandedWidth);
        }

        componentDidUpdate() {
            this.setExpandedWidth();
        }

        componentWillUnmount() {
            events.off(window, 'resize', this.setExpandedWidth);
        }

        saveExpandedRowRef = (key, rowRef) => {
            if (!this.expandedRowRefs) {
                this.expandedRowRefs = {};
            }
            this.expandedRowRefs[key] = rowRef;
        };

        setExpandedWidth = () => {
            const { prefix } = this.props;
            const tableEl = this.getTableNode();
            const totalWidth = +(tableEl && tableEl.clientWidth) - 1 || '100%';
            const bodyNode = tableEl && tableEl.querySelector(`.${prefix}table-body`);

            Object.keys(this.expandedRowRefs || {}).forEach(key => {
                dom.setStyle(this.expandedRowRefs[key], { width: (bodyNode && bodyNode.clientWidth) || totalWidth });
            });
        };

        getTableInstance = instance => {
            this.tableInc = instance;
        };

        getTableNode() {
            const table = this.tableInc;
            try {
                // in case of finding an unmounted component due to cached data
                // need to clear refs of table when dataSource Changed
                // use try catch for temporary
                return table.tableEl;
            } catch (error) {
                return null;
            }
        }

        expandedKeydown = (value, record, index, e) => {
            e.preventDefault();
            e.stopPropagation();

            if (e.keyCode === KEYCODE.ENTER) {
                this.onExpandedClick(value, record, index, e);
            }
        };

        renderExpandedCell = (value, index, record) => {
            const { getExpandedColProps, prefix, locale, rowExpandable } = this.props;

            if (typeof rowExpandable === 'function' && !rowExpandable(record, index)) {
                return '';
            }

            const { openRowKeys } = this.state,
                { primaryKey } = this.props,
                hasExpanded = openRowKeys.indexOf(record[primaryKey]) > -1,
                switchNode = hasExpanded ? (
                    <Icon type="minus" size="xs" className={`${prefix}table-expand-unfold`} />
                ) : (
                    <Icon type="add" size="xs" className={`${prefix}table-expand-fold`} />
                ),
                attrs = getExpandedColProps(record, index) || {};
            const cls = classnames({
                [`${prefix}table-expanded-ctrl`]: true,
                disabled: attrs.disabled,
                [attrs.className]: attrs.className,
            });

            if (!attrs.disabled) {
                attrs.onClick = this.onExpandedClick.bind(this, value, record, index);
            }
            return (
                <span
                    {...attrs}
                    role="button"
                    tabIndex="0"
                    onKeyDown={this.expandedKeydown.bind(this, value, record, index)}
                    aria-label={hasExpanded ? locale.expanded : locale.folded}
                    aria-expanded={hasExpanded}
                    className={cls}
                >
                    {switchNode}
                </span>
            );
        };

        onExpandedClick(value, record, i, e) {
            const openRowKeys = [...this.state.openRowKeys],
                { primaryKey } = this.props,
                id = record[primaryKey],
                index = openRowKeys.indexOf(id);
            if (index > -1) {
                openRowKeys.splice(index, 1);
            } else {
                openRowKeys.push(id);
            }
            if (!('openRowKeys' in this.props)) {
                this.setState({
                    openRowKeys: openRowKeys,
                });
            }
            this.props.onRowOpen(openRowKeys, id, index === -1, record);
            e.stopPropagation();
        }

        addExpandCtrl = columns => {
            const { prefix, size } = this.props;

            if (!columns.find(record => record.key === 'expanded')) {
                columns.unshift({
                    key: 'expanded',
                    title: '',
                    cell: this.renderExpandedCell.bind(this),
                    width: size === 'small' ? 34 : 50,
                    className: `${prefix}table-expanded ${prefix}table-prerow`,
                    __normalized: true,
                });
            }
        };

        normalizeChildren(children) {
            const { prefix, size } = this.props;
            const toArrayChildren = Children.map(children, (child, index) =>
                React.cloneElement(child, {
                    key: index,
                })
            );
            toArrayChildren.unshift(
                <Col
                    title=""
                    key="expanded"
                    cell={this.renderExpandedCell.bind(this)}
                    width={size === 'small' ? 34 : 50}
                    className={`${prefix}table-expanded ${prefix}table-prerow`}
                    __normalized
                />
            );
            return toArrayChildren;
        }

        normalizeDataSource(ds) {
            const ret = [];
            ds.forEach(item => {
                const itemCopy = { ...item };
                itemCopy.__expanded = true;
                ret.push(item, itemCopy);
            });
            return ret;
        }

        render() {
            /* eslint-disable no-unused-vars, prefer-const */
            let {
                components,
                openRowKeys,
                expandedRowRender,
                rowExpandable,
                hasExpandedRowCtrl,
                children,
                columns,
                dataSource,
                entireDataSource,
                getExpandedColProps,
                expandedRowIndent,
                onRowOpen,
                onExpandedRowClick,
                ...others
            } = this.props;

            if (expandedRowRender && !components.Row) {
                components = { ...components };
                components.Row = RowComponent;
                dataSource = this.normalizeDataSource(dataSource);
                entireDataSource = this.normalizeDataSource(entireDataSource);
            }
            if (expandedRowRender && hasExpandedRowCtrl) {
                let useColumns = columns && !children;

                if (useColumns) {
                    this.addExpandCtrl(columns);
                } else {
                    children = this.normalizeChildren(children || []);
                }
            }

            return (
                <TableContext.Provider
                    value={{
                        ...(this.context || {}),
                        openRowKeys: this.state.openRowKeys,
                        expandedRowRender: this.props.expandedRowRender,
                        expandedIndexSimulate: this.props.expandedIndexSimulate,
                        expandedRowWidthEquals2Table: stickyLock,
                        expandedRowIndent: stickyLock ? [0, 0] : this.props.expandedRowIndent,
                        getExpandedRowRef: this.saveExpandedRowRef,
                        getTableInstanceForExpand: this.getTableInstance,
                    }}
                >
                    <BaseComponent
                        {...others}
                        columns={columns}
                        dataSource={dataSource}
                        entireDataSource={entireDataSource}
                        components={components}
                    >
                        {children}
                    </BaseComponent>
                </TableContext.Provider>
            );
        }
    }
    statics(ExpandedTable, BaseComponent);
    return polyfill(ExpandedTable);
}
