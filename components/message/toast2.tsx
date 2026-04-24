import { createRoot, type Root } from 'react-dom/client';
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import ConfigProvider from '../config-provider';
import Animate from '../animate';
import Message from './message';
import { obj, log, guid } from '../util';
import type {
    OpenProps,
    MessageQuickProps,
    MessageWrapperProps,
    MessageWrapperItem,
} from './types';

const config = {
    top: 8,
    maxCount: 0,
    duration: 3000,
};
export type MessageConfig = Partial<typeof config>;

const MessageWrapper = (props: MessageWrapperProps) => {
    const { prefix = 'next-', dataSource = [] } = props;
    const [, forceUpdate] = useState<Record<string, never>>();

    dataSource.forEach(i => {
        if (!i.timer) {
            i.timer = setTimeout(() => {
                const idx = dataSource.indexOf(i);
                if (idx > -1) {
                    const item = dataSource[idx];
                    typeof item.onClose === 'function' && item.onClose();
                    dataSource.splice(idx, 1);
                    forceUpdate({});
                }
            }, i.duration);
        }
    });

    return (
        <div className={`${prefix}message-wrapper-v2`} style={{ top: config.top }}>
            <Animate
                animationAppear
                animation={{
                    appear: 'pulse',
                    enter: 'pulse',
                    leave: `${prefix}message-fade-leave`,
                }}
                singleMode={false}
            >
                {dataSource.map(i => {
                    const { key, className, type, title, content, style, ...others } = i;
                    return (
                        <div className={`${prefix}message-list`} key={key}>
                            <Message
                                {...others}
                                className={className}
                                prefix={prefix}
                                visible
                                type={type}
                                shape="toast"
                                title={title}
                                style={style}
                            >
                                {content}
                            </Message>
                        </div>
                    );
                })}
            </Animate>
        </div>
    );
};

const ConfigedMessages = ConfigProvider.config(MessageWrapper);

let messageRootNode: HTMLDivElement | null = null;
let messageRoot: Root | null = null;
let messageList: MessageWrapperProps['dataSource'] = [];

// 缓存同一个 container 上的 createRoot 结果——每次都 createRoot 会让上一次 mount
// 变成孤儿 root（React 19 警告 + 组件 lifecycle 不触发，导致 Message 无法正确 unmount）
function renderMessages() {
    if (!messageRootNode) return;
    if (!messageRoot) {
        messageRoot = createRoot(messageRootNode);
    }
    messageRoot.render(
        <ConfigProvider {...ConfigProvider.getContext()}>
            <ConfigedMessages dataSource={messageList} />
        </ConfigProvider>
    );
}

const createMessage = (props: MessageQuickProps & { key?: string }) => {
    const { key = guid('message-'), ...others } = props;
    if (!messageRootNode) {
        messageRootNode = document.createElement('div');
        document.body.appendChild(messageRootNode);
    }

    const { maxCount, duration } = config;

    const item: MessageWrapperItem = {
        key,
        duration,
        ...others,
    };

    messageList.push(item);

    if (maxCount && messageList.length > maxCount) {
        messageList.shift();
    }

    renderMessages();

    return {
        key,
        close: () => {
            if (item.timer) {
                clearTimeout(item.timer);
            }
            const idx = messageList.indexOf(item);
            if (idx > -1) {
                typeof item.onClose === 'function' && item.onClose();
                messageList.splice(idx, 1);
                renderMessages();
            }
        },
    };
};

function close(key?: string) {
    if (key) {
        const index = messageList.findIndex(item => item.key === key);
        if (index > -1) {
            messageList.splice(index, 1);
        }
    } else {
        messageList = [];
    }

    renderMessages();
}

function handleConfig(config: OpenProps, type?: MessageQuickProps['type']) {
    let newConfig: MessageQuickProps = {};

    if (typeof config === 'string' || React.isValidElement(config)) {
        newConfig.title = config;
    } else if (obj.typeOf(config) === 'Object') {
        newConfig = { ...config } as MessageQuickProps;
    }

    if (type) {
        newConfig.type = type;
    }

    return newConfig;
}

function open(type?: MessageQuickProps['type']) {
    return (config: OpenProps) => {
        config = handleConfig(config, type);
        return createMessage(config);
    };
}

function destory() {
    if (!messageRootNode) return;
    // 复用缓存的 root；从未创建过就不用再 unmount
    if (messageRoot) {
        messageRoot.unmount();
        messageRoot = null;
    }
    messageRootNode.parentNode?.removeChild(messageRootNode);
    messageRootNode = null;
    messageList = [];
}

export default {
    open: open(),
    success: open('success'),
    warning: open('warning'),
    error: open('error'),
    help: open('help'),
    loading: open('loading'),
    notice: open('notice'),
    close,
    destory,
    config(...args: MessageConfig[]) {
        if (!useState) {
            log.warning('need react version > 16.8.0');
            return;
        }
        return Object.assign(config, ...args);
    },
};
