## ADDED Requirements

### Requirement: 移除所有 react-lifecycles-compat 导入
系统 SHALL 从所有组件文件中移除 `import { polyfill } from 'react-lifecycles-compat'` 语句。

#### Scenario: 批量移除 import 语句
- **WHEN** 执行 react-lifecycles-compat 清理脚本
- **THEN** 所有 70 个组件文件中的 `import { polyfill } from 'react-lifecycles-compat'` 行被移除

#### Scenario: 不影响其他 import
- **WHEN** 移除 react-lifecycles-compat import
- **THEN** 同一文件中的其他 import 语句保持不变

### Requirement: 移除所有 polyfill() 调用
系统 SHALL 从所有组件文件中移除 `polyfill(ComponentName)` 调用语句。

#### Scenario: 批量移除 polyfill 调用
- **WHEN** 执行清理脚本
- **THEN** 所有 70 个组件文件中的 `polyfill(ComponentName)` 行被移除

#### Scenario: polyfill 调用位置不影响移除
- **WHEN** `polyfill()` 调用在文件末尾
- **THEN** 该行被正确移除，不留下多余空行

### Requirement: 从 package.json 移除依赖
系统 SHALL 从 `package.json` 的 `dependencies` 中移除 `react-lifecycles-compat`。

#### Scenario: 依赖被移除
- **WHEN** 清理完成
- **THEN** `package.json` 中不再包含 `react-lifecycles-compat` 依赖
- **THEN** `package-lock.json` 中不再包含 `react-lifecycles-compat`

### Requirement: 构建验证
系统 SHALL 在移除后通过完整的构建和类型检查。

#### Scenario: TypeScript 编译通过
- **WHEN** 运行 `npm run check:types`
- **THEN** 无新增类型错误

#### Scenario: 构建通过
- **WHEN** 运行 `npm run build`
- **THEN** 构建成功完成，产出 lib/、es/、dist/ 目录
