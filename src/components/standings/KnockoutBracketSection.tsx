import React from 'react';
import { KnockoutBracketResponse, KnockoutRound } from '../../types';
import { Swords, Calendar, CheckCircle2 } from 'lucide-react';

interface KnockoutProps {
  knockoutBracket: KnockoutBracketResponse | null;
  selectedRoundName: string;
  setSelectedRoundName: (name: string) => void;
  allKnockoutRounds: KnockoutRound[];
  filteredKnockoutRounds: KnockoutRound[];
  currentClubId: string;
}

export const KnockoutBracketSection: React.FC<KnockoutProps> = ({
  knockoutBracket,
  selectedRoundName,
  setSelectedRoundName,
  allKnockoutRounds,
  filteredKnockoutRounds,
  currentClubId,
}) => {
  if (!knockoutBracket || allKnockoutRounds.length === 0) {
    return (
      <div className="card text-center" style={{ padding: '3.5rem', borderRadius: '16px' }}>
        <Swords size={40} color="#cbd5e1" style={{ marginBottom: '8px', display: 'inline-block' }} />
        <p style={{ margin: 0, fontSize: '0.95rem', color: '#64748b', fontWeight: 600 }}>
          Chưa có nhánh đấu loại trực tiếp (Knockout) nào được bốc thăm cho giải đấu này.
        </p>
      </div>
    );
  }

  const activeRound = filteredKnockoutRounds[0] || allKnockoutRounds[0];

  return (
    <div>
      {/* Round Selection Header & Dropdown */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          background: '#ffffff',
          padding: '10px 14px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Swords size={20} color="#15803d" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            {activeRound?.roundName || 'Vòng Đấu'}
          </h3>
          {activeRound && (
            <span
              style={{
                fontSize: '0.75rem',
                background: '#dcfce7',
                color: '#166534',
                padding: '2px 8px',
                borderRadius: '10px',
                fontWeight: 700,
              }}
            >
              {activeRound.matches.length} Cặp Đấu • Ngày {activeRound.seasonDay}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Chọn Vòng:</span>
          <select
            value={activeRound?.roundName || selectedRoundName}
            onChange={(e) => setSelectedRoundName(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1.5px solid #15803d',
              fontWeight: 700,
              fontSize: '0.84rem',
              color: '#166534',
              backgroundColor: '#f0fdf4',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {allKnockoutRounds.map((rnd) => (
              <option key={rnd.roundOrder} value={rnd.roundName}>
                {rnd.roundName} (Ngày {rnd.seasonDay} - {rnd.matches.length} trận)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Round Filter Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem', overflowX: 'auto', padding: '4px 0' }}>
        {allKnockoutRounds.map((rnd) => {
          const isSelected = (activeRound?.roundName || selectedRoundName) === rnd.roundName;
          return (
            <button
              key={rnd.roundOrder}
              type="button"
              onClick={() => setSelectedRoundName(rnd.roundName)}
              style={{
                padding: '7px 14px',
                borderRadius: '20px',
                fontSize: '0.82rem',
                fontWeight: isSelected ? 800 : 600,
                border: isSelected ? '1.5px solid #15803d' : '1px solid #cbd5e1',
                cursor: 'pointer',
                backgroundColor: isSelected ? '#15803d' : '#ffffff',
                color: isSelected ? '#ffffff' : '#64748b',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: isSelected ? '0 2px 6px rgba(21, 128, 61, 0.25)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{rnd.roundName}</span>
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '1px 5px',
                  borderRadius: '8px',
                  background: isSelected ? 'rgba(255, 255, 255, 0.25)' : '#f1f5f9',
                  color: isSelected ? '#ffffff' : '#64748b',
                  fontWeight: 700,
                }}
              >
                {rnd.matches.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Render Selected Round ONLY */}
      {activeRound && (
        <div key={activeRound.roundOrder} style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
            {activeRound.matches.map((match: any) => {
              const isHomeCurrent = match.homeClub?.id && match.homeClub.id.toString() === currentClubId?.toString();
              const isAwayCurrent = match.awayClub?.id && match.awayClub.id.toString() === currentClubId?.toString();
              const isHomeWinner = match.homeScore != null && match.awayScore != null && Number(match.homeScore) > Number(match.awayScore);
              const isAwayWinner = match.homeScore != null && match.awayScore != null && Number(match.awayScore) > Number(match.homeScore);

              return (
                <div
                  key={match.id}
                  className="card"
                  style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: isHomeCurrent || isAwayCurrent ? '2px solid #15803d' : '1px solid #e2e8f0',
                    background: isHomeCurrent || isAwayCurrent ? '#f0fdf4' : '#ffffff',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  }}
                >
                  {/* Match Meta Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginBottom: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} />
                      <span>Ngày {match.seasonDay || 1}</span>
                    </div>
                    <span style={{ fontWeight: 700, color: match.status === 'COMPLETED' ? '#16a34a' : '#15803d' }}>
                      {match.status === 'COMPLETED' ? 'ĐÃ KẾT THÚC' : 'SẮP DIỄN RA'}
                    </span>
                  </div>

                  {/* Team Home */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 6px', borderRadius: '6px', background: isHomeWinner ? '#f0fdf4' : 'transparent', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: '1rem' }}>⚽</span>
                      <span style={{ fontSize: '0.88rem', fontWeight: isHomeWinner || isHomeCurrent ? 700 : 500, color: isHomeWinner ? '#15803d' : isHomeCurrent ? '#15803d' : '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {match.homeClub?.name || 'Đội Nhà'}
                      </span>
                      {isHomeCurrent && <span style={{ fontSize: '0.65rem', background: '#15803d', color: '#fff', padding: '1px 4px', borderRadius: '4px', fontWeight: 700 }}>BẠN</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {isHomeWinner && <CheckCircle2 size={14} color="#16a34a" />}
                      <span style={{ fontWeight: 800, fontSize: '0.95rem', color: isHomeWinner ? '#16a34a' : '#0f172a', minWidth: '20px', textAlign: 'center' }}>
                        {match.homeScore !== null ? match.homeScore : '-'}
                      </span>
                    </div>
                  </div>

                  {/* Team Away */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 6px', borderRadius: '6px', background: isAwayWinner ? '#f0fdf4' : 'transparent' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: '1rem' }}>⚽</span>
                      <span style={{ fontSize: '0.88rem', fontWeight: isAwayWinner || isAwayCurrent ? 700 : 500, color: isAwayWinner ? '#15803d' : isAwayCurrent ? '#15803d' : '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {match.awayClub?.name || 'Đội Khách'}
                      </span>
                      {isAwayCurrent && <span style={{ fontSize: '0.65rem', background: '#15803d', color: '#fff', padding: '1px 4px', borderRadius: '4px', fontWeight: 700 }}>BẠN</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {isAwayWinner && <CheckCircle2 size={14} color="#16a34a" />}
                      <span style={{ fontWeight: 800, fontSize: '0.95rem', color: isAwayWinner ? '#16a34a' : '#0f172a', minWidth: '20px', textAlign: 'center' }}>
                        {match.awayScore !== null ? match.awayScore : '-'}
                      </span>
                    </div>
                  </div>

                  {match.homePenaltyScore !== null && match.awayPenaltyScore !== null && (
                    <div style={{ textAlign: 'center', fontSize: '0.72rem', color: '#64748b', background: '#f8fafc', padding: '2px 6px', borderRadius: '4px', marginTop: '4px' }}>
                      Penalty: <strong>{match.homePenaltyScore}</strong> - <strong>{match.awayPenaltyScore}</strong>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
