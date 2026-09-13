import React, { useState, useEffect } from 'react';
import { Club, Formation, FormationPosition, Player } from '../types';
import { tacticsApi } from '../services/tactics.service';
import { Sliders, Save, Shield, Compass, FastForward, Activity, CheckCircle2 } from 'lucide-react';

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
      setSavedSuccess('Tactics and squad formation saved successfully!');
      setTimeout(() => setSavedSuccess(''), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save tactics');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
      {/* 2D Football Pitch */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.25rem' }}>
              Sân Đấu Chiến Thuật & Đội Hình Ra Sân (Starting XI)
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
              Sơ đồ: <strong style={{ color: 'var(--neon-green)' }}>{currentFormation?.name || '4-3-3 Attack'}</strong> ({currentFormation?.code || '4-3-3'})
            </p>
          </div>
          <span className="badge badge-green">LIVE LINEUP</span>
        </div>

        {savedSuccess && (
          <div className="alert alert-success mb-4 flex-center" style={{ width: '100%', justifyContent: 'flex-start', gap: '0.5rem' }}>
            <CheckCircle2 size={18} />
            {savedSuccess}
          </div>
        )}

        {/* Pitch Graphic */}
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
              >
                <div className={`token-circle ${isGK ? 'gk' : ''}`}>
                  {assignedPlayer?.squad_number || idx + 1}
                </div>
                <div className="token-label">
                  {assignedPlayer ? (assignedPlayer.common_name || `${assignedPlayer.first_name?.[0] || ''}. ${assignedPlayer.last_name}`) : pos.slot_code}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tactical Sliders and Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.1rem', marginBottom: '16px' }}>
            Chọn Sơ Đồ Đội Hình
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
          <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.1rem' }}>
            Chỉ Đạo Lối Chơi
          </h3>

          <div>
            <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>
              Tư Duy Chiến Thuật (Mentality)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {['DEFENSIVE', 'BALANCED', 'ATTACKING'].map((m) => (
                <button
                  key={m}
                  className={`btn btn-sm ${mentality === m ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setMentality(m)}
                  style={{ fontSize: '0.78rem', padding: '6px 4px' }}
                >
                  {m === 'DEFENSIVE' ? 'Phòng Ngự' : m === 'BALANCED' ? 'Cân Bằng' : 'Tấn Công'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
              <span style={{ color: '#94a3b8' }}>Nhịp Độ Trận Đấu (Tempo)</span>
              <strong style={{ color: '#38bdf8' }}>{tempo} / 100</strong>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={tempo}
              onChange={(e) => setTempo(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
              <span style={{ color: '#94a3b8' }}>Cường Độ Áp Sát (Pressing)</span>
              <strong style={{ color: '#f59e0b' }}>{pressing} / 100</strong>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={pressing}
              onChange={(e) => setPressing(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
              <span style={{ color: '#94a3b8' }}>Hàng Phòng Ngự (Defensive Line)</span>
              <strong style={{ color: '#10b981' }}>{defensiveLine} / 100</strong>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={defensiveLine}
              onChange={(e) => setDefensiveLine(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <button
            className="btn btn-primary"
            style={{ marginTop: '10px', width: '100%' }}
            onClick={handleSave}
            disabled={saving}
          >
            <Save size={16} />
            {saving ? 'Đang Lưu...' : 'Lưu Chiến Thuật'}
          </button>
        </div>
      </div>
    </div>
  );
};
