import { Row, Col } from "antd";
import MyLeaveRequestTable from "./components/MyLeaveRequestTable";
import LeaveRequestForm from "./components/LeaveRequestForm";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { fetchMyBalance, selectMyLeaveBalances } from "../../../../store/leaveBalanceSlide";
import { PageHeader, StatRow } from "../../components/listPage";

const MyLeaveRequest = () => {
    const dispatch = useAppDispatch();
    const balances = useAppSelector(selectMyLeaveBalances);

    useEffect(() => {
        dispatch(fetchMyBalance());
    }, [dispatch]);

    return (
        <div className="p-2">
            <PageHeader title="Nghỉ phép của tôi" subtitle="Đăng ký và theo dõi các yêu cầu nghỉ phép của bạn." />

            {/* Balance Section */}
            {(balances || []).length > 0 && (
                <StatRow items={(balances || []).map((item: any) => ({
                    title: item.leaveTypeName,
                    value: item.remainingDays,
                    suffix: `/ ${item.totalEntitlement}`,
                    description: `Đã dùng: ${item.usedDays}`,
                }))} />
            )}

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={8}>
                    <LeaveRequestForm />
                </Col>
                <Col xs={24} lg={16}>
                    <MyLeaveRequestTable />
                </Col>
            </Row>
        </div>
    );
};

export default MyLeaveRequest;
