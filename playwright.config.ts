import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests against a running API with the seeded PERF test data
 * (Tools/HRManagement.Seeder in the API repository).
 *
 *   E2E_API_URL   the API the client is proxied to (default http://localhost:5103)
 *   E2E_COMPANY   the seeded company to sign in to (default perf002)
 *
 * The client is built and served by `vite preview` on port 4173; `npm run e2e` runs everything.
 */
const apiUrl = process.env.E2E_API_URL ?? "http://localhost:5103";

export default defineConfig({
    testDir: "./e2e",
    // The tests share one database, so they run one after another
    workers: 1,
    fullyParallel: false,
    retries: process.env.CI ? 1 : 0,
    timeout: 60_000,
    expect: { timeout: 15_000 },
    reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"], ["html", { open: "never" }]],
    use: {
        baseURL: "http://localhost:4173",
        locale: "vi-VN",
        timezoneId: "Asia/Ho_Chi_Minh",
        viewport: { width: 1440, height: 900 },
        trace: "retain-on-failure",
        screenshot: "only-on-failure",
    },
    projects: [
        // Signs every role in once; the tests reuse the saved sessions
        { name: "setup", testMatch: /auth\.setup\.ts/ },
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
            dependencies: ["setup"],
        },
    ],
    webServer: {
        command: "npx vite build && npx vite preview --port 4173 --strictPort",
        url: "http://localhost:4173",
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
        env: { API_PROXY_TARGET: apiUrl, VITE_API_URL: "/api" },
    },
});
