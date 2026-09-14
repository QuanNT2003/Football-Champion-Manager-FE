import React, { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  DollarSign,
  Filter,
  Loader2,
  MapPin,
  Play,
  Search,
  Swords,
  Users,
  X,
} from 'lucide-react';
import { Club, Match, MatchEvent, TimelineData } from '../types';
import { matchesApi } from '../services/matches.service';

interface Props {
  club?: Club | null;
  timeline?: TimelineData | null;
  matches?: Match[];
  onSimulateMatch?: (matchId: string) => Promise<any>;
  onMatchSimulated?: () => void;
}

type StatusFilter = 'ALL' | 'SCHEDULED' | 'FINISHED';

const formatDate = (value?: string) => {
  if (!value) return 'Chưa có ngày';
  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
};

const formatTime = (value?: string) => {
  if (!value) return '--:--';
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Ho_Chi_Minh',
    }).format(date);
  }

  return value.slice(0, 5);
};

const statusLabel = (status: Match['status']) => (status === 'FINISHED' ? 'Đã đá' : 'Sắp đá');

export const MatchCenterView: React.FC<Props> = ({
  club,
  timeline,
  matches: initialMatches,
  onSimulateMatch,
  onMatchSimulated,
}) => {
  const [matchList, setMatchList] = useState<Match[]>(initialMatches || []);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [dayFilter, setDayFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const seasonId = timeline?.season?.id;

  useEffect(() => {
    if (initialMatches) {
      setMatchList(initialMatches);
      setSelectedMatch(null);
      return;
    }

    loadMatches();
  }, [initialMatches, club?.id, seasonId]);

  const loadMatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await matchesApi.getMatches(1, 500, club?.id, undefined, seasonId);
      const items = data.items || (Array.isArray(data) ? data : []);
      setMatchList(items);
    } catch (err) {
      console.error('Failed to load matches:', err);
      setError('Không tải được lịch thi đấu.');
    } finally {
      setLoading(false);
    }
  };

  const loadMatchDetail = async (match: Match) => {
    setSelectedMatch(match);
    setSimResult(null);
    try {
      const detail = await matchesApi.getMatchById(match.id);
      setSelectedMatch(detail);
    } catch (err) {
      console.error('Failed to load match detail:', err);
    }
  };

  const handleSimulate = async () => {
    if (!selectedMatch) return;
    setSimulating(true);
    try {
      const res = onSimulateMatch
        ? await onSimulateMatch(selectedMatch.id)
        : await matchesApi.simulateMatch(selectedMatch.id);
      setSimResult(res?.data || res);
      await loadMatches();
      if (onMatchSimulated) onMatchSimulated();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể mô phỏng trận đấu');
    } finally {
      setSimulating(false);
    }
  };

  const days = useMemo(() => {
    return Array.from(new Set(matchList.map((match) => match.season_day))).sort((a, b) => a - b);
  }, [matchList]);

  const filteredMatches = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return matchList.filter((match) => {
      const statusMatched = statusFilter === 'ALL' || match.status === statusFilter;
      const dayMatched = dayFilter === 'ALL' || match.season_day === Number(dayFilter);
      const textMatched =
        keyword.length === 0 ||
        match.homeClub?.name?.toLowerCase().includes(keyword) ||
        match.awayClub?.name?.toLowerCase().includes(keyword) ||
        match.stadium?.toString().toLowerCase().includes(keyword);

      return statusMatched && dayMatched && textMatched;
    });
  }, [dayFilter, matchList, searchTerm, statusFilter]);

  const sortedMatches = useMemo(() => {
    return [...filteredMatches].sort((a, b) => {
      if (a.season_day !== b.season_day) return a.season_day - b.season_day;
      return formatTime(a.kickoff_time).localeCompare(formatTime(b.kickoff_time));
    });
  }, [filteredMatches]);

  const selectedEvents = (simResult?.events || selectedMatch?.events || []) as MatchEvent[];
  const selectedHomeScore = simResult?.homeScore ?? selectedMatch?.homeScore ?? 0;
  const selectedAwayScore = simResult?.awayScore ?? selectedMatch?.awayScore ?? 0;
  const seasonLabel = timeline?.season
    ? `${timeline.season.name} · Day ${timeline.season.current_day}/${timeline.season.total_days}`
    : 'Mùa hiện tại';

  return (
    <div className="match-season-view">
      <section className="match-season-list glass-panel">
        <div className="match-season-header">
          <div>
            <h2>Lịch Thi Đấu</h2>
            <p>{seasonLabel}</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={loadMatches} disabled={loading}>
            {loading ? <Loader2 className="spinner-icon" size={16} /> : <CalendarDays size={16} />}
            Làm mới
          </button>
        </div>

        <div className="match-toolbar">
          <div className="match-search">
            <Search size={16} />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Tìm đội bóng, sân vận động"
            />
          </div>

          <select value={dayFilter} onChange={(event) => setDayFilter(event.target.value)} className="input-select">
            <option value="ALL">Tất cả ngày</option>
            {days.map((day) => (
              <option key={day} value={day}>
                Day {day}
              </option>
            ))}
          </select>

          <div className="match-status-tabs" aria-label="Lọc trạng thái trận">
            {(['ALL', 'SCHEDULED', 'FINISHED'] as StatusFilter[]).map((status) => (
              <button
                key={status}
                type="button"
                className={statusFilter === status ? 'active' : ''}
                onClick={() => setStatusFilter(status)}
              >
                <Filter size={14} />
                {status === 'ALL' ? 'Tất cả' : status === 'SCHEDULED' ? 'Sắp đá' : 'Đã đá'}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="season-fixture-list">
          {loading && matchList.length === 0 ? (
            <div className="match-empty-state">
              <Loader2 className="spinner-icon" size={24} />
              <span>Đang tải lịch mùa giải...</span>
            </div>
          ) : filteredMatches.length === 0 ? (
            <div className="match-empty-state">
              <CalendarDays size={24} />
              <span>Không có trận nào khớp bộ lọc.</span>
            </div>
          ) : (
            <div className="season-fixture-table" role="list">
              {sortedMatches.map((match, index) => {
                const previousMatch = sortedMatches[index - 1];
                const showDayHeader = !previousMatch || previousMatch.season_day !== match.season_day;
                const isSelected = selectedMatch?.id === match.id;
                const isMyClub = match.homeClub?.id === club?.id || match.awayClub?.id === club?.id;
                const competitionName = match.competitionSeason?.name || match.stage?.name || 'Giải đấu';

                return (
                  <React.Fragment key={match.id}>
                    {showDayHeader && (
                      <div className="fixture-section-label">
                        <span>Day {match.season_day}</span>
                        <strong>{formatDate(match.match_date)}</strong>
                      </div>
                    )}

                    <button
                      type="button"
                      className={`season-fixture-row ${isSelected ? 'selected' : ''}`}
                      onClick={() => loadMatchDetail(match)}
                    >
                      <span className={`fixture-status ${match.status === 'FINISHED' ? 'finished' : 'scheduled'}`}>
                        {statusLabel(match.status)}
                      </span>
                      <span className="fixture-time">
                        <Clock size={14} />
                        {formatTime(match.kickoff_time)}
                      </span>
                      <span className="fixture-competition">{competitionName}</span>
                      <span className={`fixture-club ${match.homeClub?.id === club?.id ? 'my-club' : ''}`}>
                        {match.homeClub?.name || 'Đội nhà'}
                      </span>
                      <span className="fixture-score">
                        {match.status === 'FINISHED' ? `${match.homeScore ?? 0} - ${match.awayScore ?? 0}` : 'vs'}
                      </span>
                      <span className={`fixture-club ${match.awayClub?.id === club?.id ? 'my-club' : ''}`}>
                        {match.awayClub?.name || 'Đội khách'}
                      </span>
                      {isMyClub && <span className="fixture-my-club">CLB</span>}
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <aside className="match-detail-panel glass-panel">
        {!selectedMatch ? (
          <div className="match-detail-empty">
            <Swords size={36} />
            <h3>Chọn một trận trong lịch</h3>
            <p>Chi tiết trận, tỷ số, sân đấu và diễn biến sẽ mở ở đây.</p>
          </div>
        ) : (
          <>
            <div className="match-detail-header">
              <div>
                <span className={`badge ${selectedMatch.status === 'FINISHED' || simResult ? 'badge-green' : 'badge-gold'}`}>
                  {selectedMatch.status === 'FINISHED' || simResult ? 'Đã kết thúc' : 'Sắp diễn ra'}
                </span>
                <h3>Day {selectedMatch.season_day}</h3>
                <p>{formatDate(selectedMatch.match_date)} · {formatTime(selectedMatch.kickoff_time)} giờ VN</p>
              </div>
              <button className="btn btn-outline btn-xs" type="button" onClick={() => setSelectedMatch(null)}>
                <X size={14} />
              </button>
            </div>

            <div className="match-scoreboard">
              <div className="match-team">
                <div className="club-avatar-sm">{selectedMatch.homeClub?.name?.slice(0, 2).toUpperCase() || 'HN'}</div>
                <strong>{selectedMatch.homeClub?.name || 'Đội nhà'}</strong>
                <span>Chủ nhà</span>
              </div>

              <div className="score-block">
                <strong>{selectedHomeScore} - {selectedAwayScore}</strong>
                <span>{selectedMatch.status === 'FINISHED' || simResult ? 'Kết quả' : 'Lịch đấu'}</span>
              </div>

              <div className="match-team">
                <div className="club-avatar-sm">{selectedMatch.awayClub?.name?.slice(0, 2).toUpperCase() || 'AK'}</div>
                <strong>{selectedMatch.awayClub?.name || 'Đội khách'}</strong>
                <span>Đội khách</span>
              </div>
            </div>

            <div className="match-meta-grid">
              <div>
                <MapPin size={16} />
                <span>{typeof selectedMatch.stadium === 'string' ? selectedMatch.stadium : selectedMatch.stadium?.name || 'Chưa có sân'}</span>
              </div>
              <div>
                <Users size={16} />
                <span>{(simResult?.attendance ?? selectedMatch.attendance ?? 0).toLocaleString()} khán giả</span>
              </div>
              <div>
                <DollarSign size={16} />
                <span>€{Number(simResult?.ticketRevenue ?? selectedMatch.ticketRevenue ?? 0).toLocaleString()}</span>
              </div>
              <div>
                <CheckCircle2 size={16} />
                <span>{selectedMatch.round?.name || `Vòng ${selectedMatch.season_day}`}</span>
              </div>
            </div>

            {selectedMatch.status !== 'FINISHED' && !simResult && (
              <button className="btn btn-primary match-simulate-btn" onClick={handleSimulate} disabled={simulating}>
                {simulating ? <Loader2 className="spinner-icon" size={18} /> : <Play size={18} />}
                {simulating ? 'Đang mô phỏng...' : 'Mô phỏng trận đấu'}
              </button>
            )}

            <div className="match-events-panel">
              <h4>Diễn Biến Trận Đấu</h4>
              {selectedEvents.length === 0 ? (
                <p>Chưa có diễn biến cho trận này.</p>
              ) : (
                <div className="match-event-list">
                  {selectedEvents.map((event, idx) => (
                    <div key={event.id || idx} className="match-event-row">
                      <strong>{event.minute}'</strong>
                      <span>{event.eventType}</span>
                      <p>{event.player?.name || 'Cầu thủ'} {event.metadata?.description || ''}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </aside>
    </div>
  );
};
