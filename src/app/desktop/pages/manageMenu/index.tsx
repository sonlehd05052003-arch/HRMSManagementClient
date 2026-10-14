import { useEffect } from "react";
import { Tabs } from "antd";
import { useAppDispatch } from "../../../../store";
import { fetchMenuTree } from "../../../../store/menuSlide";
import { SuperAdminOnly } from "../../components/companyScopeSelect";
import MenuTreeTab from "./MenuTreeTab";
import RoleMenuTab from "./RoleMenuTab";
import { PageHeader } from "../../components/listPage";

// The menu tree is shared by every company; which menus each company role sees is picked per company.
// Both are configured by the SuperAdmin.
const ManageMenuContent = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchMenuTree());
  }, [dispatch]);

  return (
    <div className="p-2">
      <PageHeader title="Quản lý menu" />
      <Tabs
        items={[
          { key: "tree", label: "Cây menu", children: <MenuTreeTab /> },
          { key: "roles", label: "Phân menu theo vai trò", children: <RoleMenuTab /> },
        ]}
      />
    </div>
  );
};

const ManageMenu = () => (
  <SuperAdminOnly>
    <ManageMenuContent />
  </SuperAdminOnly>
);

export default ManageMenu;
