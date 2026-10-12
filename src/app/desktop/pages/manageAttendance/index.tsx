import { Layout, Typography, Tabs } from "antd";
import { TableOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import AttendanceTable from "./components/AttendanceTable";
import ExplanationApprovalTable from "./components/ExplanationApprovalTable";
import { useEffect } from "react";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { fetchPendingExplanations, selectPendingExplanationsTotal } from "../../../../store/attendanceSlide";

const { Content } = Layout;
const { Title } = Typography;

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
        <Layout className="bg-transparent p-4 min-h-screen">
            <Content>
                <div className="mb-6">
                    <Title level={2} className="m-0">Quản lý Chấm công</Title>
                    <p className="text-gray-500 mt-2">Tra cứu, điều chỉnh và quản lý dữ liệu chấm công của toàn bộ nhân viên.</p>
                </div>

                <Tabs
                    defaultActiveKey="attendance"
                    items={[
                        {
                            key: "attendance",
                            label: (
                                <span>
                                    <TableOutlined />
                                    Bảng chấm công
                                    <span style={{
                                        marginLeft: 8
                                    }}></span>
                                </span>
                            ),
                            children: <AttendanceTable />
                        },
                        {
                            key: "explanations",
                            label: (
                                <span>
                                    <ExclamationCircleOutlined />
                                    Giải trình chờ duyệt
                                    <span
                                        style={{
                                            marginLeft: 8,
                                        }}
                                    >
                                    </span>
                                    {pendingCount > 0 && (
                                        <span
                                            style={{
                                                background: "#fa8c16",
                                                color: "#fff",
                                                borderRadius: 10,
                                                padding: "0 7px",
                                                fontSize: 12,
                                                fontWeight: 600,
                                            }}
                                        >
                                            {pendingCount}
                                        </span>
                                    )}
                                </span>
                            ),
                            children: <ExplanationApprovalTable />
                        }
                    ]}
                />
            </Content>
        </Layout>
    );
};

export default ManageAttendance;

