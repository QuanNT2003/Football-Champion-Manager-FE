import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  Trophy,
  ShoppingCart,
  Globe,
  Handshake,
  MessageSquare,
  Search,
  Bell,
  CheckSquare,
  Mail,
  UserCheck,
  LogOut,
  Clock,
  Shield,
  Plus,
  DollarSign,
  Coins,
  Check,
} from 'lucide-react';
import { User, Club, TimelineData } from '../types';
import { useTranslation } from '../i18n';

interface NavbarProps {
  user: User | null;
  club: Club | null;
  timeline?: TimelineData | null;
  seasonNum?: number;
  currentDay?: number;
  totalDays?: number;
  onLogout?: () => void;
  onOpenLogin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  club,
  timeline,
  seasonNum: seasonNumProp,
  currentDay: currentDayProp,
  totalDays: totalDaysProp,
  onLogout,
  onOpenLogin,
}) => {
  const navigate = useNavigate();
  const { t, language, setLanguage, languages, currentLanguageOption } = useTranslation();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [showWorldModal, setShowWorldModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  // Live ticking clock (Kickoff Boss style)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}:${seconds}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const seasonNum = timeline?.season?.season_number || seasonNumProp || 1;
  const currentDay = timeline?.season?.current_day || currentDayProp || 8;
  const totalDays = timeline?.season?.total_days || totalDaysProp || 34;

  const cash = club?.financial_accounts?.[0]?.cash_balance ?? club?.finances?.cash ?? 1980000;
  const gold = club?.financial_accounts?.[0]?.gold_balance ?? club?.finances?.gold ?? 4010;

  const formatCompactCash = (val: number) => {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(2)}M`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K`;
    return String(val);
  };

  return (
    <header className="cockpit-header">
      {/* =========================================================================
          TIER 1: COCKPIT QUICKBAR (Search, Clock, Currency, Alerts, Profile)
          ========================================================================= */}
      <div className="cockpit-top-bar">
        {/* Left Section: Search & Live Clock */}
        <div className="cockpit-left-group">
          {/* Brand Title */}
          <Link to="/dashboard" className="cockpit-brand-pill">
            <span className="brand-dot-pulse" />
            <span className="cockpit-brand-name">FOOTBALL CHAMPION</span>
          </Link>

          {/* Quick Search Box */}
          <div className="cockpit-search-box">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              placeholder={t('cockpit.search_placeholder')}
              className="cockpit-search-input"
            />
            <kbd className="search-shortcut-kbd">Ctrl K</kbd>
          </div>

          {/* Live Real-time Clock */}
          <div className="cockpit-live-clock" title={t('navbar.clock_tooltip', 'Thời gian thực hệ thống (UTC+7)')}>
            <Clock size={13} className="text-emerald" />
            <span className="clock-digits">{currentTime || '09:26:36'}</span>
          </div>

          {/* Season & Day Indicator */}
          <div className="cockpit-season-badge">
            <span>{t('cockpit.season')} {seasonNum} • {t('cockpit.day')} {currentDay}/{totalDays}</span>
          </div>
        </div>

        {/* Right Section: Currencies, Notifications, Language, User */}
        <div className="cockpit-right-group">
          {/* Income Pill */}
          <Link to="/finances" className="cockpit-income-pill" title={t('navbar.income_tooltip', 'Doanh thu & Báo cáo tài chính')}>
            <span className="income-dot" />
            <span>{t('cockpit.income')}</span>
          </Link>

          {/* Cash Balance */}
          <div className="cockpit-currency-pill cash">
            <DollarSign size={14} className="text-emerald" />
            <span className="curr-val">€{formatCompactCash(Number(cash))}</span>
            <Link to="/finances" className="curr-add-btn" title={t('navbar.cash_add_tooltip', 'Nạp / Quản lý ngân sách')}>
              <Plus size={11} />
            </Link>
          </div>

          {/* Gold Balance */}
          <div className="cockpit-currency-pill gold">
            <Coins size={14} className="text-amber" />
            <span className="curr-val">{Number(gold).toLocaleString()}</span>
            <Link to="/finances" className="curr-add-btn gold" title={t('navbar.gold_shop_tooltip', 'Đổi vàng / Shop')}>
              <Plus size={11} />
            </Link>
          </div>

          {/* Language Switcher */}
          <div className="language-switcher-wrap">
            <button
              type="button"
              className="lang-toggle-btn"
              onClick={() => setShowLangMenu(!showLangMenu)}
              title={t('cockpit.switch_lang')}
            >
              <span className="text-sm leading-none">{currentLanguageOption.flag}</span>
              <span className="text-xs font-bold text-slate-700 uppercase">{language}</span>
              <Globe size={12} className="text-slate-400" />
            </button>

            {showLangMenu && (
              <div className="lang-dropdown-menu">
                {languages.map((langOpt) => (
                  <button
                    key={langOpt.code}
                    type="button"
                    className={`lang-menu-item ${language === langOpt.code ? 'active' : ''}`}
                    onClick={() => {
                      setLanguage(langOpt.code);
                      setShowLangMenu(false);
                    }}
                  >
                    <span className="text-base">{langOpt.flag}</span>
                    <span className="text-xs font-semibold">{langOpt.name}</span>
                    {language === langOpt.code && <Check size={13} className="text-emerald ml-auto" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications / Alerts Button */}
          <button
            className="cockpit-icon-btn alert-btn"
            onClick={() => setShowAlertModal(!showAlertModal)}
            title={t('navbar.alerts_tooltip', 'Thông báo mới (Alerts)')}
          >
            <Bell size={15} />
            <span className="btn-label-text">{t('cockpit.alerts')}</span>
            <span className="alert-count-badge">1</span>
          </button>

          {/* Tasks Button */}
          <Link to="/facilities" className="cockpit-icon-btn" title={t('navbar.missions_tooltip', 'Nhiệm vụ & Mục tiêu CLB')}>
            <CheckSquare size={15} />
            <span className="btn-label-text">{t('cockpit.tasks')}</span>
          </Link>

          {/* Messages Button */}
          <button className="cockpit-icon-btn" title={t('navbar.inbox_tooltip', 'Hộp thư HLV')}>
            <Mail size={15} />
            <span className="btn-label-text">{t('cockpit.messages')}</span>
            <span className="subtle-zero-badge">0</span>
          </button>

          {/* User Profile / Logout */}
          {user ? (
            <div className="cockpit-user-card">
              <div className="user-avatar-circle">
                <UserCheck size={14} className="text-emerald" />
              </div>
              <div className="user-info-text">
                <span className="user-title-sub">HLV</span>
                <span className="user-name-bold">{user.username}</span>
              </div>
              {onLogout && (
                <button
                  className="cockpit-logout-btn"
                  onClick={onLogout}
                  title={t('cockpit.logout')}
                >
                  <LogOut size={13} />
                </button>
              )}
            </div>
          ) : (
            <button className="btn-cockpit-login" onClick={onOpenLogin}>
              <Shield size={14} />
              <span>{t('navbar.login', 'ĐĂNG NHẬP')}</span>
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          TIER 2: EXTERNAL NAV MENU
          ========================================================================= */}
      <nav className="external-nav-bar">
        <div className="external-nav-container">
          <NavLink
            to="/standings"
            className={({ isActive }) => `ext-nav-link ${isActive ? 'active' : ''}`}
          >
            <Trophy size={15} className="ext-icon" />
            <span>{t('nav.ext.federation')}</span>
            <span className="dropdown-caret">▾</span>
          </NavLink>

          <NavLink
            to="/transfers"
            className={({ isActive }) => `ext-nav-link ${isActive ? 'active' : ''}`}
          >
            <ShoppingCart size={15} className="ext-icon" />
            <span>{t('nav.ext.markets')}</span>
            <span className="dropdown-caret">▾</span>
          </NavLink>

          {/* THẾ GIỚI (WORLD) - Tạm ẩn theo yêu cầu */}

          {/* BẢNG XẾP HẠNG (RANKINGS) - Tạm ẩn theo yêu cầu */}

          <NavLink
            to="/finances"
            className="ext-nav-link"
          >
            <Handshake size={15} className="ext-icon" />
            <span>{t('nav.ext.partners')}</span>
            <span className="dropdown-caret">▾</span>
          </NavLink>

          <div className="ext-nav-link community-link">
            <MessageSquare size={15} className="ext-icon" />
            <span>{t('nav.ext.community')}</span>
            <span className="dropdown-caret">▾</span>
          </div>
        </div>
      </nav>

      {/* Quick World Modal Preview */}
      {showWorldModal && (
        <div className="modal-overlay" onClick={() => setShowWorldModal(false)}>
          <div className="modal-container-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <div className="flex items-center gap-2">
                <Globe className="text-emerald" size={20} />
                <h3 className="text-lg font-bold">{t('navbar.world_leagues_title', 'HỆ THỐNG THẾ GIỚI 96 QUỐC GIA (WORLD LEAGUES)')}</h3>
              </div>
              <button className="btn-close-modal" onClick={() => setShowWorldModal(false)}>✕</button>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-sm text-slate-600">
                {t('navbar.world_leagues_desc', 'Football Champion quy tụ 96 quốc gia trải khắp 5 châu lục, mỗi quốc gia gồm 4 hạng đấu (Tier 1-4) cùng Cúp Quốc Gia và Cúp Châu Lục (C1, C2, C3).')}
              </p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <strong className="block text-emerald-700">{t('navbar.confed_uefa', 'Châu Âu (UEFA)')}</strong>
                  <span>{t('navbar.confed_uefa_sample', 'Anh, Pháp, Đức, Tây Ban Nha, Ý, Bồ Đào Nha...')}</span>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <strong className="block text-emerald-700">{t('navbar.confed_americas', 'Châu Mỹ (CONMEBOL/CONCACAF)')}</strong>
                  <span>Brazil, Argentina, Colombia, Uruguay, Mexico...</span>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <strong className="block text-emerald-700">{t('navbar.confed_afc', 'Châu Á (AFC)')}</strong>
                  <span>{t('navbar.confed_afc_sample', 'Việt Nam, Nhật Bản, Hàn Quốc, Ả Rập Xê Út...')}</span>
                </div>
              </div>
              <div className="pt-2 flex justify-end">
                <button
                  className="btn-primary"
                  onClick={() => {
                    setShowWorldModal(false);
                    navigate('/standings');
                  }}
                >
                  {t('navbar.go_standings', 'Đến Bảng Xếp Hạng Giải Đấu →')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Alerts Notification Dropdown/Popup */}
      {showAlertModal && (
        <div className="alerts-dropdown-box">
          <div className="alerts-dropdown-header">
            <strong>{t('navbar.notif_title', 'Thông báo trận đấu & Chuyển nhượng')}</strong>
            <button onClick={() => setShowAlertModal(false)}>✕</button>
          </div>
          <div className="alerts-dropdown-body">
            <div className="alert-item unread">
              <span className="alert-dot" />
              <div>
                <p className="font-semibold text-xs text-slate-800">{t('navbar.market_open_title', 'Thị trường chuyển nhượng Mùa {season} đang mở').replace('{season}', String(seasonNum))}</p>
                <span className="text-[11px] text-slate-500">{t('navbar.market_open_desc', 'Hàng ngàn cầu thủ và ban huấn luyện đã sẵn sàng đàm phán hợp đồng.')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
