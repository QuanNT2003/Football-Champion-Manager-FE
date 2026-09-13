import React, { useState, useEffect } from 'react';
import { Club, Match, MatchEvent } from '../types';
import { matchesApi } from '../services/api';
import { Play, CheckCircle2, DollarSign, Users, Award, AlertTriangle, Swords } from 'lucide-react';

interface Props {
  club?: Club | null;
  matches?: Match[];
  onSimulateMatch?: (matchId: string) => Promise<any>;
  onMatchSimulated?: () => void;
}

export const MatchCenterView: React.FC<Props> = ({
  club,
  matches: initialMatches,
  onSimulateMatch,
  onMatchSimulated,
}) => {
  const [matchList, setMatchList] = useState<Match[]>(initialMatches || []);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [simulating, setSimulating] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<any>(null);

  useEffect(() => {
    if (initialMatches && initialMatches.length > 0) {
      setMatchList(initialMatches);
      setSelectedMatch(initialMatches[0]);
    } else {
      loadMatches();
    }
  }, [initialMatches, club?.id]);

  const loadMatches = async () => {
    try {
      const data = await matchesApi.getMatches(1, 20, club?.id);
      const items = data.items || (Array.isArray(data) ? data : []);
      setMatchList(items);
      if (items.length > 0) {
        setSelectedMatch(items[0]);
      }
    } catch (err) {
      console.error('Failed to load matches:', err);
    }
  };

  const handleSimulate = async () => {
    if (!selectedMatch) return;
    setSimulating(true);
    try {
      let res;
      if (onSimulateMatch) {
        res = await onSimulateMatch(selectedMatch.id);
      } else {
        res = await matchesApi.simulateMatch(selectedMatch.id);
      }
      setSimResult(res?.data || res);
      loadMatches();
      if (onMatchSimulated) onMatchSimulated();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to simulate match');
    } finally {
      setSimulating(false);
    }
  };

  const currentMatch = selectedMatch || matchList[0];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px' }}>
      {/* Live Match Pitch & Events */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Scoreboard */}
        <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)', border: '1px solid #bae6fd' }}>
          <div style={{ display: 'inline-block', marginBottom: '12px' }}>
            <span className={`badge ${currentMatch?.status === 'FINISHED' || simResult ? 'badge-green' : 'badge-gold'}`}>
              {currentMatch?.status === 'FINISHED' || simResult ? 'ĐÃ KẾT THÚC' : 'SẮP DIỄN RA (LỊCH THI ĐẤU)'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', margin: '20px 0' }}>
            {/* Home Team */}
            <div style={{ width: '180px' }}>
              <div style={{ fontSize: '48px', marginBottom: '8px' }}>🛡️</div>
              <strong style={{ fontSize: '1.2rem', display: 'block' }}>{currentMatch?.homeClub?.name || 'Đội Nhà'}</strong>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Chủ Nhà</span>
            </div>

            {/* Score */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '3.5rem', fontWeight: 900, fontFamily: 'Outfit', color: '#0284c7', letterSpacing: '4px' }}>
                {simResult?.homeScore ?? currentMatch?.homeScore ?? 0} : {simResult?.awayScore ?? currentMatch?.awayScore ?? 0}
              </div>
              <span style={{ fontSize: '0.85rem', color: '#06d6a0', fontWeight: 600 }}>90 Phút Chính Thức</span>
            </div>

            {/* Away Team */}
            <div style={{ width: '180px' }}>
              <div style={{ fontSize: '48px', marginBottom: '8px' }}>⚔️</div>
              <strong style={{ fontSize: '1.2rem', display: 'block' }}>{currentMatch?.awayClub?.name || 'Đội Khách'}</strong>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Đội Khách</span>
            </div>
          </div>

          {/* Action Button */}
          {currentMatch && currentMatch.status !== 'FINISHED' && !simResult && (
            <button
              className="btn btn-primary"
              style={{ padding: '12px 32px', fontSize: '1.05rem', margin: '0 auto' }}
              onClick={handleSimulate}
              disabled={simulating}
            >
              <Play size={20} fill="#070b12" />
              {simulating ? 'Đang Mô Phỏng Trận Đấu 90 Phút...' : 'Mô Phỏng Trận Đấu (Simulate Match)'}
            </button>
          )}

          {/* Matchday Stats Banner if finished */}
          {(currentMatch?.status === 'FINISHED' || simResult) && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '24px',
              marginTop: '20px',
              padding: '12px',
              background: '#f1f5f9',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={16} color="#38bdf8" />
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Khán giả:</span>
                <strong style={{ fontSize: '0.9rem' }}>
                  {(simResult?.attendance ?? currentMatch?.attendance ?? 48500).toLocaleString()} người
                </strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DollarSign size={16} color="#10b981" />
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Doanh thu bán vé:</span>
                <strong style={{ fontSize: '0.9rem', color: '#10b981' }}>
                  +€{(simResult?.ticketRevenue ?? currentMatch?.ticketRevenue ?? 1940000).toLocaleString()}
                </strong>
              </div>
            </div>
          )}
        </div>

        {/* Live Match Events Ticker */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.1rem', marginBottom: '16px' }}>
            Diễn Biến Trận Đấu (Match Timeline Events)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(simResult?.events || currentMatch?.events || []).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8', fontSize: '0.9rem' }}>
                Chưa có diễn biến nào. Bấm 'Mô Phỏng Trận Đấu' để xem bàn thắng và thẻ phạt trực tiếp!
              </div>
            ) : (
              (simResult?.events || currentMatch?.events || []).map((evt: MatchEvent, idx: number) => {
                const isGoal = evt.eventType === 'GOAL';
                const isCard = evt.eventType === 'CARD' || evt.eventType === 'YELLOW_CARD' || evt.eventType === 'RED_CARD';
                const isSub = evt.eventType === 'SUBSTITUTION';

                return (
                  <div
                    key={evt.id || idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 14px',
                      background: isGoal ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255,255,255,0.02)',
                      borderRadius: '8px',
                      borderLeft: `3px solid ${isGoal ? '#10b981' : isCard ? '#f59e0b' : '#38bdf8'}`
                    }}
                  >
                    <span style={{ fontWeight: 800, color: '#f59e0b', width: '36px' }}>
                      {evt.minute}'
                    </span>
                    <span style={{ fontSize: '1.2rem' }}>
                      {isGoal ? '⚽' : isCard ? '🟨' : isSub ? '🔄' : '🧤'}
                    </span>
                    <div style={{ flex: 1 }}>
                      <strong style={{ color: '#0f172a', fontSize: '0.9rem' }}>
                        {evt.player?.name || 'Cầu thủ'}
                      </strong>
                      <span style={{ color: '#94a3b8', fontSize: '0.85rem', marginLeft: '6px' }}>
                        {evt.metadata?.description || (isGoal ? 'sút tung lưới đối phương!' : 'phạm lỗi')}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Fixtures List */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.1rem' }}>
          Lịch Thi Đấu Mùa Giải
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '520px', overflowY: 'auto' }}>
          {matchList.length === 0 ? (
            <div style={{ color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center', padding: '20px' }}>
              Không có trận đấu nào trong lịch trình.
            </div>
          ) : (
            matchList.map((m) => (
              <div
                key={m.id}
                onClick={() => {
                  setSelectedMatch(m);
                  setSimResult(null);
                }}
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  background: selectedMatch?.id === m.id ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${selectedMatch?.id === m.id ? '#3b82f6' : 'rgba(255,255,255,0.05)'}`,
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '6px' }}>
                  <span>Vòng {m.season_day || 1}</span>
                  <span className={`badge ${m.status === 'FINISHED' ? 'badge-green' : 'badge-gold'}`} style={{ fontSize: '0.65rem' }}>
                    {m.status === 'FINISHED' ? 'KẾT THÚC' : 'SẮP ĐÁ'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600, fontSize: '0.88rem' }}>
                  <span style={{ color: m.homeClub?.id === club?.id ? '#06d6a0' : 'inherit' }}>{m.homeClub?.name}</span>
                  <span style={{ color: '#f59e0b', margin: '0 8px' }}>
                    {m.status === 'FINISHED' ? `${m.homeScore} - ${m.awayScore}` : 'vs'}
                  </span>
                  <span style={{ color: m.awayClub?.id === club?.id ? '#06d6a0' : 'inherit' }}>{m.awayClub?.name}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
