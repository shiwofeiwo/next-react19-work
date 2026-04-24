import React, { Component } from 'react';
import Input from '../../input';

export interface TreeNodeInputProps {
    prefix?: string;
    defaultValue: React.ReactNode;
    onBlur: (e: React.FocusEvent<HTMLInputElement> | React.KeyboardEvent<HTMLInputElement>) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

// Input 通过 ConfigProvider.config 暴露 `focus` 和 `getInputNode` 两个方法（见 components/input/index.tsx:41）
interface InputInstance {
    focus?: () => void;
    getInputNode?: () => HTMLInputElement | null;
}

export default class TreeNodeInput extends Component<TreeNodeInputProps> {
    private inputRef: InputInstance | null = null;

    componentDidMount() {
        // 优先调用 Input 暴露的 focus 方法（内部直接聚焦 input 元素，无需 DOM 查询）
        // 退路：通过 getInputNode 拿到原生 input 再 focus
        if (this.inputRef?.focus) {
            this.inputRef.focus();
        } else if (this.inputRef?.getInputNode) {
            this.inputRef.getInputNode()?.focus();
        }
    }

    render() {
        const { prefix, defaultValue, ...others } = this.props;

        return (
            <Input
                size="small"
                className={`${prefix}tree-node-input`}
                defaultValue={defaultValue as string | number | undefined}
                {...others}
                ref={(c: InputInstance | null) => {
                    this.inputRef = c;
                }}
            />
        );
    }
}
