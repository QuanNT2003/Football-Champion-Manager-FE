import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Club, TimelineData } from '../types';
import {
  Users,
  DollarSign,
  Compass,
  Trophy,
  Play,
  Share2,
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

  const currentDay = timeline?.season?.current_day || 1;
  const totalDays = timeline?.season?.total_days || 40;
  const seasonNum = timeline?.season?.season_number || 1;
  const cash = club?.financial_accounts?.[0]?.cash_balance ?? club?.finances?.cash ?? 1500000;
  const gold = club?.financial_accounts?.[0]?.gold_balance ?? club?.finances?.gold ?? 200;

  const getClubInitials = (name: string, shortName?: string) => {
    if (shortName && shortName.trim()) return shortName.trim().slice(0, 5);
    const words = name.replace(/[()]/g, '').trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.slice(0, 3).toUpperCase();
  };

  const hasValidLogo = club.logo_url && !logoError && !club.logo_url.includes('default_logo');

  // Format currency
  const formatCompactCash = (amount: number) => {
    if (amount >= 1000000) return (amount / 1000000).toFixed(2) + 'M';
    if (amount >= 1000) return (amount / 1000).toFixed(1) + 'k';
    return amount.toLocaleString();
  };

  return (
    <div className="view-container dashboard-cockpit-canvas">
      {/* =========================================================================
          SECTION 1: CLUB HERO CARD
          ========================================================================= */}
      <section className="cockpit-hero-card">
        {/* Left: Club Crest, Name, League status */}
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
              <div className="hero-crest-placeholder">
                <span>{getClubInitials(club.name, club.short_name)}</span>
              </div>
            )}
          </div>

          <div className="hero-club-identity">
            <div className="flex items-center gap-2">
              <h2 className="hero-club-name">{club.name}</h2>
              <button
                className="btn-share-club"
                onClick={() => alert(t('dashboard.share_club', 'Chia sẻ CLB {name}').replace('{name}', club.name))}
                title={t('dashboard.share_tooltip', 'Chia sẻ thông tin CLB')}
              >
                <Share2 size={13} />
              </button>
            </div>

            <div className="hero-club-badges-row">
              <span className="badge-league-rank">
                3rd <strong className="text-emerald">A.1</strong>
              </span>
              <span className="bullet-sep">•</span>
              <span className="badge-match-countdown">
                {t('dashboard.hero.next_match_in')} <strong>4 {t('dashboard.hero.hours')}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Center: Season & Next Opponent Quick Pill */}
        <div className="hero-match-pill-center">
          <div className="match-pill-season">
            <span>{t('cockpit.season')} {seasonNum} • {t('cockpit.day')} {currentDay}/{totalDays}</span>
          </div>
          <div className="match-pill-opponent">
            <span className="opponent-prefix">{t('common.vs')}</span>
            <strong className="opponent-name">{t('dashboard.mock_opponent', 'Tuần Giáo')}</strong>
            <span className="opponent-flag">⚡</span>
          </div>
        </div>

        {/* Right: Dual Meters (Popularity & Morale) + Financial Quick View */}
        <div className="hero-club-meters-right">
          <div className="meters-currencies-row">
            <div className="meter-curr-chip">
              <DollarSign size={13} className="text-emerald" />
              <span>€{formatCompactCash(Number(cash))}</span>
            </div>
            <div className="meter-curr-chip gold">
              <span className="text-amber">🪙</span>
              <span>{Number(gold).toLocaleString()}</span>
            </div>
          </div>

          {/* Dual Meters */}
          <div className="dual-progress-meters">
            {/* Meter 1: Club Popularity */}
            <div className="progress-meter-col">
              <div className="meter-label-row">
                <span className="meter-title">{t('dashboard.hero.popularity')}</span>
                <span className="meter-val-pct">65.8%</span>
              </div>
              <div className="meter-track">
                <div className="meter-fill green" style={{ width: '65.8%' }} />
              </div>
            </div>

            {/* Meter 2: Team Morale */}
            <div className="progress-meter-col">
              <div className="meter-label-row">
                <span className="meter-title">{t('dashboard.hero.morale')}</span>
                <span className="meter-val-pct orange">93%</span>
              </div>
              <div className="meter-track">
                <div className="meter-fill orange" style={{ width: '93%' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stay Updated Banner - Tạm ẩn theo yêu cầu */}
      {/* Spotlight Tournament Widget - Tạm ẩn theo yêu cầu */}

      {/* =========================================================================
          SECTION 4: 2-COLUMN MAIN COCKPIT (Next Match & Competitions Overview)
          ========================================================================= */}
      <section className="cockpit-match-comps-grid">
        {/* Left Column: Next Match Visual Stadium Pitch Card */}
        <div className="next-match-card-stadium">
          <div className="stadium-card-header">
            <div className="flex items-center gap-2">
              <span className="text-emerald font-black">⏩</span>
              <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wide">{t('dashboard.match.next_match')}</h4>
            </div>
            <span className="stadium-comp-tag">{t('dashboard.match.league_match')}</span>
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
                  <span>⭐</span>
                </div>
                <strong className="pitch-team-name">{t('dashboard.mock_opponent', 'Tuần Giáo')}</strong>
                <span className="pitch-home-away-pill">{t('common.home')}</span>
              </div>

              {/* Center Clash Time / Countdown */}
              <div className="pitch-clash-box">
                <span className="clash-vs-text">{t('common.vs')}</span>
                <span className="clash-countdown">4 {t('dashboard.hero.hours')}</span>
                <span className="clash-date-time">{t('dashboard.hero.ready')}</span>
              </div>

              {/* Away Team (Your Club) */}
              <div className="pitch-team-box away">
                <div className="pitch-crest-badge away">
                  {hasValidLogo ? (
                    <img src={club.logo_url} alt="" className="pitch-away-img" />
                  ) : (
                    <span>⚽</span>
                  )}
                </div>
                <strong className="pitch-team-name">{club.name}</strong>
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

          {/* Last Match Score Strip */}
          <div className="stadium-last-match-strip">
            <span className="text-xs text-slate-500 font-semibold">{t('dashboard.match.last_match')}:</span>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-slate-700">{club.name}</span>
              <span className="last-score-pill">3 - 2</span>
              <span className="font-bold text-slate-700">{t('dashboard.mock_team_2', 'Cẩm Lộ')}</span>
            </div>
            <span className="text-[11px] text-slate-400">{t('dashboard.league_tier', 'VĐQG')}</span>
          </div>
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
              {/* Comp 1: National League */}
              <div className="comp-list-item" onClick={() => navigate('/standings')}>
                <div className="comp-trophy-icon gold">🏆</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-sm font-bold text-slate-800">{t('dashboard.comp.nat_league')}</strong>
                    <span className="text-xs font-bold text-emerald">{t('common.rank')} 3</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mt-0.5">
                    <span>{club.country || t('common.vietnam', 'Việt Nam')}</span>
                    <span className="font-semibold text-slate-700">17 {t('common.points')}</span>
                  </div>
                </div>
              </div>

              {/* Comp 2: National Cup */}
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

              {/* Comp 3: Continental Cup */}
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
              <strong className="metric-val text-slate-800">49.3</strong>
              <span className="metric-sub">{t('dashboard.comp.avg_ovr')}</span>
            </div>
            <div className="metric-divider" />
            <div className="metric-col">
              <strong className="metric-val text-slate-800">16</strong>
              <span className="metric-sub">{t('dashboard.comp.players_count')}</span>
            </div>
            <div className="metric-divider" />
            <div className="metric-col">
              <strong className="metric-val text-emerald">93%</strong>
              <span className="metric-sub">{t('dashboard.comp.team_morale')}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
