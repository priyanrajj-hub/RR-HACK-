"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import { Coins, Sliders, CheckCircle2, Award, AlertCircle, ArrowUpRight } from "lucide-react";
import auctionData from "@/data/auction_intelligence.json";

export default function AuctionLabPage() {
  const [budget, setBudget] = useState<number>(75);
  const [maxOverseas, setMaxOverseas] = useState<number>(6);
  const [squadSlots, setSquadSlots] = useState<number>(8);

  const squad = auctionData.optimal_squad;
  const metrics = auctionData.metrics;

  return (
    <div className="min-h-screen bg-rr-dark text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-rr-border">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-rr-gold/20 text-rr-gold">
                <Coins className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-black text-white">Rajasthan Royals Auction Decision Intelligence</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Integer Linear Programming (ILP via Google OR-Tools) squad optimization with Monte Carlo budget risk analysis.
            </p>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-rr-navy border border-rr-border text-xs text-slate-300 font-mono">
            Optimizer Status: <span className="text-emerald-400 font-bold">{auctionData.scenario.status}</span>
          </div>
        </div>

        {/* Top Control Panel & Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls */}
          <div className="lg:col-span-5 p-6 bg-rr-card rounded-2xl border border-rr-border space-y-4">
            <h3 className="text-sm font-black uppercase text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-rr-pink" />
              Scenario Constraints & Purse
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-bold">Auction Purse Budget (Cr INR):</span>
                  <span className="font-mono text-rr-gold font-bold">{budget} Cr</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="110"
                  step="5"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rr-gold"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-bold">Max Overseas Slots:</span>
                  <span className="font-mono text-rr-cyan font-bold">{maxOverseas}</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="8"
                  value={maxOverseas}
                  onChange={(e) => setMaxOverseas(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rr-cyan"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-bold">Target Squad Additions:</span>
                  <span className="font-mono text-rr-pink font-bold">{squadSlots} players</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="12"
                  value={squadSlots}
                  onChange={(e) => setSquadSlots(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rr-pink"
                />
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-800">
              * Optimization dynamically balances death bowling yorker quotas, power finisher requirements, and domestic core stability.
            </div>
          </div>

          {/* Key Optimization Outputs */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 bg-rr-card rounded-2xl border border-rr-border text-center flex flex-col justify-center">
              <div className="text-[10px] uppercase font-bold text-slate-400">Total Spend</div>
              <div className="text-xl font-black text-rr-gold mt-1">₹{metrics.total_estimated_spend_cr} Cr</div>
              <div className="text-[10px] text-slate-400">Est. Acquisition</div>
            </div>

            <div className="p-4 bg-rr-card rounded-2xl border border-rr-border text-center flex flex-col justify-center">
              <div className="text-[10px] uppercase font-bold text-slate-400">Purse Left</div>
              <div className="text-xl font-black text-emerald-400 mt-1">₹{metrics.remaining_purse_cr} Cr</div>
              <div className="text-[10px] text-slate-400">Buffer Reserve</div>
            </div>

            <div className="p-4 bg-rr-card rounded-2xl border border-rr-border text-center flex flex-col justify-center">
              <div className="text-[10px] uppercase font-bold text-slate-400">Mean Pressure Score</div>
              <div className="text-xl font-black text-rr-pink mt-1">{metrics.mean_pressure_score}</div>
              <div className="text-[10px] text-slate-400">High Leverage Quality</div>
            </div>

            <div className="p-4 bg-rr-card rounded-2xl border border-rr-border text-center flex flex-col justify-center">
              <div className="text-[10px] uppercase font-bold text-slate-400">Budget Feasibility</div>
              <div className="text-xl font-black text-rr-cyan mt-1">{metrics.monte_carlo_budget_feasibility}%</div>
              <div className="text-[10px] text-slate-400">100 Monte Carlo Runs</div>
            </div>
          </div>
        </div>

        {/* Optimal Squad Table */}
        <div className="bg-rr-card rounded-2xl border border-rr-border p-6 shadow-xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-black text-white">
              OR-Tools Optimal Target Squad Selection
            </h3>
            <span className="text-xs text-slate-400">
              Overseas: {metrics.overseas_players_count} / {maxOverseas} Allowed
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">Player Name</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Tactical Profile</th>
                  <th className="p-3">Pressure Score</th>
                  <th className="p-3">Estimated Purse Cost</th>
                  <th className="p-3">Overseas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {squad.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-white">{p.name}</td>
                    <td className="p-3 text-slate-300">{p.role}</td>
                    <td className="p-3 text-rr-cyan font-medium">{p.fit_type}</td>
                    <td className="p-3 font-mono font-bold text-rr-pink">{p.score}</td>
                    <td className="p-3 font-mono text-rr-gold font-bold">₹{p.est_cost} Cr</td>
                    <td className="p-3">
                      {p.is_overseas ? (
                        <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold text-[10px]">
                          OVERSEAS
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-bold text-[10px]">
                          INDIAN
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Strategic Recommendation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {auctionData.strategic_recommendations.map((rec, idx) => (
            <div key={idx} className="p-5 bg-gradient-to-br from-rr-card to-rr-navy rounded-2xl border border-rr-border space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-rr-pink/20 text-rr-pink">
                  {rec.tier}
                </span>
                <span className="text-[10px] text-slate-400">{rec.type}</span>
              </div>
              <h4 className="text-base font-bold text-white">{rec.player}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{rec.reason}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
