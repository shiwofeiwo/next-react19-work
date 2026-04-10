# React 19 Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 @alifd/next 组件库从 React 16 升级到 React 19，保证所有组件的外部 API、Props 定义及交互功能与当前版本完全一致。

**Architecture:** 采用最小改动原则，仅针对 React 19 Breaking Changes 进行必要调整。按优先级分批修改：先修改测试文件中的废弃 API，再处理 forwardRef/propTypes 等建议性变更。

**Tech Stack:** React 19, ReactDOM 19, TypeScript, Cypress, Enzyme

---

## 受影响文件清单

> **扫描范围**: 仅扫描 `components/` 下的源代码文件，排除 `__docs__`、`__tests__`、`mobile` 文件夹。

### 高优先级（Breaking Changes，必须修改）

#### A. ReactDOM.render / unmountComponentAtNode（5个文件）

| 文件                                  | 问题                                          | 修改方式                               |
| ----------------------------------- | ------------------------------------------- | ---------------------------------- |
| `components/dialog/show.tsx`        | `unmountComponentAtNode`, `ReactDOM.render` | 改用 `createRoot` + `root.unmount()` |
| `components/drawer/show.tsx`        | 同上                                          | 同上                                 |
| `components/message/toast.tsx`      | 同上                                          | 同上                                 |
| `components/message/toast2.tsx`     | 同上                                          | 同上                                 |
| `components/notification/index.tsx` | 同上                                          | 同上                                 |

#### B. findDOMNode（24个文件）

| 组件           | 文件                                                | 修改方式            |
| ------------ | ------------------------------------------------- | --------------- |
| overlay      | gateway.tsx, overlay.tsx, popup.tsx, position.tsx | ref 替代          |
| menu         | item.tsx, menu.tsx, popup-item.tsx, sub-menu.tsx  | ref 替代          |
| tree         | tree.tsx, tree-node.tsx, tree-node-input.tsx      | ref 替代          |
| step         | step.tsx, step-item.tsx                           | ref 替代          |
| dialog       | dialog-v2.tsx                                     | ref 替代          |
| split-button | index.tsx                                         | ref 替代          |
| tab          | tabs/nav.tsx                                      | ref 替代          |
| cascader     | menu.tsx                                          | ref 替代          |
| input        | textarea.tsx                                      | ref 替代          |
| card         | collapse-content.tsx                              | ref 替代          |
| calendar     | head/menu.tsx                                     | ref 替代          |
| notification | index.tsx                                         | ref 替代          |
| upload       | runtime/iframe-uploader.tsx                       | ref 替代          |
| virtual-list | virtual-list.tsx                                  | ref 替代          |
| select       | base.tsx                                          | ref 替代 ✅ 已在本次修改 |
| menu-button  | index.tsx                                         | ref 替代          |

#### C. ReactChild / ReactFragment（5个文件）

> React 19 不再从 `react` 导出 `ReactChild` 和 `ReactFragment`。需要改用 `ReactNode` 或 `ReactElement`。

| 文件 | 问题 | 修改方式 |
|------|------|----------|
| `components/menu/types.ts` | `ReactChild`, `ReactFragment` 导入 | 改用 `ReactElement` 或 `ReactNode` |
| `components/menu/view/menu.tsx` | `ReactChild`, `ReactFragment` 导入 | 同上 |
| `components/menu/view/group.tsx` | `ReactChild` 导入 | 同上 |
| `components/menu/__docs__/theme/index.tsx` | `ReactChild` 导入 | 同上 |
| `components/form/form.tsx` | `ReactChild` 导入 | 同上 |

#### D. children prop 类型问题（隐式 children）

> React 19 要求显式声明 `children` prop，且 `ReactNode` 类型更严格。部分组件通过 `React.Children.map` 访问 `child.props` 时需要类型断言。

