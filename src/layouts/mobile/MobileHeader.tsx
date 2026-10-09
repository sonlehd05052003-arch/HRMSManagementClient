import { Avatar, Dropdown } from "antd";
import { UserOutlined, LogoutOutlined, KeyOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../store";
import { actionLogout, selectInfoLogin, selectIsLogin } from "../../store/authSlide";
import { useNavigate } from "react-router-dom";
import URL from "../../constants/url";
import { useEffect, useState } from "react";

import ChangePasswordModal from "../../app/desktop/pages/auth/ChangePasswordModal";
import { stringToColor, getInitial } from "../../utils/common";
import { request } from "../../utils/request";

const MobileHeader = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const infoLogin = useAppSelector(selectInfoLogin);
    const isLogin = useAppSelector(selectIsLogin);
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

    const handleLogout = () => {
        dispatch(actionLogout());
        navigate(URL.Login);
    };



    useEffect(() => {
        if (!isLogin) return;

        const pingTimer = setInterval(async () => {
            try {
                await request({
                    url: "/Auth/ping",
                    method: "GET",
                });
            } catch {
                clearInterval(pingTimer);
            }
        }, 10000);

        return () => clearInterval(pingTimer);
    }, [isLogin]);

    const userInitial = getInitial(infoLogin?.userName);
    const avatarColor = infoLogin?.userName ? stringToColor(infoLogin.userName) : "#bfbfbf";

    return (
        <>
            <header className="mobile-header flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <span className="text-blue-600 font-bold text-lg leading-none">HRMS Management</span>
                </div>

                <Dropdown
                    menu={{
                        items: [
                            ...(infoLogin?.employeeId
                                ? [{
                                    key: "profile",
                                    label: "Hồ sơ của tôi",
                                    icon: <UserOutlined />,
                                    onClick: () => navigate(URL.MyProfile),
                                }]
                                : []),
                            {
                                key: "change-password",
                                label: "Đổi mật khẩu",
                                icon: <KeyOutlined />,
                                onClick: () => setIsChangePasswordOpen(true),
                            },
                            { type: "divider" as const },
                            {
                                key: "logout",
                                label: "Đăng xuất",
                                icon: <LogoutOutlined />,
                                onClick: handleLogout,
                                danger: true,
                            },
                        ],
                    }}
                    placement="bottomRight"
                    arrow
                >
                    <div className="flex items-center gap-2 cursor-pointer">
                        <div className="text-right hidden">
                            <p className="text-xs font-semibold text-gray-800 leading-tight">{infoLogin?.userName}</p>
                            <p className="text-xs text-gray-400 leading-tight">{infoLogin?.positionName}</p>
                        </div>
                        <Avatar
                            size={36}
                            style={{ backgroundColor: avatarColor, fontWeight: "bold", cursor: "pointer" }}
                        >
                            {userInitial}
                        </Avatar>
                    </div>
                </Dropdown>
            </header>

            <ChangePasswordModal
                open={isChangePasswordOpen}
                onCancel={() => setIsChangePasswordOpen(false)}
            />
        </>
    );
};

export default MobileHeader;
