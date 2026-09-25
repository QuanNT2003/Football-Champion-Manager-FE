import { request } from './client';
import {
  Competition,
  Standing,
  StandingItem,
  PlayerStat,
  GroupStandings,
  KnockoutBracketResponse,
} from '../types';


export interface CompetitionCountry {
  id: string;
  name: string;
  code: string;
  flag_url?: string | null;
  confederation?: {
    code: string;
    name: string;
  } | null;
}

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
  
  getCountries: (search?: string) => {
    let url = '/competitions/countries';
    if (search) url += `?search=${encodeURIComponent(search)}`;
    return request<CompetitionCountry[]>(url);
  },
  getAll: (countryId?: string) => {
    let url = '/competitions';
    if (countryId) url += `?countryId=${encodeURIComponent(countryId)}`;
    return request<Competition[]>(url);
  },

  getStandings: (competitionId: string, countryId?: string) => {
    let url = `/competitions/${competitionId}/standings`;
    if (countryId) url += `?countryId=${encodeURIComponent(countryId)}`;
    return request<{
      competitionId: string;
      stageName: string;
      formatType?: 'LEAGUE' | 'KNOCKOUT' | 'GROUP_KNOCKOUT';
      formatLabel?: string;
      groups?: GroupStandings[];
      standings: StandingItem[];
    } | StandingItem[]>(url);
  },

  getKnockoutBracket: (competitionId: string, countryId?: string, seasonId?: string) => {
    let url = `/competitions/${competitionId}/knockout-bracket`;
    const params: string[] = [];
    if (countryId) params.push(`countryId=${encodeURIComponent(countryId)}`);
    if (seasonId) params.push(`seasonId=${encodeURIComponent(seasonId)}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    return request<KnockoutBracketResponse>(url);
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
