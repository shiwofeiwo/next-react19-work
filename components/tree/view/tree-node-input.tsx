import React, { Component } from 'react';
import Input from '../../input';

export interface TreeNodeInputProps {
    prefix?: string;
    defaultValue: React.ReactNode;
    onBlur: (e: React.FocusEvent<HTMLInputElement> | React.KeyboardEvent<HTMLInputElement>) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}
export default class TreeNodeInput extends Component<TreeNodeInputProps> {
    containerRef: Element | null = null;

    componentDidMount() {
        const inputWrapperNode = this.containerRef as Element;
        inputWrapperNode.querySelector('input')!.focus();
    }

    render() {
        const { prefix, defaultValue, ...others } = this.props;

        return (
            <Input
                size="small"
                className={`${prefix}tree-node-input`}
                defaultValue={defaultValue as string | number | undefined}
                {...others}
                ref={(c: any) => {
                    if (c instanceof Element) {
                        this.containerRef = c;
                    } else if (c && 'getDOMNode' in c && typeof c.getDOMNode === 'function') {
                        this.containerRef = c.getDOMNode();
                    }
                }}
            />
        );
    }
}
