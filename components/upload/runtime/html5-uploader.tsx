import React, { Component } from 'react';
import { func } from '../../util';
import Uploader from './uploader';
import Selecter from './selecter';
import type { Html5Props, UploadFile } from '../types';

export default class Html5Uploader extends Component<Html5Props> {
    static defaultProps = {
        ...Selecter.defaultProps,
        name: 'file',
        multiple: false,
        withCredentials: true,
        beforeUpload: func.noop,
        onSelect: func.noop,
        onDragOver: func.noop,
        onDragLeave: func.noop,
        onDrop: func.noop,
        onProgress: func.noop,
        onSuccess: func.noop,
        onError: func.noop,
        onAbort: func.noop,
        method: 'post',
    };
    uploader: Uploader;

    componentDidMount() {
        const { props } = this;
        const options = this.getUploadOptions(props);
        this.uploader = new Uploader(options);
    }

    componentDidUpdate(prevProps: Html5Props) {
        const preOptions = this.getUploadOptions(prevProps);
        const options = this.getUploadOptions(this.props);

        const keys = Object.keys(options);

        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (options[key] !== preOptions[key]) {
                this.uploader.setOptions(options);
                return;
            }
        }
    }

    componentWillUnmount() {
        this.abort();
    }

    abort(file?: UploadFile) {
        this.uploader.abort(file);
    }

    startUpload(fileList: UploadFile[]) {
        this.uploader.startUpload(fileList);
    }

    getUploadOptions = (props: Html5Props): Record<string, unknown> => ({
        action: props.action,
        name: props.name,
        timeout: props.timeout,
        method: props.method,
        beforeUpload: props.beforeUpload,
        onProgress: props.onProgress,
        onSuccess: props.onSuccess,
        onError: props.onError,
        withCredentials: props.withCredentials,
        headers: props.headers,
        data: props.data,
        request: props.request,
    });

    render() {
        const {
            accept,
            multiple,
            webkitdirectory,
            children,
            id,
            disabled,
            dragable,
            style,
            className,
            onSelect,
            onDragOver,
            onDragLeave,
            onDrop,
            name,
            ...others
        } = this.props;

        return (
            <Selecter
                {...others}
                id={id}
                accept={accept}
                multiple={multiple}
                webkitdirectory={webkitdirectory}
                dragable={dragable}
                disabled={disabled}
                className={className}
                style={style}
                onSelect={onSelect}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                name={name}
            >
                {children}
            </Selecter>
        );
    }
}
