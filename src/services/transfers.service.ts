import { request } from './client';
import { TransferOffer } from '../types';

export interface StaffMarketItem {
  id: string;
  name: string;
  staffType: 'HEAD_COACH' | 'ASSISTANT_COACH' | 'FITNESS_COACH' | 'SCOUT' | 'PHYSIO';
  coachingLicense: 'PRO' | 'A' | 'B' | 'C';
  tacticalStyle: string;
  reputation: number;
  nationality: string;
  countryCode: string;
  preferredFormation?: {
    id: string;
    name: string;
    code: string;
  };
  currentClub?: {
    id: string;
    name: string;
    logo_url?: string;
  } | null;
  wage: number;
  signingFee: number;
  photoUrl?: string;
}

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
    request<{ incoming: TransferOffer[]; outgoing: TransferOffer[] }>(
      `/transfers/club/${clubId}/offers`
    ),

  respondOffer: (offerId: string, data: { response: 'ACCEPTED' | 'REJECTED' }) =>
    request(`/transfers/offers/${offerId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ action: data.response }),
    }),

  getStaffMarket: (params?: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
  }) => {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    let url = `/transfers/staff-market?page=${page}&limit=${limit}`;
    if (params?.role) url += `&role=${encodeURIComponent(params.role)}`;
    if (params?.search) url += `&search=${encodeURIComponent(params.search)}`;
    return request<{ total: number; page: number; limit: number; totalPages: number; items: StaffMarketItem[] }>(url);
  },

  hireStaff: (data: { clubId: string; staffId: string }) =>
    request('/transfers/hire-staff', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
