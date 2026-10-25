import React, { useState } from 'react';
import {
  Trophy,
  Calendar,
  Clock,
  Loader2,
} from 'lucide-react';
import { Club, ClubMatchItem } from '../../types';
import { useTranslation } from '../../i18n';
import { useTournamentLocale } from '../../utils/tournamentLocalization';

interface Props {
  matches: ClubMatchItem[];
  loadingMatches: boolean;
  club: Club;
}

export const ClubMatchesTab: React.FC<Props> = ({
  matches,
  loadingMatches,
  club,
}) => {
  const { t } = useTranslation();
  const { comp } = useTournamentLocale();
  const [matchFilter, setMatchFilter] = useState<'all' | 'home' | 'away' | 'finished' | 'scheduled'>('all');

  const filteredMatches = matches.filter((m) => {
    if (matchFilter === 'home') return m.is_home;
    if (matchFilter === 'away') return !m.is_home;
    if (matchFilter === 'finished') return m.status === 'FINISHED' || m.status === 'COMPLETED';
    if (matchFilter === 'scheduled') return m.status !== 'FINISHED' && m.status !== 'COMPLETED';
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Bộ lọc trận đấu */}
      <div
        className="glass-panel"
        style={{
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {(
            [
              { id: 'all', label: t('club_detail.all_matches') },
              { id: 'home', label: `${t('club_detail.home_matches')} 🏠` },
              { id: 'away', label: `${t('club_detail.away_matches')} ✈️` },
              { id: 'finished', label: t('club_detail.finished_matches') },
              { id: 'scheduled', label: t('club_detail.scheduled_matches') },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              className={`btn btn-sm ${matchFilter === f.id ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setMatchFilter(f.id)}
              style={{ fontSize: '0.78rem', padding: '5px 12px' }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
          {t('club_detail.showing_matches', 'Hiển thị: {count} trận đấu').replace(
            '{count}',
            String(filteredMatches.length),
          )}
        </span>
      </div>

      {/* Fixture cards list */}
      <div className="glass-panel" style={{ padding: '16px 20px' }}>
        {loadingMatches ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
            <Loader2 size={32} className="animate-spin text-emerald-600" style={{ margin: '0 auto 8px' }} />
            <span>{t('common.loading')}...</span>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
            <Calendar size={40} style={{ margin: '0 auto 8px', color: '#cbd5e1' }} />
            <p>{t('club_detail.no_matches')}</p>
          </div>
        ) : (
          <div>
            {filteredMatches.map((m, index) => {
              const previousMatch = filteredMatches[index - 1];
              const showDayHeader = !previousMatch || previousMatch.season_day !== m.season_day;
              const isFinished = m.status === 'FINISHED' || m.status === 'COMPLETED';

              return (
                <React.Fragment key={m.id}>
                  {showDayHeader && (
                    <div className="fixture-section-label" style={{ margin: '14px 0 8px' }}>
                      <span>Day {m.season_day}</span>
                    </div>
                  )}

                  <div className="season-fixture-card my-match" style={{ cursor: 'default' }}>
                    {/* Top bar: Giải đấu + Badges */}
                    <div className="fixture-card-top">
                      <div className="fixture-comp-tag">
                        <Trophy size={13} />
                        <span className="comp-name">{comp(m.competition_name)}</span>
                      </div>

                      <div className="fixture-card-badges">
                        <span className={`fixture-status-pill ${isFinished ? 'finished' : 'scheduled'}`}>
                          {isFinished
                            ? m.result === 'W'
                              ? t('club_detail.result_win')
                              : m.result === 'L'
                              ? t('club_detail.result_loss')
                              : t('club_detail.result_draw')
                            : t('club_detail.result_upcoming')}
                        </span>
                        <span className="fixture-time-pill">
                          <Clock size={12} />
                          {m.kickoff_time ? m.kickoff_time.slice(0, 5) : '20:00'}
                        </span>
                      </div>
                    </div>

                    {/* Matchup row */}
                    <div className="fixture-card-matchup">
                      {/* Home team */}
                      <div className="fixture-team home">
                        <span className="club-name">
                          {m.is_home ? club.name : (m.opponent?.name || '')}
                        </span>
                        <div className="club-avatar-sm">
                          {m.is_home ? (
                            club.logo_url ? (
                              <img
                                src={club.logo_url}
                                alt=""
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                              />
                            ) : (
                              '⭐'
                            )
                          ) : m.opponent?.logo_url ? (
                            <img
                              src={m.opponent.logo_url}
                              alt=""
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                          ) : (
                            '⚽'
                          )}
                        </div>
                      </div>

                      {/* Score / VS */}
                      <div className="fixture-score-wrap">
                        {isFinished ? (
                          <span className="fixture-score-box finished">
                            {m.home_score} - {m.away_score}
                          </span>
                        ) : (
                          <span className="fixture-score-box upcoming">
                            VS
                          </span>
                        )}
                      </div>

                      {/* Away team */}
                      <div className="fixture-team away">
                        <div className="club-avatar-sm">
                          {!m.is_home ? (
                            club.logo_url ? (
                              <img
                                src={club.logo_url}
                                alt=""
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                              />
                            ) : (
                              '⭐'
                            )
                          ) : m.opponent?.logo_url ? (
                            <img
                              src={m.opponent.logo_url}
                              alt=""
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                          ) : (
                            '⚽'
                          )}
                        </div>
                        <span className="club-name">
                          {!m.is_home ? club.name : (m.opponent?.name || '')}
                        </span>
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
