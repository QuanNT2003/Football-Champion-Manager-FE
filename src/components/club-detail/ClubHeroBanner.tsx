import React from 'react';
import {
  Trophy,
  Calendar,
  Building2,
  Award,
  Sparkles,
  Activity,
  Users,
  Bot,
  UserCheck,
} from 'lucide-react';
import { Club } from '../../types';
import { useTranslation } from '../../i18n';
import { useTournamentLocale } from '../../utils/tournamentLocalization';

interface Props {
  club: Club;
}

export const ClubHeroBanner: React.FC<Props> = ({ club }) => {
  const { t } = useTranslation();
  const { comp, subTitle } = useTournamentLocale();

  return (
    <section
      style={{
        background: '#ffffff',
        borderRadius: '20px',
        border: '1.5px solid #e2e8f0',
        boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.06), 0 2px 6px -1px rgba(15, 23, 42, 0.04)',
        position: 'relative',
        overflow: 'hidden',
        padding: '24px 28px',
      }}
    >
      {/* Top Accent Gradient Bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #10b981 0%, #059669 40%, #16a34a 70%, #3b82f6 100%)',
        }}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '28px', alignItems: 'center' }}>
        {/* Left: Crest + Name + Info Pills + Vital Stat Badges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            {/* Crest Box */}
            <div
              style={{
                width: '84px',
                height: '84px',
                borderRadius: '18px',
                background:
                  club.logo_url && !club.logo_url.includes('default_logo')
                    ? '#ffffff'
                    : 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                border: '2px solid #bbf7d0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.2)',
                padding: club.logo_url && !club.logo_url.includes('default_logo') ? '8px' : '0',
              }}
            >
              {club.logo_url && !club.logo_url.includes('default_logo') ? (
                <img
                  src={club.logo_url}
                  alt={club.name}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              ) : (
                <>
                  <span
                    style={{
                      fontSize: '1.45rem',
                      fontWeight: 900,
                      color: '#ffffff',
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase',
                      lineHeight: 1.1,
                    }}
                  >
                    {club.short_name || club.name.slice(0, 3).toUpperCase()}
                  </span>
                  <span style={{ fontSize: '10px', color: '#fef08a', marginTop: '2px' }}>★</span>
                </>
              )}
            </div>

            {/* Club Information */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h1
                  style={{
                    fontSize: '1.85rem',
                    fontWeight: 900,
                    margin: 0,
                    color: '#0f172a',
                    letterSpacing: '-0.5px',
                    lineHeight: 1.2,
                  }}
                >
                  {club.name}
                </h1>
                {club.short_name && (
                  <span
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      padding: '3px 9px',
                      borderRadius: '6px',
                      background: '#ecfdf5',
                      color: '#065f46',
                      border: '1px solid #a7f3d0',
                    }}
                  >
                    {club.short_name}
                  </span>
                )}
              </div>

              {/* Badges row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flexWrap: 'wrap',
                  fontSize: '0.82rem',
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#f8fafc',
                    padding: '4px 11px',
                    borderRadius: '20px',
                    border: '1px solid #e2e8f0',
                    color: '#334155',
                    fontWeight: 600,
                  }}
                >
                  {club.country_detail?.flag_url && (
                    <img
                      src={club.country_detail.flag_url}
                      alt=""
                      style={{ width: '16px', height: '12px', objectFit: 'cover', borderRadius: '2px' }}
                    />
                  )}
                  <span>{subTitle(club.country) || 'Việt Nam'}</span>
                </span>

                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#fefce8',
                    color: '#854d0e',
                    padding: '4px 11px',
                    borderRadius: '20px',
                    fontWeight: 700,
                    border: '1px solid #fef08a',
                  }}
                >
                  <Trophy size={13} style={{ color: '#ca8a04' }} />
                  <span>
                    {comp(club.current_competition?.name || `Tier ${club.current_competition?.tier || 1}`)}
                  </span>
                </span>

                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#f0fdf4',
                    padding: '4px 11px',
                    borderRadius: '20px',
                    border: '1px solid #bbf7d0',
                    color: '#166534',
                    fontWeight: 600,
                  }}
                >
                  <Calendar size={13} style={{ color: '#16a34a' }} />
                  <span>
                    {t('club_detail.founded')}: <strong>{club.founded_year || 1990}</strong>
                  </span>
                </span>

                {club.stadium && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: '#f1f5f9',
                      padding: '4px 11px',
                      borderRadius: '20px',
                      border: '1px solid #cbd5e1',
                      color: '#334155',
                      fontWeight: 600,
                    }}
                  >
                    <Building2 size={13} style={{ color: '#0284c7' }} />
                    <span>
                      {club.stadium.name} ({(club.stadium.capacity || 25000).toLocaleString()}{' '}
                      {t('club_detail.seats')})
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 4 Stat Badges Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '10px',
            }}
          >
            <div
              style={{
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: '12px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: '#fef3c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#d97706',
                  flexShrink: 0,
                }}
              >
                <Award size={18} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: '#92400e',
                    textTransform: 'uppercase',
                  }}
                >
                  {t('club_detail.reputation')}
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#b45309', lineHeight: 1.1 }}>
                  {club.reputation}
                </div>
              </div>
            </div>

            <div
              style={{
                background: '#f0fdfa',
                border: '1px solid #99f6e4',
                borderRadius: '12px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: '#ccfbf1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0d9488',
                  flexShrink: 0,
                }}
              >
                <Sparkles size={18} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: '#115e59',
                    textTransform: 'uppercase',
                  }}
                >
                  {t('club_detail.world_rank')}
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f766e', lineHeight: 1.1 }}>
                  #{club.world_rank || 1}
                </div>
              </div>
            </div>

            <div
              style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '12px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: '#dcfce7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#16a34a',
                  flexShrink: 0,
                }}
              >
                <Activity size={18} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: '#166534',
                    textTransform: 'uppercase',
                  }}
                >
                  {t('club_detail.avg_ovr_label')}
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#15803d', lineHeight: 1.1 }}>
                  {club.avgOvr || 65}
                </div>
              </div>
            </div>

            <div
              style={{
                background: '#faf5ff',
                border: '1px solid #e9d5ff',
                borderRadius: '12px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: '#f3e8ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#9333ea',
                  flexShrink: 0,
                }}
              >
                <Users size={18} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: '#6b21a8',
                    textTransform: 'uppercase',
                  }}
                >
                  {t('club_detail.squad_label')}
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#7e22ce', lineHeight: 1.1 }}>
                  {club.squadCount ?? 0} {t('club_detail.squad_count')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Manager / Owner Card */}
        <div
          style={{
            background: '#f8fafc',
            borderRadius: '16px',
            padding: '18px 22px',
            border: '1.5px solid #e2e8f0',
            minWidth: '260px',
            boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                color: '#64748b',
                letterSpacing: '0.05em',
              }}
            >
              {t('club_detail.manager_owner')}
            </span>
            {club.isAiManaged ? (
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: '#f0f9ff',
                  color: '#0284c7',
                  border: '1px solid #bae6fd',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Bot size={12} /> AI Quản Lý
              </span>
            ) : (
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: '#f0fdf4',
                  color: '#15803d',
                  border: '1px solid #bbf7d0',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <UserCheck size={12} /> {t('club_detail.user_managed')}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: club.isAiManaged
                  ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '1rem',
                color: '#ffffff',
                boxShadow: '0 3px 8px rgba(0,0,0,0.12)',
                flexShrink: 0,
              }}
            >
              {club.manager?.username
                ? club.manager.username.slice(0, 2).toUpperCase()
                : club.isAiManaged
                ? 'AI'
                : 'HLV'}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <strong
                style={{
                  display: 'block',
                  fontSize: '0.96rem',
                  color: '#0f172a',
                  fontWeight: 800,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {club.manager?.username ||
                  (club.isAiManaged ? 'CLB do AI / Liên Đoàn' : 'Ban Huấn Luyện')}
              </strong>
              <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginTop: '2px' }}>
                {club.manager
                  ? t('club_detail.manager_role_user')
                  : club.isAiManaged
                  ? 'Ban Quản Trị Liên Đoàn'
                  : t('club_detail.manager_role_ai')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
