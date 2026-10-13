import { Input, Select, Row, Col } from "antd";
import { SearchOutlined } from "@ant-design/icons";

interface ConditionProps {
    searchText: string;
    setSearchText: (value: string) => void;
    statusFilter: boolean | null;
    setStatusFilter: (value: boolean | null) => void;
}

const Condition = ({
    searchText,
    setSearchText,
    statusFilter,
    setStatusFilter,
}: ConditionProps) => {
    return (
        <Row gutter={[16, 16]}>
            <Col xs={24} sm={16} md={12}>
                <Input
                    placeholder="Tìm theo tên vai trò hoặc mô tả"
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    allowClear
                />
            </Col>
            <Col xs={24} sm={8} md={6}>
                <Select
                    style={{ width: "100%" }}
                    placeholder="Lọc trạng thái"
                    value={statusFilter}
                    onChange={setStatusFilter}
                    allowClear
                >
                    <Select.Option value={true}>Hoạt động</Select.Option>
                    <Select.Option value={false}>Ngừng</Select.Option>
                </Select>
            </Col>
        </Row>
    );
};

export default Condition;
