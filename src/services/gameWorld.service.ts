import { request } from './client';
import { TimelineData } from '../types';

export const gameWorldApi = {
  getTimeline: (worldId: string = '1') =>
    request<TimelineData>(`/game-worlds/${worldId}/timeline`),

  advanceDay: (worldId: string = '1') =>
    request(`/game-worlds/${worldId}/advance-day`, { method: 'POST' }),
};
