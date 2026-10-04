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
  countryFlag?: string;
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


export interface StaffAttributeItem {
  id: string;
  code: string;
  name: string;
  category: 'COACHING' | 'MENTAL' | 'SCOUTING' | 'MEDICAL';
  description: string;
  value: number;
  is_key: boolean;
  multiplier: number;
}

export interface StaffDetailResponse {
  id: string;
  name: string;
  staffType: string;
  coachingLicense: string;
  tacticalStyle: string;
  reputation: number;
  photoUrl?: string;
  nationality?: {
    id: string;
    name: string;
    code: string;
    flag_url?: string;
  } | null;
  preferredFormation?: {
    id: string;
    name: string;
    code: string;
  } | null;
  secondaryFormation?: {
    id: string;
    name: string;
    code: string;
  } | null;
  estimatedWage: number;
  attributes: StaffAttributeItem[];
  groupedAttributes: {
    coaching: StaffAttributeItem[];
    mental: StaffAttributeItem[];
    scouting: StaffAttributeItem[];
    medical: StaffAttributeItem[];
  };
  currentContract?: {
    id: string;
    club?: { id: string; name: string; logo_url?: string } | null;
    salary: number;
    startDate: string;
    endDate?: string | null;
    status: string;
  } | null;
  contractHistory: Array<{
    id: string;
    club?: { id: string; name: string; logo_url?: string } | null;
    salary: number;
    startDate: string;
    endDate?: string | null;
    status: string;
  }>;
  existingOffer?: {
    id: string;
    role_offered: string;
    proposed_wage: number;
    contract_years: number;
    signing_bonus: number;
    status: string;
    createdAt: string;
  } | null;
}

export interface StaffOfferItem {
  id: string;
  staff_id: string;
  staff_name: string;
  staff_type: string;
  coaching_license: string;
  role_offered: string;
  proposed_wage: number;
  contract_years: number;
  signing_bonus: number;
  status: string;
  created_at: string;
  country?: { name: string; code: string; flag_url?: string };
  photo_url?: string;
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
    to_club_id?: string;
    offer_amount: number;
    is_loan?: boolean;
    proposed_wage?: number;
    contract_years?: number;
  }) =>
    request('/transfers/offers', {
      method: 'POST',
      body: JSON.stringify({
        player_id: data.player_id,
        to_club_id: data.to_club_id,
        offer_amount: data.offer_amount,
        is_loan: data.is_loan,
        proposed_wage: data.proposed_wage,
        contract_years: data.contract_years,
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

  getClubStaff: (clubId: string) =>
    request<StaffMarketItem[]>(`/transfers/club/${clubId}/staff`),

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

  getStaffDetail: (staffId: string, clubId?: string) => {
    let url = `/transfers/staff/${staffId}`;
    if (clubId) url += `?clubId=${encodeURIComponent(clubId)}`;
    return request<StaffDetailResponse>(url);
  },

  makeStaffOffer: (data: {
    staff_id: string;
    club_id: string;
    role_offered?: string;
    proposed_wage: number;
    contract_years: number;
    signing_bonus?: number;
  }) =>
    request<{ message: string; offer: any }>('/transfers/staff-offers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getStaffOffers: (clubId: string) =>
    request<StaffOfferItem[]>(`/transfers/staff-offers/club/${clubId}`),

  cancelStaffOffer: (offerId: string, clubId?: string) =>
    request(`/transfers/staff-offers/${offerId}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ clubId }),
    }),
};
