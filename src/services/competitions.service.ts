import { request } from './client';
import { Competition, Standing, PlayerStat } from '../types';

export interface CompetitionTeam {
  id: string;
  name: string;
  short_name?: string;
  logo_url?: string;
  city?: string;
  country?: string;
  stadium?: {
    name: string;
    capacity: number;
  } | null;
  reputation: number;
  manager?: {
    id: string;
    username: string;
  } | null;
}

export const competitionsApi = {
  getAll: () => request<Competition[]>('/competitions'),

  getStandings: (competitionId: string) =>
    request<{ competitionId: string; stageName: string; standings: Standing[] } | Standing[]>(
      `/competitions/${competitionId}/standings`
    ),

  getTopScorers: (competitionId: string) =>
    request<PlayerStat[]>(`/competitions/${competitionId}/top-scorers`),

  getTopAssists: (competitionId: string) =>
    request<PlayerStat[]>(`/competitions/${competitionId}/top-assists`),

  getTeams: (competitionId: string, countryId?: string) => {
    let url = `/competitions/${competitionId}/teams`;
    if (countryId) url += `?countryId=${encodeURIComponent(countryId)}`;
    return request<CompetitionTeam[]>(url);
  },
};
