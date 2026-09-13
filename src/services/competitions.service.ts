import { request } from './client';
import { Competition, Standing, PlayerStat } from '../types';

export const competitionsApi = {
  getAll: () => request<Competition[]>('/competitions'),

  getStandings: (competitionId: string) =>
    request<Standing[]>(`/competitions/${competitionId}/standings`),

  getTopScorers: (competitionId: string) =>
    request<PlayerStat[]>(`/competitions/${competitionId}/top-scorers`),

  getTopAssists: (competitionId: string) =>
    request<PlayerStat[]>(`/competitions/${competitionId}/top-assists`),
};
