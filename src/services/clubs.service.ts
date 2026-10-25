import { request } from './client';
import {
  Club,
  StarterCountry,
  StarterTier,
  DashboardData,
  ClubTrophy,
  ClubNews,
  ClubSquadGroupsResponse,
  ClubMatchItem,
  ClubTransfersResponse,
  ClubSeasonHistoryResponse,
  ClubStadiumResponse,
} from '../types';

export const clubsApi = {
  getClubs: (page: number = 1, limit: number = 20, search?: string) => {
    let url = `/clubs?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return request(url);
  },

  getClubById: (id: string) => request<Club>(`/clubs/${id}`),

  getDashboard: (id: string) => request<DashboardData>(`/clubs/${id}/dashboard`),
  getTrophies: (id: string) => request<ClubTrophy[]>(`/clubs/${id}/trophies`),
  getSquadGroups: (id: string) => request<ClubSquadGroupsResponse>(`/clubs/${id}/squad-groups`),
  getClubSquadGroups: (id: string) => request<ClubSquadGroupsResponse>(`/clubs/${id}/squad-groups`),
  getMatches: (id: string, seasonId?: string) =>
    request<ClubMatchItem[]>(`/clubs/${id}/matches${seasonId ? `?seasonId=${seasonId}` : ''}`),
  getClubMatches: (id: string, seasonId?: string) =>
    request<ClubMatchItem[]>(`/clubs/${id}/matches${seasonId ? `?seasonId=${seasonId}` : ''}`),
  getTransfers: (id: string) => request<ClubTransfersResponse>(`/clubs/${id}/transfers`),
  getClubTransfers: (id: string) => request<ClubTransfersResponse>(`/clubs/${id}/transfers`),
  getSeasonHistory: (id: string) => request<ClubSeasonHistoryResponse>(`/clubs/${id}/season-history`),
  getClubSeasonHistory: (id: string) => request<ClubSeasonHistoryResponse>(`/clubs/${id}/season-history`),
  getStadium: (id: string) => request<ClubStadiumResponse>(`/clubs/${id}/stadium`),
  getClubStadium: (id: string) => request<ClubStadiumResponse>(`/clubs/${id}/stadium`),
  getNews: (id: string, page: number = 1, limit: number = 20, newsType?: string, search?: string) => {
    let url = `/clubs/${id}/news?page=${page}&limit=${limit}`;
    if (newsType) url += `&newsType=${encodeURIComponent(newsType)}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return request<{ total: number; page: number; limit: number; totalPages: number; items: ClubNews[] }>(url);
  },

  getMyClub: () => request<Club | null>('/clubs/my-club'),

  getStarterCountries: (search?: string) =>
    request<StarterCountry[]>(
      '/clubs/starter/countries' + (search ? `?search=${encodeURIComponent(search)}` : '')
    ),

  getStarterTiers: (countryId: string) =>
    request<StarterTier[]>(`/clubs/starter/tiers?countryId=${encodeURIComponent(countryId)}`),

  claimRandomStarterClub: (countryId: string, tier: number) =>
    request<{ message: string; club: Club }>('/clubs/starter/claim-random', {
      method: 'POST',
      body: JSON.stringify({ countryId, tier }),
    }),

  claim: (clubId: string) =>
    request(`/clubs/${clubId}/claim`, { method: 'POST' }),

  claimClub: (clubId: string) =>
    request(`/clubs/${clubId}/claim`, { method: 'POST' }),

  upgradeFacility: (clubId: string, facilityId: string) =>
    request(`/clubs/${clubId}/facilities/${facilityId}/upgrade`, { method: 'POST' }),
};
