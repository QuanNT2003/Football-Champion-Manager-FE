import { request } from './client';
import { FinancialAccount, LedgerTransaction, ShopItem } from '../types';

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
