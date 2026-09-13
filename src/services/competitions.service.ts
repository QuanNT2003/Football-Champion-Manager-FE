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
  getAll: (countryId?: string) => {
    let url = '/competitions';
    if (countryId) url += `?countryId=${encodeURIComponent(countryId)}`;
    return request<Competition[]>(url);
  },

  getStandings: (competitionId: string, countryId?: string) => {
    let url = `/competitions/${competitionId}/standings`;
    if (countryId) url += `?countryId=${encodeURIComponent(countryId)}`;
    return request<{ competitionId: string; stageName: string; standings: Standing[] } | Standing[]>(url);
  },

  getTopScorers: (competitionId: string, countryId?: string) => {
    let url = `/competitions/${competitionId}/top-scorers`;
    if (countryId) url += `?countryId=${encodeURIComponent(countryId)}`;
    return request<PlayerStat[]>(url);
  },

  getTopAssists: (competitionId: string, countryId?: string) => {
    let url = `/competitions/${competitionId}/top-assists`;
    if (countryId) url += `?countryId=${encodeURIComponent(countryId)}`;
    return request<PlayerStat[]>(url);
  },

  getTeams: (competitionId: string, countryId?: string) => {
    let url = `/competitions/${competitionId}/teams`;
    if (countryId) url += `?countryId=${encodeURIComponent(countryId)}`;
    return request<CompetitionTeam[]>(url);
  },
};
