## 1. Props 接口补充 children 声明

- [ ] 1.1 `components/affix/types.ts` — 在 `AffixProps` 中添加 `children?: React.ReactNode`
- [ ] 1.2 `components/config-provider/types.ts` — 在 `ErrorBoundaryConfig` 中添加 `children?: React.ReactNode`
- [ ] 1.3 `components/upload/types.ts` — 在 `SelecterProps` 中添加 `children?: ReactNode`
- [ ] 1.4 `components/upload/types.ts` — 在 `Html5Props` 中添加 `children?: ReactNode`
- [ ] 1.5 `components/upload/types.ts` — 在 `IframeUploaderProps` 中添加 `children?: ReactNode`
- [ ] 1.6 `components/tab/types.ts` — 在 `TabContentProps` 中添加 `children?: React.ReactNode`
- [ ] 1.7 `components/animate/types.ts` — 在 `AnimateChildProps` 中添加 `children`（或修复 `Readonly<P>` 赋值）

## 2. 修复 void/unknown 不可赋值给 ReactNode（~25 个错误）

- [ ] 2.1 `components/pagination/pagination.tsx:183` — 确保 render 函数返回 `null` 而非 `void`
- [ ] 2.2 `components/slider/slick/dots.tsx:68` — 修复 void 返回值
- [ ] 2.3 `components/upload/card.tsx:165` — 修复 void 返回值
- [ ] 2.4 `components/upload/list.tsx` — 批量修复 184、193、201、211、274、276、295、304、311、380、447、449 行的 void/类型错误
- [ ] 2.5 `components/upload/upload.tsx:402` — 修复 void 返回值
- [ ] 2.6 `components/date-picker/month-picker.tsx:243` — 修复 void 返回值
- [ ] 2.7 `components/select/select.tsx` — 修复 795、808、816、843 行的 `unknown` / `HTMLElement` 不可赋值给 ReactNode
- [ ] 2.8 `components/tab/index.tsx:46` — 修复 `unknown` 不可赋值给 ReactNode
- [ ] 2.9 `components/progress/index.tsx:28` — 修复 `() => unknown` 类型签名
- [ ] 2.10 `components/search/index.tsx:22` — 修复 `{}` 不可赋值给 ReactNode

## 3. 修复 locale 类型与 ReactNode 不兼容（~5 个错误）

- [ ] 3.1 `components/card/collapse-content.tsx:123` — 将 locale 值断言为 ReactNode
- [ ] 3.2 `components/cascader-select/cascader-select.tsx:692` — 将 locale 值断言为 ReactNode
- [ ] 3.3 `components/list/list.tsx:70` — 将 locale 值断言为 ReactNode
- [ ] 3.4 `components/timeline/view/timeline-item.tsx` — 修复 178、183 行的 locale 类型

## 4. 修复 ConfiguredComponent 类型兼容性（~10 个错误）

- [ ] 4.1 `components/shell/shell.tsx:600` — 修复 Affix ConfiguredComponent children 传参
- [ ] 4.2 `components/tab/tab.tsx:312` — 修复 TabContent ConfiguredComponent children 传参
- [ ] 4.3 `components/cascader/menu.tsx:105` — 修复 ref 回调类型 `HTMLUListElement` vs `ConfiguredComponent`
- [ ] 4.4 `components/transfer/view/transfer-panel.tsx:239` — 修复 ref 回调类型
- [ ] 4.5 `components/dialog/dialog-v2.tsx:323` — 修复 Modal ConfiguredComponent props 不兼容
- [ ] 4.6 `components/dialog/inner.tsx:170` — 修复 Button ConfiguredComponent props 不兼容
- [ ] 4.7 `components/dialog/show.tsx` — 修复 161、162、198、202、217、263 行的 Modal props 类型问题
- [ ] 4.8 `components/message/toast.tsx` — 修复 96、99、107、149 行的 Mask/Button ConfiguredComponent 类型
- [ ] 4.9 `components/form/submit.tsx:29,33` — 修复 Button ConfiguredComponent 重载不匹配

## 5. 修复 HTMLElement vs Element 类型不匹配（~4 个错误）

- [ ] 5.1 `components/overlay/position.tsx:194,196` — 修复 Element 传给 HTMLElement 参数，使用 `as HTMLElement` 断言
- [ ] 5.2 `components/select/base.tsx:446` — 修复 `ConfiguredComponent` 传给 `HTMLUListElement | null` 参数

## 6. 修复杂项类型问题（~20 个错误）

- [ ] 6.1 `components/notification/index.tsx` — 为组件添加 `<NotificationProps, NotificationState>` 类型参数，修复 77、78、105、150、169 行的 state 和隐式 any 错误
- [ ] 6.2 `components/menu/view/create.tsx` — 修复 43、46、107 行的 props 兼容性和 state 类型
- [ ] 6.3 `components/menu/view/item.tsx` — 修复 54 行 `getDOMNode` 不存在（改用 `findDOMNode` 或 ref），204 行 union type 过于复杂
- [ ] 6.4 `components/menu/view/menu.tsx:176` — 修复 ReactNode 子类型不兼容
- [ ] 6.5 `components/cascader/cascader.tsx:819` — 修复 `onMouseLeave` 不存在
- [ ] 6.6 `components/calendar2/calendar.tsx:279` — 修复 `locale` 属性缺失
- [ ] 6.7 `components/date-picker/range-picker.tsx` — 修复 841、852、871 行的 `Readonly<P>` 赋值错误
- [ ] 6.8 `components/date-picker/week-picker.tsx:262` — 修复 `placeholder` 属性缺失
- [ ] 6.9 `components/select/util.ts:124` — 修复 `Key` 类型中的 `bigint` 不兼容
- [ ] 6.10 `components/transfer/types.ts:148` — 修复 `TransferProps.children` 与 `HTMLAttributesWeak.children` 不兼容
- [ ] 6.11 `components/tree-select/tree-select.tsx:126` — 修复 `{ key; pos }` 类型缺少 `children`
- [ ] 6.12 `components/upload/dragger.tsx:103,104` — 修复事件处理函数签名不匹配
- [ ] 6.13 `components/upload/runtime/selecter.tsx:129` — 修复 `capture` 属性类型收窄
- [ ] 6.14 `components/message/toast2.tsx:120` — 修复 `HTMLDivElement | null` 传给 `Container` 参数

## 7. 清理失效的 @ts-expect-error

- [ ] 7.1 `components/slider/slider.tsx:172` — 删除多余的 `@ts-expect-error`
- [ ] 7.2 `components/time-picker2/module/date-input.tsx:137` — 删除多余的 `@ts-expect-error`
- [ ] 7.3 `components/menu/view/sub-menu.tsx:254` — 删除多余的 `@ts-expect-error`

## 8. 验证构建

- [ ] 8.1 运行 `npm run build` 确认零 TypeScript 错误
- [ ] 8.2 运行 `npm run check:types` 确认类型检查通过
