import { expect, test } from "@playwright/test";
import { PASSWORD, USERS } from "./helpers";

test.describe("Đăng nhập", () => {
    test("sai mật khẩu chỉ báo một thông báo chung", async ({ page }) => {
        await page.goto("/login");
        await page.getByPlaceholder("Nhập tên đăng nhập").fill(USERS.staff);
        await page.getByPlaceholder("Nhập mật khẩu").fill("sai-mat-khau");
        await page.getByRole("button", { name: "Đăng nhập" }).click();

        await expect(page.getByText("Tên đăng nhập hoặc mật khẩu không đúng")).toBeVisible();
        await expect(page).toHaveURL(/\/login/);
    });

    test("khoảng trắng quanh tên đăng nhập được bỏ qua", async ({ page }) => {
        await page.goto("/login");
        const username = page.getByPlaceholder("Nhập tên đăng nhập");
        await username.fill(`  ${USERS.staff}  `);
        // Spaces are dropped as they are typed
        await expect(username).toHaveValue(USERS.staff);
        await page.getByPlaceholder("Nhập mật khẩu").fill(` ${PASSWORD} `);
        await page.getByRole("button", { name: "Đăng nhập" }).click();

        await expect(page).not.toHaveURL(/\/login/);
    });
});
