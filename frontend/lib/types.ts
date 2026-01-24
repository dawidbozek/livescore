/**
 * Typy dla systemu Live Score
 */

export type MatchStatus = 'active' | 'pending' | 'finished' | 'walkover';

export type DartType = 'soft' | 'steel';

export type TournamentCategory = 'indywidualny' | 'deblowy' | 'triple_mieszane' | 'druzynowy';

export type TournamentFormat = 'single_ko' | 'groups_ko';

export interface Tournament {
  id: string;
  name: string;
  n01_url: string;
  tournament_date: string;
  is_active: boolean;
  dart_type: DartType;
  category: TournamentCategory | null;
  start_time: string | null;
  entry_fee: string | null;
  prizes: string | null;
  format: string | null;
  image_url: string | null;
  tournament_format: TournamentFormat;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: string;
  tournament_id: string;
  n01_match_id: string | null;
  player1_name: string;
  player2_name: string;
  player1_score: number;
  player2_score: number;
  station_number: number | null;
  referee: string | null;
  status: MatchStatus;
  created_at: string;
  updated_at: string;
  tournament?: Tournament;
}

export interface MatchWithTournament extends Match {
  tournament: Tournament;
}

export interface GroupedMatches {
  active: Match[];
  pending: Match[];
  finished: Match[];
  walkover: Match[];
}

export interface TournamentFormData {
  name: string;
  n01_url: string;
  tournament_date: string;
  is_active: boolean;
  dart_type: DartType;
  category: TournamentCategory | null;
  start_time: string | null;
  entry_fee: string | null;
  prizes: string | null;
  format: string | null;
  image_url: string | null;
  tournament_format: TournamentFormat;
}

// =============================================
// Typy dla turniejów grupowych
// =============================================

export interface GroupPlayer {
  id?: string;        // n01 player ID (tpid)
  name: string;
  position: number;   // pozycja w grupie (1-6)
  wins?: number;
  losses?: number;
  legsWon?: number;   // camelCase - zgodne z danymi ze scrapera (JSONB)
  legsLost?: number;  // camelCase - zgodne z danymi ze scrapera (JSONB)
  rank?: number;      // aktualna pozycja w tabeli
  average?: number;   // średnia (dla Steel)
}

export interface Group {
  id: string;
  tournament_id: string;
  group_number: number;
  group_name: string;
  station_number: number | null;
  players: GroupPlayer[];
  total_matches: number;
  completed_matches: number;
  status: MatchStatus;
  referee_scheme: string | null;
  created_at: string;
  updated_at: string;
  tournament?: Tournament;
}

export interface GroupMatch {
  id: string;
  group_id: string;
  tournament_id: string;
  match_order: number;
  player1_name: string;
  player2_name: string;
  player1_id: string | null;
  player2_id: string | null;
  player1_score: number;
  player2_score: number;
  referee: string | null;
  status: MatchStatus;
  created_at: string;
  updated_at: string;
  group?: Group;
}

export interface GroupWithMatches extends Group {
  matches: GroupMatch[];
}

export interface GroupedGroups {
  active: Group[];
  pending: Group[];
  finished: Group[];
}

export interface AdminAuthResponse {
  success: boolean;
  message?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface TournamentsApiResponse {
  tournaments: Tournament[];
}

export interface MatchesApiResponse {
  matches: Match[];
  lastUpdated: string;
}
