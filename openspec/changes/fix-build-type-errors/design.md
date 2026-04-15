## Context

当前分支 `feature/react19-upgrade-from-1.27.29` 已将 React 升级到 19.2.5，但 `npm run build` 在 TypeScript 类型检查阶段失败，产生 94 个类型错误。

**根因分析**：

1. **React 19 `ReactNode` 收紧**：`void`、`{}`、`unknown` 不再是合法的 `ReactNode`。新增了 `bigint`、`Promise<AwaitedReactNode>`、`Iterable<ReactNode>`
2. **`children` 必须显式声明**：React 19 的类型定义不再隐式包含 `children`，class 组件的 props 接口必须显式声明
3. **`ConfiguredComponent<P, R>` 类型严格化**：本地定义的 `ConfiguredComponent`（在 `config-provider/types.ts`）泛型 `P` 仅包含组件自身 props，不包含 `children` 等隐式属性，导致 JSX 传入 children 时类型不匹配
4. **`Key` 类型变更**：React 19 的 `Key` 新增了 `bigint`，导致 `Key | null` 不再是 `string | number | boolean | null` 的子集

**约束**：
- 不能修改运行时行为，所有修复仅限类型层面
- 不能修改 `@types/react` 或 `@alifd/field` 等外部依赖
- `skipLibCheck: true` 已启用，外部 `.d.ts` 不会报错

## Goals / Non-Goals

**Goals:**
- 消除全部 94 个 TypeScript 构建错误，使 `npm run build` 通过
- 保持公共 API 不变，不引入破坏性变更
- 采用最小化、精确的类型修复，避免过度使用 `any`

**Non-Goals:**
- 不重构组件架构或迁移到函数组件 + Hooks
- 不升级 `@alifd/field`、`@alifd/overlay` 等依赖
- 不处理 ESLint / stylelint 的告警
- 不处理测试用例的运行时失败

## Decisions

### Decision 1: 修复 `void` 不可赋值给 `ReactNode`

**策略**：将隐式返回 `void` 的表达式改为显式返回 `null`

**替代方案**：
- ❌ 类型断言 `as ReactNode` — 掩盖真实问题
- ✅ 确保渲染函数返回 `null` 而非 `void` — 语义正确

**模式**：
```tsx
// Before: condition && doSomething()  (returns void when true)
// After:  condition ? doSomething() || null : null
// 或:     condition && (doSomething(), null)
```

### Decision 2: 为 Props 补充 `children` 声明

**策略**：在缺少 `children` 的 props 接口中添加 `children?: React.ReactNode`

**替代方案**：
- ❌ 使用 `PropsWithChildren<Props>` 包裹 class 声明 — 需要修改多处 class 定义
- ✅ 直接在 props 接口中添加 `children?` — 更明确，改动集中

**受影响的 props 类型**：`AffixProps`、`ErrorBoundaryConfig`、`SelecterProps`、`TabContentProps`、`Html5Props`、`IframeUploaderProps`、`AnimateChildProps`

### Decision 3: 修复 `ConfiguredComponent` JSX 类型不兼容

**策略**：在 JSX 传入 children 给 `ConfiguredComponent` 的地方使用类型断言

**理由**：`ConfiguredComponent<P, R>` 是由 `config()` 工厂函数创建的运行时包装器，运行时实际会透传所有 props（包括 children）。类型系统无法表达"这个包装后的组件接受原始 props + children"，所以类型断言是合理的。

**模式**：
```tsx
// Before: <WrappedComponent style={...}>{children}</WrappedComponent>
// After:  <WrappedComponent style={...} children={children} /> (avoid JSX children syntax)
// 或:     {React.cloneElement(<WrappedComponent style={...} />, { children })}
```

### Decision 4: 修复 `ComponentLocaleObject` / `unknown` 不可赋值给 `ReactNode`

**策略**：在渲染 locale 文本前进行类型收窄或断言

**模式**：
```tsx
// Before: {locale.someText}  (locale.someText: ComponentLocaleObject | string)
// After:  {locale.someText as React.ReactNode}
// 或在 props 类型中将 locale 字段类型收窄为 ReactNode
```

### Decision 5: 清理失效的 `@ts-expect-error`

**策略**：直接删除不再需要的 `@ts-expect-error` 注释

**涉及文件**：`slider/slider.tsx`、`time-picker2/module/date-input.tsx`、`menu/view/sub-menu.tsx`

### Decision 6: 修复杂项类型问题

**策略**：逐个组件精确修复：
- `notification/index.tsx`：为 state 添加类型参数 `<NotificationProps, NotificationState>`
- `menu/view/create.tsx`：修复 props 类型和 `getDOMNode` 替代方案
- `select/util.ts`：处理 `Key` 类型中的 `bigint`
- `upload/runtime/selecter.tsx`：修复 `capture` 属性类型
- `dialog/show.tsx`：修复 Modal props 类型断言
- `upload/dragger.tsx`：修复事件处理函数签名

## Risks / Trade-offs

- **类型断言过多** → 风险：掩盖潜在的类型安全问题。缓解：仅在 `ConfiguredComponent` 包装层使用，不应用于业务逻辑
- **`children` 类型过于宽泛** → 风险：`ReactNode` 涵盖面广，可能漏掉具体约束。缓解：保持与组件现有行为一致
- **后续 React 版本可能再次变更类型** → 风险：修复可能需要再次调整。缓解：使用 React 官方推荐的类型模式
- **未处理深层类型不兼容** → 风险：某些 `Readonly<P>` 赋值错误可能需要更深层重构。缓解：使用精确类型断言，最小化改动范围
