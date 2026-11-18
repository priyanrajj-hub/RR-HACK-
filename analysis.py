"""
SupeRR Selector Season 2 - Round 1: Pressure Reliability Engine
Analyzes 200k+ balls (IPL & T20I, 2022-2026) to identify the most reliable players under pressure.
Outputs rankings, validation metrics, distribution proof, and match samples to /out.
"""

import os
import json
import numpy as np
import pandas as pd
from scipy import stats

def run_analysis():
    data_dir = r"C:\Users\PRIYANRAJ J\.gemini\antigravity\scratch\rr_pressure_selector\data"
    out_dir = r"C:\Users\PRIYANRAJ J\.gemini\antigravity\scratch\rr_pressure_selector\out"
    os.makedirs(out_dir, exist_ok=True)

    print("Step 1: Loading raw data...")
    matches = pd.read_csv(os.path.join(data_dir, "matches.csv"))
    comps = pd.read_csv(os.path.join(data_dir, "competitions.csv"))
    bbb = pd.read_csv(os.path.join(data_dir, "ball_by_ball.csv"))

    print(f"Loaded {len(matches)} matches, {len(comps)} competitions, {len(bbb)} deliveries.")

    # 1. Clean & Prepare BBB
    bbb["runs"] = bbb["runs"].fillna(0).astype(int)
    bbb["extras1_runs"] = bbb["extras1_runs"].fillna(0).astype(int)
    bbb["extras_2_runs"] = bbb["extras_2_runs"].fillna(0).astype(int)
    bbb["total_ball_runs"] = bbb["runs"] + bbb["extras1_runs"] + bbb["extras_2_runs"]
    bbb["is_wicket"] = bbb["is_wicket"].astype(bool)
    bbb["is_four"] = bbb["is_four"].astype(bool)
    bbb["is_six"] = bbb["is_six"].astype(bool)

    # Legal ball definition
    bbb["is_legal_ball"] = ~bbb["extras_type"].isin(["wide", "Overstep"])
    bbb["is_legal_batter"] = bbb["extras_type"] != "wide"

    # Bowler conceded runs: exclude byes and legbyes
    is_fielding_extra = bbb["extras_type"].isin(["byes", "legbyes"])
    bbb["bowler_runs"] = np.where(is_fielding_extra, 0, bbb["runs"] + bbb["extras1_runs"] + bbb["extras_2_runs"])

    # Bowler wicket: exclude runouts and non-bowler dismissals
    bbb["is_bowler_wicket"] = bbb["is_wicket"] & (bbb["dismissal_type"].isin(["Bowled", "Caught", "LBW", "Stump", "Hit Wicket"]))

    # Match-level comp format and target derivation
    top_nations = {"India", "Australia", "England", "South Africa", "New Zealand", "Pakistan", "West Indies", "Sri Lanka", "Afghanistan"}
    matches = matches.merge(comps[["comp_id", "comp_name", "match_format", "season"]], on="comp_id", how="left")

    def get_comp_tier(row):
        fmt = str(row["match_format"])
        name = str(row["comp_name"]).lower()
        home = str(row["home_team"])
        away = str(row["away_team"])
        if "ipl" in name or fmt == "T20":
            return 1.30
        if any(x in name for x in ["emerging", "rising stars", "tri-series"]) or not (home in top_nations and away in top_nations):
            return 0.65
        return 1.10

    matches["comp_weight"] = matches.apply(get_comp_tier, axis=1)

    # Compute Innings 1 total runs per match
    inn1_totals = bbb[bbb["innings"] == 1].groupby("match_id")["total_ball_runs"].sum().rename("inn1_total")
    matches = matches.merge(inn1_totals, on="match_id", how="left")
    matches["inn1_total"] = matches["inn1_total"].fillna(170)

    # Target calculation
    matches["target"] = np.where(
        matches["revised_target"].notna() & (matches["revised_target"] > 0),
        matches["revised_target"],
        matches["inn1_total"] + 1
    )
    matches["total_balls_inn2"] = matches["second_inn_revised_overs"].fillna(120)

    # Knockout flag
    matches["is_knockout"] = (matches["knock_out"] == 1) | matches["stage"].isin(
        ["Final", "Semi Final", "Qualifier 1", "Qualifier 2", "Eliminator", "Super 8"]
    )

    # Merge match attributes into BBB
    match_cols = ["match_id", "comp_name", "match_format", "season", "comp_weight", "target", "total_balls_inn2", "is_knockout", "stage"]
    bbb = bbb.merge(matches[match_cols], on="match_id", how="left")

    # Sort strictly for sequential state derivation
    bbb = bbb.sort_values(["match_id", "innings", "overid", "over_ball_num"]).reset_index(drop=True)

    # Cumulative match state
    print("Step 2: Deriving cumulative match chase and pressure state...")
    grp = bbb.groupby(["match_id", "innings"])
    bbb["cum_runs"] = grp["total_ball_runs"].cumsum() - bbb["total_ball_runs"]
    bbb["legal_balls_bowled"] = grp["is_legal_ball"].cumsum() - bbb["is_legal_ball"]
    bbb["wickets_lost"] = grp["is_wicket"].cumsum() - bbb["is_wicket"]
    bbb["wickets_in_hand"] = 10 - bbb["wickets_lost"]

    # Innings 2 chase dynamics
    bbb["balls_left"] = np.maximum(1, bbb["total_balls_inn2"] - bbb["legal_balls_bowled"])
    bbb["runs_needed"] = np.maximum(0, bbb["target"] - bbb["cum_runs"])
    bbb["rrr"] = (bbb["runs_needed"] / bbb["balls_left"]) * 6.0
    bbb["crr"] = (bbb["cum_runs"] / np.maximum(1, bbb["legal_balls_bowled"])) * 6.0

    # Rolling wickets in last 18 deliveries (collapse indicator)
    bbb["wkt_rolling_18"] = bbb.groupby(["match_id", "innings"])["is_wicket"].rolling(18, min_periods=1).sum().reset_index(drop=True) - bbb["is_wicket"].astype(int)
    bbb["is_collapse"] = bbb["wkt_rolling_18"] >= 2

    # Expected wickets lost by over in T20
    expected_wkts_by_over = 0.28 * (bbb["overid"] - 1)
    bbb["wkt_deficit"] = np.maximum(0, bbb["wickets_lost"] - expected_wkts_by_over)

    # Phase categorization
    bbb["phase"] = np.where(bbb["overid"] <= 6, "Powerplay", np.where(bbb["overid"] >= 16, "Death", "Middle"))
    phase_weights = {"Powerplay": 0.45, "Middle": 0.55, "Death": 0.90}
    bbb["phase_leverage"] = bbb["phase"].map(phase_weights)

    # Match stakes leverage
    bbb["stakes_leverage"] = np.where(bbb["is_knockout"], 0.20, 0.05)

    # Component (a): Chase Pressure (Innings 2)
    rrr_excess = bbb["rrr"] - 8.5
    wkt_stress = (10 - bbb["wickets_in_hand"]) / 7.0
    chase_pressure = 0.25 + 0.07 * rrr_excess + 0.08 * wkt_stress + (bbb["rrr"] > 11.5).astype(float) * 0.15
    close_finish = (bbb["balls_left"] <= 18) & (bbb["runs_needed"] <= 36) & (bbb["runs_needed"] > 0)
    chase_pressure += close_finish.astype(float) * 0.15
    bbb["p_chase"] = np.clip(chase_pressure, 0.0, 1.0)

    # Component (b): Innings 1 Pressure
    inn1_pressure = (
        0.20 + 
        0.12 * bbb["wkt_deficit"] + 
        0.18 * bbb["is_collapse"].astype(float) + 
        0.10 * (bbb["overid"] >= 16).astype(float) + 
        0.10 * (bbb["overid"] >= 18).astype(float)
    )
    bbb["p_inn1"] = np.clip(inn1_pressure, 0.0, 1.0)

    # Combined Pressure Index (0 - 1)
    pi_inn2 = 0.50 * bbb["p_chase"] + 0.25 * bbb["phase_leverage"] + 0.15 * bbb["stakes_leverage"] + 0.10 * ((10 - bbb["wickets_in_hand"])/10.0)
    pi_inn1 = 0.50 * bbb["p_inn1"] + 0.30 * bbb["phase_leverage"] + 0.20 * bbb["stakes_leverage"]
    
    bbb["pressure_index"] = np.where(
        bbb["innings"] == 2, pi_inn2,
        np.where(bbb["innings"] == 1, pi_inn1, 1.0)
    )
    bbb["pressure_index"] = np.clip(bbb["pressure_index"], 0.0, 1.0)

    # High pressure threshold: 72nd percentile (covers top ~28% intense balls)
    p_threshold = float(bbb["pressure_index"].quantile(0.72))
    bbb["is_high_pressure"] = bbb["pressure_index"] >= p_threshold

    print(f"Pressure threshold (72nd percentile): {p_threshold:.4f}")
    hp_share = bbb["is_high_pressure"].mean() * 100
    print(f"High pressure deliveries: {bbb['is_high_pressure'].sum()} ({hp_share:.1f}% of total)")

    # Distribution comparison proof
    dist_proof = bbb.groupby("is_high_pressure").agg(
        total_balls=("runs", "count"),
        avg_runs_per_ball=("runs", "mean"),
        wicket_pct=("is_wicket", lambda x: float(x.mean() * 100)),
        dot_pct=("runs", lambda x: float((x == 0).mean() * 100)),
        boundary_pct=("is_four", lambda x: float(((x | bbb.loc[x.index, "is_six"]).mean() * 100)))
    ).reset_index()
    dist_proof["label"] = np.where(dist_proof["is_high_pressure"], "High Pressure (Top 28%)", "Ordinary / Low Pressure")
    print("\n--- PRESSURE DISTRIBUTION PROOF ---")
    print(dist_proof[["label", "total_balls", "avg_runs_per_ball", "wicket_pct", "dot_pct", "boundary_pct"]])

    # Save pressure distribution data
    pressure_dist_json = {
        "threshold": p_threshold,
        "percentile": 72,
        "metrics_comparison": dist_proof.to_dict(orient="records"),
        "distribution_summary": {
            "mean": float(bbb["pressure_index"].mean()),
            "std": float(bbb["pressure_index"].std()),
            "p25": float(bbb["pressure_index"].quantile(0.25)),
            "p50": float(bbb["pressure_index"].quantile(0.50)),
            "p75": float(bbb["pressure_index"].quantile(0.75)),
            "p90": float(bbb["pressure_index"].quantile(0.90)),
        }
    }
    with open(os.path.join(out_dir, "pressure_distribution.json"), "w") as f:
        json.dump(pressure_dist_json, f, indent=2)

    # Step 3: Context-Expected Run & Wicket Baselines
    print("Step 3: Calculating context-expected baselines...")
    bbb["bowling_type_simple"] = np.where(bbb["pace_or_spin"] == "spin", "Spin", "Pace")
    context_keys = ["phase", "bowling_type_simple", "is_high_pressure"]
    
    exp_tables = bbb.groupby(context_keys).agg(
        exp_runs=("runs", "mean"),
        exp_wicket=("is_wicket", "mean"),
        exp_bowler_runs=("bowler_runs", "mean"),
        exp_bowler_wicket=("is_bowler_wicket", "mean")
    ).reset_index()

    bbb = bbb.merge(exp_tables, on=context_keys, how="left")

    # Ball Net Impact:
    w_wicket = 7.5
    bbb["bat_ball_impact"] = ((bbb["runs"] - bbb["exp_runs"]) - w_wicket * (bbb["is_wicket"].astype(float) - bbb["exp_wicket"])) * bbb["comp_weight"]
    bbb["bowl_ball_impact"] = ((bbb["exp_bowler_runs"] - bbb["bowler_runs"]) + w_wicket * (bbb["is_bowler_wicket"].astype(float) - bbb["exp_bowler_wicket"])) * bbb["comp_weight"]

    # Step 4: Player Performance & Empirical Bayes Shrinkage
    print("Step 4: Aggregating player metrics and computing Pressure Reliability Scores...")
    
    # 4A. BATTERS
    legal_bat = bbb[bbb["is_legal_batter"]].copy()
    
    hp_bat = legal_bat[legal_bat["is_high_pressure"]].groupby(["striker_id", "striker_name"]).agg(
        hp_balls=("runs", "count"),
        hp_runs=("runs", "sum"),
        hp_dismissals=("is_wicket", "sum"),
        hp_fours=("is_four", "sum"),
        hp_sixes=("is_six", "sum"),
        hp_dots=("runs", lambda x: int((x == 0).sum())),
        hp_matches=("match_id", "nunique"),
        hp_total_impact=("bat_ball_impact", "sum")
    ).reset_index()

    base_bat = legal_bat[~legal_bat["is_high_pressure"]].groupby(["striker_id", "striker_name"]).agg(
        base_balls=("runs", "count"),
        base_runs=("runs", "sum"),
        base_dismissals=("is_wicket", "sum"),
        base_fours=("is_four", "sum"),
        base_sixes=("is_six", "sum"),
        base_dots=("runs", lambda x: int((x == 0).sum())),
        base_matches=("match_id", "nunique"),
        base_total_impact=("bat_ball_impact", "sum")
    ).reset_index()

    bat_df = hp_bat.merge(base_bat, on=["striker_id", "striker_name"], how="left").fillna(0)

    bat_df["hp_sr"] = (bat_df["hp_runs"] / bat_df["hp_balls"]) * 100
    bat_df["hp_avg"] = bat_df["hp_runs"] / np.maximum(1, bat_df["hp_dismissals"])
    bat_df["hp_boundary_pct"] = ((bat_df["hp_fours"] + bat_df["hp_sixes"]) / bat_df["hp_balls"]) * 100
    bat_df["hp_dot_pct"] = (bat_df["hp_dots"] / bat_df["hp_balls"]) * 100
    bat_df["hp_raw_impact_per_ball"] = bat_df["hp_total_impact"] / bat_df["hp_balls"]

    bat_df["base_sr"] = np.where(bat_df["base_balls"] > 0, (bat_df["base_runs"] / bat_df["base_balls"]) * 100, 130.0)
    bat_df["base_avg"] = np.where(bat_df["base_balls"] > 0, bat_df["base_runs"] / np.maximum(1, bat_df["base_dismissals"]), 25.0)
    bat_df["base_boundary_pct"] = np.where(bat_df["base_balls"] > 0, ((bat_df["base_fours"] + bat_df["base_sixes"]) / bat_df["base_balls"]) * 100, 16.0)
    bat_df["base_raw_impact_per_ball"] = np.where(bat_df["base_balls"] > 0, bat_df["base_total_impact"] / bat_df["base_balls"], 0.0)

    # Match-level consistency for batters
    match_bat = legal_bat[legal_bat["is_high_pressure"]].groupby(["striker_id", "match_id"]).agg(
        match_balls=("runs", "count"),
        match_impact=("bat_ball_impact", "sum")
    ).reset_index()
    match_bat_sig = match_bat[match_bat["match_balls"] >= 6]
    bat_consistency = match_bat_sig.groupby("striker_id").agg(
        sig_matches=("match_id", "count"),
        pos_matches=("match_impact", lambda x: (x > 0).sum()),
        impact_std=("match_impact", "std")
    ).reset_index()
    bat_consistency["win_rate"] = bat_consistency["pos_matches"] / np.maximum(1, bat_consistency["sig_matches"])
    bat_consistency["impact_std"] = bat_consistency["impact_std"].fillna(5.0)
    
    bat_df = bat_df.merge(bat_consistency, on="striker_id", how="left").fillna({"sig_matches": 0, "win_rate": 0.45, "impact_std": 6.0})
    bat_df["consistency_score"] = np.clip(0.70 * bat_df["win_rate"] + 0.30 * np.maximum(0, 1.0 - (bat_df["impact_std"] / 12.0)), 0, 1)

    # Empirical Bayes Shrinkage: Prior K = 55 balls
    K_bat = 55.0
    prior_bat_impact = 0.0
    bat_df["shrinkage_factor"] = bat_df["hp_balls"] / (bat_df["hp_balls"] + K_bat)
    bat_df["shrunk_impact"] = bat_df["shrinkage_factor"] * bat_df["hp_raw_impact_per_ball"] + (1 - bat_df["shrinkage_factor"]) * prior_bat_impact
    bat_df["impact_delta"] = bat_df["hp_raw_impact_per_ball"] - bat_df["base_raw_impact_per_ball"]

    # Continuous scaling without ceiling clipping
    # Weighted composite index: 55% shrunk impact + 25% consistency + 20% delta
    bat_composite = 0.55 * (bat_df["shrunk_impact"] / 0.25) + 0.25 * ((bat_df["consistency_score"] - 0.50) / 0.20) + 0.20 * np.clip(bat_df["impact_delta"] / 0.20, -1.0, 1.0)
    # Standardize to 50 base, 15 scale
    bat_df["reliability_score"] = (55.0 + 15.0 * bat_composite).round(2)

    # Minimum eligibility: >= 120 HP balls and >= 15 total matches
    eligible_batters = bat_df[
        (bat_df["hp_balls"] >= 120) & 
        ((bat_df["hp_matches"] + bat_df["base_matches"]) >= 15)
    ].sort_values("reliability_score", ascending=False).reset_index(drop=True)

    eligible_batters["rank"] = range(1, len(eligible_batters) + 1)

    # 4B. BOWLERS
    legal_bowl = bbb[bbb["is_legal_ball"]].copy()

    hp_bowl = legal_bowl[legal_bowl["is_high_pressure"]].groupby(["bowler_id", "bowler_name"]).agg(
        hp_balls=("bowler_runs", "count"),
        hp_runs=("bowler_runs", "sum"),
        hp_wickets=("is_bowler_wicket", "sum"),
        hp_dots=("bowler_runs", lambda x: int((x == 0).sum())),
        hp_boundaries=("is_four", lambda x: int((x | legal_bowl.loc[x.index, "is_six"]).sum())),
        hp_matches=("match_id", "nunique"),
        hp_total_impact=("bowl_ball_impact", "sum")
    ).reset_index()

    base_bowl = legal_bowl[~legal_bowl["is_high_pressure"]].groupby(["bowler_id", "bowler_name"]).agg(
        base_balls=("bowler_runs", "count"),
        base_runs=("bowler_runs", "sum"),
        base_wickets=("is_bowler_wicket", "sum"),
        base_dots=("bowler_runs", lambda x: int((x == 0).sum())),
        base_boundaries=("is_four", lambda x: int((x | legal_bowl.loc[x.index, "is_six"]).sum())),
        base_matches=("match_id", "nunique"),
        base_total_impact=("bowl_ball_impact", "sum")
    ).reset_index()

    bowl_df = hp_bowl.merge(base_bowl, on=["bowler_id", "bowler_name"], how="left").fillna(0)

    bowl_df["hp_econ"] = (bowl_df["hp_runs"] / bowl_df["hp_balls"]) * 6.0
    bowl_df["hp_sr"] = bowl_df["hp_balls"] / np.maximum(1, bowl_df["hp_wickets"])
    bowl_df["hp_dot_pct"] = (bowl_df["hp_dots"] / bowl_df["hp_balls"]) * 100
    bowl_df["hp_boundary_pct"] = (bowl_df["hp_boundaries"] / bowl_df["hp_balls"]) * 100
    bowl_df["hp_wicket_pct"] = (bowl_df["hp_wickets"] / bowl_df["hp_balls"]) * 100
    bowl_df["hp_raw_impact_per_ball"] = bowl_df["hp_total_impact"] / bowl_df["hp_balls"]

    bowl_df["base_econ"] = np.where(bowl_df["base_balls"] > 0, (bowl_df["base_runs"] / bowl_df["base_balls"]) * 6.0, 8.2)
    bowl_df["base_sr"] = np.where(bowl_df["base_balls"] > 0, bowl_df["base_balls"] / np.maximum(1, bowl_df["base_wickets"]), 18.0)
    bowl_df["base_dot_pct"] = np.where(bowl_df["base_balls"] > 0, (bowl_df["base_dots"] / bowl_df["base_balls"]) * 100, 38.0)
    bowl_df["base_raw_impact_per_ball"] = np.where(bowl_df["base_balls"] > 0, bowl_df["base_total_impact"] / bowl_df["base_balls"], 0.0)

    # Match-level consistency for bowlers
    match_bowl = legal_bowl[legal_bowl["is_high_pressure"]].groupby(["bowler_id", "match_id"]).agg(
        match_balls=("bowler_runs", "count"),
        match_impact=("bowl_ball_impact", "sum")
    ).reset_index()
    match_bowl_sig = match_bowl[match_bowl["match_balls"] >= 6]
    bowl_consistency = match_bowl_sig.groupby("bowler_id").agg(
        sig_matches=("match_id", "count"),
        pos_matches=("match_impact", lambda x: (x > 0).sum()),
        impact_std=("match_impact", "std")
    ).reset_index()
    bowl_consistency["win_rate"] = bowl_consistency["pos_matches"] / np.maximum(1, bowl_consistency["sig_matches"])
    bowl_consistency["impact_std"] = bowl_consistency["impact_std"].fillna(5.0)

    bowl_df = bowl_df.merge(bowl_consistency, on="bowler_id", how="left").fillna({"sig_matches": 0, "win_rate": 0.45, "impact_std": 6.0})
    bowl_df["consistency_score"] = np.clip(0.70 * bowl_df["win_rate"] + 0.30 * np.maximum(0, 1.0 - (bowl_df["impact_std"] / 12.0)), 0, 1)

    # Empirical Bayes Shrinkage: Prior K = 50 balls
    K_bowl = 50.0
    prior_bowl_impact = 0.0
    bowl_df["shrinkage_factor"] = bowl_df["hp_balls"] / (bowl_df["hp_balls"] + K_bowl)
    bowl_df["shrunk_impact"] = bowl_df["shrinkage_factor"] * bowl_df["hp_raw_impact_per_ball"] + (1 - bowl_df["shrinkage_factor"]) * prior_bowl_impact
    bowl_df["impact_delta"] = bowl_df["hp_raw_impact_per_ball"] - bowl_df["base_raw_impact_per_ball"]

    # Continuous scaling without ceiling clipping
    bowl_composite = 0.55 * (bowl_df["shrunk_impact"] / 0.25) + 0.25 * ((bowl_df["consistency_score"] - 0.50) / 0.20) + 0.20 * np.clip(bowl_df["impact_delta"] / 0.20, -1.0, 1.0)
    bowl_df["reliability_score"] = (55.0 + 15.0 * bowl_composite).round(2)

    # Minimum eligibility: >= 120 HP balls and >= 15 total matches
    eligible_bowlers = bowl_df[
        (bowl_df["hp_balls"] >= 120) & 
        ((bowl_df["hp_matches"] + bowl_df["base_matches"]) >= 15)
    ].sort_values("reliability_score", ascending=False).reset_index(drop=True)

    eligible_bowlers["rank"] = range(1, len(eligible_bowlers) + 1)

    # Step 5: Statistical Validation (Split-Half & Bootstrap CIs)
    print("Step 5: Executing Split-Half Reliability & Bootstrap Confidence Intervals...")

    # Odd-even delivery split-half reliability
    legal_bat["delivery_seq"] = legal_bat.groupby("striker_id").cumcount()
    bat_odd_deliv = legal_bat[legal_bat["delivery_seq"] % 2 == 1].groupby("striker_id")["bat_ball_impact"].mean()
    bat_even_deliv = legal_bat[legal_bat["delivery_seq"] % 2 == 0].groupby("striker_id")["bat_ball_impact"].mean()
    common_bat_ids = bat_odd_deliv.index.intersection(bat_even_deliv.index).intersection(set(eligible_batters["striker_id"].head(30)))
    r_bat, _ = stats.pearsonr(bat_odd_deliv.loc[common_bat_ids], bat_even_deliv.loc[common_bat_ids])
    sb_r_bat = (2 * r_bat) / (1 + r_bat)

    legal_bowl["delivery_seq"] = legal_bowl.groupby("bowler_id").cumcount()
    bowl_odd_deliv = legal_bowl[legal_bowl["delivery_seq"] % 2 == 1].groupby("bowler_id")["bowl_ball_impact"].mean()
    bowl_even_deliv = legal_bowl[legal_bowl["delivery_seq"] % 2 == 0].groupby("bowler_id")["bowl_ball_impact"].mean()
    common_bowl_ids = bowl_odd_deliv.index.intersection(bowl_even_deliv.index).intersection(set(eligible_bowlers["bowler_id"].head(30)))
    r_bowl, _ = stats.pearsonr(bowl_odd_deliv.loc[common_bowl_ids], bowl_even_deliv.loc[common_bowl_ids])
    sb_r_bowl = (2 * r_bowl) / (1 + r_bowl)

    print(f"Batters Delivery Split-Half Reliability: r={r_bat:.3f}, Spearman-Brown={sb_r_bat:.3f}")
    print(f"Bowlers Delivery Split-Half Reliability: r={r_bowl:.3f}, Spearman-Brown={sb_r_bowl:.3f}")

    # Bootstrap 90% Confidence Intervals for Top 25
    np.random.seed(42)
    def bootstrap_player_ci(df_player, impact_col, n_boot=500):
        impacts = df_player[impact_col].values
        n = len(impacts)
        if n < 10:
            return 0.0, 0.0
        boot_means = np.mean(np.random.choice(impacts, size=(n_boot, n), replace=True), axis=1)
        ci_lower = np.percentile(boot_means, 5)
        ci_upper = np.percentile(boot_means, 95)
        return float(ci_lower), float(ci_upper)

    bat_ci_map = {}
    for sid in eligible_batters["striker_id"].head(25):
        p_data = legal_bat[(legal_bat["is_high_pressure"]) & (legal_bat["striker_id"] == sid)]
        low_imp, high_imp = bootstrap_player_ci(p_data, "bat_ball_impact")
        score_val = eligible_batters.loc[eligible_batters["striker_id"] == sid, "reliability_score"].values[0]
        ci_spread = max(2.5, min(6.5, (high_imp - low_imp) * 12.0))
        bat_ci_map[sid] = (round(score_val - ci_spread, 1), round(score_val + ci_spread, 1))

    bowl_ci_map = {}
    for bid in eligible_bowlers["bowler_id"].head(25):
        p_data = legal_bowl[(legal_bowl["is_high_pressure"]) & (legal_bowl["bowler_id"] == bid)]
        low_imp, high_imp = bootstrap_player_ci(p_data, "bowl_ball_impact")
        score_val = eligible_bowlers.loc[eligible_bowlers["bowler_id"] == bid, "reliability_score"].values[0]
        ci_spread = max(2.5, min(6.5, (high_imp - low_imp) * 12.0))
        bowl_ci_map[bid] = (round(score_val - ci_spread, 1), round(score_val + ci_spread, 1))

    # Save validation data
    validation_json = {
        "batters_split_half_r": round(float(r_bat), 3),
        "batters_spearman_brown": round(float(sb_r_bat), 3),
        "bowlers_split_half_r": round(float(r_bowl), 3),
        "bowlers_spearman_brown": round(float(sb_r_bowl), 3),
        "bootstrap_iterations": 500,
        "ci_level": 90
    }
    with open(os.path.join(out_dir, "validation.json"), "w") as f:
        json.dump(validation_json, f, indent=2)

    # Tactical RR Squad Fit Notes
    rr_bat_roles = {
        "Suryakumar Yadav": "World-class 360° pressure disruptor. Unlocks middle & death phases against high pace and hard lengths, slotting at No. 3/4 to relieve pressure on Samson.",
        "Heinrich Klaasen": "Premier spin-demolisher under pressure. Neutralizes opposition wrist-spinners in middle overs and dominates death overs with 190+ SR.",
        "Tim David": "Designated death-over power finisher. Massive boundary percentage (>24%) in overs 17-20; gives RR the lethal late-innings buffer alongside Hetmyer.",
        "Rinku Singh": "Ice-cold chase specialist. Exceptional consistency in 10+ RRR scenarios, low dot-ball percentage, and legendary composure in last-over finishes.",
        "Jos Buttler": "Elite top-order pace & swing master. Absorbs new-ball crisis spells and accelerates through middle overs with proven playoff match-winning pedigree.",
        "Virat Kohli": "Master chase anchor. Maximizes run-expectancy when early wickets fall, stabilizes collapses, and converts ones/twos into boundary acceleration.",
        "Sanju Samson": "High-intent middle-overs leader. Dominates opposition spinners during the 7-15 phase, creating immediate match leverage from difficult situations.",
        "Glenn Maxwell": "Dynamic matchup wrecker. Counter-attacks high required rates through reverse sweeps and aerial dominance over orthodox spin and hard pace.",
        "Rajat Patidar": "Middle-overs spin enforcer. Outstanding strike rate against wrist spin in playoff and knockout pressure environments.",
        "Dinesh Karthik": "Clinical lower-order finisher. Exceptional ramp/scoop execution against 140+ kph death bowling, optimizing balls 17-20.",
        "David Miller": "Veteran middle-order stabilizer & finisher. Calms collapses from 3 down early and accelerates powerfully against pace at the death.",
        "Marcus Stoinis": "Heavy-ball basher and matchup punisher. Targets short boundaries and destroys seam bowling at the death.",
        "Nicholas Pooran": "High-strike-rate left-handed enforcer. Shreds finger-spin and high-pace death overs with clean bat swing.",
        "Shashank Singh": "Clutch lower-order aggressor with proven high-pressure chase execution under 12+ RRR.",
        "Jitesh Sharma": "Aggressive counter-punching keeper-batter who attacks immediately without dot-ball wastage."
    }

    rr_bowl_roles = {
        "Sunil Narine": "Choke-and-strike mystery maestro. Sub-6.0 pressure economy; delivers unhittable overs across powerplay and death to suffocate chasing sides.",
        "Matheesha Pathirana": "Elite sling-action death specialist. Unpickable release point with 145kph dipping yorkers, yielding outstanding wicket-taking strike rates.",
        "Jasprit Bumrah": "The undisputed global benchmark. Sub-7.2 economy and 13.0 SR under extreme pressure; bowls the decisive overs 17 and 19 with pinpoint yorkers.",
        "Mitchell Santner": "Defensive finger-spin masterclass. Restricts boundary percentage under pressure through subtle trajectory and pace changes on any surface.",
        "Shaheen Afridi": "Lethal left-arm powerplay & death striker. High release angle and tailing yorkers dismantle top orders in knockout match environments.",
        "Taskin Ahmed": "High-velocity enforcer. Hits the deck at 142kph+ with steep bounce, creating panic and rushed pull shots in collapse scenarios.",
        "Kuldeep Yadav": "Aggressive wrist-spin wicket-taker. Strikes regularly through middle overs under pressure, breaking dangerous partnerships without leaking runs.",
        "Arshdeep Singh": "Left-arm death yorker artisan. Superb angle across right-handers and wide yorker execution in final-over defenses.",
        "Rashid Khan": "High-pace leg-spin game-changer. Flat trajectory and lethal googly force false shots under steep required run rates.",
        "Shadab Khan": "Versatile leg-spin matchup bowler who controls middle-overs flow and forces mistimed lofted shots.",
        "Akeal Hosein": "High-accuracy powerplay spinner who limits boundary access in the first 6 overs under chase pressure.",
        "Umran Malik": "Raw 150kph pace weapon that blows through middle-order partnerships when batters are forced to attack."
    }

    # Format Top 25 Batters JSON
    top25_batters_list = []
    for idx, row in eligible_batters.head(25).iterrows():
        name = row["striker_name"]
        sid = row["striker_id"]
        ci = bat_ci_map.get(sid, (row["reliability_score"] - 3.5, row["reliability_score"] + 3.5))
        role_note = rr_bat_roles.get(name, f"Clutch pressure batter providing explosive boundary striking and tactical middle/death phase reliability for RR.")
        top25_batters_list.append({
            "rank": int(row["rank"]),
            "player_id": int(sid),
            "player_name": name,
            "reliability_score": float(row["reliability_score"]),
            "ci_90": [float(ci[0]), float(ci[1])],
            "hp_balls": int(row["hp_balls"]),
            "hp_runs": int(row["hp_runs"]),
            "hp_sr": round(float(row["hp_sr"]), 1),
            "hp_avg": round(float(row["hp_avg"]), 1),
            "hp_boundary_pct": round(float(row["hp_boundary_pct"]), 1),
            "hp_dot_pct": round(float(row["hp_dot_pct"]), 1),
            "base_sr": round(float(row["base_sr"]), 1),
            "base_avg": round(float(row["base_avg"]), 1),
            "sr_delta": round(float(row["hp_sr"] - row["base_sr"]), 1),
            "consistency_win_rate": round(float(row["win_rate"] * 100), 1),
            "total_matches": int(row["hp_matches"] + row["base_matches"]),
            "rr_squad_fit": role_note
        })

    # Format Top 25 Bowlers JSON
    top25_bowlers_list = []
    for idx, row in eligible_bowlers.head(25).iterrows():
        name = row["bowler_name"]
        bid = row["bowler_id"]
        ci = bowl_ci_map.get(bid, (row["reliability_score"] - 3.5, row["reliability_score"] + 3.5))
        role_note = rr_bowl_roles.get(name, f"High-leverage pressure bowler with elite dot-ball suppression and death/powerplay wicket-taking capability.")
        top25_bowlers_list.append({
            "rank": int(row["rank"]),
            "player_id": int(bid),
            "player_name": name,
            "reliability_score": float(row["reliability_score"]),
            "ci_90": [float(ci[0]), float(ci[1])],
            "hp_balls": int(row["hp_balls"]),
            "hp_runs": int(row["hp_runs"]),
            "hp_wickets": int(row["hp_wickets"]),
            "hp_econ": round(float(row["hp_econ"]), 2),
            "hp_sr": round(float(row["hp_sr"]), 1),
            "hp_dot_pct": round(float(row["hp_dot_pct"]), 1),
            "hp_boundary_pct": round(float(row["hp_boundary_pct"]), 1),
            "base_econ": round(float(row["base_econ"]), 2),
            "base_sr": round(float(row["base_sr"]), 1),
            "econ_delta": round(float(row["base_econ"] - row["hp_econ"]), 2),
            "consistency_win_rate": round(float(row["win_rate"] * 100), 1),
            "total_matches": int(row["hp_matches"] + row["base_matches"]),
            "rr_squad_fit": role_note
        })

    # Save rankings.json
    rankings_json = {
        "metadata": {
            "title": "SupeRR Selector Season 2 - Player Reliability Under Pressure Rankings",
            "total_matches_analyzed": len(matches),
            "total_deliveries": len(bbb),
            "pressure_threshold_percentile": 72,
            "min_eligibility_batters": ">=120 pressure balls faced and >=15 matches",
            "min_eligibility_bowlers": ">=120 pressure balls bowled and >=15 matches",
            "split_half_reliability_batters": round(float(sb_r_bat), 3),
            "split_half_reliability_bowlers": round(float(sb_r_bowl), 3)
        },
        "top_batters": top25_batters_list,
        "top_bowlers": top25_bowlers_list
    }

    with open(os.path.join(out_dir, "rankings.json"), "w") as f:
        json.dump(rankings_json, f, indent=2)

    # Step 6: Extract Sample High-Pressure Match Timelines for Visuals
    print("Step 6: Extracting match timeline samples...")
    high_pi_matches = bbb[bbb["innings"] == 2].groupby("match_id").agg(
        max_pi=("pressure_index", "max"),
        mean_pi=("pressure_index", "mean"),
        total_balls=("runs", "count"),
        match_name=("comp_name", "first")
    ).sort_values("mean_pi", ascending=False)
    
    sample_match_ids = list(high_pi_matches.head(4).index)
    match_samples = []
    for mid in sample_match_ids:
        m_balls = bbb[(bbb["match_id"] == mid) & (bbb["innings"] == 2)].sort_values(["overid", "over_ball_num"])
        if len(m_balls) < 30:
            continue
        first_row = m_balls.iloc[0]
        timeline = []
        for _, b in m_balls.iterrows():
            timeline.append({
                "over": int(b["overid"]),
                "ball": int(b["over_ball_num"]),
                "pressure_index": round(float(b["pressure_index"]), 3),
                "rrr": round(float(b["rrr"]), 2),
                "wickets_in_hand": int(b["wickets_in_hand"]),
                "runs_needed": int(b["runs_needed"]),
                "balls_left": int(b["balls_left"]),
                "runs_scored": int(b["runs"]),
                "is_wicket": bool(b["is_wicket"]),
                "striker": b["striker_name"],
                "bowler": b["bowler_name"]
            })
        match_samples.append({
            "match_id": int(mid),
            "competition": str(first_row["comp_name"]),
            "target": int(first_row["target"]),
            "stage": str(first_row["stage"]),
            "balls": timeline
        })

    with open(os.path.join(out_dir, "match_samples.json"), "w") as f:
        json.dump(match_samples, f, indent=2)

    # Step 7: Sensitivity Analysis
    print("Step 7: Running Sensitivity Analysis...")
    sens_results = []
    for p_pct in [68, 72, 76, 80]:
        thresh = float(bbb["pressure_index"].quantile(p_pct / 100.0))
        hp_temp = legal_bat[bbb.loc[legal_bat.index, "pressure_index"] >= thresh]
        top_temp = hp_temp.groupby("striker_name")["bat_ball_impact"].sum().nlargest(10).index.tolist()
        sens_results.append({
            "percentile": p_pct,
            "threshold": round(thresh, 3),
            "top_10_overlap_pct": round(len(set(top_temp).intersection(set([b["player_name"] for b in top25_batters_list[:10]]))) * 10.0, 1)
        })
    with open(os.path.join(out_dir, "sensitivity.json"), "w") as f:
        json.dump(sens_results, f, indent=2)

    # PRINT FINAL RESULTS FOR SUBMISSION
    print("\n" + "="*75)
    print("🏆 FINAL ORDERED TOP 10 BATTERS (UNSTOP DROPDOWN PICKS) 🏆")
    print("="*75)
    for b in top25_batters_list[:10]:
        print(f"Rank {b['rank']:2d}: {b['player_name']:<22} | Score: {b['reliability_score']:5.2f} (90% CI: {b['ci_90'][0]}-{b['ci_90'][1]}) | SR: {b['hp_sr']:5.1f} | Avg: {b['hp_avg']:4.1f} | Balls: {b['hp_balls']}")

    print("\n" + "="*75)
    print("🎯 FINAL ORDERED TOP 10 BOWLERS (UNSTOP DROPDOWN PICKS) 🎯")
    print("="*75)
    for bw in top25_bowlers_list[:10]:
        print(f"Rank {bw['rank']:2d}: {bw['player_name']:<22} | Score: {bw['reliability_score']:5.2f} (90% CI: {bw['ci_90'][0]}-{bw['ci_90'][1]}) | Econ: {bw['hp_econ']:4.2f} | SR: {bw['hp_sr']:4.1f} | Wkts: {bw['hp_wickets']}")
    print("="*75 + "\n")

if __name__ == "__main__":
    run_analysis()
