import { Row, Col } from "antd";
import ResignationRequestForm from "./components/ResignationRequestForm";
import MyResignationRequestTable from "./components/MyResignationRequestTable";
import { PageHeader } from "../../components/listPage";

const MyResignationRequest = () => {
    return (
        <div className="p-2">
            <PageHeader title="Đơn xin thôi việc" subtitle="Nộp và theo dõi đơn xin thôi việc của bạn." />

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={8}>
                    <ResignationRequestForm />
                </Col>
                <Col xs={24} lg={16}>
                    <MyResignationRequestTable />
                </Col>
            </Row>
        </div>
    );
};

export default MyResignationRequest;
