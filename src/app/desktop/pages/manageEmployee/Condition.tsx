import { Input, Select, Row, Col } from "antd";
import { SearchOutlined, PhoneOutlined } from "@ant-design/icons";

interface ConditionProps {
    searchText: string;
    setSearchText: (v: string) => void;
    statusFilter: string | null;
    setStatusFilter: (v: string | null) => void;
    genderFilter: string | null;
    setGenderFilter: (v: string | null) => void;
    departmentFilter: string | null;
    setDepartmentFilter: (v: string | null) => void;
    phoneSearch: string;
    setPhoneSearch: (v: string) => void;
    departmentOptions: { label: string; value: string }[];
}

const EMPLOYMENT_STATUS_OPTIONS = [
    { label: "Active", value: "Active" },
    { label: "Inactive", value: "Inactive" },
    { label: "Resigned", value: "Resigned" },
    { label: "Terminated", value: "Terminated" },
    { label: "On Leave", value: "On Leave" },
];
const GENDER_OPTIONS = [
    { label: "Nam", value: "Male" },
    { label: "Nữ", value: "Female" },
    { label: "Khác", value: "Other" },
];

const Condition = ({
    searchText, setSearchText,
    statusFilter, setStatusFilter,
    genderFilter, setGenderFilter,
    departmentFilter, setDepartmentFilter,
    phoneSearch, setPhoneSearch,
    departmentOptions,
}: ConditionProps) => (
    <Row gutter={[16, 12]}>
        <Col xs={24} sm={12} md={8}>
            <Input
                placeholder="Tìm theo tên, mã NV hoặc email..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
            />
        </Col>
        <Col xs={24} sm={12} md={6}>
            <Input
                placeholder="Tìm theo số điện thoại..."
                prefix={<PhoneOutlined />}
                value={phoneSearch}
                onChange={(e) => setPhoneSearch(e.target.value)}
                allowClear
            />
        </Col>
        <Col xs={12} sm={8} md={4}>
            <Select style={{ width: "100%" }} placeholder="Trạng thái" value={statusFilter} onChange={setStatusFilter} allowClear options={EMPLOYMENT_STATUS_OPTIONS} />
        </Col>
        <Col xs={12} sm={8} md={3}>
            <Select style={{ width: "100%" }} placeholder="Giới tính" value={genderFilter} onChange={setGenderFilter} allowClear options={GENDER_OPTIONS} />
        </Col>
        <Col xs={24} sm={8} md={3}>
            <Select style={{ width: "100%" }} placeholder="Phòng ban" value={departmentFilter} onChange={setDepartmentFilter} allowClear options={departmentOptions} showSearch />
        </Col>
    </Row>
);

export default Condition;
