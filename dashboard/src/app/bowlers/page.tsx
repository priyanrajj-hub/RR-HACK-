"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import { Shield, Search, Trophy, Download } from "lucide-react";
import rankingsData from "@/data/rankings.json";
import matchSamplesData from "@/data/match_samples.json";
import { Bowler, MatchSample } from "@/types";
import PlayerDrawer from "@/components/PlayerDrawer";

export default function BowlersPage() {
  const [search, setSearch] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<Bowler | null>(null);

  const bowlers = rankingsData.top_bowlers as Bowler[];
  const filtered = bowlers.filter((bw) =>
    bw.player_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-rr-dark text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-rr-border">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-rr-blue/20 text-rr-blue-light">
                <Shield className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-black text-white">Top Pressure Bowlers Leaderboard</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Ranked by context-expected Runs Saved Above Expected (RSAE), dot ball pressure, and wicket strike rates.
            </p>
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search bowler name..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rr-blue-light"
            />
          </div>
        </div>

        {/* Top 3 Spotlight Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {bowlers.slice(0, 3).map((bw) => (
            <div
              key={bw.player_id}
              onClick={() => setSelectedPlayer(bw)}
              className="p-5 rounded-2xl bg-gradient-to-br from-rr-card to-rr-navy border border-rr-blue-light/40 shadow-xl cursor-pointer hover:border-rr-blue-light transition-all group"
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="px-2 py-0.5 rounded bg-rr-blue/20 text-rr-blue-light font-extrabold">
                  RANK #{bw.rank}
                </span>
                <span className="font-mono text-slate-400">90% CI: {bw.ci_90[0]}-{bw.ci_90[1]}</span>
              </div>
              <h3 className="text-lg font-black text-white group-hover:text-rr-blue-light transition-colors">
                {bw.player_name}
              </h3>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-slate-900/80">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Score</div>
                  <div className="font-black text-rr-blue-light mt-0.5">{bw.reliability_score.toFixed(1)}</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/80">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">HP Econ</div>
                  <div className="font-black text-white mt-0.5">{bw.hp_econ.toFixed(2)}</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/80">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">HP Wkts</div>
                  <div className="font-black text-emerald-400 mt-0.5">{bw.hp_wickets}</div>
                </div>
              </div>
              <div className="text-[11px] text-slate-300 mt-3 line-clamp-2 italic">
                &ldquo;{bw.rr_squad_fit}&rdquo;
              </div>
            </div>
          ))}
        </div>

        {/* Full Table */}
        <div className="bg-rr-card rounded-2xl border border-rr-border p-5 shadow-xl overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-bold">
              <tr>
                <th className="p-3">Rank</th>
                <th className="p-3">Bowler Name</th>
                <th className="p-3">Pressure Score</th>
                <th className="p-3">90% CI</th>
                <th className="p-3">HP Economy</th>
                <th className="p-3">HP Bowling SR</th>
                <th className="p-3">HP Wickets</th>
                <th className="p-3">Dot Ball %</th>
                <th className="p-3">Base Econ</th>
                <th className="p-3">Econ Delta</th>
                <th className="p-3">Consistency</th>
                <th className="p-3">HP Balls</th>
                <th className="p-3 text-right">Card</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filtered.map((bw) => (
                <tr
                  key={bw.player_id}
                  onClick={() => setSelectedPlayer(bw)}
                  className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <td className="p-3 font-black text-rr-gold">#{bw.rank}</td>
                  <td className="p-3 font-bold text-white">{bw.player_name}</td>
                  <td className="p-3 font-black text-rr-blue-light">{bw.reliability_score.toFixed(2)}</td>
                  <td className="p-3 font-mono text-slate-400">{bw.ci_90[0].toFixed(1)}–{bw.ci_90[1].toFixed(1)}</td>
                  <td className="p-3 font-bold">{bw.hp_econ.toFixed(2)}</td>
                  <td className="p-3">{bw.hp_sr.toFixed(1)} b/w</td>
                  <td className="p-3 font-bold text-white">{bw.hp_wickets}</td>
                  <td className="p-3">{bw.hp_dot_pct.toFixed(1)}%</td>
                  <td className="p-3 text-slate-400">{bw.base_econ.toFixed(2)}</td>
                  <td className="p-3 font-bold text-emerald-400">
                    {bw.econ_delta > 0 ? `+${bw.econ_delta.toFixed(2)}` : bw.econ_delta.toFixed(2)}
                  </td>
                  <td className="p-3 font-mono text-rr-gold">{bw.consistency_win_rate.toFixed(0)}%</td>
                  <td className="p-3 text-slate-400">{bw.hp_balls}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPlayer(bw);
                      }}
                      className="px-2.5 py-1 rounded-md bg-rr-blue/20 hover:bg-rr-blue-light text-[11px] font-bold text-rr-blue-light hover:text-white border border-rr-blue/30 hover:border-rr-blue-light transition-all shadow-sm"
                    >
                      Scout
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      <PlayerDrawer
        player={selectedPlayer}
        onClose={() => setSelectedPlayer(null)}
        isBowler={true}
        matchSamples={matchSamplesData as MatchSample[]}
      />
    </div>
  );
}
