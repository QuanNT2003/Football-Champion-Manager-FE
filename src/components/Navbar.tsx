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
        <div className="stat-pill server">
          <span style={{
            width: 9,
            height: 9,
            borderRadius: '50%',
            background: '#10b981',
            boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)',
            display: 'inline-block'
          }} />
          <div>
            <span style={{ color: '#64748b', fontSize: '0.65rem', display: 'block', textTransform: 'uppercase', fontWeight: 800, fontFamily: 'var(--font-game)' }}>MÁY CHỦ REAL-TIME</span>
            <strong style={{ color: '#0284c7', fontSize: '0.88rem', fontFamily: 'var(--font-game)' }}>
              LIVE (ĐỒNG BỘ)
            </strong>
          </div>
        </div>

        {/* Season & Matchday Progress */}
        <div className="stat-pill">
          <Calendar size={16} color="#0284c7" />
          <div>
            <span style={{ color: '#64748b', fontSize: '0.65rem', display: 'block', textTransform: 'uppercase', fontWeight: 800, fontFamily: 'var(--font-game)' }}>VÒNG ĐẤU MÙA GIẢI</span>
            <strong style={{ color: '#0f172a', fontSize: '0.88rem', fontFamily: 'var(--font-game)' }}>
              VÒNG {currentDay} / {totalDays}
            </strong>
          </div>
        </div>

        {/* Club Finances */}
        {club && (
          <>
            <div className="stat-pill cash">
              <DollarSign size={16} color="#059669" />
              <div>
                <span style={{ color: '#64748b', fontSize: '0.65rem', display: 'block', textTransform: 'uppercase', fontWeight: 800, fontFamily: 'var(--font-game)' }}>TIỀN MẶT CLB</span>
                <strong>€{Number(cash).toLocaleString()}</strong>
              </div>
            </div>

            <div className="stat-pill gold">
              <Coins size={16} color="#d97706" />
              <div>
                <span style={{ color: '#64748b', fontSize: '0.65rem', display: 'block', textTransform: 'uppercase', fontWeight: 800, fontFamily: 'var(--font-game)' }}>VÀNG BULLION</span>
                <strong>{Number(gold).toLocaleString()} GOLD</strong>
              </div>
            </div>
          </>
        )}

        {/* User / Logout */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="stat-pill" style={{ borderColor: '#bae6fd', background: '#f0f9ff' }}>
              <UserCheck size={16} color="#0284c7" />
              <span style={{ fontWeight: 700, color: '#0369a1', fontFamily: 'var(--font-game)' }}>{user.username}</span>
            </div>
            {onLogout && (
              <button
                className="btn btn-secondary btn-sm"
                style={{
                  color: '#dc2626',
                  borderColor: '#fecaca',
                  background: '#fef2f2'
                }}
                onClick={onLogout}
                title="Đăng xuất khỏi tài khoản HLV"
              >
                <LogOut size={14} />
                <span>Thoát</span>
              </button>
            )}
          </div>
        ) : (
          <button className="btn btn-primary btn-sm" onClick={onOpenLogin}>
            <Shield size={16} />
            <span>Đăng Nhập HLV</span>
          </button>
        )}
      </div>
    </header>
  );
};
