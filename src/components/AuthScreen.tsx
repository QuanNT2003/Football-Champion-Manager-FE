import React, { useState } from 'react';
import { authApi } from '../services/auth.service';
import { Shield, Lock, User, Mail, LogIn, UserPlus, AlertCircle, Sparkles } from 'lucide-react';

interface Props {
  onAuthSuccess: () => void;
}

export const AuthScreen: React.FC<Props> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'login') {
      if (!username.trim() || !password) {
        setError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu');
        return;
      }
      setLoading(true);
      try {
        await authApi.login(username.trim(), password);
        onAuthSuccess();
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Tài khoản hoặc mật khẩu không chính xác');
      } finally {
        setLoading(false);
      }
    } else {
      if (!username.trim() || !email.trim() || !password) {
        setError('Vui lòng điền đầy đủ các thông tin bắt buộc');
        return;
      }
      if (password !== confirmPassword) {
        setError('Mật khẩu xác nhận không khớp');
        return;
      }
      if (password.length < 6) {
        setError('Mật khẩu phải có ít nhất 6 ký tự');
        return;
      }
      setLoading(true);
      try {
        await authApi.register(username.trim(), email.trim(), password);
        onAuthSuccess();
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Đăng ký tài khoản thất bại. Tên đăng nhập hoặc email có thể đã tồn tại.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDemoAccount = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setMode('register');
    setUsername(`coach_${randomSuffix}`);
    setEmail(`coach_${randomSuffix}@football.com`);
    setPassword('Pass1234!');
    setConfirmPassword('Pass1234!');
    setError(null);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Header & Logo */}
        <div className="auth-header">
          <div className="auth-logo-badge">
            <span className="auth-logo-icon">⚽</span>
          </div>
          <h1 className="auth-title">Football Champion Manager</h1>
          <p className="auth-subtitle">
            Hệ thống Quản lý Bóng đá Trực tuyến Chuyên nghiệp & Cạnh tranh Toàn cầu
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab-btn ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setError(null); }}
          >
            <LogIn size={18} />
            <span>Đăng Nhập</span>
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${mode === 'register' ? 'active' : ''}`}
            onClick={() => { setMode('register'); setError(null); }}
          >
            <UserPlus size={18} />
            <span>Đăng Ký HLV</span>
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="auth-alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Tên đăng nhập {mode === 'login' ? 'hoặc Email' : ''}</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input
                type="text"
                placeholder={mode === 'login' ? 'Nhập username hoặc email...' : 'Chọn tên HLV (ví dụ: coach_alex)'}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                required
              />
            </div>
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label>Địa chỉ Email</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Mật khẩu</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                placeholder="Nhập mật khẩu bí mật..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label>Xác nhận mật khẩu</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  placeholder="Nhập lại mật khẩu..."
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="btn-spinner">Đang xử lý...</span>
            ) : mode === 'login' ? (
              <>
                <LogIn size={20} />
                <span>Vào Trung Tâm Quản Lý</span>
              </>
            ) : (
              <>
                <UserPlus size={20} />
                <span>Hoàn Tất Đăng Ký HLV</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Helper */}
        <div className="auth-footer">
          <button
            type="button"
            className="auth-demo-btn"
            onClick={handleDemoAccount}
          >
            <Sparkles size={16} />
            <span>Tạo nhanh thông tin HLV ngẫu nhiên để thử nghiệm</span>
          </button>
          <div className="auth-note">
            <Shield size={14} />
            <span>Phiên bản Online Máy Chủ Mùa 1 • Dữ liệu đồng bộ theo thời gian thực</span>
          </div>
        </div>
      </div>
    </div>
  );
};
