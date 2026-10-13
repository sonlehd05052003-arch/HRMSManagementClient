import { useEffect, useState } from "react";
import { Avatar, Skeleton, Tag } from "antd";
import {
    UserOutlined, MailOutlined
} from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { fetchEmployeeById, selectSelectedEmployee, selectEmployeeLoading } from "../../../../store/employeeSlide";
import { selectInfoLogin } from "../../../../store/authSlide";
import { stringToColor, getInitial } from "../../../../utils/common";
import ChangePasswordModal from "../../../desktop/pages/auth/ChangePasswordModal";
import MobileCard from "../../components/MobileCard";

const STATUS_COLOR: Record<string, string> = {
    Active: "green", Inactive: "default",
    Resigned: "red", Terminated: "red", "On Leave": "orange",
};

const STATUS_VI: Record<string, string> = {
    Active: "Đang làm việc", Inactive: "Không hoạt động",
    Resigned: "Đã nghỉ việc", Terminated: "Đã chấm dứt HĐ", "On Leave": "Đang nghỉ phép",
};

const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString("vi-VN") : "—");

const InfoRow = ({ label, value }: { label: string; value?: string | null }) => (
    <div className="flex items-start justify-between py-2.5 border-b border-gray-50 last:border-b-0">
        <span className="text-xs text-gray-400 w-28 flex-shrink-0">{label}</span>
        <span className="text-sm text-gray-800 text-right flex-1 min-w-0 break-words">{value || "—"}</span>
    </div>
);

const MobileProfile = () => {
    const dispatch = useAppDispatch();
    const infoLogin = useAppSelector(selectInfoLogin);
    const employee = useAppSelector(selectSelectedEmployee);
    const loading = useAppSelector(selectEmployeeLoading);
    const [changePwOpen, setChangePwOpen] = useState(false);

    useEffect(() => {
        if (infoLogin?.employeeId) {
            dispatch(fetchEmployeeById(infoLogin.employeeId));
        }
    }, [infoLogin, dispatch]);


    const avatarColor = infoLogin?.userName ? stringToColor(infoLogin.userName) : "#bfbfbf";
    const initial = getInitial(infoLogin?.userName);

    if (loading && !employee) {
        return (
            <div className="p-4 space-y-4">
                <Skeleton avatar active paragraph={{ rows: 2 }} />
                <Skeleton active paragraph={{ rows: 4 }} />
            </div>
        );
    }

    if (!infoLogin?.employeeId) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <UserOutlined style={{ fontSize: 48 }} />
                <p className="mt-3 text-center text-sm px-8">
                    Tài khoản hệ thống — không có hồ sơ cá nhân để hiển thị.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 pb-4">
            {/* ── Avatar & name ── */}
            <MobileCard className="flex flex-col items-center py-6">
                <Avatar
                    size={80}
                    style={{ backgroundColor: avatarColor, fontSize: 32, fontWeight: "bold" }}
                >
                    {employee ? employee.lastName?.[0]?.toUpperCase() : initial}
                </Avatar>
                <h2 className="text-lg font-bold text-gray-800 mt-3">
                    {employee?.fullName ?? infoLogin?.userName ?? "—"}
                </h2>
                <p className="text-sm text-gray-400">{employee?.positionName ?? infoLogin?.positionName ?? "—"}</p>
                {employee?.employmentStatus && (
                    <Tag
                        color={STATUS_COLOR[employee.employmentStatus] ?? "default"}
                        className="mt-2"
                    >
                        {STATUS_VI[employee.employmentStatus] ?? employee.employmentStatus}
                    </Tag>
                )}
            </MobileCard>

            {/* ── Personal info ── */}
            {employee && (
                <MobileCard>
                    <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
                        <UserOutlined className="text-blue-500" /> Thông tin cá nhân
                    </h3>
                    <InfoRow label="Mã nhân viên" value={employee.employeeCode} />
                    <InfoRow label="Email" value={employee.email} />
                    <InfoRow label="Số điện thoại" value={employee.phone} />
                    <InfoRow label="Ngày sinh" value={fmt(employee.dateOfBirth)} />
                    <InfoRow label="Giới tính" value={employee.gender} />
                    <InfoRow label="Địa chỉ" value={employee.address} />
                    <InfoRow label="Thành phố" value={employee.city} />
                </MobileCard>
            )}

            {/* ── Work info ── */}
            {employee && (
                <MobileCard>
                    <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
                        <MailOutlined className="text-blue-500" /> Thông tin công việc
                    </h3>
                    <InfoRow label="Phòng ban" value={employee.departmentName} />
                    <InfoRow label="Chức vụ" value={employee.positionName} />
                    <InfoRow label="Quản lý" value={employee.managerName} />
                    <InfoRow label="Ngày vào làm" value={fmt(employee.joinDate)} />
                    <InfoRow label="Loại hình" value={employee.employmentType} />
                </MobileCard>
            )}

            {/* ── Account actions ── */}
            {/* <MobileCard>
                <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
                    <KeyOutlined className="text-blue-500" /> Tài khoản
                </h3>
                <button
                    className="w-full flex items-center gap-3 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-50 active:bg-gray-50 transition-colors"
                    onClick={() => setChangePwOpen(true)}
                >
                    <KeyOutlined className="text-gray-400" />
                    <span>Đổi mật khẩu</span>
                </button>
                <Divider className="my-0" />
                <button
                    className="w-full flex items-center gap-3 py-3 text-left text-sm font-medium text-red-500 active:bg-red-50 transition-colors"
                    onClick={handleLogout}
                >
                    <LogoutOutlined />
                    <span>Đăng xuất</span>
                </button>
            </MobileCard> */}

            <ChangePasswordModal
                open={changePwOpen}
                onCancel={() => setChangePwOpen(false)}
            />
        </div>
    );
};

export default MobileProfile;
