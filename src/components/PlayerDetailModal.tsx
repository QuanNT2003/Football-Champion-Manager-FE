import React, { useState, useEffect } from 'react';
import { Player, PlayerDetailData } from '../types';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { playersApi } from '../services/players.service';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  Edit2,
  Coins,
  Shield,
  Award,
  AlertCircle,
  HelpCircle,
  Plus,
  ArrowRight,
  Activity,
  HeartPulse,
} from 'lucide-react';

interface Props {
  player: Player;
  playersList?: Player[];
  currentClubId?: string;
  onClose: () => void;
  onSelectPlayer?: (player: Player) => void;
  onPlayerUpdated?: () => void;
}

export const PlayerDetailModal: React.FC<Props> = ({
  player,
  playersList = [],
  currentClubId,
  onClose,
  onSelectPlayer,
}) => {
  const [activeTab, setActiveTab] = useState<'skills' | 'matches' | 'statistics' | 'transfers' | 'injuries'>('skills');
  const [skillCategory, setSkillCategory] = useState<'KEY' | 'ALL' | 'PHYSICAL' | 'TECHNICAL' | 'MENTAL' | 'GOALKEEPING'>('KEY');
  const [detail, setDetail] = useState<PlayerDetailData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [compared, setCompared] = useState<boolean>(false);

  // Load detailed player info from API
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    playersApi
      .getPlayerById(player.id)
      .then((data: any) => {
        if (isMounted) {
          setDetail(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load player detail:', err);
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [player.id]);

  // Navigate to previous / next player in squad
  const currentIndex = playersList.findIndex((p) => p.id === player.id);
  const hasPrev = playersList.length > 1;
  const hasNext = playersList.length > 1;

  const handlePrev = () => {
    if (!onSelectPlayer || playersList.length <= 1) return;
    const prevIdx = currentIndex > 0 ? currentIndex - 1 : playersList.length - 1;
    onSelectPlayer(playersList[prevIdx]);
  };

  const handleNext = () => {
    if (!onSelectPlayer || playersList.length <= 1) return;
    const nextIdx = currentIndex < playersList.length - 1 ? currentIndex + 1 : 0;
    onSelectPlayer(playersList[nextIdx]);
  };

  // Get skills dynamically based on DB attributes & position key attributes
  const getDisplayedSkills = () => {
    if (!detail?.skills) {
      return { left: [], right: [], total: 0, label: 'Chỉ số cốt lõi' };
    }

    let list: any[] = [];
    let label = 'Chỉ số cốt lõi vị trí (10)';

    if (skillCategory === 'KEY') {
      list = (detail.skills.key_attributes && detail.skills.key_attributes.length > 0)
        ? detail.skills.key_attributes
        : [...(detail.skills.left_column || []), ...(detail.skills.right_column || [])];
      label = `Chỉ số cốt lõi vị trí (${list.length})`;
    } else if (skillCategory === 'PHYSICAL') {
      list = detail.skills.categories?.physical || [];
      label = `Thể chất - Physical (${list.length})`;
    } else if (skillCategory === 'TECHNICAL') {
      list = detail.skills.categories?.technical || [];
      label = `Kỹ thuật - Technical (${list.length})`;
    } else if (skillCategory === 'MENTAL') {
      list = detail.skills.categories?.mental || [];
      label = `Tâm lý & Nhận thức - Mental (${list.length})`;
    } else if (skillCategory === 'GOALKEEPING') {
      list = detail.skills.categories?.goalkeeping || [];
      label = `Kỹ năng Thủ môn - Goalkeeping (${list.length})`;
    } else {
      list = detail.skills.all_attributes || [];
      label = `Tất cả chỉ số (${list.length})`;
    }

    const half = Math.ceil(list.length / 2);
    const left = list.slice(0, half);
    const right = list.slice(half);
    const total = list.reduce((acc: number, a: any) => acc + (Number(a.value) || 0), 0);

    return { left, right, total, label };
  };

  const displayedSkills = getDisplayedSkills();

  // Basic info from DB
  const pName = detail?.name || `${player.first_name} ${player.last_name}`.trim();
  const pAge = detail?.age ?? player.age ?? 20;
  const pPos = detail?.primary_position?.name || detail?.position?.name || player.position?.name || 'Cầu thủ';
  const pPosCode = detail?.primary_position?.code || detail?.position?.code || player.position?.code || '-';
  
  // Chiều cao & Cân nặng chuẩn hóa từ DB
  const rawHeight = detail?.height || (player as any).height;
  const pHeight = rawHeight && rawHeight !== '-' 
    ? `${Math.round(parseFloat(String(rawHeight).replace(/[^\d.]/g, '')))} cm` 
    : '-';

  const rawWeight = detail?.weight || (player as any).weight;
  const pWeight = rawWeight && rawWeight !== '-' 
    ? `${Math.round(parseFloat(String(rawWeight).replace(/[^\d.]/g, '')))} kg` 
    : '-';

  // Chân thuận
  const rawFoot = (detail?.preferred_foot || (player as any).preferred_foot || 'RIGHT').toUpperCase();
  const pFoot = rawFoot === 'LEFT' ? 'Left (Trái)' : rawFoot === 'BOTH' ? 'Both (Hai chân)' : 'Right (Phải)';

  // Danh tiếng & Tiềm năng
  const pReputation = detail?.reputation ?? player.reputation ?? 0;
  const pPotential = detail?.potential ?? player.potential ?? 0;

  // Điểm OVR / Average Quality
  const pQuality = (detail?.average_quality ?? player.overall_rating ?? 50.0).toFixed(2);
  const pClubName = detail?.club?.name || player.club?.name || 'Tự do';
  const pCountry = typeof detail?.nationality === 'object'
    ? (detail?.nationality as any)?.name
    : typeof player.nationality === 'object'
    ? (player.nationality as any)?.name
    : (detail?.nationality || player.nationality || '-');
  const pShirtNo = detail?.squad_number ?? player.squad_number ?? 1;

  // Giá trị thị trường và Lương tuần dùng chung hàm formatCurrency duy nhất
  const pMarketValue = detail?.market_value ?? player.market_value;
  const pWorth = formatCurrency(pMarketValue);

  const pWeeklyWage = (detail as any)?.weekly_wage ?? (player.contract?.salary ? Math.round(Number(player.contract.salary) / 52) : null);
  const pWages = pWeeklyWage && pWeeklyWage > 0 
    ? `${formatCurrency(pWeeklyWage)} / tuần` 
    : (detail?.weekly_wages_display || 'Chưa ký HĐ');

  // Hiển thị sao tiềm năng theo thang chuẩn 1-100 (mỗi 20 điểm = 1 sao)
  const renderStars = (pot: number) => {
    const starCount = pot > 5 ? Math.min(5, Math.max(1, Math.round(pot / 20))) : Math.max(1, pot);
    const list = [];
    for (let i = 1; i <= 5; i++) {
      list.push(
        <span key={i} className={i <= starCount ? 'star-gold' : 'star-muted'}>
          ★
        </span>
      );
    }
    return list;
  };

  return (
    <div className="player-modal-overlay" onClick={onClose}>
      <div className="player-modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Top Control Bar */}
        <div className="pm-topbar">
          <div className="pm-topbar-left">
            <button
              className="pm-nav-btn"
              onClick={handlePrev}
              title="Cầu thủ trước"
              disabled={!hasPrev}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              className="pm-nav-btn"
              onClick={handleNext}
              title="Cầu thủ tiếp theo"
              disabled={!hasNext}
            >
              <ChevronRight size={20} />
            </button>
            <h2 className="pm-player-title">{pName}</h2>
            <button className="pm-icon-btn" title="Chỉnh sửa tên / biệt danh">
              <Edit2 size={16} />
            </button>
            <button
              className={`pm-icon-btn ${isFavorite ? 'fav-active' : ''}`}
              onClick={() => setIsFavorite(!isFavorite)}
              title="Đánh dấu yêu thích"
            >
              <Star size={17} fill={isFavorite ? '#eab308' : 'none'} color={isFavorite ? '#eab308' : '#64748b'} />
            </button>
          </div>

          <button className="pm-close-btn" onClick={onClose} title="Đóng">
            <X size={20} />
          </button>
        </div>

        {/* Player Profile Header Card */}
        <div className="pm-header-card">
          {/* Avatar with Shirt Badge */}
          <div className="pm-avatar-container">
            <div className="pm-avatar-box">
              {detail?.photo_url || player.photo_url ? (
                <img
                  src={detail?.photo_url || player.photo_url}
                  alt=""
                  className="pm-avatar-img"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="pm-avatar-placeholder">
                  <span className="pm-placeholder-icon">👤</span>
                </div>
              )}
            </div>
            {/* Jersey Badge */}
            <div className="pm-jersey-badge" title={`Số áo: ${pShirtNo}`}>
              <span className="pm-jersey-num">{pShirtNo}</span>
            </div>
          </div>

          {/* Column 1: Core Physical & Technical Info */}
          <div className="pm-info-col">
            <div className="pm-info-row">
              <span className="pm-label">Position:</span>
              <span className="pm-value pm-val-bold">
                {pPos} / {pPosCode}
              </span>
            </div>
            <div className="pm-info-row">
              <span className="pm-label">Age:</span>
              <span className="pm-value pm-val-bold">{pAge}</span>
            </div>
            <div className="pm-info-row">
              <span className="pm-label">Height:</span>
              <span className="pm-value">{pHeight}</span>
            </div>
            <div className="pm-info-row">
              <span className="pm-label">Weight:</span>
              <span className="pm-value">{pWeight}</span>
            </div>
            <div className="pm-info-row">
              <span className="pm-label">Preferred Foot:</span>
              <span className="pm-value">{pFoot}</span>
            </div>
            <div className="pm-info-row">
              <span className="pm-label">Average Quality:</span>
              <span className="pm-value pm-val-bold pm-quality-val">{pQuality}</span>
            </div>
          </div>

          {/* Column 2: Club, Reputation, Potential, Value & Wages */}
          <div className="pm-info-col">
            <div className="pm-info-row">
              <span className="pm-label">Team:</span>
              <span className="pm-value pm-val-bold pm-team-link">
                {pClubName} {(detail?.club as any)?.country_flag ? (
                  <img src={(detail?.club as any).country_flag} alt="" className="pm-flag-img" />
                ) : null}
              </span>
            </div>
            <div className="pm-info-row">
              <span className="pm-label">Country:</span>
              <span className="pm-value">
                {pCountry} {(detail?.nationality_detail?.flag_url || player.nationalityFlag) ? (
                  <img src={detail?.nationality_detail?.flag_url || player.nationalityFlag} alt="" className="pm-flag-img" />
                ) : null}
              </span>
            </div>
            <div className="pm-info-row">
              <span className="pm-label">Reputation:</span>
              <span className="pm-value pm-reputation-val">
                <Award size={14} className="pm-icon-badge" />
                {formatNumber(pReputation)}
              </span>
            </div>
            <div className="pm-info-row">
              <span className="pm-label">Potential:</span>
              <div className="pm-potential-wrap">
                <span className="pm-val-bold" style={{ color: 'var(--color-navy-blue)' }}>{pPotential}</span>
                <span className="pm-muted-note" style={{ fontSize: '0.75rem', marginRight: '6px' }}>/100</span>
                <div className="pm-stars-wrap">{renderStars(pPotential)}</div>
              </div>
            </div>
            <div className="pm-info-row">
              <span className="pm-label">Worth:</span>
              <span className="pm-value pm-worth-val">
                <Coins size={14} className="pm-coin-icon" /> {pWorth}
              </span>
            </div>
            <div className="pm-info-row">
              <span className="pm-label">Weekly Wages:</span>
              <span className="pm-value pm-val-bold" style={{ color: '#047857' }}>
                {pWages}
              </span>
            </div>
          </div>
        </div>

        {/* 5 Tabs Navigation Header */}
        <div className="pm-tabs-bar">
          <button
            className={`pm-tab-btn ${activeTab === 'skills' ? 'active' : ''}`}
            onClick={() => setActiveTab('skills')}
          >
            <Star size={15} />
            <span>Kỹ Năng</span>
          </button>
          <button
            className={`pm-tab-btn ${activeTab === 'matches' ? 'active' : ''}`}
            onClick={() => setActiveTab('matches')}
          >
            <Activity size={15} />
            <span>Trận Đấu</span>
          </button>
          <button
            className={`pm-tab-btn ${activeTab === 'statistics' ? 'active' : ''}`}
            onClick={() => setActiveTab('statistics')}
          >
            <Award size={15} />
            <span>Lịch Sử Các Mùa</span>
          </button>
          <button
            className={`pm-tab-btn ${activeTab === 'transfers' ? 'active' : ''}`}
            onClick={() => setActiveTab('transfers')}
          >
            <Coins size={15} />
            <span>Chuyển Nhượng</span>
          </button>
          <button
            className={`pm-tab-btn ${activeTab === 'injuries' ? 'active' : ''}`}
            onClick={() => setActiveTab('injuries')}
          >
            <HeartPulse size={15} />
            <span>Lịch Sử Chấn Thương</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="pm-tab-content">
          {loading ? (
            <div className="pm-loading-state">
              <div className="pm-spinner" />
              <span>Đang tải hồ sơ cầu thủ...</span>
            </div>
          ) : (
            <>
              {/* TAB 1: SKILLS (100% PURE DB SCHEMA & POSITION ATTRIBUTES) */}
              {activeTab === 'skills' && (
                <div className="pm-skills-view">
                  {/* Category Filter Sub-nav */}
                  <div className="pm-skills-subnav">
                    <button
                      className={`pm-subnav-btn ${skillCategory === 'KEY' ? 'active' : ''}`}
                      onClick={() => setSkillCategory('KEY')}
                      title="10 Chỉ số cốt lõi theo vị trí thi đấu (Hệ số x3 OVR)"
                    >
                      ⭐ Cốt lõi vị trí (10)
                    </button>
                    <button
                      className={`pm-subnav-btn ${skillCategory === 'PHYSICAL' ? 'active' : ''}`}
                      onClick={() => setSkillCategory('PHYSICAL')}
                      title="Chỉ số thể chất & sức mạnh"
                    >
                      🏃 Thể chất (10)
                    </button>
                    <button
                      className={`pm-subnav-btn ${skillCategory === 'TECHNICAL' ? 'active' : ''}`}
                      onClick={() => setSkillCategory('TECHNICAL')}
                      title="Chỉ số kỹ thuật xử lý bóng"
                    >
                      ⚽ Kỹ thuật (10)
                    </button>
                    <button
                      className={`pm-subnav-btn ${skillCategory === 'MENTAL' ? 'active' : ''}`}
                      onClick={() => setSkillCategory('MENTAL')}
                      title="Chỉ số tâm lý & nhãn quan chiến thuật"
                    >
                      🧠 Tâm lý (10)
                    </button>
                    {(pPosCode === 'GK' || (detail?.skills?.categories?.goalkeeping?.some((g: any) => g.value > 0))) && (
                      <button
                        className={`pm-subnav-btn ${skillCategory === 'GOALKEEPING' ? 'active' : ''}`}
                        onClick={() => setSkillCategory('GOALKEEPING')}
                        title="Chỉ số chuyên môn thủ môn"
                      >
                        🧤 Thủ môn (10)
                      </button>
                    )}
                    <button
                      className={`pm-subnav-btn ${skillCategory === 'ALL' ? 'active' : ''}`}
                      onClick={() => setSkillCategory('ALL')}
                      title="Toàn bộ 40 chỉ số trong CSDL"
                    >
                      📋 Tất cả (40)
                    </button>
                  </div>

                  {/* 2-Column Skills Grid */}
                  <div className="pm-skills-grid">
                    {/* Left Column Skills */}
                    <div className="pm-skills-col">
                      {displayedSkills.left.map((sk: any) => (
                        <div key={sk.id || sk.code} className="pm-skill-item" title={sk.description || `${sk.name} (${sk.code})`}>
                          <span className="pm-skill-name">
                            {sk.is_key && <span className="pm-key-star" title="Chỉ số cốt lõi vị trí">⭐ </span>}
                            <strong className="pm-skill-code">[{sk.code}]</strong> {sk.name}
                          </span>
                          <div className="pm-skill-bar-wrap">
                            <div className="pm-skill-bar-track">
                              <div
                                className="pm-skill-bar-fill"
                                style={{ width: `${Math.min(100, Math.max(5, sk.value))}%` }}
                              >
                                <span className="pm-skill-num">{sk.value}</span>
                              </div>
                            </div>
                            {sk.potential_value && sk.potential_value > sk.value ? (
                              <span className="pm-growth-tag">(+{sk.potential_value - sk.value})</span>
                            ) : sk.growth ? (
                              <span className="pm-growth-tag">({sk.growth})</span>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Right Column Skills */}
                    <div className="pm-skills-col">
                      {displayedSkills.right.map((sk: any) => (
                        <div key={sk.id || sk.code} className="pm-skill-item" title={sk.description || `${sk.name} (${sk.code})`}>
                          <span className="pm-skill-name">
                            {sk.is_key && <span className="pm-key-star" title="Chỉ số cốt lõi vị trí">⭐ </span>}
                            <strong className="pm-skill-code">[{sk.code}]</strong> {sk.name}
                          </span>
                          <div className="pm-skill-bar-wrap">
                            <div className="pm-skill-bar-track">
                              <div
                                className="pm-skill-bar-fill"
                                style={{ width: `${Math.min(100, Math.max(5, sk.value))}%` }}
                              >
                                <span className="pm-skill-num">{sk.value}</span>
                              </div>
                            </div>
                            {sk.potential_value && sk.potential_value > sk.value ? (
                              <span className="pm-growth-tag">(+{sk.potential_value - sk.value})</span>
                            ) : sk.growth ? (
                              <span className="pm-growth-tag">({sk.growth})</span>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pm-skills-total-row">
                    <span className="pm-total-label">Tổng điểm {displayedSkills.label}:</span>
                    <span className="pm-total-val">{displayedSkills.total}</span>
                    <span className="pm-calc-icon">🧮</span>
                  </div>

                  {/* Skills Bottom Row: Progress Chart & Comparison Tool */}
                  <div className="pm-skills-bottom-row">
                    {/* Quality Progress Chart */}
                    <div className="pm-progress-chart-box">
                      <h4 className="pm-sub-title">Average Quality Progress</h4>
                      <div className="pm-svg-chart">
                        {/* Render simple, clean SVG line chart */}
                        {(() => {
                          const pts = detail?.skills?.quality_progress || [];
                          if (pts.length < 2) {
                            return (
                              <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>
                                Chưa có dữ liệu lịch sử tăng trưởng trong CSDL
                              </div>
                            );
                          }
                          const minQ = Math.min(...pts.map((p) => p.quality)) - 0.5;
                          const maxQ = Math.max(...pts.map((p) => p.quality)) + 0.5;
                          const width = 320;
                          const height = 110;
                          const padX = 25;
                          const padY = 20;

                          const getX = (idx: number) =>
                            padX + (idx / Math.max(1, pts.length - 1)) * (width - 2 * padX);
                          const getY = (q: number) =>
                            height - padY - ((q - minQ) / Math.max(0.1, maxQ - minQ)) * (height - 2 * padY);

                          const polylinePts = pts
                            .map((p, idx) => `${getX(idx)},${getY(p.quality)}`)
                            .join(' ');

                          return (
                            <svg viewBox={`0 0 ${width} ${height}`} className="pm-chart-svg">
                              {/* Grid lines */}
                              <line
                                x1={padX}
                                y1={height - padY}
                                x2={width - padX}
                                y2={height - padY}
                                stroke="#e2e8f0"
                                strokeWidth="1"
                              />
                              <line
                                x1={padX}
                                y1={padY}
                                x2={width - padX}
                                y2={padY}
                                stroke="#f1f5f9"
                                strokeWidth="1"
                                strokeDasharray="3 3"
                              />

                              {/* Progress curve line */}
                              <polyline
                                fill="none"
                                stroke="#0284c7"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                points={polylinePts}
                              />

                              {/* Points & Labels */}
                              {pts.map((p, idx) => {
                                const x = getX(idx);
                                const y = getY(p.quality);
                                return (
                                  <g key={idx}>
                                    <circle cx={x} cy={y} r="4" fill="#0284c7" />
                                    <text
                                      x={x}
                                      y={height - 4}
                                      textAnchor="middle"
                                      fontSize="10"
                                      fill="#64748b"
                                    >
                                      {p.age}
                                    </text>
                                  </g>
                                );
                              })}
                            </svg>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Comparison Tool */}
                    <div className="pm-compare-box">
                      <h4 className="pm-sub-title">Player Comparison Tool</h4>
                      <button
                        className={`pm-compare-btn ${compared ? 'added' : ''}`}
                        onClick={() => setCompared(!compared)}
                      >
                        <Plus size={16} />
                        <span>{compared ? 'Đã thêm (1/3)' : 'Add this Player (0/3)'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: MATCHES THIS SEASON */}
              {activeTab === 'matches' && (
                <div className="pm-matches-view">
                  <div className="pm-matches-header-stat">
                    <span>
                      Matches: <strong>{detail?.matches?.total ?? 0}</strong> | Missed:{' '}
                      <strong>{detail?.matches?.missed || 0} ({detail?.matches?.missed_pct || '0%'})</strong>
                    </span>
                    <HelpCircle size={14} className="pm-inline-help" />
                  </div>

                  <div className="pm-table-wrapper">
                    <table className="pm-data-table">
                      <thead>
                        <tr>
                          <th>D</th>
                          <th>Opponent</th>
                          <th className="text-center">Result</th>
                          <th>Min</th>
                          <th>Saves/Tackles</th>
                          <th>Key/Ass</th>
                          <th>Shot/Goal</th>
                          <th className="text-right">Rating</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(!detail?.matches?.list || detail.matches.list.length === 0) ? (
                          <tr>
                            <td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                              Chưa có trận đấu nào được ghi nhận trong cơ sở dữ liệu
                            </td>
                          </tr>
                        ) : (detail.matches.list.map((m, idx) => (
                          <tr key={idx}>
                            <td className="pm-dim-cell">{m.day}</td>
                            <td className="pm-bold-cell">{m.opponent}</td>
                            <td className="text-center">
                              <span
                                className={`pm-result-badge ${
                                  m.outcome === 'WIN'
                                    ? 'res-win'
                                    : m.outcome === 'LOSS'
                                    ? 'res-loss'
                                    : 'res-draw'
                                }`}
                              >
                                {m.result}
                              </span>
                            </td>
                            <td>{m.minutes}'</td>
                            <td>{m.saves_or_tackles}</td>
                            <td>{m.key_ass}</td>
                            <td>{m.shot_goal}</td>
                            <td className="text-right pm-rating-cell">{m.rating.toFixed(2)}</td>
                          </tr>
                        ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: STATISTICS ACROSS SEASONS */}
              {activeTab === 'statistics' && (
                <div className="pm-stats-view">
                  {/* Career Totals Bar */}
                  <div className="pm-career-totals-bar">
                    <div className="pm-stat-mini">
                      <span className="pm-stat-mini-label">Matches</span>
                      <span className="pm-stat-mini-val">
                        {detail?.statistics?.career_totals?.matches ?? 0}
                      </span>
                    </div>
                    <div className="pm-stat-mini">
                      <span className="pm-stat-mini-label">Caps</span>
                      <span className="pm-stat-mini-val">
                        {detail?.statistics?.career_totals?.caps || 0}
                      </span>
                    </div>
                    <div className="pm-stat-mini">
                      <span className="pm-stat-mini-label">Tackles</span>
                      <span className="pm-stat-mini-val">
                        {detail?.statistics?.career_totals?.tackles ?? 0}
                      </span>
                    </div>
                    <div className="pm-stat-mini">
                      <span className="pm-stat-mini-label">Key/Ass</span>
                      <span className="pm-stat-mini-val">
                        {detail?.statistics?.career_totals?.key_ass || '0/0'}
                      </span>
                    </div>
                    <div className="pm-stat-mini">
                      <span className="pm-stat-mini-label">Shot/Goal</span>
                      <span className="pm-stat-mini-val">
                        {detail?.statistics?.career_totals?.shot_goal || '0/0'}
                      </span>
                    </div>
                    <div className="pm-stat-mini">
                      <span className="pm-stat-mini-label">Rating</span>
                      <span className="pm-stat-mini-val">
                        {Number(detail?.statistics?.career_totals?.rating ?? 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="pm-table-wrapper">
                    <table className="pm-data-table">
                      <thead>
                        <tr>
                          <th>S</th>
                          <th>Team</th>
                          <th>Avg. Q</th>
                          <th>Matches</th>
                          <th>Tackles</th>
                          <th>Key/Ass</th>
                          <th>Shot/Goal</th>
                          <th className="text-right">Rating</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(!detail?.statistics?.seasons || detail.statistics.seasons.length === 0) ? (
                          <tr>
                            <td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                              Chưa có thống kê mùa giải nào trong cơ sở dữ liệu
                            </td>
                          </tr>
                        ) : (detail.statistics.seasons.map((s, idx) => (
                          <tr key={idx}>
                            <td className="pm-dim-cell">{s.season}</td>
                            <td className="pm-team-name-cell">{s.team}</td>
                            <td>{s.avg_quality.toFixed(2)}</td>
                            <td>{s.matches}</td>
                            <td>{s.tackles}</td>
                            <td>{s.key_ass}</td>
                            <td>{s.shot_goal}</td>
                            <td className="text-right pm-rating-cell">{s.rating.toFixed(2)}</td>
                          </tr>
                        ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: TRANSFERS ACROSS SEASONS */}
              {activeTab === 'transfers' && (
                <div className="pm-transfers-view">
                  <h4 className="pm-sub-title">🕒 Transfer History</h4>
                  <div className="pm-table-wrapper">
                    <table className="pm-data-table">
                      <thead>
                        <tr>
                          <th>From Team</th>
                          <th>To Team</th>
                          <th>Season</th>
                          <th>Avg. Q</th>
                          <th className="text-right">Bid Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(!detail?.transfers?.history || detail.transfers.history.length === 0) ? (
                          <tr>
                            <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                              Chưa có dữ liệu chuyển nhượng trong cơ sở dữ liệu
                            </td>
                          </tr>
                        ) : (detail.transfers.history.map((t, idx) => (
                          <tr key={idx}>
                            <td className="pm-team-name-cell">{t.from_team}</td>
                            <td className="pm-team-name-cell">{t.to_team}</td>
                            <td>{t.season}</td>
                            <td>{t.avg_quality}</td>
                            <td className="text-right pm-bold-cell">
                              <Coins size={13} className="pm-coin-inline" /> {t.bid_value}
                            </td>
                          </tr>
                        ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Potential Upgrades */}
                  <div className="pm-potential-box">
                    <h4 className="pm-sub-title">📈 Potential Upgrades</h4>
                    <p className="pm-potential-desc">
                      Những cầu thủ có chỉ số OVR và tiềm năng tương tự hiện đang có mặt trên thị trường chuyển nhượng hoặc trong học viện bóng đá.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 5: INJURIES HISTORY */}
              {activeTab === 'injuries' && (
                <div className="pm-injuries-view">
                  {/* Current Active Injury Status */}
                  <div className="pm-injury-status-box">
                    {detail?.active_injury ? (
                      <div className="pm-status-alert pm-status-injured">
                        <AlertCircle size={20} />
                        <div>
                          <strong>Đang gặp chấn thương: {detail.active_injury.injury_type}</strong>
                          <p>
                            Mức độ: {detail.active_injury.severity} • Dự kiến nghỉ thi đấu thêm{' '}
                            {detail.active_injury.days_remaining} ngày nữa.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="pm-status-alert pm-status-healthy">
                        <HeartPulse size={20} />
                        <div>
                          <strong>Thể trạng hoàn toàn khỏe mạnh</strong>
                          <p>Cầu thủ sẵn sàng 100% cho mọi trận đấu và các bài tập huấn luyện.</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <h4 className="pm-sub-title">📋 Hồ sơ chấn thương trong sự nghiệp</h4>
                  <div className="pm-table-wrapper">
                    <table className="pm-data-table">
                      <thead>
                        <tr>
                          <th>Loại chấn thương</th>
                          <th>Mức độ</th>
                          <th>Số ngày nghỉ</th>
                          <th>Thời gian</th>
                          <th className="text-right">Tình trạng</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(!detail?.injuries_tab?.history || detail.injuries_tab.history.length === 0) ? (
                          <tr>
                            <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                              Chưa có hồ sơ chấn thương nào trong cơ sở dữ liệu
                            </td>
                          </tr>
                        ) : (detail.injuries_tab.history.map((inj) => (
                          <tr key={inj.id}>
                            <td className="pm-bold-cell">{inj.injury_name}</td>
                            <td>
                              <span
                                className={`pm-sev-tag ${
                                  inj.severity === 'SEVERE'
                                    ? 'sev-high'
                                    : inj.severity === 'MODERATE'
                                    ? 'sev-mid'
                                    : 'sev-low'
                                }`}
                              >
                                {inj.severity === 'SEVERE'
                                  ? 'Nặng'
                                  : inj.severity === 'MODERATE'
                                  ? 'Trung bình'
                                  : 'Nhẹ'}
                              </span>
                            </td>
                            <td>{inj.days_missed} ngày</td>
                            <td>{inj.season}</td>
                            <td className="text-right">
                              <span
                                className={`pm-status-tag ${
                                  inj.status === 'ACTIVE' ? 'tag-active' : 'tag-recovered'
                                }`}
                              >
                                {inj.status === 'ACTIVE' ? 'Đang điều trị' : 'Đã bình phục'}
                              </span>
                            </td>
                          </tr>
                        ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pm-footer">
          <span className="pm-player-id">#{player.id}</span>
          <button className="pm-footer-close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
