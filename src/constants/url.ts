


const URL = {
    Login: "/login",
    DashboardAdmin: "/dashboard/admin",
    DashboardManage: "/dashboard/manage",
    DashboardHR: "/dashboard/hr",
    DashboardStaff: "/dashboard/staff",
    DashboardPurchase: "/dashboard/purchase",
    DashboardSale: "/dashboard/sale",
    ManageUser: "/admin/manage-user",
    ManageRole: "/admin/manage-role",
    ManagePermission: "/admin/manage-permission",
    ManageMenu: "/admin/manage-menu",
    ManageCompany: "/superadmin/companies",
    ManageCategory: "/admin/manage-category",
    ManageProduct: "/admin/manage-product",

    ManageTask: "/manage-task",
    ManageEmployee: "/hr/manage-employee",
    AddEmployee: "/hr/manage-employee/add",
    EditEmployee: "/hr/manage-employee/edit/:id",
    EmployeeDetail: "/hr/manage-employee/:id",
    ManageDepartment: "/hr/manage-department",
    DepartmentDetail: "/hr/manage-department/:id",
    ManagePosition: "/hr/manage-position",
    PositionDetail: "/hr/manage-position/:id",
    MyAttendance: "/attendance/my",
    ManageAttendance: "/attendance/manage",
    ManageHRProcedure: "/hr/manage-procedure",
    ManageShift: "/hr/manage-shift",
    AddShift: "/hr/manage-shift/add",
    EditShift: "/hr/manage-shift/edit/:id",
    ManageShiftAssignment: "/hr/manage-shift-assignment",
    MyLeaveRequest: "/leave/my",
    ManageLeaveRequest: "/leave/manage",
    LeaveConfiguration: "/leave/configuration",
    MyOvertimeRequest: "/overtime/my",
    ManageOvertimeRequest: "/overtime/manage",
    ManageSystemSettings: "/admin/system-settings",
    AuditLog: "/admin/audit-log",
    Reports: "/reports/hr",
    HRPayrollSettings: "/hr/payroll-settings",
    ManageFaceRegistration: "/hr/manage-face-registration",
    MyProfile: "/my-profile",
    
    // Payroll — Admin/HR
    PayrollPeriods:       "/payroll/periods",
    PayrollPeriodDetail:  "/payroll/periods/:id",
    PayrollRecordDetail:  "/payroll/records/:id",
    PayrollReport:        "/payroll/report",

    // Payroll — Employee
    MyPayslips:           "/payroll/my-payslips",
    MyPayrollDraftList:   "/payroll/my-draft",
    MyPayrollDraft:       "/payroll/my-draft/:periodId",

    // Payroll — Reference
    PayrollMethodology:   "/payroll/methodology",

    // Resignation
    MyResignationRequest:     "/resignation/my",
    ManageResignationRequest: "/resignation/manage",
}

export default URL
