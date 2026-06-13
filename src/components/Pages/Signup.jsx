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
                <div className="login-footer">
                    <span>Đã có tài khoản? </span>
                    <Link to="/login" className="signup-link">Đăng nhập ngay</Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;