import { useEffect } from "react";
import { Tabs } from "antd";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { fetchAllDepartments, selectDepartments } from "../../../../store/departmentSlide";
import { PageHeader } from "../../components/listPage";
import WorkforceTab from "./WorkforceTab";
import AttendanceTab from "./AttendanceTab";
import PayrollTab from "./PayrollTab";

/** HR reports: headcount movements, attendance by department and payroll cost, each with an Excel export */
const Reports = () => {
    const dispatch = useAppDispatch();
    const departments = useAppSelector(selectDepartments);

    useEffect(() => { dispatch(fetchAllDepartments()); }, [dispatch]);

    const departmentOptions = departments.map((d) => ({ label: d.departmentName, value: d.departmentId }));

    return (
        <div className="p-2">
            <PageHeader title="Báo cáo nhân sự" subtitle="Số liệu tính trực tiếp từ hồ sơ, chấm công và bảng lương" />
            <Tabs
                destroyOnHidden
                items={[
                    { key: "workforce", label: "Biến động nhân sự", children: <WorkforceTab departments={departmentOptions} /> },
                    { key: "attendance", label: "Chấm công", children: <AttendanceTab departments={departmentOptions} /> },
                    { key: "payroll", label: "Chi phí lương", children: <PayrollTab /> },
                ]}
            />
        </div>
    );
};

export default Reports;