| 文件 | 问题 | 修改方式 |
|------|------|----------|
| `components/affix/index.tsx` | `children` 属性不存在于类型 | 显式添加 `children?: ReactNode` |
| `components/animate/animate.tsx` | 同上 | 同上 |
| `components/animate/overlay-animate.tsx` | `children.props` 类型为 `unknown` | 使用 `ReactElement` 类型断言 |
| `components/avatar/index.tsx` | `icon.props` 类型为 `unknown` | 同上 |
| `components/balloon/balloon.tsx` | `element.props` 类型为 `unknown` | 同上 |
| `components/balloon/util.tsx` | 同上 | 同上 |
| `components/box/index.tsx` | `child.props` 类型为 `unknown` | 同上 |
| `components/breadcrumb/index.tsx` | 同上 | 同上 |
| `components/button/view/button.tsx` | 同上 | 同上 |
| `components/collapse/collapse.tsx` | 同上 | 同上 |
| `components/checkbox/checkbox-group.tsx` | 同上 | 同上 |
| `components/form/form.tsx` | 同上 | 同上 |
| `components/grid/row.tsx` | 同上 | 同上 |
| `components/list/list.tsx` | 同上 | 同上 |
| `components/step/view/step.tsx` | 同上 | 同上 |
| `components/tree-select/tree-select.tsx` | 同上 | 同上 |
| `components/tree/view/tree.tsx` | 同上 | 同上 |

**通用修改模式**：
```typescript
// 原来
React.Children.map(children, child => {
    return child.props.xxx;  // ❌ TS18046: child.props is of type 'unknown'
});

// 改为
React.Children.map(children, (child: ReactElement) => {
    return child.props.xxx;  // ✅
});
```

#### E. Form 组件类型冲突

| 文件 | 问题 | 修改方式 |
|------|------|----------|
| `components/form/types.ts` | `ErrorProps.children` 类型冲突 | children 可为函数，需调整类型定义 |
| `components/form/types.ts` | `FormProps.onSubmit` 类型不兼容 | `FormEventHandler` vs `SubmitEventHandler` |

**ErrorProps.children 修改**：
```typescript
// 原来
export interface ErrorProps extends HTMLAttributes<HTMLElement> {
    children?: ReactNode | ((errors: errorsGroup, state?: FieldState) => ReactNode);
}

// 改为 - 使用交叉类型
export interface ErrorProps extends Omit<HTMLAttributes<HTMLElement>, 'children'>, CommonProps {
    children?: ReactNode | ((errors: errorsGroup, state?: FieldState) => ReactNode);
}
```

**FormProps.onSubmit 修改**：
```typescript
// 原来
export interface FormProps extends CommonProps, HTMLAttributesWeak {
    onSubmit?: (e: FormEvent<HTMLFormElement>) => void;
}

// 改为
export interface FormProps extends CommonProps, HTMLAttributesWeak {
    onSubmit?: (e: FormEvent<HTMLFormElement> | SubmitEvent) => void;
}
```

#### F. ConfigProvider.Consumer JSX 组件问题

> React 19 中 `Context.Consumer` 不能作为 JSX 组件使用。

| 文件 | 问题 | 修改方式 |
|------|------|----------|
| `components/message/toast.tsx` | `ConfigProvider.Consumer` 不能作为 JSX 组件 | 改用 `ConfigProvider` as hook 或其他模式 |

### 中优先级（建议修改）

| 文件                                      | 问题               | 建议                                |
| --------------------------------------- | ---------------- | --------------------------------- |
| `components/time-picker2/index.tsx`     | `forwardRef` 使用  | React 19 仍支持，可保留                  |
| `components/config-provider/config.tsx` | 函数组件 `propTypes` | React 19 会静默忽略，建议 TypeScript 类型替代 |

---

## Task 0: 升级 React 和 React-DOM 依赖

> **重要**: 此步骤应在所有代码修改完成后进行，或者在修改前先安装依赖以便测试。

- [ ] **Step 1: 安装 React 19**

```bash
npm install --save-exact react@^19.0.0 react-dom@^19.0.0
```

- [ ] **Step 2: 安装 React 19 TypeScript 类型**

```bash
npm install --save-exact @types/react@^19.0.0 @types/react-dom@^19.0.0
```

- [ ] **Step 3: 验证安装**

```bash
npm ls react react-dom
```

---

## Task 1: 扫描确认（验证范围）

