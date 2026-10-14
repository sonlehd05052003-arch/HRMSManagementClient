import { Badge, Space, Tabs } from "antd";
import { TableOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import AttendanceTable from "./components/AttendanceTable";
import ExplanationApprovalTable from "./components/ExplanationApprovalTable";
import { useEffect } from "react";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { fetchPendingExplanations, selectPendingExplanationsTotal } from "../../../../store/attendanceSlide";
import { PageHeader } from "../../components/listPage";

const ManageAttendance = () => {
    const dispatch = useAppDispatch();
    // The tab badge needs the count before the explanations tab is opened
    const pendingCount = useAppSelector(selectPendingExplanationsTotal);

    useEffect(() => {
        dispatch(fetchPendingExplanations({
            fromDate: dayjs().subtract(90, "day").format("YYYY-MM-DD"),
            toDate: dayjs().format("YYYY-MM-DD"),
            page: 1,
            pageSize: 10,
        }));
    }, [dispatch]);

    return (
        <div className="p-2">
            <PageHeader
                title="Quản lý chấm công"
                subtitle="Tra cứu, điều chỉnh và quản lý dữ liệu chấm công của toàn bộ nhân viên."
            />

            <Tabs
                defaultActiveKey="attendance"
                items={[
                    {
                        key: "attendance",
                        icon: <TableOutlined />,
                        label: "Bảng chấm công",
                        children: <AttendanceTable />
                    },
                    {
                        key: "explanations",
                        icon: <ExclamationCircleOutlined />,
                        label: (
                            <Space size={8}>
                                <span>Giải trình chờ duyệt</span>
                                {pendingCount > 0 && <Badge count={pendingCount} color="#fa8c16" />}
                            </Space>
                        ),
                        children: <ExplanationApprovalTable />
                    }
                ]}
            />
        </div>
    );
};

export default ManageAttendance;
