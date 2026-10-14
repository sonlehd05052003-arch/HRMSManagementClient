import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, DatePicker, message } from "antd";
import { useAppDispatch, useAppSelector } from "../../../../../store";
import { createTask, fetchAllTasks } from "../../../../../store/taskSlide";
import { fetchAllUsers, selectUsers } from "../../../../../store/userSlide";
import type { IUser } from "../../../../../store/userSlide";
import dayjs from "dayjs";

interface AddTaskModalProps {
    open: boolean;
    onCancel: () => void;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ open, onCancel }) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const allUsers = useAppSelector(selectUsers);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            dispatch(fetchAllUsers());
        }
    }, [open, dispatch]);

    const onFinish = (values: any) => {
        setLoading(true);
        const submitData = {
            ...values,
            dueDate: values.dueDate ? values.dueDate.format("YYYY-MM-DD") : undefined,
        };

        dispatch(createTask(submitData))
            .unwrap()
            .then(() => {
                message.success("Đã tạo công việc");
                form.resetFields();
                onCancel();
                dispatch(fetchAllTasks());
            })
            .catch((err: any) => {
                message.error(err || "Tạo công việc thất bại");
            })
            .finally(() => setLoading(false));
    };

    return (
        <Modal
            title="Tạo công việc"
            open={open}
            onCancel={onCancel}
            onOk={() => form.submit()}
            confirmLoading={loading}
            width={600}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{ priority: 'Medium' }}
            >
                <Form.Item
                    name="taskTitle"
                    label="Tên công việc"
                    rules={[{ required: true, message: 'Vui lòng nhập tên công việc' }]}
                >
                    <Input placeholder="Nhập tên công việc" />
                </Form.Item>

                <Form.Item
                    name="taskType"
                    label="Loại công việc"
                    rules={[{ required: true, message: 'Vui lòng nhập loại công việc' }]}
                >
                    <Input placeholder="Enter task type (e.g. Leave Approval, Research...)" />
                </Form.Item>

                <Form.Item
                    name="assignedTo"
                    label="Giao cho"
                    rules={[{ required: true, message: 'Vui lòng chọn người thực hiện' }]}
                >
                    <Select
                        showSearch
                        placeholder="Chọn người thực hiện"
                        optionFilterProp="children"
                    >
                        {allUsers.map((user: IUser) => (
                            <Select.Option key={user.userId} value={user.userId}>
                                {user.username} ({user.email})
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="priority"
                    label="Độ ưu tiên"
                    rules={[{ required: true }]}
                >
                    <Select>
                        <Select.Option value="High">Cao</Select.Option>
                        <Select.Option value="Medium">Trung bình</Select.Option>
                        <Select.Option value="Low">Thấp</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="dueDate"
                    label="Hạn hoàn thành"
                >
                    <DatePicker style={{ width: '100%' }} disabledDate={(current) => current && current < dayjs().startOf('day')} />
                </Form.Item>

                <Form.Item
                    name="taskDescription"
                    label="Mô tả"
                >
                    <Input.TextArea rows={4} placeholder="Nhập mô tả công việc" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AddTaskModal;
