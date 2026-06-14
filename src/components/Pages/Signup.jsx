import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';

const Signup = () => {
    const [username, setUsername] = useState('');
    const [fullName, setFullName] = useState(''); // Thêm state họ tên
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        const trimmedUser = username.trim();
        const trimmedName = fullName.trim(); // Trim họ tên
        const trimmedPass = password.trim();
        const trimmedConfirm = confirm.trim();

        if (!trimmedUser || !trimmedPass || !trimmedName) {
            setError('Vui lòng nhập đủ thông tin');
            return;
        }
        if (trimmedPass !== trimmedConfirm) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }
        if (trimmedPass.length < 3) {
            setError('Mật khẩu tối thiểu 3 ký tự');
            return;
        }

        const accounts = JSON.parse(localStorage.getItem('allAccounts') || '[]');
        const userExists = accounts.find(acc => acc.user.toLowerCase() === trimmedUser.toLowerCase());

        if (userExists) {
            setError('Tên đăng nhập đã tồn tại');
            return;
        }

        const newUser = {
            id: Date.now(),
            user: trimmedUser,
            name: trimmedName, // Thêm trường name vào object
            pass: trimmedPass,
            role: 'customer'
        };

        accounts.push(newUser);
        localStorage.setItem('allAccounts', JSON.stringify(accounts));

        alert('Đăng ký thành công!');
        navigate('/login');
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <h2 className="login-title">ĐĂNG KÝ</h2>
                <form className="login-form" onSubmit={handleSubmit}>
                    <input type="text" className="form-input" placeholder="Họ và tên" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                    <input type="text" className="form-input" placeholder="Tên đăng nhập" value={username} onChange={(e) => setUsername(e.target.value)} />
                    <input type="password" className="form-input" placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <input type="password" className="form-input" placeholder="Xác nhận mật khẩu" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
                    {error && <div className="login-error" style={{ color: 'red', fontSize: '14px', marginBottom: '10px', textAlign: 'center' }}>{error}</div>}
                    <button type="submit" className="login-button main-btn">ĐĂNG KÝ</button>
                </form>
                <div className="login-divider"><span>Hoặc đăng nhập với</span></div>
                <div className="social-login">
                    <button class="social-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2" className="social-icon">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        FACEBOOK
                    </button>

                    <button class="social-btn">
                        <svg width="18" height="18" viewBox="0 0 48 48" className="social-icon">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                        </svg>
                        GOOGLE
                    </button>
                </div>
                <div className="login-footer">
                    <span>Đã có tài khoản? </span>
                    <Link to="/login" className="signup-link">Đăng nhập ngay</Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;