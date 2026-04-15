import { findDOMNode } from 'react-dom';
import FixedHeader from '../fixed/header';
import TableContext from '../context';

export default class LockHeader extends FixedHeader {
    static contextType = TableContext;

    componentDidMount() {
        const { getNode, getLockNode } = this.context || {};
        getNode && getNode('header', findDOMNode(this), (this.context || {}).lockType);
        getLockNode && getLockNode('header', findDOMNode(this), (this.context || {}).lockType);
    }
}
