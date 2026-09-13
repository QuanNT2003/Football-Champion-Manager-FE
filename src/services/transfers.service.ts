import { request } from './client';
import { TransferOffer } from '../types';

export const transfersApi = {
  getMarket: (params?: {
    page?: number;
    limit?: number;
    isLoan?: boolean;
    search?: string;
    position?: string;
  }) => {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    let url = `/transfers/market?page=${page}&limit=${limit}`;
    if (params?.isLoan !== undefined) url += `&isLoan=${params.isLoan}`;
    if (params?.search) url += `&search=${encodeURIComponent(params.search)}`;
    if (params?.position) url += `&position=${encodeURIComponent(params.position)}`;
    return request(url);
  },

  makeOffer: (data: {
    player_id: string;
    buyer_club_id: string;
    offer_amount: number;
    proposed_wage?: number;
  }) =>
    request('/transfers/offers', {
      method: 'POST',
      body: JSON.stringify({
        playerId: data.player_id,
        toClubId: data.buyer_club_id,
        offerAmount: data.offer_amount,
        wage: data.proposed_wage,
      }),
    }),

  getClubOffers: (clubId: string) =>
    request<{ incoming: TransferOffer[]; outgoing: TransferOffer[] }>(`/transfers/club/${clubId}/offers`),

  respondOffer: (offerId: string, data: { response: 'ACCEPTED' | 'REJECTED' }) =>
    request(`/transfers/offers/${offerId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ action: data.response }),
    }),
};
