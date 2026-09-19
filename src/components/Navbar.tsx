import React from 'react';
import { Link } from 'react-router-dom';
import { Club, TimelineData, User } from '../types';
import { Trophy, Calendar, Coins, DollarSign, UserCheck, Shield, LogOut, Radio } from 'lucide-react';

interface Props {
  club: Club | null;
  timeline: TimelineData | null;
  user: User | null;
  onOpenLogin: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<Props> = ({
  club,
  timeline,
  user,
  onOpenLogin,
  onLogout,
}) => {
  const cash = club?.financial_accounts?.[0]?.cash_balance ?? club?.finances?.cash ?? 1500000;
  const gold = club?.financial_accounts?.[0]?.gold_balance ?? club?.finances?.gold ?? 200;
  const currentDay = timeline?.season?.current_day || 1;
  const totalDays = timeline?.season?.total_days || 40;

  return (
    <header className="top-header-hud">
      {/* Brand & Season Badge */}
      <Link to="/dashboard" className="brand-area-hud">
        <div className="brand-logo-hud">⚽</div>
        <div className="brand-text-hud">
          <h1>FOOTBALL CHAMPION</h1>
          <div className="brand-badge-hud">
            <Trophy size={12} className="text-amber" />
            <span>MÙA {timeline?.season?.season_number || 1} • MULTIPLAYER MATCH ENGINE</span>
          </div>
        </div>
      </Link>

      {/* Center & Right Telemetry Stats */}
      <div className="header-stats-hud">
        {/* Real-time Server Live Indicator */}
        <div className="stat-pill-hud server-live">
          <div className="radar-ping">
            <Radio size={14} className="radar-icon" />
          </div>
          <div>
            <span className="pill-sub">MÁY CHỦ REAL-TIME</span>
            <strong className="pill-val text-emerald">
              LIVE (ĐỒNG BỘ)
            </strong>
          </div>
        </div>

        {/* Season & Matchday Progress */}
        <div className="stat-pill-hud matchday">
          <Calendar size={16} className="text-cyan" />
          <div>
            <span className="pill-sub">TIẾN ĐỘ MÙA GIẢI</span>
            <strong className="pill-val text-cyan">
              VÒNG {currentDay} / {totalDays}
            </strong>
          </div>
        </div>

        {/* Club Finances */}
        {club && (
          <>
            <div className="stat-pill-hud cash-pill">
              <DollarSign size={16} className="text-emerald" />
              <div>
                <span className="pill-sub">NGÂN SÁCH TIỀN MẶT</span>
                <strong className="pill-val text-emerald">€{Number(cash).toLocaleString()}</strong>
              </div>
            </div>

            <div className="stat-pill-hud gold-pill">
              <Coins size={16} className="text-amber" />
              <div>
                <span className="pill-sub">VÀNG BULLION</span>
                <strong className="pill-val text-amber">{Number(gold).toLocaleString()} GOLD</strong>
              </div>
            </div>
          </>
        )}

        {/* User / Logout */}
        {user ? (
          <div className="user-profile-hud-wrap">
            <div className="user-pill-hud">
              <div className="user-avatar-mini">
                <UserCheck size={16} className="text-cyan" />
              </div>
              <div className="user-text-box">
                <span className="pill-sub">HLV TRƯỞNG</span>
                <span className="user-name-text">{user.username}</span>
              </div>
            </div>
            {onLogout && (
              <button
                className="btn-hud-logout"
                onClick={onLogout}
                title="Đăng xuất khỏi tài khoản HLV"
              >
                <LogOut size={15} />
                <span>Thoát</span>
              </button>
            )}
          </div>
        ) : (
          <button className="btn-hud-login" onClick={onOpenLogin}>
            <Shield size={16} />
            <span>ĐĂNG NHẬP HLV</span>
          </button>
        )}
      </div>
    </header>
  );
};
