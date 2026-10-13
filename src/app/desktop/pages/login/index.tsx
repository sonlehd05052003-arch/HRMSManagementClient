import { Form, Input, Button, ConfigProvider } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import imghrm from '../../../../assets/images/hrm.jpg';
import { actionLogin, selectInfoLogin, selectIsLogin } from '../../../../store/authSlide';
import { useAppDispatch, useAppSelector } from '../../../../store';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { EUserRole } from '../../../../interface/app';
import URL from '../../../../constants/url';
import { handleError } from '../../../../utils/common';
import { motion, type Variants } from 'framer-motion';
import ForgotPasswordModal from '../auth/ForgotPasswordModal';

const staggerContainer: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const fadeRight: Variants = {
    hidden: { opacity: 0, x: -40 },
    show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const fadeLeft: Variants = {
    hidden: { opacity: 0, x: 40 },
    show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const dots = [
    { top: '8%',  left: '12%', size: 10, opacity: 0.5 },
    { top: '15%', left: '72%', size: 6,  opacity: 0.35 },
    { top: '28%', left: '88%', size: 8,  opacity: 0.4 },
    { top: '55%', left: '6%',  size: 7,  opacity: 0.3 },
    { top: '68%', left: '80%', size: 5,  opacity: 0.45 },
    { top: '78%', left: '20%', size: 9,  opacity: 0.3 },
    { top: '88%', left: '60%', size: 6,  opacity: 0.4 },
    { top: '40%', left: '92%', size: 5,  opacity: 0.25 },
];

const LoginPage = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const infoLogin = useAppSelector(selectInfoLogin);
    const isLogin = useAppSelector(selectIsLogin);
    const [loading, setLoading] = useState(false);
    const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

    const onFinish = async (values: { username: string; password: string }) => {
        setLoading(true);
        try {
            // Spaces typed or pasted around the password are dropped; spaces inside it are kept
            const res: any = await dispatch(actionLogin({ username: values.username, password: values.password.trim() }));
            if (!actionLogin.fulfilled.match(res)) {
                handleError(res.payload || 'Tài khoản hoặc mật khẩu không đúng');
            }
        } catch (error) {
            handleError(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isLogin && infoLogin) {
            const role = infoLogin.role;
            const routes = {
                [EUserRole.ADMIN]: URL.DashboardAdmin,
                [EUserRole.EMPLOYEE]: URL.MyAttendance,
                [EUserRole.MANAGE]: URL.DashboardManage,
                [EUserRole.HR]: URL.DashboardHR,
                [EUserRole.SUPERADMIN]: URL.ManageCompany,
            };
            navigate(routes[role as keyof typeof routes] || URL.MyAttendance);
        }
    }, [isLogin, infoLogin, navigate]);

    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#4F46E5',
                    borderRadius: 10,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                },
                components: {
                    Input: {
                        controlHeightLG: 50,
                        colorBorder: '#E2E8F0',
                        colorBgContainer: '#F8FAFC',
                        hoverBorderColor: '#4F46E5',
                        activeBorderColor: '#4F46E5',
                    },
                    Button: {
                        controlHeightLG: 50,
                        fontWeight: 600,
                    },
                },
            }}
        >
            <div className="min-h-screen flex overflow-hidden">

                {/* ── LEFT PANEL ── */}
                <motion.div
                    variants={fadeRight}
                    initial="hidden"
                    animate="show"
                    className="hidden lg:block lg:w-[52%] xl:w-[55%] relative overflow-hidden"
                >
                    {/* Background image */}
                    <img
                        src={imghrm}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* Dark overlay */}
                    <div className="absolute inset-0"
                        style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.82) 0%, rgba(30,27,75,0.78) 50%, rgba(49,46,129,0.72) 100%)' }}
                    />

                    {/* Decorative floating dots */}
                    {dots.map((d, i) => (
                        <div
                            key={i}
                            className="absolute rounded-full bg-white"
                            style={{
                                top: d.top,
                                left: d.left,
                                width: d.size,
                                height: d.size,
                                opacity: d.opacity,
                            }}
                        />
                    ))}

                    {/* Concentric rings behind logo */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        {[320, 240, 160].map((size, i) => (
                            <div
                                key={i}
                                className="absolute rounded-full border border-white/[0.07]"
                                style={{ width: size, height: size }}
                            />
                        ))}
                    </div>

                    {/* Logo card — centered */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
                            className="bg-white rounded-3xl shadow-2xl shadow-black/50 overflow-hidden"
                            style={{ width: 'clamp(220px, 32%, 300px)', aspectRatio: '1 / 1' }}
                        >
                            <img src="/logo.png" alt="PeopleCore" className="w-full h-full object-contain p-6" />
                        </motion.div>
                    </div>

                    {/* Bottom tagline */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="absolute bottom-10 left-0 right-0 text-center px-8"
                    >
                        <p className="text-white font-black text-xl xl:text-2xl tracking-widest uppercase drop-shadow-lg">
                            Hệ thống quản trị nhân sự
                        </p>
                        <p className="text-white/50 text-sm mt-1 tracking-wider uppercase">HR Management System</p>
                    </motion.div>
                </motion.div>

                {/* ── RIGHT FORM PANEL ── */}
                <motion.div
                    variants={fadeLeft}
                    initial="hidden"
                    animate="show"
                    className="flex-1 flex flex-col items-center justify-center bg-white px-8 sm:px-14 lg:px-16 xl:px-24 py-12"
                >
                    <div className="w-full max-w-[400px]">
                        {/* Logo + brand */}
                        <motion.div
                            variants={staggerContainer}
                            initial="hidden"
                            animate="show"
                        >
                            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-10">
                                <img src="/logo.png" alt="PeopleCore" className="w-10 h-10 object-contain" />
                                <span className="text-slate-900 font-black text-xl tracking-tight">PeopleCore</span>
                            </motion.div>

                            <motion.div variants={fadeUp} className="mb-8">
                                <h2 className="text-slate-900 font-black text-[2rem] leading-tight tracking-tight">
                                    Đăng nhập tài khoản
                                </h2>
                                <p className="text-slate-500 mt-2 text-sm">Nhập thông tin để tiếp tục</p>
                            </motion.div>

                            <motion.div variants={fadeUp}>
                                <Form
                                    name="login"
                                    layout="vertical"
                                    autoComplete="off"
                                    onFinish={onFinish}
                                    requiredMark={false}
                                    size="large"
                                >
                                    <Form.Item
                                        label={<span className="text-slate-600 font-semibold text-sm">Tên đăng nhập</span>}
                                        name="username"
                                        // Usernames never contain spaces: drop them as they are typed or pasted
                                        normalize={(value?: string) => value?.replace(/\s/g, '')}
                                        rules={[{ required: true, message: 'Vui lòng nhập tài khoản' }]}
                                        className="mb-5"
                                    >
                                        <Input
                                            prefix={<UserOutlined className="text-slate-400 mr-1" />}
                                            placeholder="Nhập tên đăng nhập"
                                            className="!rounded-xl"
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        label={<span className="text-slate-600 font-semibold text-sm">Mật khẩu</span>}
                                        name="password"
                                        rules={[{ required: true, whitespace: true, message: 'Vui lòng nhập mật khẩu' }]}
                                        className="mb-7"
                                    >
                                        <Input.Password
                                            prefix={<LockOutlined className="text-slate-400 mr-1" />}
                                            placeholder="Nhập mật khẩu"
                                            className="!rounded-xl"
                                        />
                                    </Form.Item>

                                    <Form.Item className="mb-5">
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            block
                                            loading={loading}
                                            className="!h-[50px] !rounded-xl !text-base !font-semibold !border-none"
                                            style={{
                                                background: loading ? undefined : 'linear-gradient(135deg, #4F46E5, #6366F1)',
                                                boxShadow: '0 8px 20px -4px rgba(79,70,229,0.45)',
                                            }}
                                        >
                                            Đăng nhập
                                        </Button>
                                    </Form.Item>

                                    <div className="text-center">
                                        <button
                                            type="button"
                                            onClick={() => setIsForgotPasswordOpen(true)}
                                            className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold underline underline-offset-4 transition-colors duration-150 cursor-pointer"
                                        >
                                            Quên mật khẩu?
                                        </button>
                                    </div>
                                </Form>
                            </motion.div>
                        </motion.div>

                        <p className="text-center text-slate-400 text-xs mt-12">
                            © 2026 HRMS Platform · Bảo mật được chứng nhận
                        </p>
                    </div>
                </motion.div>
            </div>

            <ForgotPasswordModal
                open={isForgotPasswordOpen}
                onCancel={() => setIsForgotPasswordOpen(false)}
            />
        </ConfigProvider>
    );
};

export default LoginPage;
