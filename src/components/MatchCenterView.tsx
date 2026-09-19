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
  Shield,
  Swords,
  Trophy,
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

const ClubBadge: React.FC<{
  name?: string;
  logoUrl?: string;
  isHome?: boolean;
  isMyClub?: boolean;
  size?: 'sm' | 'lg';
}> = ({ name = 'CLB', logoUrl, isHome = true, isMyClub = false, size = 'sm' }) => {
  const [imgError, setImgError] = useState(false);
  const initials =
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase() || 'FC';

  if (logoUrl && !imgError) {
    return (
      <img
        src={logoUrl}
        alt={name}
        className={size === 'lg' ? 'club-avatar-lg-img' : 'club-avatar-img'}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className={`${size === 'lg' ? 'club-avatar-lg' : 'club-avatar-sm'} ${
        isMyClub ? 'my-club' : isHome ? 'home' : 'away'
      }`}
      title={name}
    >
      {initials}
    </div>
  );
};

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
  const [competitionFilter, setCompetitionFilter] = useState<string>('ALL');
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

  const competitions = useMemo(() => {
    const list = matchList
      .map((match) => match.competitionSeason?.name)
      .filter((name): name is string => Boolean(name));
    return Array.from(new Set(list)).sort();
  }, [matchList]);

  const filteredMatches = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return matchList.filter((match) => {
      const statusMatched = statusFilter === 'ALL' || match.status === statusFilter;
      const dayMatched = dayFilter === 'ALL' || match.season_day === Number(dayFilter);
      const compMatched = competitionFilter === 'ALL' || match.competitionSeason?.name === competitionFilter;
      const textMatched =
        keyword.length === 0 ||
        match.homeClub?.name?.toLowerCase().includes(keyword) ||
        match.awayClub?.name?.toLowerCase().includes(keyword) ||
        match.competitionSeason?.name?.toLowerCase().includes(keyword) ||
        match.stadium?.toString().toLowerCase().includes(keyword);

      return statusMatched && dayMatched && compMatched && textMatched;
    });
  }, [competitionFilter, dayFilter, matchList, searchTerm, statusFilter]);

  const sortedMatches = useMemo(() => {
    return [...filteredMatches].sort((a, b) => {
      if (a.season_day !== b.season_day) return a.season_day - b.season_day;
      return formatTime(a.kickoff_time).localeCompare(formatTime(b.kickoff_time));
    });
  }, [filteredMatches]);

  const selectedEvents = (simResult?.events || selectedMatch?.events || []) as MatchEvent[];
  const isFinished = selectedMatch?.status === 'FINISHED' || Boolean(simResult);
  const selectedHomeScore = simResult?.homeScore ?? selectedMatch?.homeScore ?? 0;
  const selectedAwayScore = simResult?.awayScore ?? selectedMatch?.awayScore ?? 0;
  const selectedCompName = selectedMatch?.competitionSeason?.name || selectedMatch?.stage?.name || 'Giải Đấu Mùa';
  const selectedRoundName = selectedMatch?.round?.name || `Vòng ${selectedMatch?.season_day || 1}`;
  const selectedStadium = typeof selectedMatch?.stadium === 'string'
    ? selectedMatch.stadium
    : selectedMatch?.stadium?.name || 'Sân vận động chính';

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
              placeholder="Tìm đội bóng, giải đấu, sân..."
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

          {competitions.length > 0 && (
            <select
              value={competitionFilter}
              onChange={(event) => setCompetitionFilter(event.target.value)}
              className="input-select"
            >
              <option value="ALL">Tất cả giải đấu ({competitions.length})</option>
              {competitions.map((comp) => (
                <option key={comp} value={comp}>
                  {comp}
                </option>
              ))}
            </select>
          )}

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
              <Loader2 className="spinner-icon" size={28} />
              <span>Đang tải lịch mùa giải...</span>
            </div>
          ) : filteredMatches.length === 0 ? (
            <div className="match-empty-state">
              <CalendarDays size={32} />
              <span>Không có trận nào khớp với bộ lọc tìm kiếm.</span>
            </div>
          ) : (
            <div className="season-fixture-table" role="list">
              {sortedMatches.map((match, index) => {
                const previousMatch = sortedMatches[index - 1];
                const showDayHeader = !previousMatch || previousMatch.season_day !== match.season_day;
                const isSelected = selectedMatch?.id === match.id;
                const isMyClub = match.homeClub?.id === club?.id || match.awayClub?.id === club?.id;
                const competitionName = match.competitionSeason?.name || match.stage?.name || 'Giải đấu';
                const roundName = match.round?.name;

                return (
                  <React.Fragment key={match.id}>
                    {showDayHeader && (
                      <div className="fixture-section-label">
                        <span>Day {match.season_day}</span>
                      </div>
                    )}

                    <div
                      role="button"
                      tabIndex={0}
                      className={`season-fixture-card ${isSelected ? 'selected' : ''} ${isMyClub ? 'my-match' : ''}`}
                      onClick={() => loadMatchDetail(match)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') loadMatchDetail(match);
                      }}
                    >
                      {/* Top bar của card: Tên Giải Đấu & Trạng thái / Badge CLB Của Bạn */}
                      <div className="fixture-card-top">
                        <div className="fixture-comp-tag">
                          <Trophy size={13} />
                          <span className="comp-name">{competitionName}</span>
                          {roundName && <span className="comp-round">· {roundName}</span>}
                        </div>

                        <div className="fixture-card-badges">
                          <span className={`fixture-status-pill ${match.status === 'FINISHED' ? 'finished' : 'scheduled'}`}>
                            {statusLabel(match.status)}
                          </span>
                          <span className="fixture-time-pill">
                            <Clock size={12} />
                            {formatTime(match.kickoff_time)}
                          </span>
                          {isMyClub && (
                            <span className="fixture-my-club-badge">
                              <Shield size={12} /> CLB CỦA BẠN
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Main matchup bar: Home vs Away */}
                      <div className="fixture-card-matchup">
                        {/* Đội nhà */}
                        <div className={`fixture-team home ${match.homeClub?.id === club?.id ? 'my-club' : ''}`}>
                          <span className="club-name" title={match.homeClub?.name || 'Đội nhà'}>
                            {match.homeClub?.name || 'Đội nhà'}
                          </span>
                          <ClubBadge
                            name={match.homeClub?.name}
                            logoUrl={match.homeClub?.logo_url}
                            isHome={true}
                            isMyClub={match.homeClub?.id === club?.id}
                          />
                        </div>

                        {/* Tỷ số / VS */}
                        <div className="fixture-score-wrap">
                          {match.status === 'FINISHED' ? (
                            <span className="fixture-score-box finished">
                              {match.homeScore ?? 0} - {match.awayScore ?? 0}
                            </span>
                          ) : (
                            <span className="fixture-score-box upcoming">
                              VS
                            </span>
                          )}
                        </div>

                        {/* Đội khách */}
                        <div className={`fixture-team away ${match.awayClub?.id === club?.id ? 'my-club' : ''}`}>
                          <ClubBadge
                            name={match.awayClub?.name}
                            logoUrl={match.awayClub?.logo_url}
                            isHome={false}
                            isMyClub={match.awayClub?.id === club?.id}
                          />
                          <span className="club-name" title={match.awayClub?.name || 'Đội khách'}>
                            {match.awayClub?.name || 'Đội khách'}
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
      </section>

      {/* Match Detail Sidebar */}
      <aside className="match-detail-panel glass-panel">
        {!selectedMatch ? (
          <div className="match-detail-empty">
            <Swords size={46} />
            <h3>Chi Tiết Trận Đấu</h3>
            <p>Chọn một trận trong danh sách lịch thi đấu để xem thông tin sân đấu, giải đấu, tỷ số và diễn biến trực tiếp.</p>
          </div>
        ) : (
          <div className="match-detail-content">
            {/* Header chi tiết trận chuẩn responsive */}
            <div className="match-detail-header">
              <div className="match-detail-top-row">
                <div className="match-comp-pill" title={`${selectedCompName} · ${selectedRoundName}`}>
                  <Trophy size={13} />
                  <span>{selectedCompName} · {selectedRoundName}</span>
                </div>
                <button className="btn-close-detail" type="button" onClick={() => setSelectedMatch(null)} title="Đóng">
                  <X size={16} />
                </button>
              </div>

              <div className="match-detail-main-row">
                <div className="title-box">
                  <span className={`match-status-badge ${isFinished ? 'finished' : 'scheduled'}`}>
                    {isFinished ? 'ĐÃ KẾT THÚC' : 'SẮP DIỄN RA'}
                  </span>
                  <h3>Day {selectedMatch.season_day}</h3>
                </div>
                <div className="datetime-box">
                  <span><Clock size={13} /> {formatTime(selectedMatch.kickoff_time)}</span>
                </div>
              </div>
            </div>

            {/* Scoreboard thể thao cao cấp */}
            <div className="match-scoreboard">
              <div className="match-scoreboard-team">
                <ClubBadge
                  name={selectedMatch.homeClub?.name}
                  logoUrl={selectedMatch.homeClub?.logo_url}
                  isHome={true}
                  isMyClub={selectedMatch.homeClub?.id === club?.id}
                  size="lg"
                />
                <strong title={selectedMatch.homeClub?.name}>{selectedMatch.homeClub?.name || 'Đội nhà'}</strong>
                <span className="team-role">Chủ nhà</span>
              </div>

              <div className="score-block">
                {isFinished ? (
                  <>
                    <strong className="score-digits">{selectedHomeScore} - {selectedAwayScore}</strong>
                    <span className="score-label finished">KẾT QUẢ</span>
                  </>
                ) : (
                  <>
                    <strong className="score-vs">VS</strong>
                    <span className="score-label scheduled">{formatTime(selectedMatch.kickoff_time)}</span>
                  </>
                )}
              </div>

              <div className="match-scoreboard-team">
                <ClubBadge
                  name={selectedMatch.awayClub?.name}
                  logoUrl={selectedMatch.awayClub?.logo_url}
                  isHome={false}
                  isMyClub={selectedMatch.awayClub?.id === club?.id}
                  size="lg"
                />
                <strong title={selectedMatch.awayClub?.name}>{selectedMatch.awayClub?.name || 'Đội khách'}</strong>
                <span className="team-role">Đội khách</span>
              </div>
            </div>

            {/* Bảng thông tin trận đấu (Info List sạch đẹp, không bao giờ bị cắt chữ) */}
            <div className="match-info-card">
              <div className="match-info-row">
                <div className="info-label">
                  <MapPin size={15} />
                  <span>Sân vận động</span>
                </div>
                <div className="info-val" title={selectedStadium}>
                  {selectedStadium}
                </div>
              </div>

              <div className="match-info-row">
                <div className="info-label">
                  <CheckCircle2 size={15} />
                  <span>Vòng thi đấu</span>
                </div>
                <div className="info-val">
                  {selectedRoundName}
                </div>
              </div>

              <div className="match-info-row">
                <div className="info-label">
                  <Users size={15} />
                  <span>Khán giả</span>
                </div>
                <div className="info-val">
                  {isFinished
                    ? `${(simResult?.attendance ?? selectedMatch.attendance ?? 0).toLocaleString()} khán giả`
                    : 'Chưa diễn ra'}
                </div>
              </div>

              <div className="match-info-row">
                <div className="info-label">
                  <DollarSign size={15} />
                  <span>Doanh thu vé</span>
                </div>
                <div className="info-val highlight-gold">
                  {isFinished
                    ? `€${Number(simResult?.ticketRevenue ?? selectedMatch.ticketRevenue ?? 0).toLocaleString()}`
                    : 'Chưa kết toán'}
                </div>
              </div>
            </div>

            {/* Nút mô phỏng nếu trận chưa kết thúc */}
            {!isFinished && (
              <button className="match-simulate-btn" onClick={handleSimulate} disabled={simulating}>
                {simulating ? <Loader2 className="spinner-icon" size={18} /> : <Play size={18} />}
                {simulating ? 'Đang mô phỏng trận...' : 'Mô phỏng trận đấu'}
              </button>
            )}

            {/* Diễn biến trận đấu */}
            <div className="match-events-panel">
              <h4>
                <Swords size={16} /> Diễn Biến Trận Đấu
              </h4>
              {selectedEvents.length === 0 ? (
                <div className="match-events-empty">
                  <p>{isFinished ? 'Trận đấu không có sự kiện bàn thắng hoặc thẻ phạt.' : 'Trận đấu chưa bắt đầu, diễn biến sẽ cập nhật khi bóng lăn.'}</p>
                </div>
              ) : (
                <div className="match-event-list">
                  {selectedEvents.map((event, idx) => {
                    const isGoal = event.eventType?.includes('GOAL');
                    const isCard = event.eventType?.includes('CARD');
                    return (
                      <div key={event.id || idx} className="match-event-row">
                        <span className="match-event-minute">{event.minute}'</span>
                        <div className="match-event-desc">
                          <strong>{isGoal ? '⚽ Bàn thắng' : isCard ? '🟨 Thẻ phạt' : event.eventType}</strong>: {event.player?.name || 'Cầu thủ'} {event.metadata?.description || ''}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};
