# Cypress 14 Upgrade for React 19 Support Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade Cypress from v13 to v14 to support React 19 and ensure all existing Cypress component tests continue to work.

**Architecture:** Upgrade the `cypress` package and `@cypress/react` adapter to versions compatible with React 19. The upgrade requires package version changes and verification that the custom `mount`, `rerender`, and `triggerInputChange` commands work with the new version.

**Tech Stack:** Cypress 14.x, @cypress/react 9.x, React 19.x

---

## File Inventory

### Files to Modify

| File | Change |
|------|--------|
| `package.json:201` | Update `cypress` from `^13.6.1` to `^14.5.4` |
| `package.json:210` | Update `eslint-plugin-cypress` from `^2.15.1` to `^3.6.0` |
| `cypress/support/component.ts` | Update `import { mount } from 'cypress/react'` to `import { mount } from '@cypress/react'` |
| `cypress/support/commands.ts` | No changes expected, but verify `triggerInputChange` still works |

### Files to Verify (Run Tests)

- All `components/**/__tests__/*-spec.tsx` files using `cy.mount()`

---

## Task 1: Update Cypress Package Versions

**Files:**
- Modify: `package.json:201`
- Modify: `package.json:210`

- [ ] **Step 1: Update package.json dependencies**

Update the following in `package.json`:

```json
{
  "devDependencies": {
    "cypress": "^14.5.4",
    "eslint-plugin-cypress": "^3.6.0"
  }
}
```

- [ ] **Step 2: Install updated dependencies**

Run: `npm install`

Expected: Cypress 14.x and @cypress/react 9.x installed

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore(deps): upgrade cypress to v14 for React 19 support"
```

---

## Task 2: Update Cypress Import Paths

**Files:**
- Modify: `cypress/support/component.ts:2`

- [ ] **Step 1: Update cypress/react import**

Change line 2 from:
```ts
import { mount, type MountReturn } from 'cypress/react';
```
to:
```ts
import { mount, type MountReturn } from '@cypress/react';
```

- [ ] **Step 2: Verify build works**

Run: `npm run build:transform` or just open Cypress to verify

Expected: No import errors

- [ ] **Step 3: Commit**

```bash
git add cypress/support/component.ts
git commit -m "chore(cypress): update @cypress/react import path"
```

---

## Task 3: Verify Cypress Tests Work

**Files:**
- Test: `components/button/__tests__/index-spec.tsx`
- Test: `components/avatar/__tests__/index-spec.tsx`
- Test: All `components/**/__tests__/*-spec.tsx`

- [ ] **Step 1: Run a sample Cypress component test**

Run: `npx cypress run --component --spec "components/button/__tests__/index-spec.tsx"`

Expected: All button tests pass

- [ ] **Step 2: Run all Cypress component tests**

Run: `npx cypress run --component`

Expected: All component tests pass

- [ ] **Step 3: If tests fail, diagnose and fix**

Common issues in Cypress 14 upgrades:
- `rerender` API changes - may need to use `cy.mount()` again with new props
- Component re-mounting behavior changes
- Type changes for `MountReturn`

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "test: verify cypress component tests pass after v14 upgrade"
```

---

## Task 4: Final Verification

- [ ] **Step 1: Run full test suite**

Run: `npm run test:head` or equivalent Cypress test command

Expected: All Cypress component tests pass

- [ ] **Step 2: Commit any remaining fixes**

```bash
git add -A
git commit -m "fix(cypress): adjust tests for Cypress 14 compatibility"
```
