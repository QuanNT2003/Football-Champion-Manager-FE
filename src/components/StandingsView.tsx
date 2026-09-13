import React, { useState, useEffect } from 'react';
import { competitionsApi } from '../services/competitions.service';
import { Competition, Standing, PlayerStat } from '../types';
import { Trophy, Award, TrendingUp, Shield, Activity, Target } from 'lucide-react';

interface StandingsViewProps {
  currentClubId: string;
}

export const StandingsView: React.FC<StandingsViewProps> = ({ currentClubId }) => {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [selectedCompId, setSelectedCompId] = useState<string>('');
  const [standings, setStandings] = useState<Standing[]>([]);
  const [topScorers, setTopScorers] = useState<PlayerStat[]>([]);
  const [topAssists, setTopAssists] = useState<PlayerStat[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'table' | 'stats'>('table');

  useEffect(() => {
    loadCompetitions();
  }, []);

  useEffect(() => {
    if (selectedCompId) {
      loadCompData(selectedCompId);
    }
  }, [selectedCompId]);

  const loadCompetitions = async () => {
    try {
      setLoading(true);
      const data = await competitionsApi.getAll();
      const list = Array.isArray(data) ? data : (data as any)?.items || [];
      setCompetitions(list);
      if (list.length > 0) {
        setSelectedCompId(list[0].id);
      }
    } catch (err) {
      console.error('Failed to load competitions:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCompData = async (compId: string) => {
    try {
      setLoading(true);
      const [tableData, scorersData, assistsData] = await Promise.all([
        competitionsApi.getStandings(compId).catch(() => []),
        competitionsApi.getTopScorers(compId).catch(() => []),
        competitionsApi.getTopAssists(compId).catch(() => [])
      ]);
      setStandings(Array.isArray(tableData) ? tableData : []);
      setTopScorers(Array.isArray(scorersData) ? scorersData : []);
      setTopAssists(Array.isArray(assistsData) ? assistsData : []);
    } catch (err) {
      console.error('Failed to load competition details:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="view-container">
      <div className="view-header">
        <div>
          <h1 className="view-title flex-center" style={{ gap: '0.75rem' }}>
            <Trophy className="text-warning" size={28} />
            League Table & Competitions
          </h1>
          <p className="view-subtitle">Monitor standings, promotion/relegation zones, and Golden Boot leaders</p>
        </div>

        <div className="flex-center" style={{ gap: '1rem' }}>
          <select
            className="input-select"
            value={selectedCompId}
            onChange={(e) => setSelectedCompId(e.target.value)}
            style={{ minWidth: 220 }}
          >
            {competitions.map((comp) => (
              <option key={comp.id} value={comp.id}>
                {comp.name}
              </option>
            ))}
          </select>

          <div className="btn-group">
            <button
              className={`btn btn-sm ${activeTab === 'table' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('table')}
            >
              Standings
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'stats' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('stats')}
            >
              Player Stats
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card text-center" style={{ padding: '3rem' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem auto' }}></div>
          <p className="text-muted">Loading league data...</p>
        </div>
      ) : activeTab === 'table' ? (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '50px', textAlign: 'center' }}>Pos</th>
                <th>Club</th>
                <th style={{ textAlign: 'center' }}>P</th>
                <th style={{ textAlign: 'center' }}>W</th>
                <th style={{ textAlign: 'center' }}>D</th>
                <th style={{ textAlign: 'center' }}>L</th>
                <th style={{ textAlign: 'center' }}>GF</th>
                <th style={{ textAlign: 'center' }}>GA</th>
                <th style={{ textAlign: 'center' }}>GD</th>
                <th style={{ textAlign: 'center', fontWeight: 800 }}>PTS</th>
              </tr>
            </thead>
            <tbody>
              {standings.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center text-muted" style={{ padding: '3rem' }}>
                    No standings available for this competition yet.
                  </td>
                </tr>
              ) : (
                standings.map((row, idx) => {
                  const isCurrent = row.club_id === currentClubId;
                  const pos = idx + 1;
                  let posClass = '';
                  if (pos <= 4) posClass = 'rank-top';
                  else if (pos > standings.length - 3 && standings.length > 5) posClass = 'rank-relegation';

                  return (
                    <tr
                      key={row.id || idx}
                      className={`${isCurrent ? 'row-highlight' : ''} ${posClass}`}
                    >
                      <td style={{ textAlign: 'center', fontWeight: 700 }}>
                        <span className={`rank-badge ${posClass}`}>{pos}</span>
                      </td>
                      <td>
                        <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.75rem' }}>
                          <div className="club-avatar-sm">
                            {row.club?.logo_url ? (
                              <img src={row.club.logo_url} alt="" style={{ width: 24, height: 24 }} />
                            ) : (
                              <span>⚽</span>
                            )}
                          </div>
                          <div>
                            <span style={{ fontWeight: 600, color: isCurrent ? 'var(--neon-green)' : 'inherit' }}>
                              {row.club?.name || 'Club ' + row.club_id}
                            </span>
                            {isCurrent && <span className="badge badge-success ml-2" style={{ fontSize: '0.65rem' }}>YOU</span>}
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>{row.played ?? 0}</td>
                      <td style={{ textAlign: 'center', color: 'var(--neon-green)' }}>{row.won ?? 0}</td>
                      <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{row.drawn ?? 0}</td>
                      <td style={{ textAlign: 'center', color: 'var(--danger)' }}>{row.lost ?? 0}</td>
                      <td style={{ textAlign: 'center' }}>{row.goals_for ?? 0}</td>
                      <td style={{ textAlign: 'center' }}>{row.goals_against ?? 0}</td>
                      <td style={{ textAlign: 'center', fontWeight: 600, color: (row.goal_difference ?? 0) >= 0 ? 'var(--neon-green)' : 'var(--danger)' }}>
                        {(row.goal_difference ?? 0) > 0 ? `+${row.goal_difference}` : row.goal_difference ?? 0}
                      </td>
                      <td style={{ textAlign: 'center', fontSize: '1.05rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                        {row.points ?? 0}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          <div style={{ padding: '0.875rem 1.5rem', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span className="flex-center" style={{ gap: '0.35rem' }}><span style={{ width: 10, height: 10, background: 'var(--neon-green)', borderRadius: 2 }}></span> Champions League / Promotion</span>
            <span className="flex-center" style={{ gap: '0.35rem' }}><span style={{ width: 10, height: 10, background: 'var(--danger)', borderRadius: 2 }}></span> Relegation Zone</span>
          </div>
        </div>
      ) : (
        <div className="grid-2">
          {/* Top Scorers */}
          <div className="card">
            <h3 className="card-title flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Award className="text-warning" size={20} />
              Golden Boot (Top Scorers)
            </h3>
            {topScorers.length === 0 ? (
              <p className="text-muted text-center" style={{ padding: '2rem 0' }}>No goal data yet.</p>
            ) : (
              <div className="player-stat-list">
                {topScorers.slice(0, 10).map((item, idx) => (
                  <div key={idx} className="player-stat-row">
                    <span className="stat-rank">#{idx + 1}</span>
                    <div className="stat-info">
                      <div className="stat-name">
                        {item.player?.common_name || `${item.player?.first_name || ''} ${item.player?.last_name || ''}`}
                      </div>
                      <div className="stat-club">{item.club?.name || 'Club'}</div>
                    </div>
                    <div className="stat-value text-warning">
                      <Target size={16} />
                      <span>{item.goals || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Assists */}
          <div className="card">
            <h3 className="card-title flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <TrendingUp className="text-primary" size={20} />
              Playmaker (Top Assists)
            </h3>
            {topAssists.length === 0 ? (
              <p className="text-muted text-center" style={{ padding: '2rem 0' }}>No assist data yet.</p>
            ) : (
              <div className="player-stat-list">
                {topAssists.slice(0, 10).map((item, idx) => (
                  <div key={idx} className="player-stat-row">
                    <span className="stat-rank">#{idx + 1}</span>
                    <div className="stat-info">
                      <div className="stat-name">
                        {item.player?.common_name || `${item.player?.first_name || ''} ${item.player?.last_name || ''}`}
                      </div>
                      <div className="stat-club">{item.club?.name || 'Club'}</div>
                    </div>
                    <div className="stat-value text-primary">
                      <Activity size={16} />
                      <span>{item.assists || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
