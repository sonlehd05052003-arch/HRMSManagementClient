import { Layout, Avatar, Dropdown } from 'antd';
import { UserOutlined, LogoutOutlined, KeyOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../../../store';
import { actionLogout, selectInfoLogin, selectIsLogin } from '../../../../store/authSlide';
import { useNavigate } from 'react-router-dom';
import URL from '../../../../constants/url';
import { useEffect, useState } from 'react';
import ChangePasswordModal from '../../pages/auth/ChangePasswordModal';

import { stringToColor, getInitial } from '../../../../utils/common';
import { request } from '../../../../utils/request';

const { Header } = Layout;

const HeaderBar = () => {
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

        // Automatically ping the server to check if the session is still valid (detects concurrent logins)
        const pingTimer = setInterval(async () => {
            try {
                await request({
                    url: '/Auth/ping',
                    method: 'GET'
                });
            } catch {
                clearInterval(pingTimer);
            }
        }, 10000); // Ping every 10 seconds

        return () => clearInterval(pingTimer);
    }, [isLogin]);

    const userInitial = getInitial(infoLogin?.userName);
    const avatarColor = infoLogin?.userName ? stringToColor(infoLogin.userName) : "#bfbfbf";

    return (
        <Header
            className="flex items-center justify-end h-16 sticky top-0 z-10"
            style={{ background: '#fff', padding: '0 24px', boxShadow: '0 4px 8px rgba(0,0,0,0.04)', clipPath: 'inset(0 0 -20px 0)' }}
        >

            <Dropdown
                menu={{
                    items: [
                        ...(infoLogin?.employeeId ? [{
                            key: 'profile',
                            label: 'Hồ sơ của tôi',
                            icon: <UserOutlined />,
                            onClick: () => navigate(URL.MyProfile),
                        }] : []),
                        {
                            key: 'change-password',
                            label: 'Đổi mật khẩu',
                            icon: <KeyOutlined />,
                            onClick: () => setIsChangePasswordOpen(true),
                        },
                        {
                            type: 'divider',
                        },
                        {
                            key: 'logout',
                            label: 'Đăng xuất',
                            icon: <LogoutOutlined />,
                            onClick: handleLogout,
                            danger: true,
                        },
                    ]
                }}
                placement="bottomRight"
                arrow
            >
                <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded-lg transition-colors">
                    <Avatar
                        size="large"
                        style={{
                            backgroundColor: avatarColor,
                            verticalAlign: 'middle',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        {userInitial}
                    </Avatar>
                </div>
            </Dropdown>

            <ChangePasswordModal
                open={isChangePasswordOpen}
                onCancel={() => setIsChangePasswordOpen(false)}
            />
        </Header>
    );
};

export default HeaderBar;
