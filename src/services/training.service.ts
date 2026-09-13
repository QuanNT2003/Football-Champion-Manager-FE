import { request } from './client';
import { TrainingType, TrainingSession } from '../types';

export const trainingApi = {
  getTypes: () => request<TrainingType[]>('/training/types'),

  getSessions: (clubId: string) =>
    request<TrainingSession[]>(`/training/club/${clubId}/sessions`),

  scheduleSession: (data: {
    club_id: string;
    training_type_id: string;
    intensity: number;
    session_date: string;
  }) =>
    request(`/training/club/${data.club_id}/schedule`, {
      method: 'POST',
      body: JSON.stringify({
        trainingTypeId: data.training_type_id,
        intensity: data.intensity,
        sessionDate: data.session_date,
      }),
    }),
};
