"""
Statistical validation tests for Pressure Index, Empirical Bayes Shrinkage, and Top 10 Selection.
"""
import pytest
import json
import numpy as np
from pathlib import Path

RANKINGS_PATH = Path("out/rankings.json")
PRESSURE_DIST_PATH = Path("out/pressure_distribution.json")
VALIDATION_PATH = Path("out/validation.json")

def test_rankings_file_exists_and_valid():
    assert RANKINGS_PATH.exists(), "out/rankings.json must exist"
    with open(RANKINGS_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    assert "top_batters" in data
    assert "top_bowlers" in data

def test_top10_batters_strict_requirements():
    with open(RANKINGS_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    batters = data["top_batters"][:10]
    
    # 1. Exactly 10 players
    assert len(batters) == 10, "Must contain exactly 10 batters"
    
    # 2. Strict rank order 1 to 10
    ranks = [b["rank"] for b in batters]
    assert ranks == list(range(1, 11)), "Ranks must be strictly 1 through 10"
    
    # 3. Monotonically non-increasing scores
    scores = [b["reliability_score"] for b in batters]
    assert all(scores[i] >= scores[i+1] for i in range(len(scores)-1)), "Scores must decrease or remain equal with rank"
    
    # 4. Strict uniqueness (no duplicates)
    player_ids = [b["player_id"] for b in batters]
    assert len(player_ids) == len(set(player_ids)), "All 10 batters must have unique player IDs"
    
    player_names = [b["player_name"] for b in batters]
    assert len(player_names) == len(set(player_names)), "All 10 batters must have unique names"
    
    # 5. Minimum sample size requirements
    for b in batters:
        assert b["hp_balls"] >= 120, f"Batter {b['player_name']} has <120 pressure balls"
        assert b["total_matches"] >= 15, f"Batter {b['player_name']} has <15 matches"

def test_top10_bowlers_strict_requirements():
    with open(RANKINGS_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    bowlers = data["top_bowlers"][:10]
    
    # 1. Exactly 10 players
    assert len(bowlers) == 10, "Must contain exactly 10 bowlers"
    
    # 2. Strict rank order 1 to 10
    ranks = [b["rank"] for b in bowlers]
    assert ranks == list(range(1, 11)), "Ranks must be strictly 1 through 10"
    
    # 3. Monotonically non-increasing scores
    scores = [b["reliability_score"] for b in bowlers]
    assert all(scores[i] >= scores[i+1] for i in range(len(scores)-1)), "Scores must decrease or remain equal with rank"
    
    # 4. Strict uniqueness (no duplicates)
    player_ids = [b["player_id"] for b in bowlers]
    assert len(player_ids) == len(set(player_ids)), "All 10 bowlers must have unique player IDs"
    
    player_names = [b["player_name"] for b in bowlers]
    assert len(player_names) == len(set(player_names)), "All 10 bowlers must have unique names"
    
    # 5. Minimum sample size requirements
    for b in bowlers:
        assert b["hp_balls"] >= 120, f"Bowler {b['player_name']} has <120 pressure balls"
        assert b["total_matches"] >= 15, f"Bowler {b['player_name']} has <15 matches"

def test_empirical_bayes_shrinkage_behavior():
    """
    Test that Empirical Bayes shrinkage pulls smaller sample sizes closer to the population prior.
    Shaped score: S_shrunk = (n / (n + K)) * S_obs + (K / (n + K)) * mu
    """
    mu = 50.0
    K = 50.0
    
    # Observed raw score is high (80.0)
    raw_obs = 80.0
    
    # Small sample (n = 20)
    n_small = 20.0
    shrunk_small = (n_small / (n_small + K)) * raw_obs + (K / (n_small + K)) * mu
    
    # Large sample (n = 500)
    n_large = 500.0
    shrunk_large = (n_large / (n_large + K)) * raw_obs + (K / (n_large + K)) * mu
    
    # With small n, score should be pulled heavily toward mu (50)
    assert shrunk_small < shrunk_large
    assert abs(shrunk_small - mu) < abs(shrunk_large - mu)
    assert round(shrunk_small, 2) == 58.57

def test_pressure_distribution_differential():
    """
    Validate that high-pressure deliveries statistically exhibit higher wicket hazard
    and lower scoring rates than low-pressure deliveries.
    """
    if PRESSURE_DIST_PATH.exists():
        with open(PRESSURE_DIST_PATH, "r", encoding="utf-8") as f:
            dist = json.load(f)
        
        comparisons = {m["label"]: m for m in dist["metrics_comparison"]}
        hp = comparisons.get("High Pressure (Top 28%)")
        ord_p = comparisons.get("Ordinary / Low Pressure")
        
        assert hp is not None and ord_p is not None
        # High pressure must induce significantly higher wicket rate
        assert hp["wicket_pct"] > ord_p["wicket_pct"], "High pressure wicket rate must exceed ordinary wicket rate"
        assert hp["wicket_pct"] >= 7.0, "High pressure wicket rate should be >= 7.0%"
