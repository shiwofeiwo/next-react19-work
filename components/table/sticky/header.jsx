import React from 'react';
import classnames from 'classnames';
import Affix from '../../affix';
import TableContext from '../context';

/* eslint-disable react/prefer-stateless-function*/
export default class StickHeader extends React.Component {    static contextType = TableContext;

    getAffixRef = ref => {
        this.props.affixRef && this.props.affixRef(ref);
    };

    render() {
        const { prefix } = this.props;
        const { Header, offsetTop, affixProps } = this.context || {};

        const newAffixProps = affixProps || {};
        const { className, ...others } = newAffixProps;
        const cls = classnames({
            [`${prefix}table-affix`]: true,
            className,
        });

        return (
            <Affix ref={this.getAffixRef} {...others} className={cls} offsetTop={offsetTop}>
                <Header {...this.props} />
            </Affix>
        );
    }
}
