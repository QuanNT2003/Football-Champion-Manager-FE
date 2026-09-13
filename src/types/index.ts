export interface User {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  roles?: string[];
}

export interface Stadium {
  id: string;
  name: string;
  capacity: number;
  city?: string;
  country?: string | { id: string; name: string; code?: string; flag_url?: string } | null;
  pitch_type?: string;
}

export interface Facility {
  id: string;
  name: string;
  code: string;
  current_level: number;
  status: string;
  upgrade_cost?: number;
}

export interface Club {
  id: string;
  name: string;
  short_name?: string;
  country?: string;
  countryFlag?: string;
  city?: string;
  reputation: number;
  ranking_points: number;
  logo_url?: string;
  stadium?: Stadium | null;
  stadiums?: Stadium[];
  manager?: {
    id: string;
    username: string;
  } | null;
  finances?: {
    cash: number;
    gold: number;
  } | null;
  financial_accounts?: Array<{
    cash_balance: number;
    gold_balance: number;
  }>;
  squadCount?: number;
  facilities?: Facility[];
  club_facilities?: Facility[];
}

export interface PlayerPosition {
  id?: string;
  position_code?: string;
  is_preferred?: boolean;
  ability?: number;
  position?: {
    code: string;
    name: string;
  };
}

export interface PlayerStatus {
  condition?: number;
  fitness?: number;
  form?: number;
  morale?: number;
  is_injured: boolean;
  is_suspended: boolean;
  is_transfer_listed: boolean;
  is_loan_listed: boolean;
  asking_price?: number;
}

export interface Player {
  id: string;
  name?: string;
  common_name?: string;
  first_name: string;
  last_name: string;
  age: number;
  nationality?: string | { id: string; name: string; code?: string; flag_url?: string } | null;
  nationalityFlag?: string;
  reputation?: number;
  overall_rating?: number;
  potential_rating?: number;
  potential?: number;
  market_value?: number;
  club_id?: string;
  club?: {
    id: string;
    name: string;
    logo_url?: string;
  };
  squad_type?: string;
  squad_number?: number;
  photo_url?: string;
  player_positions?: PlayerPosition[];
  position?: {
    code: string;
    name: string;
  } | null;
  status?: PlayerStatus | null;
  player_status?: PlayerStatus | null;
  attributes_summary?: Record<string, any> | null;
  player_attributes?: Record<string, any> | null;
  player_financial_data?: {
    market_value?: number;
    wage?: number;
  };
  contract?: {
    salary?: number;
    wage?: number;
    start_date?: string;
    end_date?: string;
  } | null;
}

export interface FormationPosition {
  id: string;
  slot_code: string;
  x: number;
  y: number;
  order_no: number;
  positions?: {
    code: string;
    name: string;
  };
}

export interface Formation {
  id: string;
  name: string;
  code: string;
  defense_count: number;
  midfield_count: number;
  forward_count: number;
  formation_positions: FormationPosition[];
}

export interface MatchEvent {
  id: string;
  minute: number;
  eventType: string;
  clubId?: string;
  player?: { id: string; name: string };
  relatedPlayer?: { id: string; name: string };
  metadata?: { description: string };
}

export interface Match {
  id: string;
  season_day: number;
  match_date: string;
  kickoff_time: string;
  status: 'SCHEDULED' | 'FINISHED';
  homeScore?: number;
  awayScore?: number;
  attendance?: number;
  ticketRevenue?: number;
  stadium?: { id: string; name: string; capacity: number } | string;
  homeClub: { id: string; name: string; logo_url?: string };
  awayClub: { id: string; name: string; logo_url?: string };
  events?: MatchEvent[];
}

export interface Competition {
  id: string;
  name: string;
  country?: string;
  type?: string;
  tier?: number;
  logo_url?: string;
}

export interface Standing {
  id?: string;
  club_id: string;
  club?: { id: string; name: string; short_name?: string; logo_url?: string };
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
}

export interface StandingItem extends Standing {
  position: number;
  wins: number;
  draws: number;
  losses: number;
}

export interface PlayerStat {
  player: {
    id: string;
    common_name?: string;
    first_name?: string;
    last_name?: string;
  };
  club?: {
    id: string;
    name: string;
  };
  goals?: number;
  assists?: number;
}

export interface TransferOffer {
  id: string;
  player_id: string;
  player?: Player;
  buyer_club_id: string;
  buyer_club?: { id: string; name: string };
  seller_club_id: string;
  seller_club?: { id: string; name: string };
  offer_amount: number;
  proposed_wage?: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  created_at?: string;
}

export interface FinancialAccount {
  id?: string;
  club_id: string;
  cash_balance: number;
  gold_balance: number;
}

export interface LedgerTransaction {
  id: string;
  club_id: string;
  transaction_type: string;
  amount: number;
  balance_after: number;
  description?: string;
  created_at: string;
}

export interface ShopItem {
  id: string;
  name: string;
  gold_cost: number;
  cash_reward: number;
  is_active?: boolean;
}

export interface TrainingType {
  id: string;
  name: string;
  description?: string;
  attribute_focus?: string;
  intensity?: number;
}

export interface TrainingSession {
  id: string;
  club_id: string;
  training_type_id: string;
  training_type?: TrainingType;
  intensity: number;
  session_date: string;
}

export interface TimelineData {
  world: { id: string; name: string; status: string };
  season: {
    id: string;
    name: string;
    season_number: number;
    current_day: number;
    total_days: number;
    is_transfer_window_open: boolean;
    status: string;
  };
}


export interface StarterCountry {
  id: string;
  name: string;
  code: string;
  flag_url: string | null;
  unclaimed_clubs: number;
}

export interface StarterTier {
  tier: number;
  competition_name: string;
  unclaimed_count: number;
}
