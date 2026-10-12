import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Club, TimelineData, DashboardData } from '../types';
import { clubsApi } from '../services/clubs.service';
import {
  Users,
  DollarSign,
  Compass,
  Trophy,
  Play,
  Share2,
  Loader2,
} from 'lucide-react';
import { useTranslation } from '../i18n';

interface Props {
  club: Club | null;
  timeline: TimelineData | null;
  onUpgradeFacility?: (facilityId: string) => void;
  onSwitchTab?: (tab: string) => void;
}

export const DashboardView: React.FC<Props> = ({
  club,
  timeline,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [logoError, setLogoError] = useState(false);
  const [activeTabCompetitions, setActiveTabCompetitions] = useState<'comps' | 'friends'>('comps');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch live dashboard data from Backend API
  useEffect(() => {
    let isMounted = true;
    if (club?.id) {
      setIsLoading(true);
      clubsApi
        .getDashboard(club.id)
        .then((data) => {
          if (isMounted) {
            setDashboardData(data);
          }
        })
        .catch((err) => {
          console.warn('Dashboard API error, using club fallback:', err);
        })
        .finally(() => {
          if (isMounted) {
            setIsLoading(false);
          }
        });
    }
    return () => {
      isMounted = false;
    };
  }, [club?.id]);

  if (!club) {
    return (
      <div className="game-empty-state">
        <div className="empty-icon-hex">⚽</div>
        <h3>{t('dashboard.no_club_title', 'CHƯA KÝ HỢP ĐỒNG QUẢN LÝ CLB')}</h3>
        <p>{t('dashboard.no_club_desc', 'Vui lòng nhận chức câu lạc bộ để truy cập Trung tâm Chỉ huy Quản lý.')}</p>
        <button className="btn-primary" onClick={() => navigate('/onboarding')}>
          {t('dashboard.go_onboarding', 'ĐẾN PHÒNG NHẬM CHỨC HLV')}
        </button>
      </div>
    );
  }

  // Fallbacks if data not yet loaded
  const currentDay = dashboardData?.timeline?.current_day || timeline?.season?.current_day || 1;
  const totalDays = dashboardData?.timeline?.total_days || timeline?.season?.total_days || 34;
  const seasonNum = dashboardData?.timeline?.season_number || timeline?.season?.season_number || 1;

  const cash = dashboardData?.club.cash ?? (club?.financial_accounts?.[0]?.cash_balance ?? club?.finances?.cash ?? 1500000);
  const gold = dashboardData?.club.gold ?? (club?.financial_accounts?.[0]?.gold_balance ?? club?.finances?.gold ?? 200);

  const popularity = dashboardData?.club.popularity ?? 68.5;
  const teamMorale = dashboardData?.club.team_morale ?? 93;
  const avgOvr = dashboardData?.metrics.avg_ovr ?? 49.3;
  const playersCount = dashboardData?.metrics.players_count ?? 16;
  const leagueRank = dashboardData?.club.league_rank ?? 3;
  const tierLabel = dashboardData?.club.tier_label ?? 'A.1';

  const nextMatch = dashboardData?.next_match;
  const lastMatch = dashboardData?.last_match;

  const getClubInitials = (name: string, shortName?: string) => {
    if (shortName && shortName.trim()) return shortName.trim().slice(0, 5);
    const words = name.replace(/[()]/g, '').trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.slice(0, 3).toUpperCase();
  };

  const hasValidLogo = club.logo_url && !logoError && !club.logo_url.includes('default_logo');

  // Format kickoff time (e.g. 1970-01-01T20:00:00.000Z -> 20:00)
  const formatKickoffTime = (timeStr?: string | null) => {
    if (!timeStr) return '20:00';
    if (timeStr.includes('T')) {
      const timePart = timeStr.split('T')[1];
      return timePart ? timePart.slice(0, 5) : '20:00';
    }
    if (timeStr.includes(':')) {
      return timeStr.slice(0, 5);
    }
    return String(timeStr);
  };


  // Format currency
  const formatCompactCash = (amount: number) => {
    if (amount >= 1000000) return (amount / 1000000).toFixed(2) + 'M';
    if (amount >= 1000) return (amount / 1000).toFixed(1) + 'k';
    return amount.toLocaleString();
  };

  return (
    <div className="view-container dashboard-cockpit-canvas">
      {/* Loading bar indicator if syncing */}
      {isLoading && (
        <div className="flex items-center gap-2 text-xs text-slate-500 py-1 px-3 bg-emerald-50 rounded-lg border border-emerald-200">
          <Loader2 size={13} className="animate-spin text-emerald-600" />
          <span>{t('common.syncing_data', 'Đang đồng bộ dữ liệu thời gian thực từ máy chủ...')}</span>
        </div>
      )}

      {/* =========================================================================
          SECTION 1: CLUB HERO CARD (STADIUM DASHBOARD BANNER)
          ========================================================================= */}
      <section className="cockpit-hero-card">
        {/* Left: Club Crest, Name, League Rank & Countdown */}
        <div className="hero-club-left">
          <div className="hero-crest-box">
            {hasValidLogo ? (
              <img
                src={club.logo_url}
                alt={club.name}
                onError={() => setLogoError(true)}
                className="hero-crest-img"
              />
            ) : (
              <div className="hero-crest-badge-styled">
                <span className="crest-initials">{getClubInitials(club.name, club.short_name)}</span>
                <span className="crest-star">★</span>
              </div>
            )}
          </div>

          <div className="hero-club-info">
            <div className="hero-name-row">
              <h2 className="hero-club-title">{club.name}</h2>
              <button
                className="btn-share-club"
                onClick={() => alert(t('dashboard.share_club', 'Chia sẻ CLB {name}').replace('{name}', club.name))}
                title={t('dashboard.share_tooltip', 'Chia sẻ thông tin CLB')}
              >
                <Share2 size={13} />
              </button>
            </div>

            <div className="hero-pills-row">
              <span className="pill-league-rank">
                <span className="rank-badge-icon">🏆</span>
                <span className="rank-text">Hạng {leagueRank}</span>
                <span className="rank-tier-divider">•</span>
                <span className="tier-text">{tierLabel}</span>
              </span>
              <button
                type="button"
                className="pill-trophies-link"
                onClick={() => navigate('/trophies')}
                title="Mở phòng truyền thống & Tủ cúp CLB"
              >
                <span>🏆</span>
                <span>Tủ cúp <strong>({dashboardData?.club.trophies_count ?? 0})</strong></span>
              </button>
              <span className="pill-match-time">
                <span className="pill-dot" />
                <span>Trận tới: <strong>{formatKickoffTime(nextMatch?.kickoff_time)}</strong> (Ngày {nextMatch?.season_day || 3})</span>
              </span>
            </div>
          </div>
        </div>

        {/* Center: Matchday Status & Opponent Clash Box */}
        <div className="hero-clash-widget">
          <div className="clash-widget-header">
            <span className="clash-season-tag">MÙA {seasonNum}</span>
            <span className="clash-dot">•</span>
            <span className="clash-day-tag">NGÀY {currentDay} / {totalDays}</span>
          </div>
          <div className="clash-widget-opponent">
            <span className="clash-vs-badge">VS</span>
            <span className="clash-opponent-name" title={nextMatch?.opponent?.name}>
              {nextMatch?.opponent?.name || 'Chưa xếp lịch'}
            </span>
            <span className="clash-venue-badge">
              {nextMatch?.is_home ? 'Sân nhà 🏠' : 'Sân khách ✈️'}
            </span>
          </div>
        </div>

        {/* Right: Financial Status & Vital Club Meters */}
        <div className="hero-club-right">
          {/* Financial Chips */}
          <div className="hero-finances-row">
            <div className="hero-fin-chip cash">
              <span className="fin-icon-wrap cash">€</span>
              <span className="fin-val">{formatCompactCash(Number(cash))}</span>
            </div>
            <div className="hero-fin-chip gold">
              <span className="fin-icon-wrap gold">🪙</span>
              <span className="fin-val">{Number(gold).toLocaleString()}</span>
            </div>
          </div>

          {/* Progress Meters */}
          <div className="hero-meters-container">
            {/* Meter 1: Popularity */}
            <div className="hero-meter-item">
              <div className="meter-header">
                <span className="meter-name">Độ nổi tiếng CLB</span>
                <span className="meter-number">{popularity}%</span>
              </div>
              <div className="meter-track-bar">
                <div
                  className="meter-fill-bar popularity"
                  style={{ width: `${Math.min(100, Math.max(0, popularity))}%` }}
                />
              </div>
            </div>

            {/* Meter 2: Morale */}
            <div className="hero-meter-item">
              <div className="meter-header">
                <span className="meter-name">Tinh thần đội bóng</span>
                <span className="meter-number">{teamMorale}%</span>
              </div>
              <div className="meter-track-bar">
                <div
                  className="meter-fill-bar morale"
                  style={{ width: `${Math.min(100, Math.max(0, teamMorale))}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: STADIUM MATCH & COMPETITIONS OVERVIEW
          ========================================================================= */}
      <section className="cockpit-match-comps-grid">
        {/* Left Column: Next Match Stadium Pitch Card */}
        <div className="next-match-card-stadium">
          <div className="stadium-card-header">
            <div className="flex items-center gap-2">
              <span className="text-emerald font-black">⏩</span>
              <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wide">{t('dashboard.match.next_match')}</h4>
            </div>
            <span className="stadium-comp-tag">{nextMatch?.competition_name || t('dashboard.match.league_match')}</span>
          </div>

          {/* Stadium Pitch Canvas */}
          <div className="stadium-pitch-viewport">
            <div className="pitch-floodlights-glow" />
            <div className="pitch-center-circle" />
            <div className="pitch-center-line" />

            <div className="pitch-teams-stage">
              {/* Home Team */}
              <div className="pitch-team-box home">
                <div className="pitch-crest-badge home">
                  {nextMatch?.home_club?.logo_url && !nextMatch.home_club.logo_url.includes('default_logo') ? (
                    <img src={nextMatch.home_club.logo_url} alt="" className="pitch-away-img" />
                  ) : (
                    <span>⭐</span>
                  )}
                </div>
                <strong className="pitch-team-name">{nextMatch?.home_club?.name || (nextMatch?.is_home ? club.name : 'Tuần Giáo')}</strong>
                <span className="pitch-home-away-pill">{t('common.home')}</span>
              </div>

              {/* Center Clash Time / Countdown */}
              <div className="pitch-clash-box">
                <span className="clash-vs-text">{t('common.vs', 'VS')}</span>
                <span className="clash-countdown">{formatKickoffTime(nextMatch?.kickoff_time)}</span>
                <span className="clash-date-time">Ngày {nextMatch?.season_day || 3} • Sẵn sàng</span>
              </div>

              {/* Away Team */}
              <div className="pitch-team-box away">
                <div className="pitch-crest-badge away">
                  {nextMatch?.away_club?.logo_url && !nextMatch.away_club.logo_url.includes('default_logo') ? (
                    <img src={nextMatch.away_club.logo_url} alt="" className="pitch-away-img" />
                  ) : (
                    <span>⚽</span>
                  )}
                </div>
                <strong className="pitch-team-name">{nextMatch?.away_club?.name || (!nextMatch?.is_home ? club.name : 'Đối thủ')}</strong>
                <span className="pitch-home-away-pill away">{t('common.away')}</span>
              </div>
            </div>

            {/* Stadium Action Buttons */}
            <div className="pitch-action-buttons">
              <button className="btn-full-match-details" onClick={() => navigate('/matches')}>
                <Play size={14} className="fill-current" />
                <span>{t('dashboard.match.details_btn')}</span>
              </button>
              <button className="btn-tactics-quick" onClick={() => navigate('/tactics')}>
                <Compass size={14} />
                <span>{t('dashboard.match.tactics_btn')}</span>
              </button>
            </div>
          </div>

          {/* Last Match Score Strip - 100% Real Data, No Fallback */}
          {lastMatch ? (
            <div className="stadium-last-match-strip">
              <span className="text-xs text-slate-500 font-semibold">{t('dashboard.match.last_match')}:</span>
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-slate-700">{lastMatch.home_club_name}</span>
                <span className="last-score-pill">{lastMatch.home_score} - {lastMatch.away_score}</span>
                <span className="font-bold text-slate-700">{lastMatch.away_club_name}</span>
              </div>
              <span className="text-[11px] text-slate-400">{lastMatch.competition_name}</span>
            </div>
          ) : (
            <div className="stadium-last-match-strip empty">
              <span className="text-xs text-slate-400 italic">Mùa giải mới: Chưa có trận đấu nào diễn ra</span>
            </div>
          )}
        </div>

        {/* Right Column: Competitions List & Club Metrics */}
        <div className="competitions-overview-card">
          <div className="comp-card-tabs">
            <button
              className={`comp-tab-btn ${activeTabCompetitions === 'comps' ? 'active' : ''}`}
              onClick={() => setActiveTabCompetitions('comps')}
            >
              <Trophy size={14} />
              <span>{t('dashboard.comp.tab_competitions')}</span>
            </button>
            <button
              className={`comp-tab-btn ${activeTabCompetitions === 'friends' ? 'active' : ''}`}
              onClick={() => setActiveTabCompetitions('friends')}
            >
              <Users size={14} />
              <span>{t('dashboard.comp.tab_friends')}</span>
            </button>
          </div>

          {activeTabCompetitions === 'comps' ? (
            <div className="comp-list-content">
              {dashboardData?.competitions && dashboardData.competitions.length > 0 ? (
                dashboardData.competitions.map((comp) => (
                  <div key={comp.id} className="comp-list-item" onClick={() => navigate('/standings')}>
                    <div className={`comp-trophy-icon ${comp.color || 'gold'}`}>{comp.icon || '🏆'}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-sm font-bold text-slate-800">{comp.name}</strong>
                        <span className={`text-xs font-bold ${comp.color === 'blue' ? 'text-cyan' : comp.color === 'amber' ? 'text-amber' : 'text-emerald'}`}>
                          {comp.round_label || (comp.rank ? `${t('common.rank')} ${comp.rank}` : comp.status_label)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500 mt-0.5">
                        <span>{comp.sub_title}</span>
                        <span className="font-semibold text-slate-700">
                          {comp.points !== undefined ? `${comp.points} ${t('common.points')}` : comp.status_label}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  {/* Default Comp 1: National League */}
                  <div className="comp-list-item" onClick={() => navigate('/standings')}>
                    <div className="comp-trophy-icon gold">🏆</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-sm font-bold text-slate-800">{t('dashboard.comp.nat_league')}</strong>
                        <span className="text-xs font-bold text-emerald">{t('common.rank')} {leagueRank}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500 mt-0.5">
                        <span>{club.country || t('common.vietnam', 'Việt Nam')}</span>
                        <span className="font-semibold text-slate-700">{dashboardData?.club.league_points || 17} {t('common.points')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Default Comp 2: National Cup */}
                  <div className="comp-list-item" onClick={() => navigate('/standings')}>
                    <div className="comp-trophy-icon amber">🏆</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-sm font-bold text-slate-800">{t('dashboard.comp.nat_cup')}</strong>
                        <span className="text-xs font-bold text-amber">{t('dashboard.comp.round_32')}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500 mt-0.5">
                        <span>Knockout</span>
                        <span className="font-semibold text-slate-700">LIVE</span>
                      </div>
                    </div>
                  </div>

                  {/* Default Comp 3: Continental Cup */}
                  <div className="comp-list-item" onClick={() => navigate('/standings')}>
                    <div className="comp-trophy-icon blue">🌍</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-sm font-bold text-slate-800">{t('dashboard.comp.intl_cup')}</strong>
                        <span className="text-xs font-bold text-cyan">{t('dashboard.comp.qualifying')}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500 mt-0.5">
                        <span>Group C</span>
                        <span className="font-semibold text-slate-700">Qualifiers</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="comp-list-content">
              <div className="p-4 text-center text-xs text-slate-500">
                <Users size={24} className="mx-auto mb-2 text-slate-400" />
                <p>Connect with other managers to play friendlies!</p>
              </div>
            </div>
          )}

          {/* Bottom 3 Club Key Metrics (Quality OVR, Players, Team Morale) */}
          <div className="comp-bottom-metrics-row">
            <div className="metric-col">
              <strong className="metric-val text-slate-800">{avgOvr}</strong>
              <span className="metric-sub">{t('dashboard.comp.avg_ovr')}</span>
            </div>
            <div className="metric-divider" />
            <div className="metric-col">
              <strong className="metric-val text-slate-800">{playersCount}</strong>
              <span className="metric-sub">{t('dashboard.comp.players_count')}</span>
            </div>
            <div className="metric-divider" />
            <div className="metric-col">
              <strong className="metric-val text-emerald">{teamMorale}%</strong>
              <span className="metric-sub">{t('dashboard.comp.team_morale')}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
