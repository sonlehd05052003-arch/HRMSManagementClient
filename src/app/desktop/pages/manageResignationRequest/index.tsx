import PendingResignationTable from "./components/PendingResignationTable";
import { PageHeader } from "../../components/listPage";

const ManageResignationRequest = () => {
    return (
        <div className="p-2">
            <PageHeader
                title="Quản lý đơn thôi việc"
                subtitle="Xem xét và phê duyệt đơn xin thôi việc của nhân viên trong nhóm."
            />
            <PendingResignationTable />
        </div>
    );
};

export default ManageResignationRequest;
