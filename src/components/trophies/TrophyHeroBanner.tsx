import React from 'react';
import { Club } from '../../types';
import { Trophy, Medal, Award, Crown } from 'lucide-react';
import { useTranslation } from '../../i18n';

interface TrophyHeroBannerProps {
  club: Club | null;
  championsCount: number;
  runnerUpsCount: number;
  thirdPlaceCount: number;
}

export const TrophyHeroBanner: React.FC<TrophyHeroBannerProps> = ({
  club,
  championsCount,
  runnerUpsCount,
  thirdPlaceCount,
}) => {
  const { t } = useTranslation();

  const getInitials = (name?: string) => {
    if (!name) return 'FC';
    const words = name.replace(/[()]/g, '').trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const foundedYear = (club as any)?.founded_year || 2026;

  return (
    <section className="trophy-hero-banner">
      <div className="trophy-hero-left">
        <div className="trophy-crest-wrapper">
          {club?.logo_url && !club.logo_url.includes('default_logo') ? (
            <img src={club.logo_url} alt={club.name} className="trophy-crest-img" />
          ) : (
            <div className="trophy-crest-fallback">
              <span className="crest-initials">{getInitials(club?.name)}</span>
              <Crown size={12} className="crest-crown-icon" />
            </div>
          )}
        </div>

        <div className="trophy-identity-info">
          <div className="flex items-center gap-2">
            <span className="trophy-header-badge">{t('trophies.cabinet_title')}</span>
            <span className="trophy-est-pill">{t('trophies.founded_year', { year: foundedYear })}</span>
          </div>
          <h1 className="trophy-club-title">{club?.name || 'Câu Lạc Bộ Bóng Đá'}</h1>
          <p className="trophy-club-subtitle">{t('trophies.cabinet_subtitle')}</p>
        </div>
      </div>

      <div className="trophy-hero-stats">
        <div className="trophy-stat-card champion">
          <div className="stat-icon-wrap gold">
            <Trophy size={20} />
          </div>
          <div className="stat-text-col">
            <span className="stat-count-num">{championsCount}</span>
            <span className="stat-count-label">{t('trophies.stat_champions')}</span>
          </div>
        </div>

        <div className="trophy-stat-card runnerup">
          <div className="stat-icon-wrap silver">
            <Medal size={20} />
          </div>
          <div className="stat-text-col">
            <span className="stat-count-num">{runnerUpsCount}</span>
            <span className="stat-count-label">{t('trophies.stat_runners_up')}</span>
          </div>
        </div>

        <div className="trophy-stat-card bronze">
          <div className="stat-icon-wrap bronze">
            <Award size={20} />
          </div>
          <div className="stat-text-col">
            <span className="stat-count-num">{thirdPlaceCount}</span>
            <span className="stat-count-label">{t('trophies.stat_third_place')}</span>
          </div>
        </div>
      </div>
    </section>
  );
};
