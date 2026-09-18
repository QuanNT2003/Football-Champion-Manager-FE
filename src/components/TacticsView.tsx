import React, { useState, useEffect } from 'react';
import { Club, Formation, FormationPosition, Player } from '../types';
import { tacticsApi } from '../services/tactics.service';
import { Sliders, Save, Compass, CheckCircle2, Zap } from 'lucide-react';

interface Props {
  club: Club | null;
  players: Player[];
  formations?: Formation[];
  onSaveTactics?: (tacticData: any) => void;
}

export const TacticsView: React.FC<Props> = ({
  club,
  players,
  formations: initialFormations,
  onSaveTactics,
}) => {
  const [formations, setFormations] = useState<Formation[]>(initialFormations || []);
  const [selectedFormationId, setSelectedFormationId] = useState<string>('1');
  const [mentality, setMentality] = useState<string>('ATTACKING');
  const [tempo, setTempo] = useState<number>(65);
  const [pressing, setPressing] = useState<number>(70);
  const [defensiveLine, setDefensiveLine] = useState<number>(60);
  const [saving, setSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<string>('');

  useEffect(() => {
    if (!initialFormations || initialFormations.length === 0) {
      loadFormations();
    }
  }, [initialFormations]);

  const loadFormations = async () => {
    try {
      const data = await tacticsApi.getFormations();
      const list = Array.isArray(data) ? data : (data as any)?.items || [];
      if (list.length > 0) {
        setFormations(list);
        setSelectedFormationId(list[0].id);
      }
    } catch (err) {
      console.error('Failed to load formations:', err);
    }
  };

  const currentFormation = formations.find((f) => f.id === selectedFormationId) || formations[0];

  const handleSave = async () => {
    setSaving(true);
    setSavedSuccess('');
    try {
      const tacticPayload = {
        formationId: selectedFormationId,
        mentality,
        tempo,
        pressingIntensity: pressing,
        defensiveLine,
      };
      if (onSaveTactics) {
        await onSaveTactics(tacticPayload);
      } else if (club?.id) {
        await tacticsApi.updateClubTactics(club.id, tacticPayload);
      }
      setSavedSuccess('Đã lưu sơ đồ và chiến thuật thành công!');
      setTimeout(() => setSavedSuccess(''), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể lưu chiến thuật');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: '24px' }}>
      {/* 2D Football Pitch (Lush Turf & Magnetic Pucks) */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.35rem', color: '#0f172a' }}>
              SA BÀN CHIẾN THUẬT & ĐỘI HÌNH RA SÂN (STARTING XI)
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '2px' }}>
              Sơ đồ hiện tại: <strong style={{ color: '#059669', fontFamily: 'var(--font-game)' }}>{currentFormation?.name || '4-3-3 Tấn Công'}</strong> ({currentFormation?.code || '4-3-3'})
            </p>
          </div>
          <span className="badge badge-green" style={{ gap: '6px' }}>
            <Zap size={14} /> LIVE LINEUP
          </span>
        </div>

        {savedSuccess && (
          <div className="alert alert-success mb-4 flex-center" style={{ width: '100%', justifyContent: 'flex-start', gap: '0.5rem' }}>
            <CheckCircle2 size={18} />
            {savedSuccess}
          </div>
        )}

        {/* Pitch Graphic with Striped Lawn & Magnetic Pucks */}
        <div className="pitch-container">
          <div className="pitch-line-half" />
          <div className="pitch-circle" />
          <div className="pitch-penalty-top" />
          <div className="pitch-penalty-bottom" />

          {/* Render Formation Positions */}
          {currentFormation?.formation_positions?.map((pos: FormationPosition, idx: number) => {
            const assignedPlayer = players[idx] || null;
            const xPercent = Number(pos.x) || 50;
            const yPercent = Number(pos.y) || 50;
            const isGK = pos.slot_code === 'GK';

            return (
              <div
                key={pos.id || idx}
                className="player-token"
                style={{ left: `${xPercent}%`, top: `${yPercent}%` }}
                title={assignedPlayer ? `${assignedPlayer.name} (${pos.slot_code})` : pos.slot_code}
              >
                <div className={`token-circle ${isGK ? 'gk' : ''}`}>
                  {assignedPlayer?.squad_number || idx + 1}
                </div>
                <div className="token-label">
                  {assignedPlayer ? (assignedPlayer.common_name || `${assignedPlayer.first_name?.[0] || ''}. ${assignedPlayer.last_name || assignedPlayer.name}`) : pos.slot_code}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tactical Sliders and Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.15rem', marginBottom: '16px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Compass size={18} color="#0284c7" />
            CHỌN SƠ ĐỒ ĐỘI HÌNH
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {formations.map((f) => (
              <button
                key={f.id}
                className={`btn btn-sm ${selectedFormationId === f.id ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSelectedFormationId(f.id)}
              >
                {f.name}
              </button>
            ))}
          </div>
        </div>

        {/* Mentality & Sliders */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.15rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={18} color="#059669" />
            CHỈ ĐẠO LỐI CHƠI
          </h3>

          <div>
            <label style={{ fontSize: '0.85rem', color: '#64748b', display: 'block', marginBottom: '8px', fontWeight: 700, fontFamily: 'var(--font-game)' }}>
              TƯ DUY CHIẾN THUẬT (MENTALITY)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {['DEFENSIVE', 'BALANCED', 'ATTACKING'].map((m) => (
                <button
                  key={m}
                  className={`btn btn-sm ${mentality === m ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setMentality(m)}
                  style={{ fontSize: '0.8rem', padding: '8px 6px' }}
                >
                  {m === 'DEFENSIVE' ? 'Phòng Ngự' : m === 'BALANCED' ? 'Cân Bằng' : 'Tấn Công'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
              <span style={{ color: '#64748b', fontWeight: 700, fontFamily: 'var(--font-game)' }}>NHỊP ĐỘ (TEMPO)</span>
              <strong style={{ color: '#0284c7', fontFamily: 'var(--font-game)', fontSize: '1rem' }}>{tempo} / 100</strong>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={tempo}
              onChange={(e) => setTempo(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#0284c7', cursor: 'pointer' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
              <span style={{ color: '#64748b', fontWeight: 700, fontFamily: 'var(--font-game)' }}>ÁP SÁT (PRESSING)</span>
              <strong style={{ color: '#d97706', fontFamily: 'var(--font-game)', fontSize: '1rem' }}>{pressing} / 100</strong>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={pressing}
              onChange={(e) => setPressing(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#d97706', cursor: 'pointer' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
              <span style={{ color: '#64748b', fontWeight: 700, fontFamily: 'var(--font-game)' }}>HÀNG THỦ (DEFENSIVE LINE)</span>
              <strong style={{ color: '#059669', fontFamily: 'var(--font-game)', fontSize: '1rem' }}>{defensiveLine} / 100</strong>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={defensiveLine}
              onChange={(e) => setDefensiveLine(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#059669', cursor: 'pointer' }}
            />
          </div>

          <button
            className="btn btn-primary"
            style={{ marginTop: '12px', width: '100%', padding: '14px' }}
            onClick={handleSave}
            disabled={saving}
          >
            <Save size={18} />
            <span>{saving ? 'ĐANG LƯU...' : 'LƯU CHIẾN THUẬT'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
