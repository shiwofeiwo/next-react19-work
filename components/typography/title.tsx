import React from 'react';
import Text from './text';
import ConfigProvider from '../config-provider';
import { TitleClass, TitleProps } from './types';

export default (Tag: string) => {
    /**
     * Typography.Title
     */
    class Title extends React.Component<TitleProps> {
        static defaultProps = {
            prefix: 'next-',
        };

        static displayName = Tag.toUpperCase();

        render() {
            const { prefix, className, ...others } = this.props;
            return (
                <Text
                    {...others}
                    component={Tag}
                    className={`${className || ''} ${prefix}typography-title`}
                />
            );
        }
    }

    return ConfigProvider.config(Title as typeof TitleClass);
};
