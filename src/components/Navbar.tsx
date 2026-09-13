import React from 'react';
import { Club, TimelineData, User } from '../types';
import { Trophy, Calendar, Coins, DollarSign, UserCheck, Shield, LogOut } from 'lucide-react';

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
    <header className="top-header">
      <div className="brand-area">
        <div className="brand-logo">⚽</div>
        <div className="brand-text">
          <h1>Football Champion Manager</h1>
          <div className="brand-badge">
            <Trophy size={12} />
            <span>MÙA {timeline?.season?.season_number || 1} - ONLINE MULTIPLAYER SERVER</span>
          </div>
        </div>
      </div>

      <div className="header-stats">
        {/* Real-time Server Live Indicator */}
        <div className="stat-pill" style={{ border: '1px solid rgba(2, 132, 199, 0.3)', background: 'rgba(2, 132, 199, 0.06)' }}>
          <span style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#0284c7',
            boxShadow: '0 0 10px #0284c7',
            display: 'inline-block'
          }} />
          <div>
            <span style={{ color: '#64748b', fontSize: '0.68rem', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>MÁY CHỦ REAL-TIME</span>
            <strong style={{ color: '#0284c7', fontSize: '0.88rem' }}>
              Online (Đồng bộ)
            </strong>
          </div>
        </div>

        {/* Season & Matchday Progress */}
        <div className="stat-pill">
          <Calendar size={16} color="#0284c7" />
          <div>
            <span style={{ color: '#64748b', fontSize: '0.68rem', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>TIẾN ĐỘ MÙA GIẢI</span>
            <strong style={{ color: '#0f172a', fontSize: '0.88rem' }}>
              Vòng {currentDay} / {totalDays}
            </strong>
          </div>
        </div>

        {/* Club Finances */}
        {club && (
          <>
            <div className="stat-pill cash">
              <DollarSign size={16} color="#059669" />
              <div>
                <span style={{ color: '#64748b', fontSize: '0.68rem', display: 'block', textTransform: 'uppercase' }}>TIỀN MẶT CLB</span>
                <strong style={{ color: '#059669' }}>€{Number(cash).toLocaleString()}</strong>
              </div>
            </div>

            <div className="stat-pill gold">
              <Coins size={16} color="#d97706" />
              <div>
                <span style={{ color: '#64748b', fontSize: '0.68rem', display: 'block', textTransform: 'uppercase' }}>VÀNG BULLION</span>
                <strong style={{ color: '#d97706' }}>{Number(gold).toLocaleString()} GOLD</strong>
              </div>
            </div>
          </>
        )}

        {/* User / Logout */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="stat-pill" style={{ borderColor: '#bae6fd', background: '#f0f9ff' }}>
              <UserCheck size={16} color="#0284c7" />
              <span style={{ fontWeight: 600, color: '#0369a1' }}>{user.username}</span>
            </div>
            {onLogout && (
              <button
                className="btn btn-secondary"
                style={{
                  borderColor: '#fecaca',
                  color: '#dc2626',
                  background: '#fef2f2',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.82rem'
                }}
                onClick={onLogout}
                title="Đăng xuất khỏi tài khoản HLV"
              >
                <LogOut size={15} />
                <span>Đăng Xuất</span>
              </button>
            )}
          </div>
        ) : (
          <button className="btn btn-secondary" onClick={onOpenLogin}>
            <Shield size={16} />
            <span>Đăng Nhập HLV</span>
          </button>
        )}
      </div>
    </header>
  );
};
