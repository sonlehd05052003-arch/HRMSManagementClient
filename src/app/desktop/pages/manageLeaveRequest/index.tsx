import { Tabs } from "antd";
import { CalendarOutlined, CheckSquareOutlined } from "@ant-design/icons";
import PendingLeaveRequestTable from "./components/PendingLeaveRequestTable";
import TeamLeaveCalendar from "./components/TeamLeaveCalendar";
import { PageHeader } from "../../components/listPage";

const ManageLeaveRequest = () => {
    return (
        <div className="p-2">
            <PageHeader
                title="Quản lý nghỉ phép"
                subtitle="Phê duyệt yêu cầu và xem lịch làm việc của nhân viên trong nhóm."
            />
            <Tabs
                defaultActiveKey="1"
                items={[
                    {
                        key: "1",
                        icon: <CheckSquareOutlined />,
                        label: "Phê duyệt yêu cầu",
                        children: <PendingLeaveRequestTable />,
                    },
                    {
                        key: "2",
                        icon: <CalendarOutlined />,
                        label: "Lịch nghỉ phép nhóm",
                        children: <TeamLeaveCalendar />,
                    },
                ]}
            />
        </div>
    );
};

export default ManageLeaveRequest;
