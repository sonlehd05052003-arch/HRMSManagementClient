import { expect, test } from "@playwright/test";
import { stateFor, tableRows } from "./helpers";

test.describe("Trang danh sách", () => {
    test.use({ storageState: stateFor("admin") });

    test("bộ lọc nằm riêng, lọc được và xóa bộ lọc trả lại danh sách", async ({ page }) => {
        await page.goto("/hr/manage-employee");

        await expect(page.locator(".ant-card").filter({ hasText: "Bộ lọc" })).toBeVisible();
        const rows = tableRows(page, "Danh sách nhân viên");
        await expect(rows.first()).toBeVisible();
        const before = await rows.count();
        expect(before).toBeGreaterThan(1);

        await page.getByPlaceholder("Tìm theo tên, mã NV hoặc email...").fill("EMP0050");
        await expect(rows).toHaveCount(1);

        await page.getByRole("button", { name: "Xóa bộ lọc" }).click();
        await expect(rows).toHaveCount(before);
    });

    test("ngừng sử dụng và khôi phục phòng ban bằng nút thùng rác", async ({ page }) => {
        // A department of its own: one with employees cannot be taken out of use
        const name = `E2E phòng ${Date.now()}`;
        const created = await page.request.post("/api/Department", { data: { departmentName: name } });
        expect(created.ok(), await created.text()).toBeTruthy();

        await page.goto("/hr/manage-department");
        await page.locator(".ant-card").filter({ hasText: "Bộ lọc" }).getByRole("searchbox").fill(name);
        const row = tableRows(page, "Danh sách phòng ban").filter({ hasText: name });
        await expect(row.getByText("Hoạt động")).toBeVisible();

        await row.getByRole("button", { name: "Ngừng sử dụng" }).click();
        await page.getByRole("tooltip").filter({ hasText: "Ngừng sử dụng phòng ban này?" }).getByRole("button", { name: "Ngừng sử dụng" }).click();
        await expect(row.getByText("Ngừng sử dụng", { exact: true })).toBeVisible();

        await row.getByRole("button", { name: "Khôi phục" }).click();
        await page.getByRole("tooltip").filter({ hasText: "Khôi phục phòng ban này?" }).getByRole("button", { name: "Khôi phục" }).click();
        await expect(row.getByText("Hoạt động")).toBeVisible();
    });

    test("bảng chấm công phân trang trên server", async ({ page }) => {
        await page.goto("/attendance/manage");

        const card = page.locator(".ant-card").filter({ hasText: "Danh sách chấm công" });
        const rows = card.locator(".ant-table-tbody tr.ant-table-row");
        await expect(rows).toHaveCount(15);
        const firstOnPage1 = await rows.first().innerText();

        await card.locator(".ant-pagination-item-2").click();
        await expect(card.locator(".ant-pagination-item-2")).toHaveClass(/ant-pagination-item-active/);
        // Wait for the second page to arrive rather than reading the rows still on screen
        await expect(rows.first()).not.toHaveText(firstOnPage1);
        await expect(rows).toHaveCount(15);
    });
});
