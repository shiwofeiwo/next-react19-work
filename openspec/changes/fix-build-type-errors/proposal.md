## Why

`npm run build` 在 `transform to types` 阶段失败，产生 94 个 TypeScript 错误。这些错误主要源于 React 19 对 `ReactNode` 类型定义的收紧（不再包含 `void`、`unknown`、`{}`），以及 `children` 属性必须显式声明等类型系统变更。当前分支 `feature/react19-upgrade-from-1.27.29` 无法完成构建，阻塞了后续的发布和测试流程。

## What Changes

- **修复 `ReactNode` 类型不兼容**：约 25 个错误。React 19 的 `ReactNode` 不再包含 `void`、`unknown`、`{}`、`ComponentLocaleObject`。需要确保所有渲染位置返回有效的 `ReactNode`（`null` 而非 `void`，添加类型断言等）
- **为组件 Props 补充 `children` 声明**：约 15 个错误。React 19 要求 `children` 在 props 类型中显式声明，影响 class 组件和 `ConfiguredComponent` 包装的组件
- **修复 `ConfiguredComponent` 泛型类型兼容性**：约 10 个错误。`@alifd/field` 的 `ConfiguredComponent<P, C>` 类型不接受额外 props（如 `children`、`style`），需要在调用处进行类型断言或扩展 props 类型
- **修复 `HTMLElement` vs `Element` / `ReactElement` 类型不匹配**：约 4 个错误。DOM 元素类型和 React 元素类型之间的转换需要正确的类型守卫
- **清理已失效的 `@ts-expect-error` 指令**：约 3 个错误。之前的 React 19 修复已解决部分错误，导致对应的 `@ts-expect-error` 注释变得多余
- **修复杂项类型问题**：约 37 个错误。包括：state 类型隐式 `any`、函数签名不匹配、缺失属性声明、`Key` 类型变更（React 19 新增 `bigint`）、`capture` 属性类型收窄等

## Capabilities

### New Capabilities
- `react19-typing-compat`: 修复 React 19 类型系统变更引起的 94 个构建错误，确保所有组件通过 TypeScript 类型检查

### Modified Capabilities
<!-- 无既有 spec 需要修改 -->

## Impact

- **受影响组件**（25+ 个）：affix, animate, calendar2, card, cascader, cascader-select, config-provider, date-picker, dialog, form, list, menu, message, notification, overlay, pagination, progress, search, select, shell, slider, tab, time-picker2, timeline, transfer, tree-select, upload
- **核心类型文件**：各组件的 `types.ts` 需要更新 props 定义以包含 `children`
- **依赖影响**：`@alifd/field` 的 `ConfiguredComponent` 类型可能需要绕过（通过类型断言），无需升级外部依赖
- **构建流程**：修复后 `npm run build` 应能顺利完成 `transform to types` 阶段
- **无破坏性 API 变更**：所有修复仅涉及内部类型定义和类型断言，不影响运行时行为和公共 API
