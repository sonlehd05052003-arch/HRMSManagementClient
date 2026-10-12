import { lazy, Suspense } from "react"
import URL from "../constants/url"
import { DEFAULT_LAYOUT, NONE_LAYOUT } from "../constants/layout"
import { Navigate, Route, Routes } from "react-router-dom"
import PageErrorBoundary from "./PageErrorBoundary"
import PrivateLayout from "./PrivateLayout"
import DefaultLayout from "./DefaultLayout"
import { useIsMobile } from "../hooks/useIsMobile"
import { useAppSelector } from "../store"
import { selectInfoLogin } from "../store/authSlide"
import { EUserRole } from "../interface/app"
import type { JSX } from "react"

// Mobile pages (lazy loaded)
const MobileAttendance        = lazy(() => import("../app/mobile/pages/MobileAttendance"))
const MobileLeaveRequest      = lazy(() => import("../app/mobile/pages/MobileLeaveRequest"))
const MobileOvertimeRequest   = lazy(() => import("../app/mobile/pages/MobileOvertimeRequest"))
const MobileProfile           = lazy(() => import("../app/mobile/pages/MobileProfile"))
const MobileResignation       = lazy(() => import("../app/mobile/pages/MobileResignation"))
const MobileManageTask        = lazy(() => import("../app/mobile/pages/MobileManageTask"))
const MobilePayslips          = lazy(() => import("../app/mobile/pages/MobilePayslips"))
const MobileFaceRegistration            = lazy(() => import("../app/mobile/pages/MobileFaceRegistration"))

const MOBILE_ROLES = [EUserRole.EMPLOYEE, EUserRole.HR, EUserRole.MANAGE]

// Renders mobile page for EMPLOYEE / HR / MANAGE on small screens, desktop otherwise
const AdaptivePage = ({ desktop, mobile }: { desktop: JSX.Element; mobile: JSX.Element }) => {
    const isMobile = useIsMobile()
    const infoLogin = useAppSelector(selectInfoLogin)
    if (isMobile && infoLogin?.role && MOBILE_ROLES.includes(infoLogin.role as any)) return mobile
    return desktop
}



const Login = lazy(() => import("../app/desktop/pages/login"))
const DashboardAdmin = lazy(() => import("../app/desktop/pages/dashboard/DashboardAdmin"))
const DashboardHR = lazy(() => import("../app/desktop/pages/dashboard/DashboardHR"))
const DashboardManage = lazy(() => import("../app/desktop/pages/dashboard/DashboardManage"))
const ManageUser = lazy(() => import("../app/desktop/pages/manageAccount"))
const ManageRole = lazy(() => import("../app/desktop/pages/manageRole"))
const ManagePermission = lazy(() => import("../app/desktop/pages/managePermission"))
const ManageMenu = lazy(() => import("../app/desktop/pages/manageMenu"))
const ManageCompany = lazy(() => import("../app/desktop/pages/manageCompany"))

const ManageTask = lazy(() => import("../app/desktop/pages/manageTask"))
const ManageEmployee = lazy(() => import("../app/desktop/pages/manageEmployee"))
const AddEmployee = lazy(() => import("../app/desktop/pages/manageEmployee/AddEmployee"))
const EditEmployee = lazy(() => import("../app/desktop/pages/manageEmployee/EditEmployee"))
const EmployeeDetail = lazy(() => import("../app/desktop/pages/manageEmployee/EmployeeDetail"))
const MyAttendance = lazy(() => import("../app/desktop/pages/myAttendance"))
const ManageAttendance = lazy(() => import("../app/desktop/pages/manageAttendance"))
const ManageHRProcedure = lazy(() => import("../app/desktop/pages/manageHRProcedure"))

const ManageDepartment = lazy(() => import("../app/desktop/pages/manageDepartment"));
const DepartmentDetail = lazy(() => import("../app/desktop/pages/manageDepartment/DepartmentDetail"));
const ManagePosition = lazy(() => import("../app/desktop/pages/managePosition"));
const PositionDetail = lazy(() => import("../app/desktop/pages/managePosition/PositionDetail"));
const ManageShift = lazy(() => import("../app/desktop/pages/manageShift"));
const AddShift = lazy(() => import("../app/desktop/pages/manageShift/AddShift"));
const EditShift = lazy(() => import("../app/desktop/pages/manageShift/EditShift"));
const ManageShiftAssignment = lazy(() => import("../app/desktop/pages/manageShiftAssignment"));
const MyLeaveRequest = lazy(() => import("../app/desktop/pages/myLeaveRequest/index"));
const ManageLeaveRequest = lazy(() => import("../app/desktop/pages/manageLeaveRequest/index"));
const LeaveConfiguration = lazy(() => import("../app/desktop/pages/leaveConfiguration/index"));
const MyOvertimeRequest = lazy(() => import("../app/desktop/pages/myOvertimeRequest/index"));
const ManageOvertimeRequest = lazy(() => import("../app/desktop/pages/manageOvertimeRequest/index"));
const ManageSystemSettings = lazy(() => import("../app/desktop/pages/manageSystemSettings/index"));
const HRPayrollSettings = lazy(() => import("../app/desktop/pages/hrPayrollSettings/index"));
const ManageFaceRegistration = lazy(() => import("../app/desktop/pages/manageFaceRegistration/index"));
const MyProfile = lazy(() => import("../app/desktop/pages/myProfile/index"));

