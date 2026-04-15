import React from 'react';
import classNames from 'classnames';
import ConfigProvider from '../config-provider';
import { log } from '../util';
import { ParagraphProps } from './types';

/** Paragraph */
class Paragraph extends React.Component<ParagraphProps> {
    static defaultProps = {
        prefix: 'next-',
        type: 'long',
        size: 'medium',
    };

    constructor(props: ParagraphProps) {
        super(props);
        log.warning('[Paragraph] is deprecated, please use Typography.Paragraph instead!');
    }

    render() {
        const { prefix, className, type, size, rtl, ...others } = this.props;

        const cls = classNames(
            `${prefix}paragraph`,
            type === 'short' ? `${prefix}paragraph-short` : `${prefix}paragraph-long`,
            size === 'small' ? `${prefix}paragraph-small` : `${prefix}paragraph-medium`,
            className
        );
        if (rtl) {
            others.dir = 'rtl';
        }

        return (
            <div {...others} className={cls}>
                {this.props.children}
            </div>
        );
    }
}

export type { ParagraphProps };

export default ConfigProvider.config(Paragraph);
