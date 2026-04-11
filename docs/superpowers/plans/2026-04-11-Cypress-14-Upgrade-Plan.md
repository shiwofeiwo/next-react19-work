# Cypress 14 Upgrade Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 Cypress 从 13.6.1 升级到 14.x，适配 React 19，保证所有组件测试功能不变，最小化改动。

**Architecture:** 基于官方 Cypress 14 Migration Guide，直接升级依赖版本，验证测试通过即可。

**Tech Stack:** Cypress 14.x, React 19, Vite, TypeScript

---

## 官方升级指南对应关系

| 官方指南章节 | 本计划对应 |
|---|---|
| Node.js 18+ support | Step 0.1 (前置检查) |
| React 18 CT no longer supported | Step 0.2 + Task 1 |
| cypress/react18 deprecated | Task 1 |
| cy.origin() changes | Task 2 (如需) |
| resourceType deprecation | Task 3 (如需) |
| JIT compilation changes | Task 4 (如需) |

---

## 升级影响评估

### 本项目 Cypress 现状

| 项目 | 当前值 | Cypress 14 要求 | 状态 |
|---|---|---|---|
| Cypress 版本 | 13.6.1 | 14.x | ❌ 需升级 |
| Node.js 版本 | 22.16.0 | 18+ | ✅ 已满足 |
| React 版本 | 19.2.5 | 18+ | ✅ 已满足 |
| mount 导入 | `cypress/react` | `cypress/react` | ✅ 无需改动 |
| cypress/react18 | 未使用 | 已废弃 | ✅ 无需改动 |
| cy.origin() | 未使用 | 跨域测试需使用 | ✅ 当前无跨域测试 |
| resourceType | 未使用 | 已deprecated | ✅ 无需改动 |
| experimentalJustInTimeCompile | 未使用 | 已移除 | ✅ 无需改动 |

**结论**: 本项目升级非常简单，主要是更新 cypress 依赖版本。

---

## Task 0: 前置检查

> **官方指南**: [Node.js 18+ support](https://docs.cypress.io/app/references/migration-guide#Nodejs-18-support)

- [ ] **Step 0.1: 确认 Node.js 版本**

```bash
node --version
```

预期输出: `v18.x.x` 或更高版本 (本项目为 v22.16.0，满足要求)

- [ ] **Step 0.2: 确认当前 package.json 中的 cypress 版本**

```bash
grep "cypress" package.json
```

预期输出: `"cypress": "^13.6.1"`

---

## Task 1: 升级 Cypress 依赖

> **官方指南**: [React 18 CT no longer supported](https://docs.cypress.io/app/references/migration-guide#React-18-CT-no-longer-supported)
>
> **重要**: 由于本项目已使用 React 19 和 `cypress/react` (非 `cypress/react18`)，无需修改任何测试文件。

- [ ] **Step 1.1: 更新 package.json 中的 cypress 版本**

Modify: `package.json`

```json
// Before
"cypress": "^13.6.1",

// After
"cypress": "^14.0.0",
```

- [ ] **Step 1.2: 安装新版本**

```bash
npm install
```

或

```bash
npm install cypress@14.0.0 --save-dev
```

- [ ] **Step 1.3: 验证安装**

```bash
npm ls cypress
```

预期输出: `cypress@14.x.x`

- [ ] **Step 1.4: 验证 cypress/react 导入仍然有效**

```bash
grep -rn "from 'cypress/react'" --include="*.tsx" components/ | head -5
```

预期: 所有测试文件仍使用 `cypress/react` (非 `cypress/react18`)

---

## Task 2: 验证测试运行 (cy.origin 检查)

> **官方指南**: [Changes to cy.origin()](https://docs.cypress.io/app/references/migration-guide#Changes-to-cyorigin)
>
> 如果没有跨域测试，此 Task 可跳过。

- [ ] **Step 2.1: 检查是否有跨域测试**

```bash
grep -rn "cy\.origin\|cy\.visit.*://" --include="*.tsx" components/ | grep -v -E "(__docs__|node_modules)" | head -20
```

- 如果无输出: 跳过 Task 2
- 如果有输出: 继续 Step 2.2

- [ ] **Step 2.2: 如有跨域测试，验证配置**

如果测试涉及跨域，需要使用 `cy.origin()` 或设置 `injectDocumentDomain: true` (deprecated)。

```typescript
// 方案 1: 使用 cy.origin()
cy.origin('https://example.com', () => {
  cy.get('selector').should('be.visible');
});

// 方案 2: 临时兼容 (deprecated，Cypress 会警告)
cypress.config.ts
export default defineConfig({
  e2e: {
    experimentalWebKitSupport: true,
  },
  component: {
    // ...
  },
});
```

---

## Task 3: resourceType 检查 (可选)

> **官方指南**: [Deprecation of resourceType on cy.intercept](https://docs.cypress.io/app/references/migration-guide#Deprecation-of-resourceType-on-cyintercept)

- [ ] **Step 3.1: 检查 cy.intercept 的 resourceType 使用**

```bash
grep -rn "resourceType" --include="*.tsx" components/ | grep -v -E "(__docs__|node_modules)"
```

- 如果无输出: 跳过 Task 3
- 如果有输出: 考虑移除 resourceType 或忽略 deprecation warning (功能仍可用)

---

## Task 4: JIT 编译配置检查 (可选)

> **官方指南**: [CT Just in Time Compile changes](https://docs.cypress.io/app/references/migration-guide#CT-Just-in-Time-Compile-changes)
>
> JIT 编译现在是默认行为，无需配置。

- [ ] **Step 4.1: 检查是否有过时的 experimentalJustInTimeCompile 配置**

```bash
grep -rn "experimentalJustInTimeCompile" --include="*.ts" --include="*.js" . | grep -v node_modules
```

- 如果无输出: 跳过 Task 4
- 如果有输出: 移除该配置，JIT 现在是默认行为

---

## Task 5: 验证测试套件

- [ ] **Step 5.1: 打开 Cypress GUI 验证组件测试**

```bash
npx cypress open
```

选择 "Component Testing"，验证所有组件测试可正常加载和运行。

- [ ] **Step 5.2: 运行完整组件测试**

```bash
npx cypress run --component
```

预期: 所有测试通过 (或仅出现与 React 19 相关的预期错误，这些应在 React 19 升级计划中处理)

- [ ] **Step 5.3: 验证关键组件测试**

运行以下组件的测试，确认基本功能正常:

```bash
# Button 组件
npx cypress run --component --spec "components/button/__tests__/index-spec.tsx"

# Dialog 组件
npx cypress run --component --spec "components/dialog/__tests__/index-spec.tsx"

# Form 组件
npx cypress run --component --spec "components/form/__tests__/index-spec.tsx"
```

预期: 测试通过

---

## Task 6: 清理与提交

- [ ] **Step 6.1: 运行 ESLint 检查**

```bash
npm run check:eslint
```

- [ ] **Step 6.2: 提交更改**

```bash
git add package.json
git commit -m "chore(deps): upgrade cypress from 13.6.1 to 14.x"
```

---

## 回滚计划

如遇问题，回滚命令:

```bash
npm install cypress@13.6.1 --save-dev
```

---

## 参考资料

- [Cypress 14.0 Migration Guide](https://docs.cypress.io/app/references/migration-guide#Migrating-to-Cypress-140)
- [Cypress 14.0 Changelog](https://docs.cypress.io/app/references/changelog#14-0-0)
- [cypress/react 迁移说明](https://docs.cypress.io/app/component-testing/react/overview#React-18-and-the-cypressreact-harness)
