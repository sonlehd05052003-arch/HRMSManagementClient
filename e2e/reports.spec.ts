import { expect, test } from "@playwright/test";
import { stateFor } from "./helpers";

test.describe("Báo cáo nhân sự", () => {
    test.use({ storageState: stateFor("hr") });

    test("HR mở báo cáo từ menu, xem từng tab và xuất Excel", async ({ page }) => {
        await page.goto("/");
        await page.getByRole("menuitem", { name: "Báo cáo nhân sự" }).click();
        await expect(page).toHaveURL(/\/reports\/hr$/);

        // Biến động nhân sự: figures and charts for the current year
        await expect(page.getByText(/^Nhân sự ngày \d{2}\/\d{2}\/\d{4}$/)).toBeVisible();
        await expect(page.getByText("Theo phòng ban")).toBeVisible();
        await expect(page.locator(".recharts-surface").first()).toBeVisible();

        // Chấm công: one row per department, with a total
        await page.getByRole("tab", { name: "Chấm công" }).click();
        const table = page.locator(".ant-table").filter({ hasText: "Ngày theo ca" });
        await expect(table.locator(".ant-table-tbody tr.ant-table-row").first()).toBeVisible();
        await expect(table.locator(".ant-table-summary")).toContainText("Tổng");

        const download = page.waitForEvent("download");
        await page.getByRole("button", { name: "Xuất Excel" }).click();
        expect((await download).suggestedFilename()).toMatch(/^bao-cao-cham-cong-\d{4}-\d{2}\.xlsx$/);

        // Chi phí lương opens whether or not the year has payroll yet
        await page.getByRole("tab", { name: "Chi phí lương" }).click();
        await expect(page.getByText("Chi phí lương theo tháng")).toBeVisible();
    });
});

test.describe("Báo cáo nhân sự – quản lý", () => {
    test.use({ storageState: stateFor("manager") });

    test("quản lý không có menu báo cáo và API từ chối", async ({ page }) => {
        await page.goto("/dashboard/manage");
        await expect(page.locator(".ant-menu")).toBeVisible();
        await expect(page.locator(".ant-menu").getByText("Báo cáo nhân sự")).toHaveCount(0);
        const response = await page.request.get(`/api/reports/workforce?year=${new Date().getFullYear()}`);
        expect(response.status()).toBe(403);
    });
});
