import * as React from 'react';
import { polyfill } from 'react-lifecycles-compat';
import classnames from 'classnames';
import Button from '../button';
import Icon from '../icon';
import Menu, { type MenuProps } from '../menu';
import Overlay from '../overlay';
import ConfigProvider from '../config-provider';
import { obj, func } from '../util';
import type { MenuButtonProps, MenuButtonState } from './types';

const { Popup } = Overlay;

const MENU_BUTTON_PROP_KEYS = [
    'prefix',
    'label',
    'autoWidth',
    'popupTriggerType',
    'popupContainer',
    'visible',
    'defaultVisible',
    'onVisibleChange',
    'popupStyle',
    'popupClassName',
    'popupProps',
    'followTrigger',
    'defaultSelectedKeys',
    'selectedKeys',
    'selectMode',
    'onItemClick',
    'onSelect',
    'menuProps',
    'style',
    'className',
    'children',
];

/**
 * MenuButton
 */
class MenuButton extends React.Component<MenuButtonProps, MenuButtonState> {
    static Item = Menu.Item;
    static Group = Menu.Group;
    static Divider = Menu.Divider;
    static displayName = 'MenuButton';

    static defaultProps = {
        prefix: 'next-',
        autoWidth: true,
        popupTriggerType: 'click',
        onVisibleChange: func.noop,
        onItemClick: func.noop,
        onSelect: func.noop,
        defaultSelectedKeys: [],
        menuProps: {},
    };

    menu: HTMLElement | undefined;
    containerRef: HTMLElement | null = null;

    constructor(props: MenuButtonProps) {
        super(props);
        this.state = {
            selectedKeys: props.defaultSelectedKeys,
            visible: props.defaultVisible,
        };
    }

    static getDerivedStateFromProps(props: MenuButtonProps) {
        const st: Partial<MenuButtonState> = {};

        if ('visible' in props) {
            st.visible = props.visible;
        }

        if ('selectedKeys' in props) {
            st.selectedKeys = props.selectedKeys;
        }

        return st;
    }

    clickMenuItem: MenuProps['onItemClick'] = (key, item, event) => {
        const { selectMode } = this.props;

        this.props.onItemClick!(key, item, event);

        if (selectMode === 'multiple') {
            return;
        }

        this.onPopupVisibleChange(false, 'menuSelect');
    };

    selectMenu: MenuProps['onSelect'] = (keys, ...others) => {
        if (!('selectedKeys' in this.props)) {
            this.setState({
                selectedKeys: keys,
            });
        }
        this.props.onSelect!(keys, ...others);
    };

    onPopupOpen = () => {
        const button = this.containerRef;
        if (this.props.autoWidth && button && this.menu) {
            this.menu.style.width = `${button.offsetWidth}px`;
        }
    };

    onPopupVisibleChange = (visible: boolean, type: string) => {
        if (!('visible' in this.props)) {
            this.setState({
                visible,
            });
        }
        this.props.onVisibleChange!(visible, type);
    };

    _menuRefHandler = (ref: React.ComponentRef<typeof Menu> | null) => {
        this.menu = (ref as any)?.getDOMNode() as HTMLElement;

        const refFn = this.props.menuProps?.ref;
        if (typeof refFn === 'function') {
            refFn(ref);
        }
    };

    render() {
        const {
            prefix,
            style,
            className,
            label,
            popupTriggerType,
            popupContainer,
            popupStyle,
            popupClassName,
            popupProps,
            followTrigger,
            selectMode,
            menuProps,
            children,
            ...others
        } = this.props;

        const state = this.state;

        const classNames = classnames(
            {
                [`${prefix}menu-btn`]: true,
                [`${prefix}expand`]: state.visible,
                opened: state.visible,
            },
            className
        );

        const popupClassNames = classnames(
            {
                [`${prefix}menu-btn-popup`]: true,
            },
            popupClassName
        );

        const trigger = (
            <Button
                style={style}
                className={classNames}
                {...obj.pickOthers(MENU_BUTTON_PROP_KEYS, others)}
                ref={(c: any) => {
                    if (c instanceof Element) {
                        this.containerRef = c as HTMLElement;
                    } else if (c && 'getDOMNode' in c && typeof c.getDOMNode === 'function') {
                        this.containerRef = c.getDOMNode();
                    }
                }}
            >
                {label} <Icon type="arrow-down" className={`${prefix}menu-btn-arrow`} />
            </Button>
        );

        return (
            <Popup
                {...popupProps}
                followTrigger={followTrigger}
                visible={state.visible}
                onVisibleChange={this.onPopupVisibleChange}
                trigger={trigger}
                triggerType={popupTriggerType}
                container={popupContainer}
                onOpen={this.onPopupOpen}
                style={popupStyle}
                className={popupClassNames}
            >
                <div className={`${prefix}menu-btn-spacing-tb`}>
                    <Menu
                        {...menuProps}
                        ref={this._menuRefHandler}
                        selectedKeys={state.selectedKeys}
                        selectMode={selectMode}
                        onSelect={this.selectMenu}
                        onItemClick={this.clickMenuItem}
                    >
                        {children}
                    </Menu>
                </div>
            </Popup>
        );
    }
}

export type { MenuButtonProps };

export default ConfigProvider.config(polyfill(MenuButton), {
    componentName: 'MenuButton',
});
