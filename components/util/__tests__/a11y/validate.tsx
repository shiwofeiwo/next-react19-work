import React, { ReactElement } from 'react';
import Axe, { Result, ElementContext, AxeResults } from 'axe-core';

export const A11Y_ROOT_ID = 'A11Y-ROOT-ID';

/**
 * Format the results of axe-core violations for easier debugging
 * @param violations - violations from results.violations returned from running axe-core
 * @param verbose - should only the most important data be printed?
 */
function formatViolations(violations: Result[], verbose: boolean = false) {
    let formatted: unknown = violations;
    if (!verbose) {
        formatted = violations.map(v => {
            return {
                id: v.id,
                impact: v.impact,
                description: v.description,
                helpUrl: v.helpUrl,
                nodes: v.nodes.map(node => ({
                    target: node.target,
                    html: node.html,
                    failureSummary: node.failureSummary,
                })),
            };
        });
    }
    return JSON.stringify(formatted, null, 2);
}

function summarizeViolations(violations: Result[]) {
    if (!violations.length) return 'no violations';
    return violations
        .map(v => {
            const impact = v.impact || 'unknown';
            const targets = v.nodes
                .map(n => (Array.isArray(n.target) ? n.target.join(' > ') : String(n.target)))
                .join('; ');
            return `[${impact}] ${v.id}: ${v.description} (nodes: ${targets}) — help: ${v.helpUrl}`;
        })
        .join('\n');
}

function delay(duration: number) {
    return new Promise(res => {
        setTimeout(res, duration);
    });
}

interface A11yTestOptions {
    rules?: object;
    debug?: boolean;
    incomplete?: boolean;
}

/**
 * Run Axe-core tests on a dom node
 *
 * @param selector - css selector for element to test
 * @param options - options for axe tests
 * `incomplete` - should test error if there was an incomplete test? (not recommended)
 * `rules` - set properties for rules
 * @returns results object from Axe.run
 */
export const test = function (selector: ElementContext, options: A11yTestOptions = {}) {
    // disable `color-contrast` test by default. Can be overriden by setting `options.rules['color-contrast']`
    options.rules = Object.assign(
        {
            'color-contrast': {
                enabled: false,
            },
        },
        options.rules
    );

    return Axe.run(selector, { rules: options.rules })
        .catch(error => {
            // 原本是 `assert(!error)`——默认 message 为空，失败时输出 "Unspecified AssertionError"，
            // 遮蔽真实的 axe-core 异常信息。改为显式 throw 保留原错误。
            throw new Error(
                `axe-core failed to run on selector ${JSON.stringify(selector)}: ${
                    error instanceof Error ? `${error.name}: ${error.message}` : String(error)
                }`
            );
        })
        .then((results: AxeResults) => {
            if (options.debug) {
                // eslint-disable-next-line no-console
                console.error(formatViolations(results.violations, true));
                return;
            }

            if (results.violations.length) {
                // eslint-disable-next-line no-console
                console.error(formatViolations(results.violations));
                throw new Error(
                    `axe-core violations (${results.violations.length}):\n${summarizeViolations(
                        results.violations
                    )}`
                );
            }

            if (options.incomplete) {
                if (results.incomplete.length) {
                    // eslint-disable-next-line no-console
                    console.error(formatViolations(results.incomplete));
                    throw new Error(
                        `axe-core incomplete checks (${
                            results.incomplete.length
                        }):\n${summarizeViolations(results.incomplete)}`
                    );
                }
            }
        });
};

/**
 * Create a DOM element and attach to the document body
 * @param id - id to set on the wrapper div
 */
export const createContainer = function (id: string) {
    const container = document.createElement('div');
    container.id = id;
    document.body.appendChild(container);
    return container;
};

/**
 * Mount a ReactDOM Element to the dom
 * @param node - React element to mount and run axe-core tests on
 * @param id - id to set on the wrapper div, defaults to a11y root id
 */
export const mountReact = function (node: ReactElement<any>, id = A11Y_ROOT_ID) {
    return cy.mount(<div id={id}>{node}</div>);
};

/**
 * Run Axe-core tests on a React element
 * @param node - React element to mount and run axe-core tests on
 * @param options - options for axe tests
 * `incomplete` - should test error if there was an incomplete test? (not recommended)
 * `rules` - set properties for rules
 */
export const testReact = async function (
    node: ReactElement<any>,
    options: A11yTestOptions & { delay?: number } = { delay: 1 }
) {
    await new Promise<unknown>(resolve => {
        mountReact(node, A11Y_ROOT_ID).then(resolve);
    });

    if (options.delay) {
        await delay(options.delay);
    }
    await test(`#${A11Y_ROOT_ID}`, options);
};

/**
 * @deprecated unmount is unnecessary when use cy.mount
 * Helper function to use with `testReact` to unmount a dom node, defaults to the root a11y node
 */
export const unmount = function (id = A11Y_ROOT_ID) {
    const root = document.querySelector(`#${id}`);
    if (root) {
        root.remove();
    }
};