- [ ] **Step 1: 确认扫描结果**

```bash
# 确认 findDOMNode 使用（排除 __docs__/__tests__/mobile）
grep -rl "findDOMNode" --include="*.tsx" components/ | grep -v -E "(__docs__|__tests__|mobile)"

# 确认 ReactDOM.render/unmountComponentAtNode（排除 __docs__/__tests__/mobile）
grep -rl "ReactDOM\.\(render\|unmountComponentAtNode\)" --include="*.tsx" components/ | grep -v -E "(__docs__|__tests__|mobile)"
```

---

## Task 2: 修改 message/toast.tsx, message/toast2.tsx, drawer/show.tsx, notification/index.tsx

**说明**: 这些文件使用模式与 `dialog/show.tsx` 相同，按照相同模式修改。

- [ ] **Step 1: 修改导入**

```typescript
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
```

- [ ] **Step 2: 修改 show 函数**

```typescript
// 原来
let root: ReactDOM.Root;
const unmount = () => {
    ReactDOM.unmountComponentAtNode(container);  // ❌ deprecated
    container.parentNode?.removeChild(container);
};
document.body.appendChild(container);
ReactDOM.render(<ConfigProvider {...newContext}>...</ConfigProvider>, container);  // ❌ deprecated

// 改为
let root: ReturnType<typeof createRoot>;
const unmount = () => {
    if (root) {
        act(() => {
            root.unmount();
        });
    }
    container.parentNode?.removeChild(container);
};
document.body.appendChild(container);
root = createRoot(container);
act(() => {
    root.render(<ConfigProvider {...newContext}>...</ConfigProvider>);
});
```

- [ ] **Step 3: 运行类型检查**

```bash
npm run check:types
```

---

## Task 3: 修改 date-picker2 测试文件

> **注意**: 此项目使用 **Cypress Component Testing**（非 Enzyme）。

**Files:**
- Modify: `components/date-picker2/__tests__/index-spec.js`

- [ ] **Step 1: 修改 act 导入**

```javascript
// 第 3 行 - 原来
import ReactTestUtils from 'react-dom/test-utils';

// 改为
import { act } from 'react';
```

- [ ] **Step 2: 添加 createRoot 导入**

```javascript
// 在第 2 行 ReactDOM 后添加
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
```

- [ ] **Step 3: 修改 render 函数**

```javascript
// 第 31-56 行原来的 render 函数
const render = element => {
    let inc;
    const container = document.createElement('div');
    container.className = 'container';
    document.body.appendChild(container);
    ReactDOM.render(element, container, function () {
        inc = this;
    });
    return {
        setProps: props => {
            ReactDOM.unmountComponentAtNode(container);
            const clonedElement = React.cloneElement(element, props);
            ReactDOM.render(clonedElement, container);
        },
        unmount: () => {
            ReactDOM.unmountComponentAtNode(container);
            document.body.removeChild(container);
        },
        instance: () => {
            return inc;
        },
        find: selector => {
            return container.querySelectorAll(selector);
        },
    };
};

// 改为
const render = element => {
    let inc;
    const container = document.createElement('div');
    container.className = 'container';
    document.body.appendChild(container);
    const root = createRoot(container);
    act(() => {
        root.render(element);
    });
    return {
        setProps: props => {
            act(() => {
                root.unmount();
                const clonedElement = React.cloneElement(element, props);
                root.render(clonedElement);
            });
        },
        unmount: () => {
            act(() => {
                root.unmount();
            });
            document.body.removeChild(container);
        },
        instance: () => {
            return inc;
        },
        find: selector => {
            return container.querySelectorAll(selector);
        },
    };
};
```

- [ ] **Step 4: 修改 ReactTestUtils.Simulate 调用**

```javascript
// 找到类似这样的调用
ReactTestUtils.Simulate.mouseEnter(btn);

// 改为使用 enzyme 的 simulate 方法（已在代码中使用）
wrapper.find(selector).simulate('mouseEnter');
```

- [ ] **Step 5: 运行测试验证**

```bash
npm run test date-picker2
```

---

