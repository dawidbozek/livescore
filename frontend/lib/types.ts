/**
 * Typy dla systemu Live Score
 */

export type MatchStatus = 'active' | 'pending' | 'finished' | 'walkover';

export interface Tournament {
  id: string;
  name: string;
  n01_url: string;
  tournament_date: string;
  is_active: boolean;
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
