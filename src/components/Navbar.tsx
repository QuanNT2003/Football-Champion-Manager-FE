import React from 'react';
import { Club, TimelineData, User } from '../types';
import { Trophy, Calendar, Coins, DollarSign, UserCheck, Shield, Radio, Clock } from 'lucide-react';

interface Props {
  club: Club | null;
  timeline: TimelineData | null;
  user: User | null;
  onOpenLogin: () => void;
}

export const Navbar: React.FC<Props> = ({
  club,
  timeline,
  user,
  onOpenLogin,
}) => {
  const cash = club?.financial_accounts?.[0]?.cash_balance ?? club?.finances?.cash ?? 5000000;
  const gold = club?.financial_accounts?.[0]?.gold_balance ?? club?.finances?.gold ?? 250;
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
        <div className="stat-pill" style={{ border: '1px solid rgba(6, 214, 160, 0.3)', background: 'rgba(6, 214, 160, 0.08)' }}>
          <span style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#06d6a0',
            boxShadow: '0 0 10px #06d6a0',
            display: 'inline-block'
          }} />
          <div>
            <span style={{ color: '#94a3b8', fontSize: '0.68rem', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>MÁY CHỦ REAL-TIME</span>
            <strong style={{ color: '#06d6a0', fontSize: '0.88rem' }}>
              Online (Đồng bộ)
            </strong>
          </div>
        </div>

        {/* Season & Matchday Progress */}
        <div className="stat-pill">
          <Calendar size={16} color="#3b82f6" />
          <div>
            <span style={{ color: '#94a3b8', fontSize: '0.68rem', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>TIẾN ĐỘ MÙA GIẢI</span>
            <strong style={{ color: '#f8fafc', fontSize: '0.88rem' }}>
              Vòng {currentDay} / {totalDays}
            </strong>
          </div>
        </div>

        {/* Club Finances */}
        {club && (
          <>
            <div className="stat-pill cash">
              <DollarSign size={16} color="#10b981" />
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.68rem', display: 'block', textTransform: 'uppercase' }}>TIỀN MẶT CLB</span>
                <strong style={{ color: '#10b981' }}>€{Number(cash).toLocaleString()}</strong>
              </div>
            </div>

            <div className="stat-pill gold">
              <Coins size={16} color="#f59e0b" />
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.68rem', display: 'block', textTransform: 'uppercase' }}>VÀNG BULLION</span>
                <strong style={{ color: '#f59e0b' }}>{Number(gold).toLocaleString()} GOLD</strong>
              </div>
            </div>
          </>
        )}

        {/* User / Login Button */}
        {user ? (
          <div className="stat-pill" style={{ cursor: 'pointer' }} onClick={onOpenLogin}>
            <UserCheck size={16} color="#06d6a0" />
            <span style={{ fontWeight: 600 }}>{user.username}</span>
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
