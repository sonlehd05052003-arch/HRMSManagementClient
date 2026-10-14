import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Descriptions, Button, Tag, Spin, message, Modal } from "antd";
import { ArrowLeftOutlined, EditOutlined, IdcardOutlined, StopOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { fetchPositionById, selectSelectedPosition, selectPositionLoading, deactivatePosition } from "../../../../store/positionSlide";
import EditPositionModal from "./modal/EditPositionModal";

import { PageHeader, SectionCard } from "../../components/listPage";

const PositionDetail = () => {
    const { id } = useParams();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const position = useAppSelector(selectSelectedPosition);
    const loading = useAppSelector(selectPositionLoading);
    
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        if (id) {
            dispatch(fetchPositionById(parseInt(id)));
        }
    }, [id, dispatch]);

    const handleDeactivate = () => {
        if (!position) return;
        Modal.confirm({
            title: "Xác nhận ngừng sử dụng",
            content: "Bạn có chắc muốn ngừng sử dụng chức vụ này?",
            onOk: () => {
                dispatch(deactivatePosition(position.positionId)).then((res: any) => {
                    if (!res.error) {
                        message.success("Đã ngừng sử dụng chức vụ (MSG-100)");
                        navigate("/hr/manage-position");
                    } else {
                        const error = res.payload;
                        const msg = typeof error === 'string' ? error : error?.message || "Không thể ngừng sử dụng chức vụ (MSG-101)";
                        message.error(msg);
                    }
                });
            }
        });
    };

    if (loading && !position) {
        return <div style={{ textAlign: "center", padding: "50px" }}><Spin size="large" /></div>;
    }

    if (!position) {
        return <div className="p-2"><PageHeader title="Không tìm thấy chức vụ" /></div>;
    }

    return (
        <div className="p-2">
            <PageHeader
                title="Chi tiết chức vụ"
                subtitle={position.positionName}
                actions={
                    <>
                        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/hr/manage-position")}>
                            Quay lại
                        </Button>
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => setIsEditModalOpen(true)}
                        >
                            Chỉnh sửa
                        </Button>
                        {position.isActive && (
                            <Button
                                danger
                                icon={<StopOutlined />}
                                onClick={handleDeactivate}
                            >
                                Ngừng sử dụng
                            </Button>
                        )}
                    </>
                }
            />
            <SectionCard title="Thông tin chức vụ" icon={<IdcardOutlined />} gap={0}>
                <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
                    <Descriptions.Item label="Mã chức vụ">{position.positionCode}</Descriptions.Item>
                    <Descriptions.Item label="Tên chức vụ">{position.positionName}</Descriptions.Item>
                    <Descriptions.Item label="Cấp bậc">{position.level}</Descriptions.Item>
                    <Descriptions.Item label="Cấp cao nhất">
                        {position.isTopLevel ? <Tag color="blue">Cấp cao nhất</Tag> : "No"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                        <Tag color={position.isActive ? "green" : "red"}>
                            {position.isActive ? "Đang hoạt động" : "Ngừng sử dụng"}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Số nhân viên">{position.employeeCount}</Descriptions.Item>
                    <Descriptions.Item label="Mô tả">{position.description || "—"}</Descriptions.Item>
                </Descriptions>
            </SectionCard>

            <EditPositionModal
                open={isEditModalOpen}
                onCancel={() => setIsEditModalOpen(false)}
                positionId={position.positionId}
                initialValues={{
                    positionCode: position.positionCode,
                    positionName: position.positionName,
                    description: position.description,
                    level: position.level,
                    isTopLevel: position.isTopLevel
                }}
            />
        </div>
    );
};

export default PositionDetail;
