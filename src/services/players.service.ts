import { request } from './client';
import { Player } from '../types';

export const playersApi = {
  getPlayers: (page: number = 1, limit: number = 20, search?: string, clubId?: string) => {
    let url = `/players?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (clubId) url += `&clubId=${clubId}`;
    return request(url);
  },

  getPlayerById: (id: string) => request<Player>(`/players/${id}`),

  getClubSquad: (clubId: string, squadType?: string) => {
    let url = `/players/club/${clubId}/squad`;
    if (squadType) url += `?squadType=${squadType}`;
    return request<Player[]>(url);
  },

  updateTransferListing: (
    playerId: string,
    isTransferListed: boolean,
    isLoanListed: boolean,
    askingPrice?: number
  ) =>
    request(`/players/${playerId}/transfer-listing`, {
      method: 'PUT',
      body: JSON.stringify({ isTransferListed, isLoanListed, askingPrice }),
    }),

  toggleTransferListing: (
    playerId: string,
    data: { is_listed: boolean; asking_price?: number }
  ) =>
    request(`/players/${playerId}/transfer-listing`, {
      method: 'PUT',
      body: JSON.stringify({
        isTransferListed: data.is_listed,
        isLoanListed: false,
        askingPrice: data.asking_price,
      }),
    }),
};
