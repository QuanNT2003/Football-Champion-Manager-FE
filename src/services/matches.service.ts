import { request } from './client';
import { Match } from '../types';

export const matchesApi = {
  getMatches: (
    page: number = 1,
    limit: number = 20,
    clubId?: string,
    status?: string,
    seasonId?: string,
    seasonDay?: number,
  ) => {
    let url = `/matches?page=${page}&limit=${limit}`;
    if (clubId) url += `&clubId=${clubId}`;
    if (status) url += `&status=${status}`;
    if (seasonId) url += `&seasonId=${seasonId}`;
    if (seasonDay) url += `&seasonDay=${seasonDay}`;
    return request(url);
  },

  getMatchById: (id: string) => request<Match>(`/matches/${id}`),

  simulateMatch: (id: string) =>
    request(`/matches/${id}/simulate`, { method: 'POST' }),
};
