import { Input, Select, Space } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const { Option } = Select;

interface ConditionProps {
    searchText: string;
    setSearchText: (value: string) => void;
    statusFilter: string | null;
    setStatusFilter: (value: string | null) => void;
    typeFilter: string | null;
    setTypeFilter: (value: string | null) => void;
}

const Condition = ({
    searchText, setSearchText,
    statusFilter, setStatusFilter,
    typeFilter, setTypeFilter
}: ConditionProps) => {
    return (
        <Space style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <Input
                placeholder="Tìm thủ tục theo mã, tên NV..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 250 }}
                allowClear
            />
            <Select
                placeholder="Lọc theo trạng thái"
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 150 }}
                allowClear
            >
                <Option value="Pending">Chờ duyệt</Option>
                <Option value="Approved">Đã duyệt</Option>
                <Option value="Rejected">Từ chối</Option>
                <Option value="Applied">Đã áp dụng</Option>
            </Select>
            <Select
                placeholder="Lọc theo loại"
                value={typeFilter}
                onChange={setTypeFilter}
                style={{ width: 150 }}
                allowClear
            >
                <Option value="Appointment">Bổ nhiệm</Option>
                <Option value="Transfer">Điều chuyển</Option>
                <Option value="Demotion">Giáng chức</Option>
                <Option value="Termination">Sa thải</Option>
            </Select>
        </Space>
    );
};

export default Condition;
