import {
  Club,
  Player,
  Formation,
  Match,
  TimelineData,
  User,
  Competition,
  Standing,
  PlayerStat,
  TransferOffer,
  FinancialAccount,
  LedgerTransaction,
  ShopItem,
  TrainingType,
  TrainingSession,
  StarterCountry,
  StarterTier,
} from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

function getHeaders(): HeadersInit {
  const token = localStorage.getItem('fc_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T = any>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...(options?.headers || {}),
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw { response: { status: res.status, data } };
  }
  return (data && typeof data === 'object' && 'data' in data) ? data.data : data;
}

// 1. Auth API
export const authApi = {
  login: async (usernameOrEmail: string, password: string) => {
    const res = await request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ usernameOrEmail, password }),
    });
    const token = res?.accessToken || res?.access_token || res?.token;
    if (token) {
      localStorage.setItem('fc_token', token);
    }
    return res;
  },
  register: async (username: string, email: string, password: string) => {
    const res = await request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
    const token = res?.accessToken || res?.access_token || res?.token;
    if (token) {
      localStorage.setItem('fc_token', token);
    }
    return res;
  },
  logout: () => {
    localStorage.removeItem('fc_token');
  },
  getProfile: () => request<User>('/auth/me'),
};

// 2. Game World & Timeline API
export const gameWorldApi = {
  getTimeline: (worldId: string = '1') =>
    request<TimelineData>(`/game-worlds/${worldId}/timeline`),
  advanceDay: (worldId: string = '1') =>
    request(`/game-worlds/${worldId}/advance-day`, { method: 'POST' }),
};

// 3. Clubs API
export const clubsApi = {
  getClubs: (page: number = 1, limit: number = 20, search?: string) => {
    let url = `/clubs?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return request(url);
  },
  getClubById: (id: string) => request<Club>(`/clubs/${id}`),
  getMyClub: () => request<Club | null>('/clubs/my-club'),
  getStarterCountries: (search?: string) =>
    request<StarterCountry[]>(
      '/clubs/starter/countries' + (search ? `?search=${encodeURIComponent(search)}` : '')
    ),
  getStarterTiers: (countryId: string) =>
    request<StarterTier[]>(`/clubs/starter/tiers?countryId=${encodeURIComponent(countryId)}`),
  claimRandomStarterClub: (countryId: string, tier: number) =>
    request<{ message: string; club: Club }>('/clubs/starter/claim-random', {
      method: 'POST',
      body: JSON.stringify({ countryId, tier }),
    }),
  claim: (clubId: string) =>
    request(`/clubs/${clubId}/claim`, { method: 'POST' }),
  claimClub: (clubId: string) =>
    request(`/clubs/${clubId}/claim`, { method: 'POST' }),
  upgradeFacility: (clubId: string, facilityId: string) =>
    request(`/clubs/${clubId}/facilities/${facilityId}/upgrade`, { method: 'POST' }),
};

// 4. Players API
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
    askingPrice?: number,
  ) =>
    request(`/players/${playerId}/transfer-listing`, {
      method: 'PUT',
      body: JSON.stringify({ isTransferListed, isLoanListed, askingPrice }),
    }),
  toggleTransferListing: (playerId: string, data: { is_listed: boolean; asking_price?: number }) =>
    request(`/players/${playerId}/transfer-listing`, {
      method: 'PUT',
      body: JSON.stringify({
        isTransferListed: data.is_listed,
        isLoanListed: false,
        askingPrice: data.asking_price,
      }),
    }),
};

// 5. Tactics API
export const tacticsApi = {
  getFormations: () => request<Formation[]>('/tactics/formations'),
  getClubTactics: (clubId: string) => request(`/tactics/club/${clubId}`),
  updateClubTactics: (clubId: string, data: any) =>
    request(`/tactics/club/${clubId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// 6. Matches API
export const matchesApi = {
  getMatches: (page: number = 1, limit: number = 20, clubId?: string, status?: string) => {
    let url = `/matches?page=${page}&limit=${limit}`;
    if (clubId) url += `&clubId=${clubId}`;
    if (status) url += `&status=${status}`;
    return request(url);
  },
  getMatchById: (id: string) => request<Match>(`/matches/${id}`),
  simulateMatch: (id: string) =>
    request(`/matches/${id}/simulate`, { method: 'POST' }),
};

// 7. Competitions API
export const competitionsApi = {
  getAll: () => request<Competition[]>('/competitions'),
  getStandings: (competitionId: string) =>
    request<Standing[]>(`/competitions/${competitionId}/standings`),
  getTopScorers: (competitionId: string) =>
    request<PlayerStat[]>(`/competitions/${competitionId}/top-scorers`),
  getTopAssists: (competitionId: string) =>
    request<PlayerStat[]>(`/competitions/${competitionId}/top-assists`),
};

// 8. Transfers API
export const transfersApi = {
  getMarket: (params?: { page?: number; limit?: number; isLoan?: boolean; search?: string; position?: string }) => {
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

// 9. Finances API
export const financesApi = {
  getBalance: (clubId: string) =>
    request<FinancialAccount>(`/finances/club/${clubId}/balance`),
  getTransactions: (clubId: string) =>
    request<LedgerTransaction[]>(`/finances/club/${clubId}/transactions`),
  getShop: () => request<ShopItem[]>('/finances/gold-shop'),
  buyShopItem: (data: { club_id: string; item_id: string }) =>
    request(`/finances/club/${data.club_id}/exchange-gold/${data.item_id}`, {
      method: 'POST',
    }),
};

// 10. Training API
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

// Unified api object for backward compatibility
export const api = {
  ...authApi,
  ...gameWorldApi,
  ...clubsApi,
  ...playersApi,
  ...tacticsApi,
  ...matchesApi,
  ...competitionsApi,
  ...transfersApi,
  ...financesApi,
  ...trainingApi,
  getClubBalance: financesApi.getBalance,
  getGoldShop: financesApi.getShop,
  exchangeGold: (clubId: string, packageId: string) =>
    financesApi.buyShopItem({ club_id: clubId, item_id: packageId }),
  getTrainingTypes: trainingApi.getTypes,
  scheduleTraining: (clubId: string, data: { trainingTypeId: string; intensity?: number }) =>
    trainingApi.scheduleSession({
      club_id: clubId,
      training_type_id: data.trainingTypeId,
      intensity: data.intensity ?? 3,
      session_date: new Date().toISOString(),
    }),
};

export default api;
