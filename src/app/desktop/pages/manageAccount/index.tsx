import { useEffect, useState } from "react";
import { Table, Button, Tag, Space, message, Tooltip } from "antd";
import { PlusOutlined, EditOutlined, UserOutlined, KeyOutlined, DeleteOutlined, UndoOutlined } from "@ant-design/icons";
import { useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../store";
import {
    fetchAllUsers,
    activateUser,
    deactivateUser,
    selectUsers,
    selectUserLoading,
} from "../../../../store/userSlide";
import { selectInfoLogin } from "../../../../store/authSlide";
import { fetchAllRoles } from "../../../../store/roleSlide";
import CompanyScopeSelect from "../../components/companyScopeSelect";
import { useConfigScope, useIsSuperAdmin } from "../../components/companyScopeSelect/hooks";
import Condition from "./Condition";
import AddAccountModal from "./modal/AddAccountModal";
import EditAccountModal from "./modal/EditAccountModal";
import ResetPasswordModal from "./modal/ResetPasswordModal";
import { FilterCard, PageHeader, TableCard } from "../../components/listPage";

const ManageAccount = () => {
    const dispatch = useAppDispatch();
    const [searchParams] = useSearchParams();
    const users = useAppSelector(selectUsers);
    const loading = useAppSelector(selectUserLoading);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);

    const [searchText, setSearchText] = useState("");
    const [roleFilter, setRoleFilter] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<boolean | null>(null);
    const [togglingUserId, setTogglingUserId] = useState<number | null>(null);
    const [resettingUser, setResettingUser] = useState<any>(null);
    const infoLogin = useAppSelector(selectInfoLogin);
    // Same rule as the API: only an ADMIN or the SuperAdmin may reset an ADMIN account
    const canResetAdmins = infoLogin?.role === "ADMIN" || infoLogin?.role === "SUPERADMIN";
    // The SuperAdmin works on the company picked above the table; reload when it changes
    const { ready, scopeKey } = useConfigScope();
    const isSuperAdmin = useIsSuperAdmin();

    useEffect(() => {
        if (!ready) return;
        dispatch(fetchAllUsers());
        dispatch(fetchAllRoles());
    }, [dispatch, ready, scopeKey]);

    useEffect(() => {
        const roleParam = searchParams.get("role");
        if (roleParam) {
            setRoleFilter(roleParam);
        }
    }, [searchParams]);

    const handleAdd = () => {
        setIsAddModalOpen(true);
    };

    const handleEdit = (record: any) => {
        setEditingUser(record);
        setIsEditModalOpen(true);
    };

    const isProtectedAdmin = (record: any) => {
        return record.username?.toLowerCase() === "admin";
    };

    const handleToggleStatus = (record: any) => {
        if (record.isActive && isProtectedAdmin(record)) {
            message.warning("Khong cho phep vo hieu hoa tai khoan admin");
            return;
        }

        const action = record.isActive ? deactivateUser(record.userId) : activateUser(record.userId);
        const successMsg = record.isActive ? "Đã vô hiệu hóa tài khoản" : "Đã kích hoạt tài khoản";

        setTogglingUserId(record.userId);
        dispatch(action)
            .unwrap()
            .then(() => {
                message.success(successMsg);
            })
            .catch((error: any) => {
                const msg = typeof error === 'string' ? error : error?.message || "Đã xảy ra lỗi";
                message.error(msg);
            })
            .finally(() => {
                setTogglingUserId(null);
            });
    };

    const handleSuccess = () => {
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        dispatch(fetchAllUsers());
    };

    const filteredUsers = users.filter((user) => {
        const matchesSearch = user.username.toLowerCase().includes(searchText.toLowerCase()) ||
            user.email.toLowerCase().includes(searchText.toLowerCase());
        const matchesRole = roleFilter ? user.roles.includes(roleFilter) : true;
        const matchesStatus = statusFilter !== null ? user.isActive === statusFilter : true;

        return matchesSearch && matchesRole && matchesStatus;
    });

    const columns = [
        {
            title: "Mã",
            dataIndex: "userId",
            key: "userId",
            width: 70,
        },
        {
            title: "Tên đăng nhập",
            dataIndex: "username",
            key: "username",
            render: (text: string) => (
                <Space>
                    <UserOutlined />
                    {text}
                </Space>
            ),
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
        },
        {
            title: "Vai trò",
            dataIndex: "roles",
            key: "roles",
            render: (roles: string[]) => (
                <>
                    {roles.map((role) => (
                        <Tag color="blue" key={role}>
                            {role.toUpperCase()}
                        </Tag>
                    ))}
                </>
            ),
        },
        {
            title: "Trạng thái",
            dataIndex: "isActive",
            key: "isActive",
            render: (isActive: boolean) => (
                <Tag color={isActive ? "green" : "red"}>
                    {isActive ? "HOẠT ĐỘNG" : "NGỪNG"}
                </Tag>
            ),
        },
        {
            title: "Thao tác",
            key: "action",
            render: (_: any, record: any) => (
                <Space size="middle">
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    />
                    <Tooltip title={record.isActive ? "Đặt lại mật khẩu" : "Tài khoản đang bị vô hiệu hóa"}>
                        <Button
                            icon={<KeyOutlined />}
                            disabled={!record.isActive || (!canResetAdmins && record.roles.includes("ADMIN"))}
                            onClick={() => setResettingUser(record)}
                        />
                    </Tooltip>
                    <Tooltip title={record.isActive ? "Vô hiệu hóa tài khoản" : "Kích hoạt lại tài khoản"}>
                        <Button
                            type={record.isActive ? "primary" : "default"}
                            danger={record.isActive}
                            icon={record.isActive ? <DeleteOutlined /> : <UndoOutlined />}
                            loading={togglingUserId === record.userId}
                            disabled={record.isActive && isProtectedAdmin(record)}
                            onClick={() => handleToggleStatus(record)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className="p-2">
            <PageHeader
                title="Quản lý Tài khoản"
                actions={
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                        Thêm tài khoản
                    </Button>
                }
            />
            {isSuperAdmin && (
                <div style={{ marginBottom: 16 }}>
                    <CompanyScopeSelect />
                </div>
            )}
            <FilterCard
                onReset={() => {
                    setSearchText("");
                    setRoleFilter(null);
                    setStatusFilter(null);
                }}
            >
                <Condition
                    searchText={searchText}
                    setSearchText={setSearchText}
                    roleFilter={roleFilter}
                    setRoleFilter={setRoleFilter}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                />
            </FilterCard>
            <TableCard title="Danh sách tài khoản" count={filteredUsers.length}>
                <Table
                    columns={columns}
                    dataSource={filteredUsers}
                    rowKey="userId"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 1000 }}
                    size="middle"
                />
            </TableCard>

            <AddAccountModal
                open={isAddModalOpen}
                onCancel={() => setIsAddModalOpen(false)}
                onSuccess={handleSuccess}
            />

            <EditAccountModal
                open={isEditModalOpen}
                onCancel={() => setIsEditModalOpen(false)}
                onSuccess={handleSuccess}
                editingUser={editingUser}
            />

            <ResetPasswordModal user={resettingUser} onClose={() => setResettingUser(null)} />
        </div>
    );
};

export default ManageAccount;
