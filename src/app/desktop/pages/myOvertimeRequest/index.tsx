import { Row, Col } from "antd";
import MyOvertimeRequestTable from "./components/MyOvertimeRequestTable";
import OvertimeRequestForm from "./components/OvertimeRequestForm";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { fetchMyOvertimeRequests, selectMyOvertimeRequests } from "../../../../store/overtimeSlide";
import { PageHeader, StatRow } from "../../components/listPage";

const MyOvertimeRequest = () => {
    const dispatch = useAppDispatch();
    const requests = useAppSelector(selectMyOvertimeRequests);

    useEffect(() => {
        dispatch(fetchMyOvertimeRequests());
    }, [dispatch]);

    const stats = {
        total: requests.length,
        approved: requests.filter(r => r.status === "Approved").length,
        pending: requests.filter(r => r.status === "Pending").length,
        rejected: requests.filter(r => r.status === "Rejected" || r.status === "Cancelled").length,
    };

    return (
        <div className="p-2">
            <PageHeader title="Làm thêm giờ của tôi" subtitle="Đăng ký và theo dõi các yêu cầu tăng ca của bạn." />

            {/* Overtime Stats Section */}
            <StatRow
                items={[
                    { title: "Tổng số yêu cầu", value: stats.total, color: "#2563eb" },
                    { title: "Đã phê duyệt", value: stats.approved, color: "#059669" },
                    { title: "Đang chờ duyệt", value: stats.pending, color: "#d97706" },
                    { title: "Đã từ chối/hủy", value: stats.rejected, color: "#e11d48" },
                ]}
            />

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={8}>
                    <OvertimeRequestForm />
                </Col>
                <Col xs={24} lg={16}>
                    <MyOvertimeRequestTable />
                </Col>
            </Row>
        </div>
    );
};

export default MyOvertimeRequest;
