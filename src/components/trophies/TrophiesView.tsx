import React, { useState, useEffect } from 'react';
import { Club, ClubTrophy } from '../../types';
import { clubsApi } from '../../services/clubs.service';
import { Loader2 } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { GroupedTrophy, TrophiesFilterType } from './types';
import { TrophyHeroBanner } from './TrophyHeroBanner';
import { TrophyToolbar } from './TrophyToolbar';
import { TrophyPedestalCard } from './TrophyPedestalCard';
import { TrophyDetailModal } from './TrophyDetailModal';
import { TrophyEmptyState } from './TrophyEmptyState';

interface TrophiesViewProps {
  currentClubId?: string;
  club: Club | null;
}

export const TrophiesView: React.FC<TrophiesViewProps> = ({ currentClubId, club }) => {
  const { t } = useTranslation();

  const [trophies, setTrophies] = useState<ClubTrophy[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<TrophiesFilterType>('ALL');
  const [selectedGroup, setSelectedGroup] = useState<GroupedTrophy | null>(null);

  const clubId = currentClubId || club?.id;

  useEffect(() => {
    if (clubId) {
      loadTrophies();
    }
  }, [clubId]);

  const loadTrophies = async () => {
    if (!clubId) return;
    try {
      setLoading(true);
      const data = await clubsApi.getTrophies(clubId);
      setTrophies(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Lỗi tải danh hiệu phòng truyền thống:', err);
      setTrophies([]);
    } finally {
      setLoading(false);
    }
  };

  const championsCount = trophies.filter((t) => t.title_type === 'CHAMPION').length;
  const runnerUpsCount = trophies.filter((t) => t.title_type === 'RUNNER_UP').length;
  const thirdPlaceCount = trophies.filter((t) => t.title_type === 'THIRD_PLACE').length;

  const filteredRawTrophies = trophies.filter((t) => {
    if (filterType === 'ALL') return true;
    return t.title_type === filterType;
  });

  // Gom nhóm danh hiệu theo Giải đấu và Loại danh hiệu (Vô địch, Á quân, Hạng ba)
  const groupedTrophies: GroupedTrophy[] = Object.values(
    filteredRawTrophies.reduce((acc, curr) => {
      const key = `${curr.competition_name || curr.competition_id}_${curr.title_type}`;
      if (!acc[key]) {
        acc[key] = {
          groupKey: key,
          competition_id: curr.competition_id,
          competition_name: curr.competition_name,
          title_type: curr.title_type,
          trophy_name: curr.trophy_name,
          trophy_url: curr.trophy_url,
          count: 0,
          seasons: [],
          latest_season: curr.season_number,
          latest_achieved_at: curr.achieved_at,
          history: [],
        };
      }
      acc[key].count += 1;
      if (!acc[key].seasons.includes(curr.season_number)) {
        acc[key].seasons.push(curr.season_number);
      }
      if (curr.season_number > acc[key].latest_season) {
        acc[key].latest_season = curr.season_number;
        acc[key].latest_achieved_at = curr.achieved_at;
      }
      acc[key].history.push(curr);
      return acc;
    }, {} as Record<string, GroupedTrophy>)
  ).sort((a, b) => {
    const rankPriority: Record<string, number> = { CHAMPION: 1, RUNNER_UP: 2, THIRD_PLACE: 3 };
    const pA = rankPriority[a.title_type] || 9;
    const pB = rankPriority[b.title_type] || 9;
    if (pA !== pB) return pA - pB;
    return b.count - a.count || b.latest_season - a.latest_season;
  });

  return (
    <div className="trophies-view-container">
      {/* 1. Hero Banner */}
      <TrophyHeroBanner
        club={club}
        championsCount={championsCount}
        runnerUpsCount={runnerUpsCount}
        thirdPlaceCount={thirdPlaceCount}
      />

      {/* 2. Toolbar Bộ lọc */}
      <TrophyToolbar
        filterType={filterType}
        setFilterType={setFilterType}
        totalCount={trophies.length}
        championsCount={championsCount}
        runnerUpsCount={runnerUpsCount}
      />

      {/* 3. Tủ Cúp Gom Nhóm */}
      {loading ? (
        <div className="trophy-loading-container">
          <Loader2 size={36} className="animate-spin text-amber-500" />
          <span className="text-sm text-slate-500 mt-3 font-semibold">
            {t('trophies.loading_cabinet')}
          </span>
        </div>
      ) : groupedTrophies.length > 0 ? (
        <section className="trophy-grid-showcase grouped-mode">
          {groupedTrophies.map((item) => (
            <TrophyPedestalCard key={item.groupKey} item={item} onSelect={setSelectedGroup} />
          ))}
        </section>
      ) : (
        <TrophyEmptyState club={club} />
      )}

      {/* 4. Modal chi tiết */}
      {selectedGroup && (
        <TrophyDetailModal item={selectedGroup} onClose={() => setSelectedGroup(null)} />
      )}
    </div>
  );
};
