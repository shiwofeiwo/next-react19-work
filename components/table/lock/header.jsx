import FixedHeader from '../fixed/header';
import TableContext from '../context';

export default class LockHeader extends FixedHeader {
    static contextType = TableContext;

    componentDidMount() {
        const { getNode, getLockNode } = this.context || {};
        const node = this.getDOMNode();
        getNode && getNode('header', node, (this.context || {}).lockType);
        getLockNode && getLockNode('header', node, (this.context || {}).lockType);
    }
}
