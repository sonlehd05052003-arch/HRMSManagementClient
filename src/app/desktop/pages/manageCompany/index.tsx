import { useEffect, useMemo, useState } from "react";
import { Table, Button, Tag, Space, Typography, Tooltip, Input, Modal, message } from "antd";
import StatusToggleButton from "../../components/statusToggleButton";
import { PlusOutlined, EditOutlined, BankOutlined, TeamOutlined, UserOutlined, SearchOutlined, KeyOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "../../../../store";
import {
  fetchCompanies,
  setCompanyStatus,
  selectCompanies,
  selectCompaniesLoading,
  type ICompany,
  type ICompanyAdmin,
  type ICreateCompanyResult,
  type IResetAdminPasswordResult,
} from "../../../../store/companySlide";
import CompanyFormModal from "./CompanyFormModal";
import ResetAdminPasswordModal from "./ResetAdminPasswordModal";
import { FilterCard, PageHeader, TableCard } from "../../components/listPage";

const { Text, Paragraph } = Typography;

/** Temporary passwords are only returned once by the API, so show them in a copyable dialog. */
const showTemporaryPassword = (title: string, intro: string, username: string, password: string) => {
  Modal.success({
    title,
    width: 480,
    content: (
      <div>
        <Paragraph>{intro}</Paragraph>
        <Paragraph style={{ marginBottom: 4 }}>
          Username: <Text strong copyable>{username}</Text>
        </Paragraph>
        <Paragraph>
          Mật khẩu tạm: <Text strong code copyable>{password}</Text>
        </Paragraph>
        <Text type="secondary">Mật khẩu này chỉ hiển thị một lần. Admin cần đổi mật khẩu sau khi đăng nhập.</Text>
      </div>
    ),
  });
};

const ManageCompany = () => {
  const dispatch = useAppDispatch();
  const companies = useAppSelector(selectCompanies);
  const loading = useAppSelector(selectCompaniesLoading);

  const [searchText, setSearchText] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ICompany | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [resettingCompany, setResettingCompany] = useState<ICompany | null>(null);

  useEffect(() => {
    dispatch(fetchCompanies());
  }, [dispatch]);

  const filtered = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return companies;
    return companies.filter((c) =>
      [c.companyCode, c.companyName, c.taxCode, c.email].some((v) => v?.toLowerCase().includes(q))
    );
  }, [companies, searchText]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (company: ICompany) => {
    setEditing(company);
    setFormOpen(true);
  };

  const handleSaved = (created?: ICreateCompanyResult) => {
    setFormOpen(false);
    dispatch(fetchCompanies());
    if (created) {
      showTemporaryPassword(
        "Đã tạo công ty",
        "Tài khoản quản trị của công ty đã được tạo và gửi qua email:",
        created.adminUsername,
        created.temporaryPassword
      );
    }
  };

  const handlePasswordReset = (result: IResetAdminPasswordResult) => {
    setResettingCompany(null);
    showTemporaryPassword(
      "Đã đặt lại mật khẩu",
      "Mật khẩu tạm mới đã được gửi qua email cho admin. Các phiên đăng nhập cũ đã bị đăng xuất.",
      result.username,
      result.temporaryPassword
    );
  };

  const handleToggleStatus = (company: ICompany) => {
    setTogglingId(company.companyId);
    dispatch(setCompanyStatus({ companyId: company.companyId, isActive: !company.isActive }))
      .unwrap()
      .then(() => {
        message.success(company.isActive ? "Đã khóa công ty" : "Đã mở khóa công ty");
        dispatch(fetchCompanies());
      })
      .catch((error: any) => message.error(typeof error === "string" ? error : "Đổi trạng thái thất bại"))
      .finally(() => setTogglingId(null));
  };

  const columns = [
    {
      title: "Mã",
      dataIndex: "companyCode",
      key: "companyCode",
      width: 110,
      render: (code: string) => <Tag>{code}</Tag>,
    },
    {
      title: "Công ty",
      key: "companyName",
      render: (_: unknown, c: ICompany) => (
        <Space direction="vertical" size={0}>
          <Space>
            <BankOutlined />
            <Text strong>{c.companyName}</Text>
          </Space>
          {c.taxCode && <Text type="secondary" style={{ fontSize: 12 }}>MST: {c.taxCode}</Text>}
        </Space>
      ),
    },
    {
      title: "Liên hệ",
      key: "contact",
      render: (_: unknown, c: ICompany) => (
        <Space direction="vertical" size={0}>
          {c.email && <Text style={{ fontSize: 13 }}>{c.email}</Text>}
          {c.phone && <Text type="secondary" style={{ fontSize: 12 }}>{c.phone}</Text>}
          {!c.email && !c.phone && <Text type="secondary">—</Text>}
        </Space>
      ),
    },
    {
      title: "Quy mô",
      key: "size",
      width: 150,
      render: (_: unknown, c: ICompany) => (
        <Space direction="vertical" size={0}>
          <Space size={4}><TeamOutlined />{c.employeeCount} nhân viên</Space>
          <Space size={4}><UserOutlined />{c.userCount} tài khoản</Space>
        </Space>
      ),
    },
    {
      title: "Admin",
      dataIndex: "admins",
      key: "admins",
      render: (admins: ICompanyAdmin[]) =>
        admins.length ? (
          admins.map((a) => (
            <Tooltip key={a.userId} title={a.isActive ? a.email : `${a.email} (đã vô hiệu hóa)`}>
              <Tag color={a.isActive ? "blue" : "default"}>{a.username}</Tag>
            </Tooltip>
          ))
        ) : (
          <Text type="secondary">Chưa có</Text>
        ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdDate",
      key: "createdDate",
      width: 120,
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      width: 120,
      render: (isActive: boolean) => <Tag color={isActive ? "green" : "red"}>{isActive ? "HOẠT ĐỘNG" : "ĐÃ KHÓA"}</Tag>,
    },
    {
      title: "Thao tác",
      key: "action",
      width: 160,
      render: (_: unknown, c: ICompany) => (
        <Space size="middle">
          <Tooltip title="Sửa thông tin">
            <Button icon={<EditOutlined />} onClick={() => openEdit(c)} />
          </Tooltip>
          <Tooltip title={c.admins.some((a) => a.isActive) ? "Đặt lại mật khẩu admin" : "Công ty chưa có admin đang hoạt động"}>
            <Button
              icon={<KeyOutlined />}
              disabled={!c.admins.some((a) => a.isActive)}
              onClick={() => setResettingCompany(c)}
            />
          </Tooltip>
          <StatusToggleButton
            active={c.isActive}
            loading={togglingId === c.companyId}
            onToggle={() => handleToggleStatus(c)}
            deactivateTitle="Khóa công ty này?"
            deactivateDescription="Toàn bộ tài khoản của công ty sẽ bị đăng xuất và không đăng nhập được."
            deactivateTooltip="Khóa công ty"
            restoreTitle="Mở khóa công ty này?"
            restoreTooltip="Mở khóa công ty"
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="p-2">
      <PageHeader
        title="Quản lý công ty"
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Thêm công ty
          </Button>
        }
      />
      <FilterCard onReset={() => setSearchText("")}>
        <Space wrap>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Tìm theo mã, tên, MST, email"
            style={{ width: 300 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Text type="secondary">
            {companies.length} công ty · {companies.filter((c) => c.isActive).length} đang hoạt động
          </Text>
        </Space>
      </FilterCard>
      <TableCard title="Danh sách công ty" count={filtered.length}>
        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="companyId"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1000 }}
        />
      </TableCard>

      <CompanyFormModal open={formOpen} company={editing} onClose={() => setFormOpen(false)} onSaved={handleSaved} />
      <ResetAdminPasswordModal
        company={resettingCompany}
        onClose={() => setResettingCompany(null)}
        onDone={handlePasswordReset}
      />
    </div>
  );
};

export default ManageCompany;
