import { request } from './client';
import { Formation } from '../types';

export const tacticsApi = {
  getFormations: () => request<Formation[]>('/tactics/formations'),

  getClubTactics: (clubId: string) => request(`/tactics/club/${clubId}`),

  updateClubTactics: (clubId: string, data: any) =>
    request(`/tactics/club/${clubId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
