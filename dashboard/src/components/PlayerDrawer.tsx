"use client";

import React, { useState } from "react";
import { X, Award } from "lucide-react";
import { Batter, Bowler, MatchSample } from "@/types";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
} from "recharts";

interface PlayerDrawerProps {
  player: Batter | Bowler | null;
  onClose: () => void;
  isBowler: boolean;
  matchSamples: MatchSample[];
}

export default function PlayerDrawer({
  player,
  onClose,
  isBowler,
  matchSamples,
}: PlayerDrawerProps) {
  const [timelineTab, setTimelineTab] = useState<number>(0);

  if (!player) return null;

  const batter = !isBowler ? (player as Batter) : null;
  const bowler = isBowler ? (player as Bowler) : null;

  // Radar data formatting
  const radarData = !isBowler && batter
    ? [
        {
          metric: "Scoring Rate",
          Pressure: Math.min(100, (batter.hp_sr / 210) * 100),
          Baseline: Math.min(100, (batter.base_sr / 210) * 100),
        },
        {
          metric: "Boundary %",
          Pressure: Math.min(100, (batter.hp_boundary_pct / 28) * 100),
          Baseline: Math.min(100, (18 / 28) * 100),
        },
        {
          metric: "Survival / Avg",
          Pressure: Math.min(100, (batter.hp_avg / 50) * 100),
          Baseline: Math.min(100, (batter.base_avg / 50) * 100),
        },
        {
          metric: "Dot Ball Avoidance",
          Pressure: Math.max(0, 100 - batter.hp_dot_pct * 1.5),
          Baseline: 55,
        },
        {
          metric: "Match Consistency",
          Pressure: batter.consistency_win_rate,
          Baseline: 50,
        },
      ]
    : bowler
    ? [
        {
          metric: "Econ Suppression",
          Pressure: Math.max(10, Math.min(100, (11.0 - bowler.hp_econ) * 15 + 30)),
          Baseline: Math.max(10, Math.min(100, (11.0 - bowler.base_econ) * 15 + 30)),
        },
        {
          metric: "Wicket Frequency",
          Pressure: Math.min(100, (20.0 / Math.max(1, bowler.hp_sr)) * 60),
          Baseline: Math.min(100, (20.0 / Math.max(1, bowler.base_sr)) * 60),
        },
        {
          metric: "Dot Ball %",
          Pressure: Math.min(100, bowler.hp_dot_pct * 1.8),
          Baseline: 68,
        },
        {
          metric: "Boundary Restraint",
          Pressure: Math.max(10, 100 - bowler.hp_boundary_pct * 3.5),
          Baseline: 50,
        },
        {
          metric: "Match Consistency",
          Pressure: bowler.consistency_win_rate,
          Baseline: 50,
        },
      ]
    : [];

  // Match sample timeline
  const activeMatch = matchSamples[timelineTab] || matchSamples[0];
  const timelineData = activeMatch?.balls?.slice(-18).map((b) => ({
    ballIdx: `${b.over}.${b.ball}`,
    PressureIndex: b.pressure_index,
    RRR: b.rrr,
    Wickets: b.wickets_in_hand,
  })) || [];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      {/* Drawer Container */}
      <div className="w-full max-w-xl h-full bg-rr-dark border-l border-rr-border shadow-2xl flex flex-col overflow-y-auto animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-rr-navy/95 backdrop-blur-md p-6 border-b border-rr-border flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rr-pink/20 text-rr-pink border border-rr-pink/40">
                Rank #{player.rank} • {isBowler ? "Bowler" : "Batter"}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                {player.total_matches} Matches Analyzed
              </span>
            </div>
            <h2 className="text-2xl font-black text-white">{player.player_name}</h2>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-baseline gap-1">
                <span className="text-xs text-slate-400">Pressure Score:</span>
                <span className="text-xl font-black text-rr-pink">
                  {player.reliability_score.toFixed(2)}
                </span>
              </div>
              <div className="text-xs text-slate-400 border-l border-slate-700 pl-3">
                90% CI:{" "}
                <span className="font-mono text-slate-200">
                  {player.ci_90[0].toFixed(1)} – {player.ci_90[1].toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Tactical RR Fit Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-rr-card to-rr-navy border border-rr-border relative overflow-hidden">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-rr-gold" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-rr-gold">
                How He Strengthens Rajasthan Royals
              </h4>
            </div>
            <p className="text-sm font-medium text-slate-200 leading-relaxed">
              {player.rr_squad_fit}
            </p>
          </div>

          {/* Key Stat Delta Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {!isBowler && batter ? (
              <>
                <div className="p-3 bg-rr-card rounded-xl border border-rr-border text-center">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Pressure SR</div>
                  <div className="text-lg font-black text-rr-pink mt-0.5">{batter.hp_sr.toFixed(1)}</div>
                  <div className="text-[10px] font-semibold text-emerald-400">
                    {batter.sr_delta > 0 ? `+${batter.sr_delta.toFixed(1)}` : batter.sr_delta.toFixed(1)} vs Base
                  </div>
                </div>
                <div className="p-3 bg-rr-card rounded-xl border border-rr-border text-center">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Pressure Avg</div>
                  <div className="text-lg font-black text-white mt-0.5">{batter.hp_avg.toFixed(1)}</div>
                  <div className="text-[10px] text-slate-400">{batter.hp_balls} HP Balls</div>
                </div>
                <div className="p-3 bg-rr-card rounded-xl border border-rr-border text-center">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Boundary %</div>
                  <div className="text-lg font-black text-rr-cyan mt-0.5">{batter.hp_boundary_pct.toFixed(1)}%</div>
                  <div className="text-[10px] text-slate-400">{batter.hp_dot_pct.toFixed(1)}% Dots</div>
                </div>
                <div className="p-3 bg-rr-card rounded-xl border border-rr-border text-center">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Consistency</div>
                  <div className="text-lg font-black text-rr-gold mt-0.5">{batter.consistency_win_rate.toFixed(0)}%</div>
                  <div className="text-[10px] text-slate-400">Win Rate</div>
                </div>
              </>
            ) : bowler ? (
              <>
                <div className="p-3 bg-rr-card rounded-xl border border-rr-border text-center">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Pressure Econ</div>
                  <div className="text-lg font-black text-rr-blue-light mt-0.5">{bowler.hp_econ.toFixed(2)}</div>
                  <div className="text-[10px] font-semibold text-emerald-400">
                    {bowler.econ_delta > 0 ? `+${bowler.econ_delta.toFixed(2)}` : bowler.econ_delta.toFixed(2)} vs Base
                  </div>
                </div>
                <div className="p-3 bg-rr-card rounded-xl border border-rr-border text-center">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Wickets</div>
                  <div className="text-lg font-black text-white mt-0.5">{bowler.hp_wickets}</div>
                  <div className="text-[10px] text-slate-400">{bowler.hp_balls} HP Balls</div>
                </div>
                <div className="p-3 bg-rr-card rounded-xl border border-rr-border text-center">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Bowling SR</div>
                  <div className="text-lg font-black text-rr-pink mt-0.5">{bowler.hp_sr.toFixed(1)}</div>
                  <div className="text-[10px] text-slate-400">{bowler.hp_dot_pct.toFixed(1)}% Dots</div>
                </div>
                <div className="p-3 bg-rr-card rounded-xl border border-rr-border text-center">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Consistency</div>
                  <div className="text-lg font-black text-rr-gold mt-0.5">{bowler.consistency_win_rate.toFixed(0)}%</div>
                  <div className="text-[10px] text-slate-400">Win Rate</div>
                </div>
              </>
            ) : null}
          </div>

          {/* Radar Chart: Pressure vs Baseline */}
          <div className="p-4 bg-rr-card rounded-xl border border-rr-border">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Performance Profile: Pressure vs Non-Pressure Baseline
              </h4>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="flex items-center gap-1 font-bold text-rr-pink">
                  <span className="w-2.5 h-2.5 rounded-full bg-rr-pink inline-block"></span>
                  High Pressure
                </span>
                <span className="flex items-center gap-1 font-bold text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-500 inline-block"></span>
                  Baseline
                </span>
              </div>
            </div>

            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#1E2C5A" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: "#94A3B8", fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="High Pressure"
                    dataKey="Pressure"
                    stroke="#EA1A85"
                    fill="#EA1A85"
                    fillOpacity={0.4}
                  />
                  <Radar
                    name="Baseline"
                    dataKey="Baseline"
                    stroke="#64748B"
                    fill="#64748B"
                    fillOpacity={0.2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Real Match Pressure Timeline Sample */}
          {activeMatch && (
            <div className="p-4 bg-rr-card rounded-xl border border-rr-border">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    High-Pressure Innings Timeline Case Study
                  </h4>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Match #{activeMatch.match_id} • {activeMatch.competition} (Target: {activeMatch.target})
                  </div>
                </div>
                <div className="flex gap-1">
                  {matchSamples.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setTimelineTab(idx)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                        timelineTab === idx
                          ? "bg-rr-pink text-white"
                          : "bg-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      M{idx + 1}
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-full h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timelineData}>
                    <XAxis dataKey="ballIdx" stroke="#64748B" tick={{ fontSize: 9 }} />
                    <YAxis domain={[0, 1]} stroke="#64748B" tick={{ fontSize: 9 }} />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "#0A1128",
                        borderColor: "#1E2C5A",
                        fontSize: "11px",
                        color: "#FFF",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="PressureIndex"
                      stroke="#EA1A85"
                      strokeWidth={2.5}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="text-[10px] text-slate-400 mt-2 text-center">
                Ball-by-ball Pressure Index (PI) progression through final chase phase.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
