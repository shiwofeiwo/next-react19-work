import React from 'react';
import Text from './text';
import { TypographyProps } from './types';

/**
 * Typography
 */
class Typography extends React.Component<TypographyProps> {
    static defaultProps = {
        component: 'article',
    };

    render() {
        return <Text {...this.props} />;
    }
}

export default Typography;
