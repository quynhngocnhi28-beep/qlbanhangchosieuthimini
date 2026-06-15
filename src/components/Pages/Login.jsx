import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { RotateCw, Check, Eye, EyeOff } from 'lucide-react';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [showFpPass, setShowFpPass] = useState(false);
    const [showFpConfirm, setShowFpConfirm] = useState(false);
    const [remember, setRemember] = useState(false);
    const [error, setError] = useState('');
    const [forgotMode, setForgotMode] = useState(false);

    const [fpUser, setFpUser] = useState('');
    const [fpNew, setFpNew] = useState('');
    const [fpConfirm, setFpConfirm] = useState('');
    const [fpError, setFpError] = useState('');
    const [fpSuccess, setFpSuccess] = useState('');

    useEffect(() => {
        const savedUser = localStorage.getItem('rememberedUser');
        if (savedUser) {
            setUsername(savedUser);
            setRemember(true);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const trimmedUser = username.trim();
        const trimmedPass = password.trim();

        if (!trimmedUser || !trimmedPass) {
            setError('Vui lòng nhập tên đăng nhập và mật khẩu');
            return;
        }

        if (remember) {
            localStorage.setItem('rememberedUser', trimmedUser);
        } else {
            localStorage.removeItem('rememberedUser');
        }

        try {
            const response = await fetch('/account.json');
            const accounts = await response.json();
            const matchedAccount = accounts.find(acc =>
                acc.user.toLowerCase() === trimmedUser.toLowerCase() &&
                acc.pass === trimmedPass
            );

            if (matchedAccount) {
                const publicInfo = { ...matchedAccount };
                delete publicInfo.pass;
                localStorage.setItem('currentUser', JSON.stringify(publicInfo));
                window.dispatchEvent(new Event('userUpdated'));
                navigate(matchedAccount.role === 'staff' ? '/admin' : '/');
            } else {
                setError('Sai tài khoản hoặc mật khẩu');
            }
        } catch (err) {
            console.error(err);
            setError('Đã xảy ra lỗi, vui lòng thử lại sau');
        }
    };

    const handleForgotSubmit = (e) => {
        e.preventDefault();
        setFpError('');
        setFpSuccess('');
        if (!fpUser || !fpNew || !fpConfirm) {
            setFpError('Vui lòng điền đầy đủ thông tin');
            return;
        }
        if (fpNew !== fpConfirm) {
            setFpError('Mật khẩu xác nhận không khớp');
            return;
        }
        setFpSuccess('Yêu cầu đã được gửi! Vui lòng kiểm tra email.');
        setTimeout(() => setForgotMode(false), 2000);
    };

    return (
        <div className="login-page">
            <div className="login-card">
                {forgotMode ? (
                    <>
                        <h2 className="login-title">QUÊN MẬT KHẨU</h2>
                        <form className="login-form" onSubmit={handleForgotSubmit}>
                            <input type="text" className="form-input" placeholder="Email đăng nhập" value={fpUser} onChange={(e) => setFpUser(e.target.value)} />
                            <div className="password-wrapper">
                                <input
                                    type={showFpPass ? "text" : "password"}
                                    className="form-input"
                                    placeholder="Mật khẩu mới"
                                    value={fpNew}
                                    onChange={(e) => setFpNew(e.target.value)}
                                    autoComplete="new-password"
                                />
                                <span className="password-toggle" onClick={() => setShowFpPass(!showFpPass)}>
                                    {showFpPass ? <Eye size={20} /> : <EyeOff size={20} />}
                                </span>
                            </div>
                            <div className="password-wrapper">
                                <input
                                    type={showFpConfirm ? "text" : "password"}
                                    className="form-input"
                                    placeholder="Xác nhận mật khẩu mới"
                                    value={fpConfirm}
                                    onChange={(e) => setFpConfirm(e.target.value)}
                                    autoComplete="new-password"
                                />
                                <span className="password-toggle" onClick={() => setShowFpConfirm(!showFpConfirm)}>
                                    {showFpConfirm ? <Eye size={20} /> : <EyeOff size={20} />}
                                </span>
                            </div>
                            {fpError && <div className="login-error">{fpError}</div>}
                            {fpSuccess && <div className="login-success">{fpSuccess}</div>}
                            <div className="btn-row-forgot">
                                <button type="submit" className="forgot-btn btn-execute"><Check size={20} strokeWidth={3} /> Thực hiện</button>
                                <button type="button" className="forgot-btn btn-reset" onClick={() => { setFpUser(''); setFpNew(''); setFpConfirm(''); }}><RotateCw size={20} /> Làm lại</button>
                            </div>
                        </form>
                        <div className="forgot-footer"><span className="back-to-login" onClick={() => setForgotMode(false)}><button>← Quay lại đăng nhập</button></span></div>
                    </>
                ) : (
                    <>
                        <h2 className="login-title">ĐĂNG NHẬP</h2>
                        <form className="login-form" onSubmit={handleSubmit}>
                            <input type="text" className="form-input" placeholder="Tên đăng nhập / Email" value={username} onChange={(e) => setUsername(e.target.value)} />
                            <div className="password-wrapper">
                                <input type={showPass ? "text" : "password"} className="form-input" placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
                                <span className="password-toggle" onClick={() => setShowPass(!showPass)}>
                                    {showPass ? <Eye size={20} /> : <EyeOff size={20} />}
                                </span>
                            </div>
                            <div className="forgot-row">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Nhớ mật khẩu
                                </label>
                                <span className="forgot-link" onClick={() => setForgotMode(true)}>Quên mật khẩu?</span>
                            </div>
                            {error && <div className="login-error">{error}</div>}
                            <button type="submit" className="login-button main-btn">ĐĂNG NHẬP</button>
                        </form>
                        <div className="login-divider"><span>Hoặc đăng nhập với</span></div>
                        <div className="social-login">
                            <button className="social-btn">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2" className="social-icon">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                                FACEBOOK
                            </button>

                            <button className="social-btn">
                                <svg width="18" height="18" viewBox="0 0 48 48" className="social-icon">
                                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                                </svg>
                                GOOGLE
                            </button>
                        </div>

                        <div className="login-footer" style={{ textAlign: 'center' }}>
                            <span>Chưa có tài khoản? </span>
                            <Link to="/signup" className="signup-link">Đăng ký ngay</Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
export default Login;