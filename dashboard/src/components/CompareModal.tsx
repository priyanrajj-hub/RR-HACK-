"use client";

import React, { useState } from "react";
import { X, Swords } from "lucide-react";
import { Batter, Bowler } from "@/types";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: (Batter | Bowler)[];
  isBowler: boolean;
}

export default function CompareModal({
  isOpen,
  onClose,
  players,
  isBowler,
}: CompareModalProps) {
  const [player1Id, setPlayer1Id] = useState<number>(players[0]?.player_id || 0);
  const [player2Id, setPlayer2Id] = useState<number>(players[1]?.player_id || 0);

  if (!isOpen) return null;

  const p1 = players.find((p) => p.player_id === player1Id) || players[0];
  const p2 = players.find((p) => p.player_id === player2Id) || players[1];

  const b1 = !isBowler ? (p1 as Batter) : null;
  const b2 = !isBowler ? (p2 as Batter) : null;
  const bw1 = isBowler ? (p1 as Bowler) : null;
  const bw2 = isBowler ? (p2 as Bowler) : null;

  // Radar comparison
  const radarData = !isBowler && b1 && b2
    ? [
        {
          metric: "Pressure SR",
          P1: Math.min(100, (b1.hp_sr / 210) * 100),
          P2: Math.min(100, (b2.hp_sr / 210) * 100),
        },
        {
          metric: "Boundary %",
          P1: Math.min(100, (b1.hp_boundary_pct / 28) * 100),
          P2: Math.min(100, (b2.hp_boundary_pct / 28) * 100),
        },
        {
          metric: "Average / Survival",
          P1: Math.min(100, (b1.hp_avg / 50) * 100),
          P2: Math.min(100, (b2.hp_avg / 50) * 100),
        },
        {
          metric: "Dot Ball Suppression",
          P1: Math.max(0, 100 - b1.hp_dot_pct * 1.5),
          P2: Math.max(0, 100 - b2.hp_dot_pct * 1.5),
        },
        {
          metric: "Consistency",
          P1: b1.consistency_win_rate,
          P2: b2.consistency_win_rate,
        },
      ]
    : bw1 && bw2
    ? [
        {
          metric: "Econ Suppression",
          P1: Math.max(10, Math.min(100, (11.0 - bw1.hp_econ) * 15 + 30)),
          P2: Math.max(10, Math.min(100, (11.0 - bw2.hp_econ) * 15 + 30)),
        },
        {
          metric: "Wicket Frequency",
          P1: Math.min(100, (20.0 / Math.max(1, bw1.hp_sr)) * 60),
          P2: Math.min(100, (20.0 / Math.max(1, bw2.hp_sr)) * 60),
        },
        {
          metric: "Dot Ball %",
          P1: Math.min(100, bw1.hp_dot_pct * 1.8),
          P2: Math.min(100, bw2.hp_dot_pct * 1.8),
        },
        {
          metric: "Boundary Restraint",
          P1: Math.max(10, 100 - bw1.hp_boundary_pct * 3.5),
          P2: Math.max(10, 100 - bw2.hp_boundary_pct * 3.5),
        },
        {
          metric: "Consistency",
          P1: bw1.consistency_win_rate,
          P2: bw2.consistency_win_rate,
        },
      ]
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-rr-dark border border-rr-border rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-rr-navy border-b border-rr-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-rr-pink/20 text-rr-pink">
              <Swords className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-black text-white">Head-to-Head Pressure Comparison</h3>
              <p className="text-xs text-slate-400">
                Compare pressure profiles, confidence intervals, and tactical role advantages.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Player Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-rr-card border border-rr-pink/40">
              <label className="text-[10px] font-bold uppercase tracking-wider text-rr-pink block mb-1.5">
                Player 1 (Pink)
              </label>
              <select
                value={player1Id}
                onChange={(e) => setPlayer1Id(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-rr-pink"
              >
                {players.map((p) => (
                  <option key={p.player_id} value={p.player_id}>
                    #{p.rank} {p.player_name} (Score: {p.reliability_score.toFixed(1)})
                  </option>
                ))}
              </select>
            </div>

            <div className="p-4 rounded-xl bg-rr-card border border-rr-blue-light/40">
              <label className="text-[10px] font-bold uppercase tracking-wider text-rr-blue-light block mb-1.5">
                Player 2 (Blue)
              </label>
              <select
                value={player2Id}
                onChange={(e) => setPlayer2Id(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-rr-blue-light"
              >
                {players.map((p) => (
                  <option key={p.player_id} value={p.player_id}>
                    #{p.rank} {p.player_name} (Score: {p.reliability_score.toFixed(1)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dual Radar Chart */}
          <div className="p-4 bg-rr-card rounded-xl border border-rr-border flex flex-col items-center">
            <div className="flex items-center gap-6 text-xs font-bold mb-2">
              <span className="flex items-center gap-1.5 text-rr-pink">
                <span className="w-3 h-3 rounded-full bg-rr-pink inline-block"></span>
                {p1.player_name} ({p1.reliability_score.toFixed(1)})
              </span>
              <span className="flex items-center gap-1.5 text-rr-blue-light">
                <span className="w-3 h-3 rounded-full bg-rr-blue-light inline-block"></span>
                {p2.player_name} ({p2.reliability_score.toFixed(1)})
              </span>
            </div>

            <div className="w-full h-64 max-w-lg">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#1E2C5A" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: "#94A3B8", fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name={p1.player_name}
                    dataKey="P1"
                    stroke="#EA1A85"
                    fill="#EA1A85"
                    fillOpacity={0.35}
                  />
                  <Radar
                    name={p2.player_name}
                    dataKey="P2"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.35}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Direct Comparison Table */}
          <div className="overflow-x-auto rounded-xl border border-rr-border bg-rr-card">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">Metric</th>
                  <th className="p-3 text-rr-pink">{p1.player_name}</th>
                  <th className="p-3 text-rr-blue-light">{p2.player_name}</th>
                  <th className="p-3">Advantage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                <tr>
                  <td className="p-3 font-semibold text-slate-400">Reliability Score</td>
                  <td className="p-3 font-black text-rr-pink">{p1.reliability_score.toFixed(2)}</td>
                  <td className="p-3 font-black text-rr-blue-light">{p2.reliability_score.toFixed(2)}</td>
                  <td className="p-3 font-bold text-white">
                    {p1.reliability_score > p2.reliability_score ? p1.player_name : p2.player_name} (+{Math.abs(p1.reliability_score - p2.reliability_score).toFixed(2)})
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-400">90% Bootstrap CI</td>
                  <td className="p-3 font-mono">{p1.ci_90[0].toFixed(1)} - {p1.ci_90[1].toFixed(1)}</td>
                  <td className="p-3 font-mono">{p2.ci_90[0].toFixed(1)} - {p2.ci_90[1].toFixed(1)}</td>
                  <td className="p-3 text-slate-400">Overlap Checked</td>
                </tr>
                {!isBowler && b1 && b2 ? (
                  <>
                    <tr>
                      <td className="p-3 font-semibold text-slate-400">Pressure Strike Rate</td>
                      <td className="p-3 font-bold">{b1.hp_sr.toFixed(1)}</td>
                      <td className="p-3 font-bold">{b2.hp_sr.toFixed(1)}</td>
                      <td className="p-3 font-bold text-emerald-400">
                        {b1.hp_sr > b2.hp_sr ? b1.player_name : b2.player_name} (+{Math.abs(b1.hp_sr - b2.hp_sr).toFixed(1)})
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-400">Pressure Average</td>
                      <td className="p-3 font-bold">{b1.hp_avg.toFixed(1)}</td>
                      <td className="p-3 font-bold">{b2.hp_avg.toFixed(1)}</td>
                      <td className="p-3 font-bold text-emerald-400">
                        {b1.hp_avg > b2.hp_avg ? b1.player_name : b2.player_name} (+{Math.abs(b1.hp_avg - b2.hp_avg).toFixed(1)})
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-400">Boundary %</td>
                      <td className="p-3">{b1.hp_boundary_pct.toFixed(1)}%</td>
                      <td className="p-3">{b2.hp_boundary_pct.toFixed(1)}%</td>
                      <td className="p-3 text-slate-300">
                        {b1.hp_boundary_pct > b2.hp_boundary_pct ? b1.player_name : b2.player_name}
                      </td>
                    </tr>
                  </>
                ) : bw1 && bw2 ? (
                  <>
                    <tr>
                      <td className="p-3 font-semibold text-slate-400">Pressure Economy</td>
                      <td className="p-3 font-bold">{bw1.hp_econ.toFixed(2)}</td>
                      <td className="p-3 font-bold">{bw2.hp_econ.toFixed(2)}</td>
                      <td className="p-3 font-bold text-emerald-400">
                        {bw1.hp_econ < bw2.hp_econ ? bw1.player_name : bw2.player_name} (-{Math.abs(bw1.hp_econ - bw2.hp_econ).toFixed(2)})
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-400">Bowling Strike Rate</td>
                      <td className="p-3 font-bold">{bw1.hp_sr.toFixed(1)} b/wkt</td>
                      <td className="p-3 font-bold">{bw2.hp_sr.toFixed(1)} b/wkt</td>
                      <td className="p-3 font-bold text-emerald-400">
                        {bw1.hp_sr < bw2.hp_sr ? bw1.player_name : bw2.player_name}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-400">Dot Ball %</td>
                      <td className="p-3">{bw1.hp_dot_pct.toFixed(1)}%</td>
                      <td className="p-3">{bw2.hp_dot_pct.toFixed(1)}%</td>
                      <td className="p-3 text-slate-300">
                        {bw1.hp_dot_pct > bw2.hp_dot_pct ? bw1.player_name : bw2.player_name}
                      </td>
                    </tr>
                  </>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
