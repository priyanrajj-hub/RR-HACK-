export interface Batter {
  rank: number;
  player_id: number;
  player_name: string;
  image_url?: string;
  team?: string;
  reliability_score: number;
  ci_90: [number, number];
  hp_balls: number;
  hp_runs: number;
  hp_sr: number;
  hp_avg: number;
  hp_boundary_pct: number;
  hp_dot_pct: number;
  base_sr: number;
  base_avg: number;
  sr_delta: number;
  consistency_win_rate: number;
  total_matches: number;
  rr_squad_fit: string;
  hp100?: number;
  base100?: number;
  consistency?: number;
  rank_interval?: string;
}

export interface Bowler {
  rank: number;
  player_id: number;
  player_name: string;
  image_url?: string;
  team?: string;
  reliability_score: number;
  ci_90: [number, number];
  hp_balls: number;
  hp_runs: number;
  hp_wickets: number;
  hp_econ: number;
  hp_sr: number;
  hp_dot_pct: number;
  hp_boundary_pct: number;
  base_econ: number;
  base_sr: number;
  econ_delta: number;
  consistency_win_rate: number;
  total_matches: number;
  rr_squad_fit: string;
  hp100?: number;
  base100?: number;
  rank_interval?: string;
}

export interface MatchBall {
  over: number;
  ball: number;
  pressure_index: number;
  rrr: number;
  wickets_in_hand: number;
  runs_needed: number;
  balls_left: number;
  runs_scored: number;
  is_wicket: boolean;
  striker: string;
  bowler: string;
}

export interface MatchSample {
  match_id: number;
  competition: string;
  target: number;
  stage: string;
  balls: MatchBall[];
}

export interface PressureMetricShift {
  is_high_pressure: boolean;
  label: string;
  total_balls: number;
  avg_runs_per_ball: number;
  wicket_pct: number;
  dot_pct: number;
  boundary_pct: number;
}

export interface PressureDistributionData {
  threshold: number;
  percentile: number;
  metrics_comparison: PressureMetricShift[];
  distribution_summary: {
    mean: number;
    std: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
  };
}
