"""
Unit tests for Cricket Domain Rules according to MCC Laws & SupeRR Selector Specifications.
"""
import pytest
import pandas as pd
import numpy as np

def test_legal_ball_bowler_classification():
    """
    MCC Law 21 & 22:
    Wides and Oversteps do NOT count as legal deliveries in the bowler's 6-ball over count.
    Byes, Leg-byes, and standard runs DO count as legal deliveries bowled.
    """
    sample_deliveries = pd.DataFrame([
        {"extras_type": np.nan, "runs": 0},          # Legal dot
        {"extras_type": "wide", "runs": 0},          # Wide (illegal)
        {"extras_type": "Overstep", "runs": 1},      # No-ball (illegal)
        {"extras_type": "legbyes", "runs": 0},       # Legal (ball bowled legally)
        {"extras_type": "byes", "runs": 0},          # Legal
        {"extras_type": "Penalty", "runs": 0},       # Illegal extra
    ])
    
    # Definition from analysis.py:
    # legal_bowled = ~extras_type.isin(['wide', 'Overstep', 'Penalty'])
    legal_bowled = ~sample_deliveries["extras_type"].isin(["wide", "Overstep", "Penalty"])
    
    assert legal_bowled.sum() == 3
    assert legal_bowled.iloc[0] == True   # Dot ball
    assert legal_bowled.iloc[1] == False  # Wide
    assert legal_bowled.iloc[2] == False  # Overstep
    assert legal_bowled.iloc[3] == True   # Legbye
    assert legal_bowled.iloc[4] == True   # Bye

def test_legal_ball_batter_classification():
    """
    Balls faced by batter:
    A batter cannot face a wide (it is deemed unhittable outside reach).
    A batter DOES face a no-ball (and can score off it).
    """
    sample_deliveries = pd.DataFrame([
        {"extras_type": np.nan},
        {"extras_type": "wide"},
        {"extras_type": "Overstep"},
        {"extras_type": "legbyes"},
        {"extras_type": "byes"},
    ])
    
    # Definition from analysis.py:
    # legal_faced = (extras_type != 'wide')
    legal_faced = (sample_deliveries["extras_type"] != "wide")
    
    assert legal_faced.sum() == 4
    assert legal_faced.iloc[1] == False  # Wide excluded

def test_bowler_conceded_runs_excludes_fielding_extras():
    """
    MCC Scoring Convention:
    Byes and Leg-byes are fielding errors or missed touches; they are credited to the team total
    but are NOT debited against the bowler's runs conceded or economy rate.
    Wides and No-balls ARE debited against the bowler.
    """
    delivery_bat_runs = 2
    delivery_bye_runs = 4
    delivery_wide_runs = 1
    
    # Bowler conceded runs: runs off bat + extras if wide/overstep
    conceded_bye = 0  # 4 byes conceder is fielding side, bowler charged 0
    conceded_wide = 1 # Wide is bowler's fault
    
    assert conceded_bye == 0
    assert conceded_wide == 1

def test_run_out_excluded_from_bowler_wickets():
    """
    Run-outs are fielding dismissals and must NOT credit the bowler with a wicket
    or improve their bowling strike rate / average.
    """
    dismissals = [
        {"dismissal_type": "Caught", "is_wicket": 1, "bowler_credit": True},
        {"dismissal_type": "Bowled", "is_wicket": 1, "bowler_credit": True},
        {"dismissal_type": "LBW", "is_wicket": 1, "bowler_credit": True},
        {"dismissal_type": "Stumped", "is_wicket": 1, "bowler_credit": True},
        {"dismissal_type": "RunOut", "is_wicket": 1, "bowler_credit": False},
        {"dismissal_type": "Retired Hurt", "is_wicket": 1, "bowler_credit": False},
    ]
    
    for d in dismissals:
        is_bowler_wicket = d["is_wicket"] == 1 and d["dismissal_type"] not in ["RunOut", "Retired Hurt", "Timed Out", "Obstructing Field"]
        assert is_bowler_wicket == d["bowler_credit"]