const PayrollPeriods = lazy(() => import("../app/desktop/pages/payroll/index"));
const PayrollPeriodDetail = lazy(() => import("../app/desktop/pages/payroll/periodDetail/index"));
const PayrollRecordDetail = lazy(() => import("../app/desktop/pages/payroll/recordDetail/index"));
const MyPayslips = lazy(() => import("../app/desktop/pages/payroll/myPayslips/index"));
const MyPayrollDraft = lazy(() => import("../app/desktop/pages/payroll/myPayrollDraft/index"));
const MyPayrollDraftList = lazy(() => import("../app/desktop/pages/payroll/myPayrollDraft/List"));
const PayrollReport = lazy(() => import("../app/desktop/pages/payroll/PayrollReport"));
const PayrollMethodology = lazy(() => import("../app/desktop/pages/payroll/PayrollMethodology"));
const MyResignationRequest = lazy(() => import("../app/desktop/pages/myResignationRequest/index"));
const ManageResignationRequest = lazy(() => import("../app/desktop/pages/manageResignationRequest/index"));

const shareResourceItem = [
    {
        key: URL.Login,
        element: <Login />,
        layout: NONE_LAYOUT,
        private: false,
    },
]
const privateResourceItem = [
    {
        key: URL.DashboardAdmin,
        element: <DashboardAdmin />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.DashboardHR,
        element: <DashboardHR />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.DashboardManage,
        element: <DashboardManage />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.ManageUser,
        element: <ManageUser />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.ManageRole,
        element: <ManageRole />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.ManagePermission,
        element: <ManagePermission />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.ManageMenu,
        element: <ManageMenu />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.ManageCompany,
        element: <ManageCompany />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },

    {
        key: URL.ManageTask,
        element: <AdaptivePage desktop={<ManageTask />} mobile={<MobileManageTask />} />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.ManageEmployee,
        element: <ManageEmployee />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.AddEmployee,
        element: <AddEmployee />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.EditEmployee,
        element: <EditEmployee />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.EmployeeDetail,
        element: <EmployeeDetail />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.ManageDepartment,
        element: <ManageDepartment />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.DepartmentDetail,
        element: <DepartmentDetail />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.ManagePosition,
        element: <ManagePosition />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.PositionDetail,
        element: <PositionDetail />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.MyAttendance,
        element: <AdaptivePage desktop={<MyAttendance />} mobile={<MobileAttendance />} />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.ManageAttendance,
        element: <ManageAttendance />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.ManageHRProcedure,
        element: <ManageHRProcedure />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.ManageShift,
        element: <ManageShift />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.AddShift,
        element: <AddShift />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.EditShift,
        element: <EditShift />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.ManageShiftAssignment,
        element: <ManageShiftAssignment />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.MyLeaveRequest,
        element: <AdaptivePage desktop={<MyLeaveRequest />} mobile={<MobileLeaveRequest />} />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.ManageLeaveRequest,
        element: <ManageLeaveRequest />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.LeaveConfiguration,
        element: <LeaveConfiguration />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.MyOvertimeRequest,
        element: <AdaptivePage desktop={<MyOvertimeRequest />} mobile={<MobileOvertimeRequest />} />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.ManageOvertimeRequest,
        element: <ManageOvertimeRequest />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.ManageSystemSettings,
        element: <ManageSystemSettings />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.HRPayrollSettings,
        element: <HRPayrollSettings />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.ManageFaceRegistration,
        element: <AdaptivePage desktop={<ManageFaceRegistration />} mobile={<MobileFaceRegistration />} />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.MyProfile,
        element: <AdaptivePage desktop={<MyProfile />} mobile={<MobileProfile />} />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.PayrollPeriods,
        element: <PayrollPeriods />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.PayrollPeriodDetail,
        element: <PayrollPeriodDetail />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.PayrollRecordDetail,
        element: <PayrollRecordDetail />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.MyPayslips,
        element: <AdaptivePage desktop={<MyPayslips />} mobile={<MobilePayslips />} />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.MyPayrollDraftList,
        element: <MyPayrollDraftList />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.MyPayrollDraft,
        element: <MyPayrollDraft />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.PayrollReport,
        element: <PayrollReport />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.PayrollMethodology,
        element: <PayrollMethodology />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.MyResignationRequest,
        element: <AdaptivePage desktop={<MyResignationRequest />} mobile={<MobileResignation />} />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.ManageResignationRequest,
        element: <ManageResignationRequest />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
]
const menus = [...shareResourceItem, ...privateResourceItem]

export default function Routers() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to={URL.Login} replace />} />
            {menus.map((menu: any) => {
                let element = menu.element;
                element = <PageErrorBoundary><Suspense fallback={null}>{element}</Suspense></PageErrorBoundary>;
                if (menu.private) {
                    element = <PrivateLayout>{element}</PrivateLayout>;
                }
                if (menu.layout === DEFAULT_LAYOUT) {
                    return <Route key={menu.key} path={menu.key} element={<DefaultLayout>{element}</DefaultLayout>} />;
                }
                return <Route key={menu.key} path={menu.key} element={element} />
            })}
        </Routes>
    )
}