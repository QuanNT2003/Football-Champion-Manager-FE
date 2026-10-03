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

export interface MarketFilterParams {
  page?: number;
  limit?: number;
  status?: 'ALL' | 'FREE' | 'LOAN' | 'TRANSFER';
  isLoan?: boolean;
  position?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minAge?: number;
  maxAge?: number;
  nationalityId?: string;
  minOvr?: number;
  maxOvr?: number;
  attributes?: Record<string, number>;
}

export interface FilterOptionsResponse {
  countries: { id: string; code: string; name: string; flag_url?: string | null }[];
  attributes: { id: string; code: string; name: string; category: string }[];
}

export const transfersApi = {
  getMarket: (params?: MarketFilterParams) => {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    const query = new URLSearchParams();
    query.append('page', String(page));
    query.append('limit', String(limit));

    if (params?.status && params.status !== 'ALL') {
      query.append('status', params.status);
    }
    if (params?.isLoan !== undefined) {
      query.append('isLoan', String(params.isLoan));
    }
    if (params?.position && params.position !== 'ALL') {
      query.append('position', params.position);
    }
    if (params?.search) {
      query.append('search', params.search);
    }
    if (params?.minPrice !== undefined) {
      query.append('minPrice', String(params.minPrice));
    }
    if (params?.maxPrice !== undefined) {
      query.append('maxPrice', String(params.maxPrice));
    }
    if (params?.minAge !== undefined) {
      query.append('minAge', String(params.minAge));
    }
    if (params?.maxAge !== undefined) {
      query.append('maxAge', String(params.maxAge));
    }
    if (params?.nationalityId) {
      query.append('nationalityId', params.nationalityId);
    }
    if (params?.minOvr !== undefined) {
      query.append('minOvr', String(params.minOvr));
    }
    if (params?.maxOvr !== undefined) {
      query.append('maxOvr', String(params.maxOvr));
    }
    if (params?.attributes && Object.keys(params.attributes).length > 0) {
      query.append('attributes', JSON.stringify(params.attributes));
    }

    return request(`/transfers/market?${query.toString()}`);
  },

  getFilterOptions: () =>
    request<FilterOptionsResponse>('/transfers/filter-options'),

  makeOffer: (data: {
    player_id: string;
    buyer_club_id: string;
    offer_amount: number;
    is_loan?: boolean;
    proposed_wage?: number;
    contract_years?: number;
  }) =>
    request('/transfers/offers', {
      method: 'POST',
      body: JSON.stringify({
        playerId: data.player_id,
        toClubId: data.buyer_club_id,
        offerAmount: data.offer_amount,
        isLoan: data.is_loan,
        proposedWage: data.proposed_wage,
        contractYears: data.contract_years,
      }),
    }),

  getPlayerOffer: (clubId: string, playerId: string) =>
    request<TransferOffer | null>(
      `/transfers/offers/club/${clubId}/player/${playerId}`
    ),

  getClubOffers: (clubId: string) =>
    request<{ incoming: TransferOffer[]; outgoing: TransferOffer[] }>(
      `/transfers/offers/club/${clubId}`
    ),

  cancelOffer: (offerId: string, clubId?: string) =>
    request(`/transfers/offers/${offerId}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ clubId }),
    }),

  respondOffer: (
    offerId: string,
    data: { response: 'ACCEPTED' | 'REJECTED'; clubId?: string }
  ) =>
    request(`/transfers/offers/${offerId}/respond`, {
      method: 'PUT',
      body: JSON.stringify(data),
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
