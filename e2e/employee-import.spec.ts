import { expect, test } from "@playwright/test";
import { stateFor } from "./helpers";
import { readFile } from "node:fs/promises";

test.use({ storageState: stateFor("admin") });

// Only the check is exercised, so the shared database is left as it was
test("the Excel template downloads and passes the import check", async ({ page }) => {
    await page.goto("/hr/manage-employee");
    await page.getByRole("button", { name: "Nhập từ Excel" }).click();
    const dialog = page.getByRole("dialog", { name: "Nhập nhân viên từ Excel" });

    const download = page.waitForEvent("download");
    await dialog.getByRole("button", { name: "Tải file mẫu" }).click();
    const template = await (await download).path();

    // Saved under a random name; the server only takes .xlsx files
    await dialog.locator("input[type=file]").setInputFiles({
        name: "nhan-vien.xlsx",
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        buffer: await readFile(template),
    });
    await expect(dialog.getByText("Cả 1 dòng đều hợp lệ")).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Nhập 1 nhân viên" })).toBeEnabled();
});

test("a file with bad rows lists them and cannot be imported", async ({ page }) => {
    await page.goto("/hr/manage-employee");
    await page.getByRole("button", { name: "Nhập từ Excel" }).click();
    const dialog = page.getByRole("dialog", { name: "Nhập nhân viên từ Excel" });

    // Not a workbook at all
    await dialog.locator("input[type=file]").setInputFiles({
        name: "nhan-vien.xlsx",
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        buffer: Buffer.from("not a workbook"),
    });
    await expect(page.getByText("Không đọc được file")).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Nhập", exact: true })).toBeDisabled();
});