## Task 4: 修改 table issue-spec 测试文件

> **注意**: 此项目使用 **Cypress Component Testing**（非 Enzyme）。

**Files:**
- Modify: `components/table/__tests__/issue-spec.js`

- [ ] **Step 1: 修改导入部分**

```javascript
// 文件顶部导入
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import ReactTestUtils from 'react-dom/test-utils';  // 删除此行

// 如果有使用 ReactTestUtils 的地方，改为 enzyme 的 simulate 方法
```

- [ ] **Step 2: 查找并修改 ReactDOM.render 调用**

```javascript
// 原来
ReactDOM.render(<App />, container, function () {
    // ...
});

// 改为
const root = createRoot(container);
act(() => {
    root.render(<App />);
});
```

- [ ] **Step 3: 查找并修改 unmountComponentAtNode 调用**

```javascript
// 原来
ReactDOM.unmountComponentAtNode(container);

// 改为
act(() => {
    root.unmount();
});
```

- [ ] **Step 4: 运行测试验证**

```bash
npm run test table
```

---

## Task 5: 修改 findDOMNode（24个文件）

> **注意**：扫描发现 `menu-button/index.tsx` 也使用 `findDOMNode`，已添加到列表。同时 `select/base.tsx` 已在本次修改中修复。

**Files**（逐一修改）:
- `components/overlay/gateway.tsx`
- `components/overlay/overlay.tsx`
- `components/overlay/popup.tsx`
- `components/overlay/position.tsx`
- `components/menu/view/item.tsx`
- `components/menu/view/menu.tsx`
- `components/menu/view/popup-item.tsx`
- `components/menu/view/sub-menu.tsx`
- `components/tree/view/tree.tsx`
- `components/tree/view/tree-node.tsx`
- `components/tree/view/tree-node-input.tsx`
- `components/step/view/step.tsx`
- `components/step/view/step-item.tsx`
- `components/dialog/dialog-v2.tsx`
- `components/split-button/index.tsx`
- `components/tab/tabs/nav.tsx`
- `components/cascader/menu.tsx`
- `components/input/textarea.tsx`
- `components/card/collapse-content.tsx`
- `components/calendar/head/menu.tsx`
- `components/notification/index.tsx`
- `components/upload/runtime/iframe-uploader.tsx`
- `components/virtual-list/virtual-list.tsx`
- `components/menu-button/index.tsx`

- [ ] **Step 1: 通用修改模式**

```typescript
// 删除导入
-import { findDOMNode } from 'react-dom';

// 添加实例属性
class Component extends React.Component {
+    myRef: HTMLElement | null = null;

    // 或对于需要获取子元素 DOM 的情况，添加 wrapper ref
+    myWrapperRef: HTMLElement | null = null;
}

// 修改 ref 赋值方式
// 原来
const node = findDOMNode(this.ref) as HTMLElement;

// 改为
const node = this.ref;
```

- [ ] **Step 2: 典型示例（Menu 组件）**

```typescript
// 原来
import { findDOMNode } from 'react-dom';
class Menu extends Component {
    handleSelect = () => {
        const node = findDOMNode(this.menuRef) as HTMLElement;
        // ...
    };
    render() {
        return (
            <div ref={(c) => { this.menuRef = c; }}>
                {/* menu items */}
            </div>
        );
    }
}

// 改为
class Menu extends Component {
    menuRef: HTMLDivElement | null = null;  // 添加类型声明
    handleSelect = () => {
        const node = this.menuRef;  // 直接使用 ref
        if (!node) return;
        // ...
    };
    render() {
        return (
            <div ref={(c) => { this.menuRef = c; }}>
                {/* menu items */}
            </div>
        );
    }
}
```

- [ ] **Step 3: 对于需要查询子元素的情况**

```typescript
// 原来
const menuNode = findDOMNode(this.menuRef) as HTMLElement;
const item = menuNode.querySelector('.menu-item');

// 改为
const menuNode = this.menuWrapperRef;  // 使用 wrapper ref
if (!menuNode) return;
const item = menuNode.querySelector('.menu-item');
```

- [ ] **Step 4: 批量修改后运行类型检查**

