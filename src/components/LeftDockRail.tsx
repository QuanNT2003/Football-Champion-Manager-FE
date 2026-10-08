import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Compass,
  Dumbbell,
  Briefcase,
  Building2,
  Coins,
  Swords,
  Radio,
} from 'lucide-react';
import { useTranslation } from '../i18n';

interface Props {
  squadCount?: number;
}

export const LeftDockRail: React.FC<Props> = ({ squadCount = 16 }) => {
  const { t } = useTranslation();

  return (
    <aside className="left-dock-rail">
      {/* Top Club Home Anchor */}
      <NavLink to="/dashboard" className="dock-logo-btn" title={t('nav.dock.dashboard')}>
        <div className="dock-logo-inner">
          <span className="dock-logo-crest">⚽</span>
        </div>
      </NavLink>

      {/* Club Navigation Icons (Menu Thuộc Về Câu Lạc Bộ) */}
      <nav className="dock-nav-list">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `dock-item ${isActive ? 'active' : ''}`}
          title={t('nav.dock.dashboard')}
        >
          <div className="dock-icon-box">
            <LayoutDashboard size={20} />
          </div>
          <span className="dock-item-label">{t('nav.dock.dashboard')}</span>
        </NavLink>

        <NavLink
          to="/squad"
          className={({ isActive }) => `dock-item ${isActive ? 'active' : ''}`}
          title={`${t('nav.dock.squad')} (${squadCount})`}
        >
          <div className="dock-icon-box">
            <Users size={20} />
            {squadCount > 0 && <span className="dock-badge">{squadCount}</span>}
          </div>
          <span className="dock-item-label">{t('nav.dock.squad')}</span>
        </NavLink>

        <NavLink
          to="/tactics"
          className={({ isActive }) => `dock-item ${isActive ? 'active' : ''}`}
          title={t('nav.dock.tactics')}
        >
          <div className="dock-icon-box">
            <Compass size={20} />
          </div>
          <span className="dock-item-label">{t('nav.dock.tactics')}</span>
        </NavLink>

        <NavLink
          to="/training"
          className={({ isActive }) => `dock-item ${isActive ? 'active' : ''}`}
          title={t('nav.dock.training')}
        >
          <div className="dock-icon-box">
            <Dumbbell size={20} />
          </div>
          <span className="dock-item-label">{t('nav.dock.training')}</span>
        </NavLink>

        <NavLink
          to="/staff"
          className={({ isActive }) => `dock-item ${isActive ? 'active' : ''}`}
          title={t('nav.dock.staff')}
        >
          <div className="dock-icon-box">
            <Briefcase size={20} />
          </div>
          <span className="dock-item-label">{t('nav.dock.staff')}</span>
        </NavLink>

        <NavLink
          to="/facilities"
          className={({ isActive }) => `dock-item ${isActive ? 'active' : ''}`}
          title={t('nav.dock.facilities')}
        >
          <div className="dock-icon-box">
            <Building2 size={20} />
          </div>
          <span className="dock-item-label">{t('nav.dock.facilities')}</span>
        </NavLink>

        <NavLink
          to="/finances"
          className={({ isActive }) => `dock-item ${isActive ? 'active' : ''}`}
          title={t('nav.dock.finances')}
        >
          <div className="dock-icon-box">
            <Coins size={20} />
          </div>
          <span className="dock-item-label">{t('nav.dock.finances')}</span>
        </NavLink>

        <NavLink
          to="/matches"
          className={({ isActive }) => `dock-item ${isActive ? 'active' : ''}`}
          title={t('nav.dock.matches')}
        >
          <div className="dock-icon-box">
            <Swords size={20} />
          </div>
          <span className="dock-item-label">{t('nav.dock.matches')}</span>
        </NavLink>
      </nav>

      {/* Bottom Social & Match Engine Live Indicator */}
      <div className="dock-bottom-section">
        <div className="dock-divider" />
        
        {/* Social Icons */}
        <div className="dock-social-group">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noreferrer"
            className="dock-social-btn fb"
            title="Facebook"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </a>
          <a
            href="https://discord.com"
            target="_blank"
            rel="noreferrer"
            className="dock-social-btn discord"
            title="Discord"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
          </a>
        </div>

        {/* Live Radar Icon */}
        <div className="dock-live-indicator" title={t('dock.server_live', 'Máy chủ Match Engine: Trực tuyến (Real-time)')}>
          <Radio size={16} className="dock-live-radar" />
        </div>
      </div>
    </aside>
  );
};
