import { describe, expect, it } from "@jest/globals";

import { budgetLink, DEEP_LINKS, redirectLaunchPath, resolveDeepLink, transactionLink } from "./deep-links";

describe("resolveDeepLink", () => {
    it("maps every canonical link the widgets and intents emit", () => {
        expect(resolveDeepLink(DEEP_LINKS.log)).toBe("/");
        expect(resolveDeepLink(DEEP_LINKS.insights)).toBe("/insights");
        expect(resolveDeepLink(DEEP_LINKS.budgets)).toBe("/budgets");
        expect(resolveDeepLink(DEEP_LINKS.overallBudget)).toBe("/budgets/overall");
        expect(resolveDeepLink(DEEP_LINKS.search)).toBe("/search");
        expect(resolveDeepLink(DEEP_LINKS.newExpense)).toBe("/transactions/create");
        expect(resolveDeepLink(DEEP_LINKS.newIncome)).toBe("/transactions/create?income=1");
    });

    it("accepts the bare path form expo-router hands it while running", () => {
        expect(resolveDeepLink("/budgets/overall")).toBe("/budgets/overall");
        expect(resolveDeepLink("new?income=1")).toBe("/transactions/create?income=1");
    });

    it("routes a single transaction, which is what Spotlight opens", () => {
        expect(resolveDeepLink(transactionLink("abc123"))).toBe("/transactions/abc123");
        expect(resolveDeepLink(budgetLink("b7"))).toBe("/budgets/b7");
    });

    it("degrades a host with no id to its section rather than to not-found", () => {
        expect(resolveDeepLink("finta://transaction")).toBe("/");
    });

    it("still answers the retired Swift hosts", () => {
        expect(resolveDeepLink("finta://newExpense")).toBe("/transactions/create");
        expect(resolveDeepLink("finta://budget")).toBe("/budgets");
        expect(resolveDeepLink("finta://transactions")).toBe("/");
    });

    it("is case-insensitive on the host, as URLs are", () => {
        expect(resolveDeepLink("finta://Budgets")).toBe("/budgets");
    });

    it("declines anything outside the contract so ordinary paths pass through", () => {
        expect(resolveDeepLink("finta://")).toBeNull();
        expect(resolveDeepLink("/settings/currency")).toBeNull();
        expect(resolveDeepLink("exp://192.168.1.4:8081")).toBeNull();
    });
});

describe("redirectLaunchPath", () => {
    function drainSpy() {
        const calls = { count: 0 };
        return [
            () => {
                calls.count += 1;
            },
            calls,
        ] as const;
    }

    it("still routes the link the app was launched from", () => {
        const [drain, calls] = drainSpy();
        expect(redirectLaunchPath({ initial: true, path: DEEP_LINKS.newExpense }, drain)).toBe("/transactions/create");
        expect(calls.count).toBe(1);
    });

    it("drains a launch that carried no deep link", () => {
        const [drain, calls] = drainSpy();
        expect(redirectLaunchPath({ initial: true, path: "finta:///" }, drain)).toBe("finta:///");
        expect(calls.count).toBe(1);
    });

    it("leaves the registry alone for a link arriving while the app runs", () => {
        const [drain, calls] = drainSpy();
        expect(redirectLaunchPath({ initial: false, path: DEEP_LINKS.budgets }, drain)).toBe("/budgets");
        expect(calls.count).toBe(0);
    });
});
