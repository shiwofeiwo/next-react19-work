import React, { Children, Component, type ReactElement, type ReactNode, cloneElement } from 'react';
import classNames from 'classnames';

import { obj, func, type ClassPropsWithDefault } from '../util';
import NextField, { type FieldOption } from '../field';
import RGrid from '../responsive-grid';
import FormContext from './context';
import type { ChildExtraProperties, FormProps, RemoveUndefined } from './types';

export type FormWithDefaultProps = ClassPropsWithDefault<FormProps, typeof Form.defaultProps>;

function pickerDefined(obj: Record<string, unknown>) {
    const newObj: RemoveUndefined<typeof obj> = {};
    Object.keys(obj).forEach(i => {
        if (typeof obj[i] !== 'undefined') {
            newObj[i] = obj[i];
        }
    });
    return newObj;
}

function preventDefault(e: Event) {
    e.preventDefault();
}

const getNewChildren: (children: ReactNode, props: FormProps) => ReactNode = (
    children: ReactNode,
    props: FormProps
) => {
    const { size, device, labelAlign, labelTextAlign, labelCol, wrapperCol, responsive, colon } =
        props;

    return Children.map(children, (child: ReactElement<any> & ChildExtraProperties) => {
        if (obj.isReactFragmentElement(child)) {
            return getNewChildren(child.props.children, props);
        }

        if (
            child &&
            ['function', 'object'].indexOf(typeof child.type) > -1 &&
            child.type._typeMark === 'form_item'
        ) {
            const childrenProps = {
                labelCol: child.props.labelCol ? child.props.labelCol : labelCol,
                wrapperCol: child.props.wrapperCol ? child.props.wrapperCol : wrapperCol,
                labelAlign: child.props.labelAlign
                    ? child.props.labelAlign
                    : device === 'phone'
                      ? 'top'
                      : labelAlign,
                labelTextAlign: child.props.labelTextAlign
                    ? child.props.labelTextAlign
                    : labelTextAlign,
                colon: 'colon' in child.props ? child.props.colon : colon,
                size: child.props.size ? child.props.size : size,
                responsive: responsive,
            };
            return cloneElement(child, pickerDefined(childrenProps));
        }
        return child;
    });
};

const FORM_PROP_KEYS = [
    'prefix',
    'inline',
    'size',
    'fullWidth',
    'labelAlign',
    'labelTextAlign',
    'field',
    'saveField',
    'labelCol',
    'wrapperCol',
    'onSubmit',
    'children',
    'className',
    'style',
    'value',
    'onChange',
    'component',
    'fieldOptions',
    'rtl',
    'device',
    'responsive',
    'isPreview',
    'useLabelForErrorMessage',
    'preferMarginToDisplayHelp',
    'colon',
    'disabled',
    'gap',
];

/** Form */
export default class Form extends Component<FormProps> {
    static displayName = 'Form';
    static defaultProps = {
        prefix: 'next-',
        onSubmit: preventDefault,
        size: 'medium',
        labelAlign: 'left',
        onChange: func.noop,
        component: 'form',
        saveField: func.noop,
        device: 'desktop',
        colon: false,
        disabled: false,
        preferMarginToDisplayHelp: false,
    };

    readonly props: FormWithDefaultProps;

    _formField: NextField | null;
    constructor(props: FormProps) {
        super(props);

        this._formField = null;
        if (props.field !== false) {
            const options: FieldOption = {
                ...props.fieldOptions,
                onChange: this.onChange,
            };

            if (props.field) {
                this._formField = props.field;
                const onChange = this._formField.options.onChange;
                options.onChange = func.makeChain(onChange, this.onChange);
                this._formField!.setOptions && this._formField.setOptions(options);
            } else {
                if ('value' in props) {
                    options.values = props.value;
                }

                this._formField = new NextField(this, options);
            }

            if (props.locale && props.locale.Validate) {
                this._formField.setOptions({ messages: props.locale.Validate });
            }

            props.saveField!(this._formField);
        }
    }

    componentDidUpdate(prevProps: FormProps) {
        const props = this.props;

        if (this._formField) {
            if ('value' in props && props.value !== prevProps.value) {
                this._formField.setValues(props.value);
            }
            if ('error' in props && props.error !== prevProps.error) {
                this._formField.setValues(props.error);
            }
        }
    }

    onChange = (name: string, value: string) => {
        this.props.onChange!(this._formField!.getValues(), {
            name,
            value,
            field: this._formField,
        });
    };

    render() {
        const {
            className,
            inline,
            size,
            device,
            onSubmit,
            children,
            style,
            prefix,
            rtl,
            isPreview,
            component: Tag,
            responsive,
            gap,
        } = this.props;

        const formClassName = classNames({
            [`${prefix}form`]: true,
            [`${prefix}inline`]: inline, // 内联
            [`${prefix}${size}`]: size,
            [`${prefix}form-responsive-grid`]: responsive,
            [`${prefix}form-preview`]: isPreview,
            [className!]: !!className,
        });

        const newChildren = getNewChildren(children, this.props);

        const formContextValue = {
            _formField: this.props.field ? this.props.field : this._formField,
            _formSize: this.props.size!,
            _formDisabled: this.props.disabled!,
            _formPreview: !!this.props.isPreview,
            _formFullWidth: !!this.props.fullWidth,
            _formLabelForErrorMessage: !!this.props.useLabelForErrorMessage,
            _formMarginToDisplayHelp: this.props.preferMarginToDisplayHelp!,
        };

        return (
            <FormContext.Provider value={formContextValue}>
                <Tag
                    role="form"
                    {...obj.pickOthers(FORM_PROP_KEYS, this.props)}
                    className={formClassName}
                    style={style}
                    dir={rtl ? 'rtl' : undefined}
                    onSubmit={onSubmit}
                >
                    {responsive ? (
                        <RGrid gap={gap} device={device}>
                            {newChildren}
                        </RGrid>
                    ) : (
                        newChildren
                    )}
                </Tag>
            </FormContext.Provider>
        );
    }
}
