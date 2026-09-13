export * from './client';
export * from './auth.service';
export * from './clubs.service';
export * from './players.service';
export * from './tactics.service';
export * from './matches.service';
export * from './competitions.service';
export * from './transfers.service';
export * from './finances.service';
export * from './training.service';
export * from './gameWorld.service';

import { authApi } from './auth.service';
import { clubsApi } from './clubs.service';
import { playersApi } from './players.service';
import { tacticsApi } from './tactics.service';
import { matchesApi } from './matches.service';
import { competitionsApi } from './competitions.service';
import { transfersApi } from './transfers.service';
import { financesApi } from './finances.service';
import { trainingApi } from './training.service';
import { gameWorldApi } from './gameWorld.service';

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
