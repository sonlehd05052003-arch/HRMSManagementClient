import React, { useEffect, useMemo, useState } from "react";
import { Input, Tag, Button, Popconfirm, message, Skeleton } from "antd";
import {
    SearchOutlined, ReloadOutlined, CameraOutlined,
    CheckCircleOutlined, CloseCircleOutlined, DeleteOutlined, TeamOutlined
} from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../../store";
import {
    fetchAllEmployeesFaceStatus, adminDeleteFace,
    selectEmployeesFaceStatus, selectFaceLoading,
    type EmployeeFaceStatusDto
} from "../../../../store/faceSlide";
import HRFaceRegisterModal from "../../../desktop/pages/manageFaceRegistration/HRFaceRegisterModal";
import MobilePageWrapper from "../../components/MobilePageWrapper";
import { errorText } from "../../../../utils/apiError";

const MobileFaceRegistration: React.FC = () => {
    const dispatch = useAppDispatch();
    const employees = useAppSelector(selectEmployeesFaceStatus);
    const loading = useAppSelector(selectFaceLoading);

    const [search, setSearch] = useState("");
    const [modal, setModal] = useState<{ open: boolean; employeeId: number; employeeName: string }>({
        open: false, employeeId: 0, employeeName: "",
    });

    useEffect(() => {
        dispatch(fetchAllEmployeesFaceStatus());
    }, [dispatch]);

    const filtered = useMemo(() => {
        if (!search.trim()) return employees;
        const q = search.toLowerCase();
        return employees.filter(e =>
            e.fullName.toLowerCase().includes(q) ||
            e.employeeCode.toLowerCase().includes(q) ||
            (e.departmentName ?? "").toLowerCase().includes(q)
        );
    }, [employees, search]);

    const stats = useMemo(() => ({
        total: employees.length,
        registered: employees.filter(e => e.isRegistered).length,
        unregistered: employees.filter(e => !e.isRegistered).length,
    }), [employees]);

    const handleDelete = async (employeeId: number, name: string) => {
        try {
            await dispatch(adminDeleteFace(employeeId)).unwrap();
            message.success(`Đã xóa khuôn mặt của ${name}`);
            dispatch(fetchAllEmployeesFaceStatus());
        } catch (error) {
            message.error(errorText(error, "Xóa thất bại"));
        }
    };

    const handleRegisterSuccess = () => {
        setModal({ open: false, employeeId: 0, employeeName: "" });
        dispatch(fetchAllEmployeesFaceStatus());
    };

    return (
        <MobilePageWrapper
            title="Quản lý khuôn mặt"
            headerRight={
                <Button
                    size="small"
                    icon={<ReloadOutlined />}
                    loading={loading}
                    onClick={() => dispatch(fetchAllEmployeesFaceStatus())}
                />
            }
        >
            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-100">
                    <TeamOutlined className="text-blue-500 text-base" />
                    <div className="text-xl font-bold text-blue-700 mt-1">{stats.total}</div>
                    <div className="text-[10px] text-blue-500 font-medium">Tổng</div>
                </div>
                <div className="bg-green-50 rounded-xl p-3 text-center border border-green-100">
                    <CheckCircleOutlined className="text-green-500 text-base" />
                    <div className="text-xl font-bold text-green-700 mt-1">{stats.registered}</div>
                    <div className="text-[10px] text-green-500 font-medium">Đã đăng ký</div>
                </div>
                <div className="bg-red-50 rounded-xl p-3 text-center border border-red-100">
                    <CloseCircleOutlined className="text-red-500 text-base" />
                    <div className="text-xl font-bold text-red-700 mt-1">{stats.unregistered}</div>
                    <div className="text-[10px] text-red-500 font-medium">Chưa đăng ký</div>
                </div>
            </div>

            {/* Search */}
            <Input
                placeholder="Tìm tên, mã NV, phòng ban..."
                prefix={<SearchOutlined className="text-gray-400" />}
                value={search}
                onChange={e => setSearch(e.target.value)}
                allowClear
                className="mb-3 rounded-xl"
            />

            {/* List */}
            <div className="flex flex-col gap-2">
                {loading && employees.length === 0
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-xl p-4 border border-gray-100">
                            <Skeleton active paragraph={{ rows: 1 }} />
                        </div>
                    ))
                    : filtered.map((emp: EmployeeFaceStatusDto) => (
                        <EmployeeCard
                            key={emp.employeeId}
                            emp={emp}
                            onRegister={() => setModal({ open: true, employeeId: emp.employeeId, employeeName: emp.fullName })}
                            onDelete={() => handleDelete(emp.employeeId, emp.fullName)}
                        />
                    ))
                }
                {!loading && filtered.length === 0 && (
                    <div className="text-center text-gray-400 py-10 text-sm">
                        Không tìm thấy nhân viên nào
                    </div>
                )}
            </div>

            <HRFaceRegisterModal
                open={modal.open}
                employeeId={modal.employeeId}
                employeeName={modal.employeeName}
                onCancel={() => setModal({ open: false, employeeId: 0, employeeName: "" })}
                onSuccess={handleRegisterSuccess}
            />
        </MobilePageWrapper>
    );
};

interface EmployeeCardProps {
    emp: EmployeeFaceStatusDto;
    onRegister: () => void;
    onDelete: () => void;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({ emp, onRegister, onDelete }) => (
    <div className={`bg-white rounded-xl p-4 border ${emp.isRegistered ? "border-gray-100" : "border-red-100 bg-red-50/30"}`}>
        <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-800 truncate">{emp.fullName}</span>
                    <span className="text-xs text-gray-400 shrink-0">{emp.employeeCode}</span>
                </div>
                {emp.departmentName && (
                    <div className="text-xs text-gray-500 truncate">{emp.departmentName}</div>
                )}
                <div className="mt-2">
                    {emp.isRegistered
                        ? <Tag color="success" icon={<CheckCircleOutlined />} className="text-xs">Đã đăng ký</Tag>
                        : <Tag color="error" icon={<CloseCircleOutlined />} className="text-xs">Chưa đăng ký</Tag>
                    }
                </div>
            </div>
            <div className="flex flex-row gap-2 shrink-0 items-center">
                <Button
                    type="primary"
                    size="small"
                    icon={<CameraOutlined />}
                    onClick={onRegister}
                    className="!text-xs"
                >
                    {emp.isRegistered ? "" : "Đăng ký"}
                </Button>
                {emp.isRegistered && (
                    <Popconfirm
                        title={`Xóa khuôn mặt của ${emp.fullName}?`}
                        description="Nhân viên sẽ không thể chấm công bằng khuôn mặt."
                        onConfirm={onDelete}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Button danger size="small" icon={<DeleteOutlined />} className="!text-xs" />
                    </Popconfirm>
                )}
            </div>
        </div>
    </div>
);

export default MobileFaceRegistration;
