import React, { useState, useEffect, useMemo } from 'react';
import { Club, Formation, FormationPosition, Player } from '../types';
import { tacticsApi } from '../services/tactics.service';
import {
  Sliders,
  Save,
  Compass,
  CheckCircle2,
  Zap,
  ArrowUpDown,
  X,
  UserCheck,
  UserX,
  Shield,
  Sparkles,
  Trophy,
  Loader2,
  RefreshCw,
  Info,
  Award,
  Flame,
  AlertCircle,
  Calendar,
} from 'lucide-react';

interface Props {
  club: Club | null;
  players: Player[];
  formations?: Formation[];
  onSaveTactics?: (tacticData: any) => void;
}

const getPlayerOvr = (p: any): number => {
  if (!p) return 50;
  return p.overall_rating ?? p.ovr ?? 50;
};

const getPlayerPos = (p: any): string => {
  if (!p) return '';
  if (typeof p.position === 'string') return p.position;
  return p.position?.code || p.player_positions?.[0]?.position?.code || '';
};

const formatDateTime = (dateStr?: string) => {
  if (!dateStr) return 'Chưa lưu';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(d);
};

export const TacticsView: React.FC<Props> = ({
  club,
  players = [],
  formations: initialFormations,
  onSaveTactics,
}) => {
  const [formations, setFormations] = useState<Formation[]>(initialFormations || []);
  const [selectedFormationId, setSelectedFormationId] = useState<string>('1');
  const [mentality, setMentality] = useState<string>('BALANCED');
  const [tempo, setTempo] = useState<number>(55);
  const [pressing, setPressing] = useState<number>(55);
  const [defensiveLine, setDefensiveLine] = useState<number>(50);
  const [passingStyle, setPassingStyle] = useState<string>('MIXED');
  const [headCoach, setHeadCoach] = useState<any>(null);

  // Saved DB state
  const [savedTacticInfo, setSavedTacticInfo] = useState<{
    id?: string;
    name?: string;
    updatedAt?: string;
    formationId?: string;
  } | null>(null);

  // Track if user has unsaved modifications
  const [isModified, setIsModified] = useState<boolean>(false);

  // Lineup assignment map: formation_position_id -> Player
  const [lineupMap, setLineupMap] = useState<Record<string, Player | null>>({});
  
  // Selection for Swap (slot_id)
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  // Modals state
  const [showFormationModal, setShowFormationModal] = useState<boolean>(false);
  const [showTacticsModal, setShowTacticsModal] = useState<boolean>(false);

  // Loading & saving status
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<string>('');

  // Bench filter
  const [benchFilter, setBenchFilter] = useState<'ALL' | 'GK' | 'DEF' | 'MID' | 'FWD'>('ALL');

  // Load Formations and Saved Club Tactic from DB
  useEffect(() => {
    loadData();
  }, [club?.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Load formations list
      let formList = initialFormations || [];
      if (formList.length === 0) {
        const res = await tacticsApi.getFormations();
        formList = Array.isArray(res) ? res : (res as any)?.items || [];
        setFormations(formList);
      }

      // 2. Load Club Tactics directly from Database
      if (club?.id) {
        const tacticRes: any = await tacticsApi.getClubTactics(club.id);
        if (tacticRes) {
          const formId = tacticRes.formation_id ? tacticRes.formation_id.toString() : '1';
          setSelectedFormationId(formId);
          if (tacticRes.mentality) setMentality(tacticRes.mentality);
          if (tacticRes.tempo !== undefined) setTempo(Number(tacticRes.tempo));
          if (tacticRes.pressing_intensity !== undefined) setPressing(Number(tacticRes.pressing_intensity));
          if (tacticRes.defensive_line !== undefined) setDefensiveLine(Number(tacticRes.defensive_line));
          if (tacticRes.passing_style) setPassingStyle(tacticRes.passing_style);
          if (tacticRes.headCoach) setHeadCoach(tacticRes.headCoach);

          setSavedTacticInfo({
            id: tacticRes.id?.toString(),
            name: tacticRes.name || 'Đội hình chính',
            updatedAt: tacticRes.updated_at,
            formationId: formId,
          });

          // Build lineup map strictly from saved club_tactic_positions
          const savedPositions = tacticRes.club_tactic_positions || [];
          const newLineup: Record<string, Player | null> = {};
          const usedPlayerIds = new Set<string>();

          savedPositions.forEach((pos: any) => {
            if (pos.formation_position_id) {
              const matchedPlayer = players.find(
                (p) => p.id.toString() === pos.player_id?.toString()
              );
              if (matchedPlayer) {
                newLineup[pos.formation_position_id.toString()] = matchedPlayer;
                usedPlayerIds.add(matchedPlayer.id.toString());
              }
            }
          });

          // Find formation positions for this formation
          const targetFormation = formList.find((f: any) => f.id.toString() === formId) || formList[0];
          const formPositions = targetFormation?.formation_positions || [];

          // Fill any empty slots with best available players
          const availablePlayers = players.filter((p) => !usedPlayerIds.has(p.id.toString()));
          let availIdx = 0;

          formPositions.forEach((fp: any) => {
            if (!newLineup[fp.id.toString()] && availIdx < availablePlayers.length) {
              const assigned = availablePlayers[availIdx++];
              newLineup[fp.id.toString()] = assigned;
              usedPlayerIds.add(assigned.id.toString());
            }
          });

          setLineupMap(newLineup);
          setIsModified(false);
        }
      }
    } catch (err) {
      console.error('Failed to load tactics:', err);
    } finally {
      setLoading(false);
    }
  };

  // Current selected formation object
  const currentFormation = useMemo(() => {
    return (
      formations.find((f) => f.id.toString() === selectedFormationId.toString()) ||
      formations[0] ||
      null
    );
  }, [formations, selectedFormationId]);


  // AUTO-SYNC: When players array loads or changes, fill any empty slots in the current formation
  useEffect(() => {
    if (!players || players.length === 0 || !currentFormation?.formation_positions) return;

    const positions = currentFormation.formation_positions;
    const currentAssignedIds = new Set(
      Object.values(lineupMap)
        .filter(Boolean)
        .map((p) => p!.id.toString())
    );

    const hasEmptySlot = positions.some((pos) => !lineupMap[pos.id.toString()]);
    if (hasEmptySlot) {
      const newLineup = { ...lineupMap };
      const availablePlayers = players.filter((p) => !currentAssignedIds.has(p.id.toString()));

      positions.forEach((pos) => {
        if (!newLineup[pos.id.toString()]) {
          // Priority 1: Match player's primary position with slot_code
          const match = availablePlayers.find(
            (p) => !currentAssignedIds.has(p.id.toString()) && getPlayerPos(p).toUpperCase() === pos.slot_code.toUpperCase()
          );
          if (match) {
            newLineup[pos.id.toString()] = match;
            currentAssignedIds.add(match.id.toString());
          } else {
            // Priority 2: Take next highest rated available player
            const nextPlayer = availablePlayers.find((p) => !currentAssignedIds.has(p.id.toString()));
            if (nextPlayer) {
              newLineup[pos.id.toString()] = nextPlayer;
              currentAssignedIds.add(nextPlayer.id.toString());
            }
          }
        }
      });

      setLineupMap(newLineup);
    }
  }, [players, currentFormation]);

  // When user switches formation: retain existing assigned players where possible
  const handleFormationChange = (newFormationId: string) => {
    if (newFormationId === selectedFormationId) return;

    const newForm = formations.find((f) => f.id.toString() === newFormationId);
    if (!newForm?.formation_positions) {
      setSelectedFormationId(newFormationId);
      setIsModified(true);
      return;
    }

    // Keep existing assigned players
    const currentAssignedPlayers = Object.values(lineupMap).filter(Boolean) as Player[];
    const usedIds = new Set<string>();
    const newLineup: Record<string, Player | null> = {};

    newForm.formation_positions.forEach((fp) => {
      // Find a player from currently assigned players
      let chosen = currentAssignedPlayers.find(
        (p) => !usedIds.has(p.id.toString()) && getPlayerPos(p).toUpperCase() === fp.slot_code.toUpperCase()
      );
      if (!chosen) {
        chosen = currentAssignedPlayers.find((p) => !usedIds.has(p.id.toString()));
      }
      if (!chosen) {
        chosen = players.find((p) => !usedIds.has(p.id.toString()));
      }

      if (chosen) {
        usedIds.add(chosen.id.toString());
        newLineup[fp.id.toString()] = chosen;
      }
    });

    setLineupMap(newLineup);
    setSelectedFormationId(newFormationId);
    setSelectedSlotId(null);
    setIsModified(true);
    setShowFormationModal(false);
  };

  // Starting XI slots
  const startingSlots = useMemo(() => {
    if (!currentFormation?.formation_positions) return [];
    return [...currentFormation.formation_positions].sort(
      (a, b) => (a.order_no || 0) - (b.order_no || 0)
    );
  }, [currentFormation]);

  const assignedPlayerIds = useMemo(() => {
    const ids = new Set<string>();
    Object.values(lineupMap).forEach((p) => {
      if (p) ids.add(p.id.toString());
    });
    return ids;
  }, [lineupMap]);

  // Bench players
  const benchPlayers = useMemo(() => {
    const list = players.filter((p) => !assignedPlayerIds.has(p.id.toString()));

    if (benchFilter === 'ALL') return list;
    return list.filter((p) => {
      const posCode = getPlayerPos(p).toUpperCase();
      if (benchFilter === 'GK') return posCode.includes('GK');
      if (benchFilter === 'DEF') return posCode.includes('B') || posCode.includes('CB');
      if (benchFilter === 'MID') return posCode.includes('M') || posCode.includes('DM') || posCode.includes('AM');
      if (benchFilter === 'FWD') return posCode.includes('W') || posCode.includes('ST') || posCode.includes('CF');
      return true;
    });
  }, [players, assignedPlayerIds, benchFilter]);

  // Handle slot click (Swap between 2 starting positions)
  const handleSlotClick = (slotId: string) => {
    if (!selectedSlotId) {
      setSelectedSlotId(slotId);
      return;
    }

    if (selectedSlotId === slotId) {
      setSelectedSlotId(null);
      return;
    }

    // Swap two starting positions
    const playerA = lineupMap[selectedSlotId] || null;
    const playerB = lineupMap[slotId] || null;

    setLineupMap((prev) => ({
      ...prev,
      [selectedSlotId]: playerB,
      [slotId]: playerA,
    }));

    setSelectedSlotId(null);
    setIsModified(true);
  };

  // Handle bench player click: Sub in to currently selected starting slot
  const handleBenchPlayerClick = (benchPlayer: Player) => {
    if (!selectedSlotId) return;

    setLineupMap((prev) => ({
      ...prev,
      [selectedSlotId]: benchPlayer,
    }));

    setSelectedSlotId(null);
    setIsModified(true);
  };

  // Auto-optimize Lineup
  const handleAutoOptimize = () => {
    if (!currentFormation?.formation_positions || players.length === 0) return;

    const sortedPlayers = [...players].sort((a, b) => getPlayerOvr(b) - getPlayerOvr(a));
    const usedIds = new Set<string>();
    const newLineup: Record<string, Player | null> = {};

    currentFormation.formation_positions.forEach((fp) => {
      const targetPos = fp.slot_code?.toUpperCase() || '';
      let best = sortedPlayers.find((p) => {
        if (usedIds.has(p.id.toString())) return false;
        const pCode = getPlayerPos(p).toUpperCase();
        return pCode === targetPos || (targetPos === 'GK' && pCode === 'GK');
      });

      if (!best) {
        best = sortedPlayers.find((p) => !usedIds.has(p.id.toString()));
      }

      if (best) {
        usedIds.add(best.id.toString());
        newLineup[fp.id.toString()] = best;
      }
    });

    setLineupMap(newLineup);
    setSelectedSlotId(null);
    setIsModified(true);
    setSavedSuccess('Đã tự động tối ưu hóa đội hình theo OVR và vị trí!');
    setTimeout(() => setSavedSuccess(''), 3000);
  };

  // Apply Coach Preferred Formation
  const handleApplyCoachFormation = () => {
    if (headCoach?.preferredFormation?.id) {
      handleFormationChange(headCoach.preferredFormation.id.toString());
      if (headCoach.tacticalStyle) {
        setMentality(headCoach.tacticalStyle === 'TIKI_TAKA' ? 'ATTACKING' : 'BALANCED');
      }
      setIsModified(true);
    }
  };

  // Save / Update Tactic to Database
  const handleSave = async () => {
    setSaving(true);
    try {
      const positionsPayload = Object.entries(lineupMap)
        .filter(([_, player]) => Boolean(player))
        .map(([formationPositionId, player]) => ({
          formationPositionId,
          playerId: player!.id.toString(),
          role: 'STANDARD',
          duty: 'SUPPORT',
        }));

      const payload = {
        formationId: selectedFormationId,
        mentality,
        tempo,
        passingStyle,
        pressingIntensity: pressing,
        defensiveLine,
        positions: positionsPayload,
      };

      let res: any;
      if (onSaveTactics) {
        res = await onSaveTactics(payload);
      } else if (club?.id) {
        res = await tacticsApi.updateClubTactics(club.id, payload);
      }

      // Update saved DB status
      setSavedTacticInfo({
        id: res?.tactic?.id?.toString() || savedTacticInfo?.id,
        name: res?.tactic?.name || 'Đội hình chính',
        updatedAt: new Date().toISOString(),
        formationId: selectedFormationId,
      });

      setIsModified(false);
      setSavedSuccess('Đã cập nhật chiến thuật và đội hình thành công vào CSDL!');
      setTimeout(() => setSavedSuccess(''), 3500);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể lưu chiến thuật');
    } finally {
      setSaving(false);
    }
  };

  const getPosColorClass = (code?: string) => {
    if (!code) return 'pos-mid';
    const c = code.toUpperCase();
    if (c.includes('GK')) return 'pos-gk';
    if (c.includes('B') || c.includes('CB') || c.includes('LB') || c.includes('RB')) return 'pos-def';
    if (c.includes('M') || c.includes('DM') || c.includes('CM') || c.includes('AM')) return 'pos-mid';
    return 'pos-fwd';
  };

  return (
    <div className="tactics-main-layout">
      {/* CỘT TRÁI: PANEL HLV + SA BÀN CHIẾN THUẬT */}
      <div className="tactics-left-col">
        {/* PANEL HUẤN LUYỆN VIÊN TRƯỞNG RIÊNG BIỆT */}
        <div className="tactics-coach-panel glass-panel">
          <div className="coach-panel-avatar-wrap">
            <div className="coach-avatar-circle">
              <Shield className="coach-shield-bg" />
              <span className="coach-initials">
                {headCoach?.name?.slice(0, 2).toUpperCase() || 'HLV'}
              </span>
            </div>
            <div className="coach-nation-badge" title={headCoach?.nationality || 'Vietnam'}>
              🇻🇳 {headCoach?.countryCode || 'VIE'}
            </div>
          </div>

          <div className="coach-panel-info">
            <div className="coach-title-row">
              <span className="badge-coach-role">HLV TRƯỞNG (HEAD COACH)</span>
              <span className="badge-coach-license">
                <Award size={13} /> BẰNG {headCoach?.coachingLicense || 'PRO'}
              </span>
            </div>
            <h3 className="coach-name">{headCoach?.name || 'Huấn luyện viên trưởng'}</h3>
            <div className="coach-meta-row">
              <span className="coach-style">
                <Flame size={13} /> Triết lý: <strong>{headCoach?.tacticalStyle || 'CÂN BẰNG'}</strong>
              </span>
              <span className="coach-rep">
                ⭐ Danh tiếng: <strong>{(headCoach?.reputation || 6000).toLocaleString()}</strong>
              </span>
            </div>
          </div>

          <div className="coach-panel-action">
            <div className="coach-pref-box">
              <small>Sơ đồ ưa thích của HLV</small>
              <strong>{headCoach?.preferredFormation?.name || '4-4-2 Classic'}</strong>
            </div>
            <button
              type="button"
              className="btn-apply-coach-tactic"
              onClick={handleApplyCoachFormation}
              title="Áp dụng ngay sơ đồ và triết lý bóng đá của HLV trưởng"
            >
              <Zap size={14} /> Áp Dụng Sơ Đồ HLV
            </button>
          </div>
        </div>

        {/* SA BÀN CHIẾN THUẬT */}
        <section className="tactics-pitch-section glass-panel">
          {/* Status Bar Đồng bộ CSDL */}
          <div className="tactics-db-status-bar">
            <div className="status-bar-left">
              <div className="db-badge-wrap">
                {isModified ? (
                  <span className="badge-sync warning">
                    <AlertCircle size={13} /> CÓ THAY ĐỔI CHƯA LƯU
                  </span>
                ) : (
                  <span className="badge-sync synced">
                    <CheckCircle2 size={13} /> ĐÃ ĐỒNG BỘ CSDL
                  </span>
                )}
              </div>
              <span className="db-info-text">
                Chiến thuật: <strong>{savedTacticInfo?.name || 'Đội hình chính'}</strong> · Lần lưu cuối: <em>{formatDateTime(savedTacticInfo?.updatedAt)}</em>
              </span>
            </div>

            <div className="status-bar-right">
              <span className="tactic-current-tag">
                Sơ đồ: <strong>{currentFormation?.name}</strong> ({currentFormation?.code})
              </span>
            </div>
          </div>

          {savedSuccess && (
            <div className="tactics-alert-success">
              <CheckCircle2 size={18} />
              <span>{savedSuccess}</span>
            </div>
          )}

          {selectedSlotId && (
            <div className="tactics-swap-hint">
              <ArrowUpDown size={15} />
              <span>
                Đang chọn vị trí <strong>{lineupMap[selectedSlotId]?.name || 'Vị trí'}</strong>: Click một cầu thủ khác trên sân để đổi chỗ, hoặc click cầu thủ dự bị bên phải để thay người!
              </span>
              <button type="button" onClick={() => setSelectedSlotId(null)}>Hủy chọn</button>
            </div>
          )}

          {/* 2D PITCH GRAPHIC (2:3 Ratio) */}
          <div className="tactics-pitch-wrapper">
            <div className="pitch-container">
              <div className="pitch-border-line" />
              <div className="pitch-line-half" />
              <div className="pitch-circle" />
              <div className="pitch-center-spot" />
              <div className="pitch-penalty-top" />
              <div className="pitch-goal-top" />
              <div className="pitch-penalty-bottom" />
              <div className="pitch-goal-bottom" />
              <div className="pitch-direction-hint">HƯỚNG TẤN CÔNG ⬆</div>

              {/* Player Tokens on Pitch */}
              {currentFormation?.formation_positions?.map((pos: FormationPosition) => {
                const assignedPlayer = lineupMap[pos.id.toString()] || null;
                const xPercent = Number(pos.x) || 50;
                const yPercent = 100 - (Number(pos.y) || 50);
                const isGK = pos.slot_code?.includes('GK');
                const isSelected = selectedSlotId === pos.id.toString();
                const posColor = getPosColorClass(pos.slot_code);

                return (
                  <div
                    key={pos.id}
                    className={`player-token ${isSelected ? 'selected-for-swap' : ''}`}
                    style={{ left: `${xPercent}%`, top: `${yPercent}%` }}
                    onClick={() => handleSlotClick(pos.id.toString())}
                    title={assignedPlayer ? `${assignedPlayer.name} (OVR: ${getPlayerOvr(assignedPlayer)})` : pos.slot_code}
                  >
                    <div className={`token-circle ${posColor} ${isGK ? 'gk' : ''}`}>
                      <span className="token-number">
                        {assignedPlayer?.squad_number || pos.order_no || '•'}
                      </span>
                      {assignedPlayer && (
                        <span className="token-ovr-badge">{getPlayerOvr(assignedPlayer)}</span>
                      )}
                    </div>
                    <div className="token-label">
                      {assignedPlayer
                        ? assignedPlayer.common_name || `${assignedPlayer.first_name?.[0] || ''}. ${assignedPlayer.last_name || assignedPlayer.name}`
                        : pos.slot_code}
                    </div>
                    <span className="token-slot-code">{pos.slot_code}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ACTION BUTTONS DƯỚI SA BÀN */}
          <div className="tactics-actions-bar">
            <button
              type="button"
              className="btn-tactic-action btn-secondary"
              onClick={() => setShowFormationModal(true)}
            >
              <Compass size={16} />
              <span>Đổi Sơ Đồ ({currentFormation?.code || 'Sơ đồ'})</span>
            </button>

            <button
              type="button"
              className="btn-tactic-action btn-secondary"
              onClick={() => setShowTacticsModal(true)}
            >
              <Sliders size={16} />
              <span>Chỉ Đạo Lối Chơi</span>
            </button>

            <button
              type="button"
              className="btn-tactic-action btn-outline"
              onClick={handleAutoOptimize}
              title="Tự động xếp 11 cầu thủ tốt nhất vào đúng vị trí"
            >
              <Sparkles size={16} />
              <span>Tối Ưu Đội Hình</span>
            </button>

            <button
              type="button"
              className={`btn-tactic-action btn-primary ${isModified ? 'pulse-btn' : ''}`}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? <Loader2 className="spinner-icon" size={16} /> : <Save size={16} />}
              <span>{saving ? 'Đang lưu vào CSDL...' : 'Lưu Đội Hình & Chiến Thuật'}</span>
            </button>
          </div>
        </section>
      </div>

      {/* CỘT PHẢI: LIST CẦU THỦ VỚI VỊ TRÍ TRONG ĐỘI HÌNH & DỰ BỊ */}
      <aside className="tactics-lineup-sidebar glass-panel">
        <div className="sidebar-header">
          <div>
            <h3>DANH SÁCH RA SÂN & DỰ BỊ</h3>
            <p>11 Cầu thủ đá chính · {benchPlayers.length} Cầu thủ dự bị</p>
          </div>
        </div>

        {/* SECTION 1: ĐỘI HÌNH CHÍNH (STARTING XI) */}
        <div className="lineup-section">
          <div className="section-title">
            <UserCheck size={16} color="#059669" />
            <span>ĐỘI HÌNH RA SÂN (STARTING XI - 11 CẦU THỦ)</span>
          </div>

          <div className="lineup-slot-list">
            {startingSlots.map((slot: FormationPosition) => {
              const player = lineupMap[slot.id.toString()] || null;
              const isSelected = selectedSlotId === slot.id.toString();
              const posColor = getPosColorClass(slot.slot_code);

              return (
                <div
                  key={slot.id}
                  className={`lineup-slot-row ${isSelected ? 'active-slot' : ''}`}
                  onClick={() => handleSlotClick(slot.id.toString())}
                >
                  <span className={`slot-code-badge ${posColor}`}>
                    {slot.slot_code}
                  </span>

                  <div className="slot-player-info">
                    {player ? (
                      <>
                        <div className="player-main-line">
                          <strong className="player-name">{player.name}</strong>
                          <span className="player-num">#{player.squad_number || '•'}</span>
                        </div>
                        <div className="player-sub-line">
                          <span>Sở trường: {getPlayerPos(player) || slot.slot_code}</span>
                        </div>
                      </>
                    ) : (
                      <span className="slot-empty-text">Chưa xếp cầu thủ</span>
                    )}
                  </div>

                  <div className="slot-ovr-wrap">
                    {player && (
                      <span className="slot-ovr-val">{getPlayerOvr(player)}</span>
                    )}
                    <button
                      type="button"
                      className="btn-swap-slot"
                      title="Chọn vị trí này để đổi người"
                    >
                      <ArrowUpDown size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: GHẾ DỰ BỊ (SUBSTITUTES & RESERVES) */}
        <div className="lineup-section bench-section">
          <div className="section-title-wrap">
            <div className="section-title">
              <UserX size={16} color="#64748b" />
              <span>GHẾ DỰ BỊ ({benchPlayers.length})</span>
            </div>

            <div className="bench-filter-tabs">
              {(['ALL', 'GK', 'DEF', 'MID', 'FWD'] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  className={benchFilter === filter ? 'active' : ''}
                  onClick={() => setBenchFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="bench-player-list">
            {benchPlayers.length === 0 ? (
              <div className="bench-empty-box">
                <Info size={18} />
                <span>Không có cầu thủ dự bị phù hợp bộ lọc</span>
              </div>
            ) : (
              benchPlayers.map((bp) => {
                const posColor = getPosColorClass(getPlayerPos(bp));
                return (
                  <div
                    key={bp.id}
                    className={`bench-player-row ${selectedSlotId ? 'can-sub-in' : ''}`}
                    onClick={() => {
                      if (selectedSlotId) handleBenchPlayerClick(bp);
                    }}
                  >
                    <span className={`slot-code-badge ${posColor}`}>
                      {getPlayerPos(bp) || 'SUB'}
                    </span>

                    <div className="bench-info">
                      <div className="player-main-line">
                        <strong className="player-name">{bp.name}</strong>
                        <span className="player-num">#{bp.squad_number || '•'}</span>
                      </div>
                      <span className="player-age-foot">{bp.age || 20} tuổi · Chân {(bp as any).preferred_foot === 'LEFT' ? 'Trái' : (bp as any).preferred_foot === 'BOTH' ? '2 chân' : 'Phải'}</span>
                    </div>

                    <div className="bench-right">
                      <span className="bench-ovr">{getPlayerOvr(bp)}</span>
                      {selectedSlotId && (
                        <button type="button" className="btn-sub-in">VÀO SÂN</button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </aside>

      {/* MODAL 1: CHỌN SƠ ĐỒ ĐỘI HÌNH */}
      {showFormationModal && (
        <div className="tactics-modal-overlay" onClick={() => setShowFormationModal(false)}>
          <div className="tactics-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="tactics-modal-header">
              <div>
                <h3>CHỌN SƠ ĐỒ ĐỘI HÌNH THI ĐẤU</h3>
                <p>Khám phá và áp dụng các sơ đồ chiến thuật kinh điển</p>
              </div>
              <button className="btn-close-modal" onClick={() => setShowFormationModal(false)}>
                <X size={18} />
              </button>
            </div>

            {headCoach?.preferredFormation && (
              <div className="coach-pref-card">
                <div className="coach-pref-text">
                  <Trophy size={18} color="#b45309" />
                  <div>
                    <strong>Sơ đồ ưa thích của HLV {headCoach.name}</strong>
                    <span>{headCoach.preferredFormation.name} ({headCoach.preferredFormation.code})</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  onClick={() => handleFormationChange(headCoach.preferredFormation.id.toString())}
                >
                  Áp Dụng Ngay
                </button>
              </div>
            )}

            <div className="formations-grid">
              {formations.map((f) => {
                const isActive = selectedFormationId.toString() === f.id.toString();
                return (
                  <div
                    key={f.id}
                    className={`formation-select-card ${isActive ? 'active' : ''}`}
                    onClick={() => handleFormationChange(f.id.toString())}
                  >
                    <div className="formation-card-head">
                      <span className="formation-code">{f.code}</span>
                      {isActive && <span className="badge-active-pill">ĐANG CHỌN</span>}
                    </div>
                    <strong className="formation-name">{f.name}</strong>
                    <p className="formation-desc">Sơ đồ chiến thuật hiện đại với tính cơ động cao.</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CHỈ ĐẠO LỐI CHƠI & CHIẾN THUẬT */}
      {showTacticsModal && (
        <div className="tactics-modal-overlay" onClick={() => setShowTacticsModal(false)}>
          <div className="tactics-modal-content tactics-modal-sliders" onClick={(e) => e.stopPropagation()}>
            <div className="tactics-modal-header">
              <div>
                <h3>CHỈ ĐẠO CHIẾN THUẬT & LỐI CHƠI</h3>
                <p>Thiết lập phong cách thi đấu tổng thể của toàn đội</p>
              </div>
              <button className="btn-close-modal" onClick={() => setShowTacticsModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="tactics-sliders-body">
              <div className="slider-group">
                <label>TƯ DUY CHIẾN THUẬT (MENTALITY)</label>
                <div className="mentality-buttons-row">
                  {[
                    { key: 'DEFENSIVE', label: 'Phòng Ngự', color: 'blue' },
                    { key: 'BALANCED', label: 'Cân Bằng', color: 'green' },
                    { key: 'ATTACKING', label: 'Tấn Công', color: 'red' },
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      className={`btn-mentality ${mentality === item.key ? 'active ' + item.color : ''}`}
                      onClick={() => { setMentality(item.key); setIsModified(true); }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="slider-group">
                <div className="slider-label-row">
                  <span>NHỊP ĐỘ TRẬN ĐẤU (TEMPO)</span>
                  <strong>{tempo} / 100</strong>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={tempo}
                  onChange={(e) => { setTempo(Number(e.target.value)); setIsModified(true); }}
                  className="range-slider blue"
                />
                <div className="slider-hints">
                  <span>Chậm rãi, kiểm soát</span>
                  <span>Dồn dập, tốc độ cao</span>
                </div>
              </div>

              <div className="slider-group">
                <div className="slider-label-row">
                  <span>CƯỜNG ĐỘ ÁP SÁT (PRESSING INTENSITY)</span>
                  <strong>{pressing} / 100</strong>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={pressing}
                  onChange={(e) => { setPressing(Number(e.target.value)); setIsModified(true); }}
                  className="range-slider amber"
                />
                <div className="slider-hints">
                  <span>Lùi sâu phòng ngự</span>
                  <span>Pressing tầm cao</span>
                </div>
              </div>

              <div className="slider-group">
                <div className="slider-label-row">
                  <span>ĐỘ CAO HÀNG THỦ (DEFENSIVE LINE)</span>
                  <strong>{defensiveLine} / 100</strong>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={defensiveLine}
                  onChange={(e) => { setDefensiveLine(Number(e.target.value)); setIsModified(true); }}
                  className="range-slider green"
                />
                <div className="slider-hints">
                  <span>Bẫy việt vị thấp</span>
                  <span>Dâng cao giữa sân</span>
                </div>
              </div>

              <div className="slider-group">
                <label>PHONG CÁCH CHUYỀN BÓNG</label>
                <div className="mentality-buttons-row">
                  {[
                    { key: 'SHORT', label: 'Chuyền Ngắn (Tiki-Taka)' },
                    { key: 'MIXED', label: 'Hỗn Hợp Linh Hoạt' },
                    { key: 'DIRECT', label: 'Trực Diện / Phản Công' },
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      className={`btn-mentality ${passingStyle === item.key ? 'active green' : ''}`}
                      onClick={() => { setPassingStyle(item.key); setIsModified(true); }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="tactics-modal-footer">
              <button
                type="button"
                className="btn btn-primary btn-block"
                onClick={() => setShowTacticsModal(false)}
              >
                Xác Nhận Chỉ Đạo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
