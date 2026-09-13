
import React, { useState } from 'react';
import { Player } from '../types';
import { Activity, ShieldAlert, DollarSign, UserCheck, Search } from 'lucide-react';

interface Props {
  players: Player[];
  onSelectPlayer: (player: Player) => void;
  onUpdateTransferListing: (playerId: string, isTransfer: boolean, isLoan: boolean, price?: number) => void;
}

export const SquadView: React.FC<Props> = ({ players, onSelectPlayer }) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filtered = players.filter((p) => {
    if (filterType !== 'ALL' && p.squad_type !== filterType) return false;
    if (searchTerm && !((p.name || p.common_name || p.last_name || "").toLowerCase().includes(searchTerm.toLowerCase()))) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Control Bar */}
      <div className="glass-panel" style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['ALL', 'FIRST_TEAM', 'RESERVES', 'YOUTH_U19'].map((type) => (
            <button
              key={type}
              className={`btn btn-sm ${filterType === type ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilterType(type)}
            >
              {type === 'ALL' ? 'Tất Cả' : type === 'FIRST_TEAM' ? 'Đội 1 (First Team)' : type === 'RESERVES' ? 'Dự Bị (Reserves)' : 'Học Viện U19'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <Search size={16} color="#94a3b8" />
          <input
            type="text"
            placeholder="Tìm cầu thủ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: '0.88rem' }}
          />
        </div>
      </div>

      {/* Squad Table */}
      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>Số</th>
              <th>Cầu Thủ</th>
              <th>Vị Trí</th>
              <th>Tuổi</th>
              <th>Điểm OVR</th>
              <th>Tiềm Năng</th>
              <th>Thể Lực</th>
              <th>Trạng Thái</th>
              <th>Định Giá Thị Trường</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((player) => {
              const condition = player.status?.condition ?? 90;
              const ovr = player.reputation || 7000;
              const ovrStars = Math.round(ovr / 1000);

              return (
                <tr key={player.id}>
                  <td>
                    <strong style={{ color: '#06d6a0', fontFamily: 'Outfit' }}>
                      #{player.squad_number || '-'}
                    </strong>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px'
                      }}>
                        ⚽
                      </div>
                      <div>
                        <strong style={{ display: 'block', color: '#f8fafc' }}>{player.name}</strong>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{typeof player.nationality === 'object' ? (player.nationality as any)?.name || 'International' : (player.nationality || 'International')}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-green">
                      {player.position?.code || 'ST'}
                    </span>
                  </td>
                  <td>{player.age}</td>
                  <td>
                    <strong style={{ color: '#f59e0b', fontSize: '1rem', fontFamily: 'Outfit' }}>
                      {ovr}
                    </strong>
                  </td>
                  <td>
                    <strong style={{ color: '#10b981', fontFamily: 'Outfit' }}>
                      {player.potential}
                    </strong>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '70px',
                        height: '6px',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '3px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${condition}%`,
                          height: '100%',
                          background: condition > 75 ? '#10b981' : condition > 50 ? '#f59e0b' : '#ef4444'
                        }} />
                      </div>
                      <span style={{ fontSize: '0.78rem' }}>{condition}%</span>
                    </div>
                  </td>
                  <td>
                    {player.status?.is_injured ? (
                      <span className="badge badge-red">Chấn Thương 🚑</span>
                    ) : player.status?.is_suspended ? (
                      <span className="badge badge-red">Treo Giò 🟥</span>
                    ) : player.status?.is_transfer_listed ? (
                      <span className="badge badge-gold">Rao Bán 🏷️</span>
                    ) : (
                      <span className="badge badge-green">Sẵn Sàng</span>
                    )}
                  </td>
                  <td>
                    <strong style={{ color: '#10b981' }}>
                      {Number(player.market_value || 0).toLocaleString()} CASH
                    </strong>
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => onSelectPlayer(player)}
                    >
                      Chi Tiết
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
