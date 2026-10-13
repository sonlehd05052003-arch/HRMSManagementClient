import { expect, request as apiRequest, test } from "@playwright/test";
import { futureWeekday, PASSWORD, stateFor, tableRows, USERS } from "./helpers";

test.describe("Thông báo", () => {
    test.use({ storageState: stateFor("manager") });

    test("quản lý nhận thông báo khi nhân viên gửi đơn nghỉ phép và mở được trang duyệt", async ({ page, baseURL }) => {
        // The employee files a leave request through the API, in a context of their own
        const staff = await apiRequest.newContext({ baseURL });
        const login = await staff.post("/api/Auth/login", { data: { username: USERS.staff, password: PASSWORD } });
        expect(login.ok()).toBeTruthy();
        // Leave type ids differ per company: use the company's first active one
        const types = (await (await staff.get("/api/leave-types")).json()) as { leaveTypeId: number }[];
        const day = futureWeekday(200 + Math.floor(Math.random() * 300));
        const created = await staff.post("/api/LeaveRequests", {
            data: { leaveTypeID: types[0].leaveTypeId, startDate: day, endDate: day, numberOfDays: 1, reason: "E2E thông báo", submitAnyway: true },
        });
        expect(created.ok(), await created.text()).toBeTruthy();

        await page.goto("/dashboard/manage");
        const bell = page.getByRole("button", { name: "Thông báo" });
        await expect(page.locator(".ant-badge").filter({ has: bell }).locator(".ant-badge-count")).toBeVisible();

        await bell.click();
        const item = page.locator(".ant-popover").getByText("Đơn nghỉ phép mới cần duyệt").first();
        await expect(item).toBeVisible();
        await item.click();
        await expect(page).toHaveURL(/\/leave\/manage/);

        await staff.dispose();
    });
});

test.describe("Lịch nghỉ lễ", () => {
    test.use({ storageState: stateFor("hr") });

    test("HR thêm các ngày lễ cố định trong năm", async ({ page }) => {
        await page.goto("/hr/payroll-settings");

        const card = page.locator(".ant-card").filter({ hasText: "Lịch nghỉ lễ" });
        await card.getByRole("button", { name: "Thêm ngày lễ cố định" }).click();
        const table = card.locator(".ant-table");
        await expect(table.getByText("Quốc khánh", { exact: true })).toBeVisible();
        await expect(table.getByText("Ngày Quốc tế Lao động", { exact: true })).toBeVisible();
    });
});

test.describe("Hợp đồng", () => {
    test.use({ storageState: stateFor("hr") });

    test("hợp đồng của nhân viên hiện trong tab Hợp đồng", async ({ page }) => {
        const me = await (await page.request.get("/api/Employee")).json();
        const employee = (me as { employeeCode: string; employeeId: number }[]).find(e => e.employeeCode === "EMP0099");
        expect(employee, "seeded employee EMP0099").toBeTruthy();
        const employeeId = employee!.employeeId;

        // End contracts left active by an earlier run, so the new one does not overlap
        const existing = await (await page.request.get(`/api/EmployeeContract/employee/${employeeId}`)).json();
        for (const c of existing as { contractId: number; status: string }[])
            if (c.status === "Active")
                await page.request.put(`/api/EmployeeContract/${c.contractId}/terminate`, { data: { endDate: new Date().toISOString().slice(0, 10) } });

        const start = futureWeekday(1);
        const created = await page.request.post("/api/EmployeeContract", {
            data: { employeeId, contractType: "Indefinite", startDate: start, salaryAmount: 20000000 },
        });
        expect(created.ok(), await created.text()).toBeTruthy();
        const contract = await created.json();

        await page.goto(`/hr/manage-employee/${employeeId}`);
        await page.getByRole("tab", { name: "Hợp đồng" }).click();
        const row = page.locator(".ant-table-row").filter({ hasText: contract.contractNumber });
        await expect(row).toBeVisible();
        await expect(row.getByText("Không xác định thời hạn")).toBeVisible();
        await expect(row.getByText("Đang hiệu lực")).toBeVisible();

        await page.request.put(`/api/EmployeeContract/${contract.contractId}/terminate`, { data: { endDate: start } });
    });
});

test.describe("Nhật ký thay đổi", () => {
    test.use({ storageState: stateFor("admin") });

    test("admin thấy menu và trang nhật ký, HR thì không", async ({ page, browser }) => {
        await page.goto("/admin/audit-log");
        await expect(page.getByText("Nhật ký thay đổi dữ liệu")).toBeVisible();
        await expect(tableRows(page, "Danh sách thay đổi").or(page.getByText("Tổng 0 thay đổi")).first()).toBeAttached();

        const hrContext = await browser.newContext({ storageState: stateFor("hr") });
        const hrPage = await hrContext.newPage();
        await hrPage.goto("/dashboard/hr");
        await expect(hrPage.locator(".ant-menu")).toBeVisible();
        await expect(hrPage.locator(".ant-menu").getByText("Nhật ký thay đổi")).toHaveCount(0);
        await hrContext.close();
    });
});
