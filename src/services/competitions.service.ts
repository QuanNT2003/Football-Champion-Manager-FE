import { request } from './client';
import {
  Competition,
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

export interface CompetitionsMenuResponse {
  country: {
    id: string;
    name: string;
    code: string;
    flag_url: string | null;
  } | null;
  confederation: {
    id: string;
    name: string;
    code: string;
  } | null;
  domestic: {
    league: {
      currentCompId: string;
      name: string;
      tiers: Array<{
        id: string;
        tier: number;
        name: string;
        code: string;
      }>;
    };
    nationalCup: {
      id: string;
      name: string;
      type: string;
    } | null;
    superCup: {
      id: string;
      name: string;
      type: string;
    } | null;
    youthCup: {
      id: string;
      name: string;
      type: string;
    } | null;
  };
  continental: Array<{
    id: string;
    name: string;
    code: string;
    competition_type: string;
    confederation_code: string;
  }>;
  international: Array<{
    id: string;
    name: string;
    code: string;
    competition_type: string;
  }>;
}

export const competitionsApi = {
  getMenu: (countryId?: string) => {
    let url = '/competitions/menu';
    if (countryId) url += `?countryId=${encodeURIComponent(countryId)}`;
    return request<CompetitionsMenuResponse>(url);
  },

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

  getStandings: (competitionId: string, countryId?: string, seasonId?: string, groupId?: string) => {
    let url = `/competitions/${competitionId}/standings`;
    const params: string[] = [];
    if (countryId) params.push(`countryId=${encodeURIComponent(countryId)}`);
    if (seasonId) params.push(`seasonId=${encodeURIComponent(seasonId)}`);
    if (groupId) params.push(`groupId=${encodeURIComponent(groupId)}`);
    if (params.length > 0) url += `?${params.join('&')}`;
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

  getTopScorers: (competitionId: string, countryId?: string, limit?: number, groupId?: string) => {
    let url = `/competitions/${competitionId}/top-scorers`;
    const params: string[] = [];
    if (countryId) params.push(`countryId=${encodeURIComponent(countryId)}`);
    if (limit) params.push(`limit=${limit}`);
    if (groupId) params.push(`groupId=${encodeURIComponent(groupId)}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    return request<PlayerStat[]>(url);
  },

  getTopAssists: (competitionId: string, countryId?: string, limit?: number, groupId?: string) => {
    let url = `/competitions/${competitionId}/top-assists`;
    const params: string[] = [];
    if (countryId) params.push(`countryId=${encodeURIComponent(countryId)}`);
    if (limit) params.push(`limit=${limit}`);
    if (groupId) params.push(`groupId=${encodeURIComponent(groupId)}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    return request<PlayerStat[]>(url);
  },

  getTeams: (competitionId: string, countryId?: string, groupId?: string) => {
    let url = `/competitions/${competitionId}/teams`;
    const params: string[] = [];
    if (countryId) params.push(`countryId=${encodeURIComponent(countryId)}`);
    if (groupId) params.push(`groupId=${encodeURIComponent(groupId)}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    return request<CompetitionTeam[]>(url);
  },
};