```bash
npm run check:types
```

---

## Task 6: 修改 dialog/show.tsx

**Files:**
- Modify: `components/dialog/show.tsx`

- [ ] **Step 1: 修改导入**

```typescript
// 第 7 行
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';  // 添加
```

- [ ] **Step 2: 修改 show 函数中的 unmountComponentAtNode**

```typescript
// 第 249-256 行
const unmount = () => {
    if (config.afterClose) {
        config.afterClose();
    }
    // eslint-disable-next-line react/no-deprecated
    ReactDOM.unmountComponentAtNode(container);  // ❌
    container.parentNode?.removeChild(container);
};

// 改为
let root: ReturnType<typeof createRoot>;
const unmount = () => {
    if (config.afterClose) {
        config.afterClose();
    }
    if (root) {
        act(() => {
            root.unmount();
        });
    }
    container.parentNode?.removeChild(container);
};
```

- [ ] **Step 3: 修改 ReactDOM.render 调用**

```typescript
// 第 265-280 行
// eslint-disable-next-line react/no-deprecated
ReactDOM.render(
    <ConfigProvider {...newContext}>
        <ConfigModal {...config} afterClose={unmount} ref={ref => { myRef = ref; }} />
    </ConfigProvider>,
    container,
    function () {
        instance = myRef;
    }
);

// 改为
document.body.appendChild(container);
root = createRoot(container);
act(() => {
    root.render(
        <ConfigProvider {...newContext}>
            <ConfigModal {...config} afterClose={unmount} ref={ref => { myRef = ref; }} />
        </ConfigProvider>
    );
});
instance = myRef;
```

- [ ] **Step 4: 添加 act 导入**

```typescript
import React, {
    Component,
    type JSXElementConstructor,
    forwardRef,
    useImperativeHandle,
    act,
} from 'react';
```

- [ ] **Step 5: 运行类型检查**

```bash
npm run check:types
```

---

## Task 7: 修改其他测试文件中的废弃 API

**Files:**
- Modify: 其他使用 `ReactDOM.render` 和 `unmountComponentAtNode` 的测试文件

> **说明**: 此项目使用 **Cypress Component Testing**，非 Enzyme。Task 1.5 和 Task 2 已覆盖主要测试文件，此 Task 处理剩余测试文件。

- [ ] **Step 1: 查找所有测试文件中的废弃 API 使用**

```bash
grep -r "ReactDOM\.render\|unmountComponentAtNode" --include="*.js" components/ | grep "__tests__"
```

- [ ] **Step 2: 逐一修改找到的文件**

按照 Task 1.5 的模式进行修改（使用 Cypress + createRoot + act）

- [ ] **Step 3: 运行完整测试套件**

```bash
npm run test
```

---

## Task 8: forwardRef 和 propTypes 评估

**Files:**
- Modify: `components/time-picker2/index.tsx` (可选)
- Modify: `components/config-provider/config.tsx` (可选)

- [ ] **Step 1: 评估 forwardRef 使用**

React 19 仍支持 `forwardRef`，不是 Breaking Change。但官方推荐使用新的 `ref as props` 方式。

**建议**: 暂时保留 forwardRef，保持向后兼容

- [ ] **Step 2: 评估 propTypes 使用**

React 19 会静默忽略函数组件上的 `propTypes`。由于本项目使用 TypeScript，propTypes 主要用于运行时检查。

**建议**: 保留 propTypes（用于 class 组件），后续逐步迁移到 TypeScript 类型定义

---

## Task 9: 验证与测试

- [ ] **Step 1: 运行类型检查**

```bash
npm run check:types
```

- [ ] **Step 2: 运行 ESLint 检查**

```bash
npm run check:eslint
```

- [ ] **Step 3: 运行完整测试**

```bash
npm run test
```

- [ ] **Step 4: 运行开发服务器验证**

```bash
npm run start
```

---

## 参考资料

- [React 19 Upgrade Guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)
- [react-codemod](https://github.com/reactjs/react-codemod)
- [types-react-codemod](https://github.com/eps1lon/types-react-codemod)