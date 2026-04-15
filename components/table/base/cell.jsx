import React from 'react';
import classnames from 'classnames';
import { obj, pickAttrs } from '../../util';

export default class Cell extends React.Component {
    static defaultProps = {
        component: 'td',
        type: 'body',
        isIconLeft: false,
        cell: value => value,
        prefix: 'next-',
    };

    shouldComponentUpdate(nextProps) {
        if (nextProps.pure) {
            const isEqual = obj.shallowEqual(this.props, nextProps);
            return !isEqual;
        }
        return true;
    }

    render() {
        /* eslint-disable no-unused-vars */
        const {
            prefix,
            className,
            cell,
            value,
            resizable,
            asyncResizable,
            colIndex,
            rowIndex,
            __colIndex,
            record,
            context,
            align,
            style = {},
            component: Tag,
            children,
            title,
            width,
            innerStyle,
            primaryKey,
            __normalized,
            filterMode,
            filterMenuProps,
            filterProps,
            filters,
            sortable,
            sortDirections,
            lock,
            pure,
            locale,
            expandedIndexSimulate,
            rtl,
            isIconLeft,
            type,
            htmlTitle,
            wordBreak,
            ...others
        } = this.props;
        const tagStyle = { ...style };
        const cellProps = { value, index: rowIndex, record, context };
        let content = cell;
        if (React.isValidElement(content)) {
            // header情况下， props.cell为 column.title，不需要传递这些props
            content = React.cloneElement(content, type === 'header' ? undefined : cellProps);
        } else if (typeof content === 'function') {
            content = content(value, rowIndex, record, context);
        }
        if (align) {
            tagStyle.textAlign = align;
            if (rtl) {
                tagStyle.textAlign = align === 'left' ? 'right' : align === 'right' ? 'left' : align;
            }
        }
        const cls = classnames({
            [`${prefix}table-cell`]: true,
            [`${prefix}table-word-break-${wordBreak}`]: !!wordBreak,
            [className]: className,
        });

        return (
            <Tag {...pickAttrs(others)} className={cls} style={tagStyle} role="gridcell">
                <div
                    className={`${prefix}table-cell-wrapper`}
                    ref={this.props.getCellDomRef}
                    style={innerStyle}
                    title={htmlTitle}
                    data-next-table-col={__colIndex}
                    data-next-table-row={rowIndex}
                >
                    {isIconLeft ? children : content}
                    {isIconLeft ? content : children}
                </div>
            </Tag>
        );
    }
}
