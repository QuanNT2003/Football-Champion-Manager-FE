import { request } from './client';
import { Formation } from '../types';

export const tacticsApi = {
  getFormations: () => request<Formation[]>('/tactics/formations'),

  getClubTactics: (clubId: string, squadType: string = 'FIRST_TEAM') =>
    request(`/tactics/club/${clubId}?squad_type=${squadType}`),

  updateClubTactics: (clubId: string, data: any, squadType: string = 'FIRST_TEAM') =>
    request(`/tactics/club/${clubId}?squad_type=${squadType}`, {
      method: 'PUT',
      body: JSON.stringify({ ...data, squadType }),
    }),
};
