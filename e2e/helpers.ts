import { expect, type Page } from "@playwright/test";

/** The seeded company the tests use (see playwright.config.ts) */
export const COMPANY = process.env.E2E_COMPANY ?? "perf002";
export const PASSWORD = process.env.E2E_PASSWORD ?? "Perf@12345";

/** Seeded accounts: the director, the head of the first department, an HR staff member and one of the head's reports */
export const USERS = {
    admin: `${COMPANY}.admin`,
    manager: `${COMPANY}.emp0002`,
    hr: `${COMPANY}.emp0012`,
    staff: `${COMPANY}.emp0050`,
};

export type Role = keyof typeof USERS;

/**
 * The saved session of a role, signed in once by auth.setup.ts. Signing in for every test would hit the API's
 * login rate limit (10 a minute per IP), and a new sign-in ends the user's other sessions.
 */
export const stateFor = (role: Role) => `e2e/.auth/${role}.json`;

/** A Monday–Friday date, `daysAhead` days or more from today, as YYYY-MM-DD */
export function futureWeekday(daysAhead: number): string {
    const date = new Date();
    date.setDate(date.getDate() + daysAhead);
    while (date.getDay() === 0 || date.getDay() === 6) date.setDate(date.getDate() + 1);
    return date.toISOString().slice(0, 10);
}

/** Rows of the table inside the card with the given title */
export function tableRows(page: Page, cardTitle: string) {
    return page.locator(".ant-card").filter({ hasText: cardTitle }).locator(".ant-table-tbody tr.ant-table-row");
}

export { expect };
