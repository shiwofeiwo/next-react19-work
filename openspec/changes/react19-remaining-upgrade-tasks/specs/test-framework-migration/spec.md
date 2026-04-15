## ADDED Requirements

### Requirement: enzyme 遗留测试迁移到 Cypress
系统 SHALL 将所有使用 enzyme 的测试文件迁移到 Cypress，与项目主力测试框架保持一致。

#### Scenario: table/index-spec.js 迁移
- **WHEN** `components/table/__tests__/index-spec.js` 中的 enzyme `mount()` 调用被迁移
- **THEN** 使用 `cy.mount()` 替代 `mount()`，使用 `cy.get()` 替代 `.find()`
- **THEN** 测试行为和断言逻辑保持不变

#### Scenario: table/issue-spec.js 迁移
- **WHEN** `components/table/__tests__/issue-spec.js` 中的 enzyme 调用被迁移
- **THEN** 使用 Cypress API 重写

#### Scenario: date-picker2/index-spec.js 迁移
- **WHEN** `components/date-picker2/__tests__/index-spec.js` 中的 enzyme 调用被迁移
- **THEN** 使用 Cypress API 重写

#### Scenario: upload-spec.ts 删除
- **WHEN** `components/upload/__tests__upload-spec.ts` 已完全注释
- **THEN** 删除该文件

### Requirement: act 导入从 react-dom/test-utils 迁移到 react
系统 SHALL 将所有测试文件中的 `act` 导入从 `react-dom/test-utils` 改为 `react`。

#### Scenario: overlay 测试文件 act 导入更新
- **WHEN** `components/overlay/__tests__/index-v2-spec.tsx` 和 `index-spec.tsx` 中的 act 导入被更新
- **THEN** `act` 从 `react` 导入，不再从 `react-dom/test-utils` 导入

#### Scenario: table 测试文件 act 导入更新
- **WHEN** `components/table/__tests__/issue-spec.js` 中的 act 导入被更新
- **THEN** `act` 从 `react` 导入

#### Scenario: date-picker2 测试文件 act 导入更新
- **WHEN** `components/date-picker2/__tests__/index-spec.js` 中的 act 导入被更新
- **THEN** `act` 从 `react` 导入

### Requirement: 移除 enzyme 全部依赖
系统 SHALL 从 `package.json` 移除 enzyme 相关依赖。

#### Scenario: 依赖移除
- **WHEN** enzyme 测试文件全部迁移完成
- **THEN** `package.json` 不再包含 `enzyme`、`enzyme-adapter-react-16`、`@types/enzyme`
- **THEN** `package-lock.json` 中不再有 enzyme 相关包

#### Scenario: 全局扫描确认无残留
- **WHEN** 在 `components/` 目录搜索 `enzyme`、`react-dom/test-utils`
- **THEN** 无匹配结果

### Requirement: 废弃生命周期清理（测试文件）
系统 SHALL 确认测试文件中的 `componentWillMount` 等废弃 API 引用不影响测试运行。

#### Scenario: 废弃 API 不导致 Cypress 测试崩溃
- **WHEN** 使用 React 19 运行包含废弃生命周期引用的 Cypress 测试
- **THEN** 测试应正常通过（Cypress 使用真实 DOM，不受 React 19 废弃影响）
