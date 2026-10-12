import { ClubTrophy } from '../../types';

export interface GroupedTrophy {
  groupKey: string;
  competition_id: string;
  competition_name: string;
  title_type: string;
  trophy_name: string;
  trophy_url?: string | null;
  count: number;
  seasons: number[];
  latest_season: number;
  latest_achieved_at: string;
  history: ClubTrophy[];
}

export type TrophiesFilterType = 'ALL' | 'CHAMPION' | 'RUNNER_UP';
