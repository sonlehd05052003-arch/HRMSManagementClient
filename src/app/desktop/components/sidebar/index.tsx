import { Layout, Menu, Spin, Empty } from "antd";
import { MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { useNavigate, useLocation } from "react-router-dom";
import { selectIsLogin } from "../../../../store/authSlide";
import { fetchMyMenu, selectMyMenu, selectMyMenuLoaded, type IMyMenuNode } from "../../../../store/menuSlide";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { renderMenuIcon } from "../../../../constants/menuIcons";

const { Sider } = Layout;

const nodeKey = (node: IMyMenuNode) => `menu-${node.menuId}`;

const toMenuItems = (nodes: IMyMenuNode[], collapsed: boolean, depth = 0): any[] =>
  nodes.map((node) => ({
    key: nodeKey(node),
    icon: renderMenuIcon(node.iconName),
    label: collapsed && depth === 0 ? null : node.title,
    children: node.children.length ? toMenuItems(node.children, collapsed, depth + 1) : undefined,
  }));

const flatten = (nodes: IMyMenuNode[]): IMyMenuNode[] =>
  nodes.flatMap((node) => [node, ...flatten(node.children)]);

const Sidebar = () => {
  const dispatch = useAppDispatch();
  const myMenu = useAppSelector(selectMyMenu);
  const loaded = useAppSelector(selectMyMenuLoaded);
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const isLogin = useAppSelector(selectIsLogin);
  useEffect(() => {
    if (isLogin) dispatch(fetchMyMenu());
  }, [isLogin, dispatch]);

  const allNodes = useMemo(() => flatten(myMenu), [myMenu]);

  // Highlight the item whose route is the longest prefix of the current URL (covers detail pages).
  const selectedKey = useMemo(() => {
    const path = location.pathname;
    const match = allNodes
      .filter((n) => n.route && (path === n.route || path.startsWith(n.route + "/")))
      .sort((a, b) => (b.route!.length - a.route!.length))[0];
    return match ? nodeKey(match) : undefined;
  }, [allNodes, location.pathname]);

  const items = useMemo(() => toMenuItems(myMenu, collapsed), [myMenu, collapsed]);

  return (
    <Sider
      theme="light"
      width={collapsed ? 80 : 240}
      collapsedWidth={80}
      trigger={null}
      className="bg-white"
      collapsed={collapsed}
    >
      <motion.div
        animate={{ width: collapsed ? 80 : 240 }}
        transition={{ duration: 0.3 }}
        className="h-full flex flex-col justify-between"
      >
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="h-16 flex items-center justify-center font-bold text-blue-600 text-xl overflow-hidden whitespace-nowrap flex-shrink-0">
            {collapsed ? "HR" : "HR MANAGEMENT"}
          </div>
          <div className="flex-1 overflow-y-auto overflow-x-hidden sidebar-menu-scroll">
            {!loaded ? (
              <div className="flex justify-center p-6"><Spin /></div>
            ) : items.length === 0 ? (
              !collapsed && <Empty className="mt-6" image={Empty.PRESENTED_IMAGE_SIMPLE} description="Vai trò chưa được cấp menu" />
            ) : (
              <Menu
                mode="inline"
                selectedKeys={selectedKey ? [selectedKey] : []}
                className="border-r-0"
                items={items}
                onClick={({ key }) => {
                  const node = allNodes.find((n) => nodeKey(n) === key);
                  if (node?.route) navigate(node.route);
                }}
              />
            )}
          </div>
        </div>
        <div className="flex justify-center items-center p-3 border-t border-gray-100">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-full hover:bg-gray-100 transition text-gray-400 hover:text-blue-500"
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </button>
        </div>
      </motion.div>
    </Sider>
  );
};

export default Sidebar;
