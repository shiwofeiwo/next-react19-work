import React from 'react';
import RowComponent from './tree/row';
import CellComponent from './tree/cell';
import { statics } from './util';
import TableContext from './context';

const noop = () => {};

export default function tree(BaseComponent) {
    class TreeTable extends React.Component {
        static TreeRow = RowComponent;
        static TreeCell = CellComponent;
        static defaultProps = {
            ...BaseComponent.defaultProps,
            primaryKey: 'id',
            onRowOpen: noop,
            components: {},
            indent: 12,
        };

        static contextType = TableContext;

        constructor(props, context) {
            super(props, context);
            this.state = {
                openRowKeys: props.openRowKeys || props.defaultOpenRowKeys || [],
            };
        }

        static getDerivedStateFromProps(nextProps) {
            if ('openRowKeys' in nextProps) {
                return {
                    openRowKeys: nextProps.openRowKeys || [],
                };
            }

            return null;
        }

        normalizeDataSource(dataSource) {
            const { openRowKeys } = this.state;
            const { primaryKey } = this.props;
            const ret = [],
                loop = function(dataSource, level, parentId = null) {
                    dataSource.forEach(item => {
                        item.__level = level;

                        if (level === 0 || openRowKeys.indexOf(parentId) > -1) {
                            item.__hidden = false;
                        } else {
                            item.__hidden = true;
                        }
                        ret.push(item);

                        if (item.children) {
                            loop(item.children, level + 1, item[primaryKey]);
                        }
                    });
                };
            loop(dataSource, 0);
            this.ds = ret;
            return ret;
        }

        getTreeNodeStatus(dataSource = []) {
            const { openRowKeys } = this.state,
                { primaryKey } = this.props,
                ret = [];

            openRowKeys.forEach(openKey => {
                dataSource.forEach(item => {
                    if (item[primaryKey] === openKey) {
                        if (item.children) {
                            item.children.forEach(child => {
                                ret.push(child[primaryKey]);
                            });
                        }
                    }
                });
            });
            return ret;
        }

        onTreeNodeClick = record => {
            const { primaryKey } = this.props,
                id = record[primaryKey],
                dataSource = this.ds,
                openRowKeys = [...this.state.openRowKeys],
                index = openRowKeys.indexOf(id),
                getChildrenKeyById = function(id) {
                    const ret = [id];
                    const loop = data => {
                        data.forEach(item => {
                            ret.push(item[primaryKey]);
                            if (item.children) {
                                loop(item.children);
                            }
                        });
                    };
                    dataSource.forEach(item => {
                        if (item[primaryKey] === id) {
                            if (item.children) {
                                loop(item.children);
                            }
                        }
                    });
                    return ret;
                };

            if (index > -1) {
                // 不仅要删除当前的openRowKey，还需要删除关联子节点的openRowKey
                const ids = getChildrenKeyById(id);
                ids.forEach(id => {
                    const i = openRowKeys.indexOf(id);
                    if (i > -1) {
                        openRowKeys.splice(i, 1);
                    }
                });
            } else {
                openRowKeys.push(id);
            }

            if (!('openRowKeys' in this.props)) {
                this.setState({
                    openRowKeys,
                });
            }
            this.props.onRowOpen(openRowKeys, id, index === -1, record);
        };

        render() {
            /* eslint-disable no-unused-vars, prefer-const */
            let { components, isTree, dataSource, indent, ...others } = this.props;

            if (isTree) {
                components = { ...components };
                if (!components.Row) {
                    components.Row = RowComponent;
                }
                if (!components.Cell) {
                    components.Cell = CellComponent;
                }

                dataSource = this.normalizeDataSource(dataSource);
            }
            return (
                <TableContext.Provider
                    value={{
                        ...(this.context || {}),
                        openTreeRowKeys: this.state.openRowKeys,
                        indent: this.props.indent,
                        treeStatus: this.getTreeNodeStatus(this.ds),
                        onTreeNodeClick: this.onTreeNodeClick,
                        isTree: this.props.isTree,
                    }}
                >
                    <BaseComponent {...others} dataSource={dataSource} components={components} />
                </TableContext.Provider>
            );
        }
    }
    statics(TreeTable, BaseComponent);
    return TreeTable;
}
