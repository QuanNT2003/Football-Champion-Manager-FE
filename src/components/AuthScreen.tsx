import { useTranslation } from '../i18n';
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../services/auth.service';
import { Shield, Lock, User, Mail, LogIn, UserPlus, AlertCircle, Sparkles, Trophy, Globe, Flame } from 'lucide-react';

interface Props {
  onAuthSuccess: () => void;
  defaultMode?: 'login' | 'register';
}

export const AuthScreen: React.FC<Props> = ({ onAuthSuccess, defaultMode = 'login' }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [mode, setMode] = useState<'login' | 'register'>(
    location.pathname.includes('register') ? 'register' : defaultMode
  );
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (location.pathname.includes('register')) {
      setMode('register');
    } else if (location.pathname.includes('login')) {
      setMode('login');
    }
  }, [location.pathname]);

  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setError(null);
    navigate(newMode === 'login' ? '/login' : '/register');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'login') {
      if (!username.trim() || !password) {
        setError(t('auth.error_required_login', 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu'));
        return;
      }
      setLoading(true);
      try {
        await authApi.login(username.trim(), password);
        onAuthSuccess();
      } catch (err: any) {
        setError(err?.response?.data?.message || t('auth.error_invalid_credentials', 'Tài khoản hoặc mật khẩu không chính xác'));
      } finally {
        setLoading(false);
      }
    } else {
      if (!username.trim() || !email.trim() || !password) {
        setError(t('auth.error_required_register', 'Vui lòng điền đầy đủ các thông tin bắt buộc'));
        return;
      }
      if (password !== confirmPassword) {
        setError(t('auth.error_password_mismatch', 'Mật khẩu xác nhận không khớp'));
        return;
      }
      if (password.length < 6) {
        setError(t('auth.error_password_length', 'Mật khẩu phải có ít nhất 6 ký tự'));
        return;
      }
      setLoading(true);
      try {
        await authApi.register(username.trim(), email.trim(), password);
        onAuthSuccess();
      } catch (err: any) {
        setError(err?.response?.data?.message || t('auth.error_register_failed', 'Đăng ký tài khoản thất bại. Tên đăng nhập hoặc email có thể đã tồn tại.'));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDemoAccount = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    switchMode('register');
    setUsername(`coach_${randomSuffix}`);
    setEmail(`coach_${randomSuffix}@football.com`);
    setPassword('Pass1234!');
    setConfirmPassword('Pass1234!');
    setError(null);
  };

  return (
    <div className="auth-arena-page">
      {/* Background ambient lighting */}
      <div className="stadium-spotlight left" />
      <div className="stadium-spotlight right" />
      <div className="hud-grid-overlay" />

      <div className="auth-card-hud">
        {/* Header with Esports Badge */}
        <div className="auth-header">
          <div className="auth-badge-hexagon">
            <div className="hexagon-inner">
              <span className="auth-logo-icon">⚽</span>
            </div>
          </div>
          <div className="auth-title-tag">
            <Flame size={14} className="text-amber animate-pulse" />
            <span>ONLINE MULTIPLAYER MANAGER</span>
          </div>
          <h1 className="auth-title">FOOTBALL CHAMPION</h1>
          <p className="auth-subtitle">
            {t('auth.tagline', 'Hệ thống Quản lý Bóng đá Thực chiến • Tranh hùng 112 Quốc gia & Cúp Châu Lục')}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="auth-tabs-hud">
          <button
            type="button"
            className={`auth-tab-btn ${mode === 'login' ? 'active' : ''}`}
            onClick={() => switchMode('login')}
          >
            <LogIn size={18} />
            <span>{t('auth.login_tab', 'ĐĂNG NHẬP HLV')}</span>
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${mode === 'register' ? 'active' : ''}`}
            onClick={() => switchMode('register')}
          >
            <UserPlus size={18} />
            <span>{t('auth.register_tab', 'ĐĂNG KÝ BẰNG HLV')}</span>
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="auth-alert-hud">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form-hud">
          <div className="form-group-hud">
            <label>{mode === 'login' ? t('auth.username_or_email_label', 'TÊN ĐĂNG NHẬP HOẶC EMAIL') : t('auth.username_label', 'TÊN ĐĂNG NHẬP')}</label>
            <div className="input-hud-wrap">
              <User size={18} className="input-icon" />
              <input
                type="text"
                placeholder={mode === 'login' ? t('auth.username_login_placeholder', 'Nhập username hoặc email...') : t('auth.username_register_placeholder', 'Chọn tên HLV (ví dụ: coach_alex)')}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                required
              />
              <div className="hud-corner-accent" />
            </div>
          </div>

          {mode === 'register' && (
            <div className="form-group-hud">
              <label>{t('auth.email_label', 'ĐỊA CHỈ EMAIL LIÊN HỆ')}</label>
              <div className="input-hud-wrap">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <div className="hud-corner-accent" />
              </div>
            </div>
          )}

          <div className="form-group-hud">
            <label>{t('auth.password_label', 'MẬT KHẨU TÀI KHOẢN')}</label>
            <div className="input-hud-wrap">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                placeholder={t('auth.password_placeholder', 'Nhập mật khẩu bảo mật...')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="hud-corner-accent" />
            </div>
          </div>

          {mode === 'register' && (
            <div className="form-group-hud">
              <label>{t('auth.confirm_password_label', 'XÁC NHẬN MẬT KHẨU')}</label>
              <div className="input-hud-wrap">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  placeholder={t('auth.confirm_password_placeholder', 'Nhập lại mật khẩu...')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <div className="hud-corner-accent" />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn-auth-submit-hud"
            disabled={loading}
          >
            {loading ? (
              <span className="btn-spinner">{t('auth.verifying', 'Đang xác thực thông tin...')}</span>
            ) : mode === 'login' ? (
              <>
                <LogIn size={20} />
                <span>{t('auth.login_button', 'VÀO PHÒNG ĐIỀU HÀNH CHIẾN THUẬT')}</span>
              </>
            ) : (
              <>
                <UserPlus size={20} />
                <span>{t('auth.register_button', 'HOÀN TẤT NHẬN CHỨNG CHỈ HLV')}</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Helper */}
        <div className="auth-footer-hud">
          <button
            type="button"
            className="btn-demo-hud"
            onClick={handleDemoAccount}
          >
            <Sparkles size={16} className="text-amber" />
            <span>{t('auth.random_profile_btn', 'Tạo nhanh hồ sơ HLV ngẫu nhiên (Thử nghiệm ngay)')}</span>
          </button>

          <div className="server-telemetry-row">
            <div className="telemetry-item">
              <Globe size={14} className="text-cyan" />
              <span>{t('auth.server_season_badge', 'Máy chủ Mùa 1 Toàn Cầu')}</span>
            </div>
            <div className="telemetry-item">
              <Trophy size={14} className="text-amber" />
              <span>{t('auth.engine_badge', 'Real-time Engine 90 Phút')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
