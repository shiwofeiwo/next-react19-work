import React, { Children } from 'react';
import Checkbox from '../checkbox';
import Radio from '../radio';
import { func, log } from '../util';
import zhCN from '../locale/zh-cn';
import SelectionRow from './selection/row';
import Col from './column';
import { statics } from './util';
import TableContext from './context';

const { makeChain } = func;

const unique = (arr, key = 'this') => {
    const temp = {},
        ret = [];
    arr.forEach(item => {
        let value;
        if (key === 'this') {
            value = item;
        } else {
            value = item[key];
        }
        if (!temp[value]) {
            ret.push(item);
            temp[value] = true;
        }
    });
    return ret;
};

export default function selection(BaseComponent) {
    /** Table */
    class SelectionTable extends React.Component {
        static SelectionRow = SelectionRow;
        static defaultProps = {
            ...BaseComponent.defaultProps,
            locale: zhCN.Table,
            primaryKey: 'id',
            prefix: 'next-',
        };

        static contextType = TableContext;

        constructor(props, context) {
            super(props, context);
            this.state = {
                selectedRowKeys:
                    props.rowSelection && 'selectedRowKeys' in props.rowSelection
                        ? props.rowSelection.selectedRowKeys || []
                        : [],
            };
        }

        static getDerivedStateFromProps(nextProps) {
            if (nextProps.rowSelection && 'selectedRowKeys' in nextProps.rowSelection) {
                const selectedRowKeys = nextProps.rowSelection.selectedRowKeys || [];
                return {
                    selectedRowKeys,
                };
            }

            return null;
        }

        normalizeChildren(children) {
            const { prefix, rowSelection, size } = this.props;
            if (rowSelection) {
                children = Children.map(children, (child, index) =>
                    React.cloneElement(child, {
                        key: index,
                    })
                );

                const attrs = (rowSelection.columnProps && rowSelection.columnProps()) || {};

                children.unshift(
                    <Col
                        key="selection"
                        title={this.renderSelectionHeader.bind(this)}
                        cell={this.renderSelectionBody.bind(this)}
                        width={size === 'small' ? 34 : 50}
                        className={`${prefix}table-selection ${prefix}table-prerow`}
                        __normalized
                        {...attrs}
                    />
                );
                return children;
            }
            return children;
        }

        addSelection = columns => {
            const { prefix, rowSelection, size } = this.props;
            const attrs = (rowSelection.columnProps && rowSelection.columnProps()) || {};

            if (!columns.find(record => record.key === 'selection')) {
                columns.unshift({
                    key: 'selection',
                    title: this.renderSelectionHeader.bind(this),
                    cell: this.renderSelectionBody.bind(this),
                    width: size === 'small' ? 34 : 50,
                    className: `${prefix}table-selection ${prefix}table-prerow`,
                    __normalized: true,
                    ...attrs,
                });
            }
        };

        renderSelectionHeader = () => {
            const onChange = this.selectAllRow,
                attrs = {},
                { rowSelection, primaryKey, dataSource, entireDataSource, locale } = this.props,
                { selectedRowKeys } = this.state,
                mode = rowSelection.mode ? rowSelection.mode : 'multiple';

            let checked = !!selectedRowKeys.length;
            let indeterminate = false;

            const source = entireDataSource || dataSource;

            this.flatDataSource(source)
                .filter((record, index) => {
                    if (!rowSelection.getProps) {
                        return true;
                    } else {
                        return !(rowSelection.getProps(record, index) || {}).disabled;
                    }
                })
                .map(record => record[primaryKey])
                .forEach(id => {
                    if (selectedRowKeys.indexOf(id) === -1) {
                        checked = false;
                    } else {
                        indeterminate = true;
                    }
                });
            attrs.onClick = makeChain(e => {
                e.stopPropagation();
            }, attrs.onClick);

            const userAttrs = (rowSelection.titleProps && rowSelection.titleProps()) || {};

            if (checked) {
                indeterminate = false;
            }
            return [
                mode === 'multiple' ? (
                    <Checkbox
                        key="_total"
                        indeterminate={indeterminate}
                        aria-label={locale.selectAll}
                        checked={checked}
                        onChange={onChange}
                        {...attrs}
                        {...userAttrs}
                    />
                ) : null,
                rowSelection.titleAddons && rowSelection.titleAddons(),
            ];
        };

        renderSelectionBody = (value, index, record) => {
            const { rowSelection, primaryKey } = this.props;
            const { selectedRowKeys } = this.state;
            const mode = rowSelection.mode ? rowSelection.mode : 'multiple';
            const checked = selectedRowKeys.indexOf(record[primaryKey]) > -1;
            const onChange = this.selectOneRow.bind(this, index, record);
            const attrs = rowSelection.getProps ? rowSelection.getProps(record, index) || {} : {};

            attrs.onClick = makeChain(e => {
                e.stopPropagation();
            }, attrs.onClick);
            return mode === 'multiple' ? (
                <Checkbox checked={checked} onChange={onChange} {...attrs} />
            ) : (
                <Radio checked={checked} onChange={onChange} {...attrs} />
            );
        };

        selectAllRow = (checked, e) => {
            const ret = [...this.state.selectedRowKeys],
                { rowSelection, primaryKey, dataSource, entireDataSource } = this.props,
                { selectedRowKeys } = this.state,
                getProps = rowSelection.getProps;
            let attrs = {},
                records = [];

            const source = entireDataSource ? entireDataSource : dataSource;

            this.flatDataSource(source).forEach((record, index) => {
                const id = record[primaryKey];
                if (getProps) {
                    attrs = getProps(record, index) || {};
                }
                // 反选和全选的时候不要丢弃禁用项的选中状态
                if (checked && (!attrs.disabled || selectedRowKeys.indexOf(id) > -1)) {
                    ret.push(id);
                    records.push(record);
                } else if (attrs.disabled && selectedRowKeys.indexOf(id) > -1) {
                    ret.push(id);
                    records.push(record);
                } else {
                    const i = ret.indexOf(id);
                    i > -1 && ret.splice(i, 1);
                }
            });

            records = unique(records, primaryKey);
            if (typeof rowSelection.onSelectAll === 'function') {
                rowSelection.onSelectAll(checked, records);
            }
            this.triggerSelection(rowSelection, unique(ret), records);
            e.stopPropagation();
        };

        selectOneRow(index, record, checked, e) {
            let selectedRowKeys = [...this.state.selectedRowKeys],
                i;
            const { primaryKey, rowSelection, dataSource, entireDataSource } = this.props,
                mode = rowSelection.mode ? rowSelection.mode : 'multiple',
                id = record[primaryKey];
            if (id === null || id === undefined) {
                log.warning(`Can't get value from record using given ${primaryKey} as primaryKey.`);
            }
            if (mode === 'multiple') {
                if (checked) {
                    selectedRowKeys.push(id);
                } else {
                    i = selectedRowKeys.indexOf(id);
                    selectedRowKeys.splice(i, 1);
                }
            } else if (checked) {
                selectedRowKeys = [id];
            }
            let totalDS = dataSource;
            if (Array.isArray(entireDataSource) && entireDataSource.length > dataSource.length) {
                totalDS = entireDataSource;
            }
            const records = unique(totalDS.filter(item => selectedRowKeys.indexOf(item[primaryKey]) > -1), primaryKey);
            if (typeof rowSelection.onSelect === 'function') {
                rowSelection.onSelect(checked, record, records);
            }

            this.triggerSelection(rowSelection, selectedRowKeys, records);

            e.stopPropagation();
        }
        triggerSelection(rowSelection, selectedRowKeys, records) {
            if (!('selectedRowKeys' in rowSelection)) {
                this.setState({
                    selectedRowKeys,
                });
            }
            if (typeof rowSelection.onChange === 'function') {
                rowSelection.onChange(selectedRowKeys, records);
            }
        }

        flatDataSource(dataSource) {
            let ret = dataSource;
            const { listHeader } = this.context || {};

            if (listHeader) {
                ret = [];
                const { hasChildrenSelection, hasSelection } = listHeader;
                dataSource.forEach(item => {
                    const children = item.children;
                    // 如果需要渲染selection才将这条记录插入到dataSource
                    // 或者没有孩子节点
                    if (hasSelection) {
                        ret.push(item);
                    }
                    if (children && hasChildrenSelection) {
                        ret = ret.concat(children);
                    }
                });
            }
            return ret;
        }

        render() {
            /* eslint-disable prefer-const */
            let { rowSelection, components, children, columns, ...others } = this.props;
            let useColumns = columns && !children;

            if (rowSelection) {
                if (useColumns) {
                    this.addSelection(columns);
                } else {
                    children = this.normalizeChildren(children || []);
                }
                components = { ...components };
                components.Row = components.Row || SelectionRow;
            }
            return (
                <TableContext.Provider
                    value={{
                        ...(this.context || {}),
                        rowSelection: this.props.rowSelection,
                        selectedRowKeys: this.state.selectedRowKeys,
                    }}
                >
                    <BaseComponent {...others} columns={columns} components={components} children={children} />
                </TableContext.Provider>
            );
        }
    }
    statics(SelectionTable, BaseComponent);
    return SelectionTable;
}
