"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import { Flame, Search, Trophy, Download } from "lucide-react";
import rankingsData from "@/data/rankings.json";
import matchSamplesData from "@/data/match_samples.json";
import { Batter, MatchSample } from "@/types";
import PlayerDrawer from "@/components/PlayerDrawer";

export default function BattersPage() {
  const [search, setSearch] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<Batter | null>(null);

  const batters = rankingsData.top_batters as Batter[];
  const filtered = batters.filter((b) =>
    b.player_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-rr-dark text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-rr-border">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-rr-pink/20 text-rr-pink">
                <Flame className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-black text-white">Top Pressure Batters Leaderboard</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Ranked by context-adjusted Runs Above Expected (RAE), match consistency, and Empirical Bayes shrinkage.
            </p>
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search batter name..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rr-pink"
            />
          </div>
        </div>

        {/* Top 3 Spotlight Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {batters.slice(0, 3).map((b) => (
            <div
              key={b.player_id}
              onClick={() => setSelectedPlayer(b)}
              className="p-5 rounded-2xl bg-gradient-to-br from-rr-card to-rr-navy border border-rr-pink/40 shadow-xl cursor-pointer hover:border-rr-pink transition-all group"
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="px-2 py-0.5 rounded bg-rr-pink/20 text-rr-pink font-extrabold">
                  RANK #{b.rank}
                </span>
                <span className="font-mono text-slate-400">90% CI: {b.ci_90[0]}-{b.ci_90[1]}</span>
              </div>
              <h3 className="text-lg font-black text-white group-hover:text-rr-pink transition-colors">
                {b.player_name}
              </h3>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-slate-900/80">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Score</div>
                  <div className="font-black text-rr-pink mt-0.5">{b.reliability_score.toFixed(1)}</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/80">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">HP SR</div>
                  <div className="font-black text-white mt-0.5">{b.hp_sr.toFixed(1)}</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/80">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">HP Avg</div>
                  <div className="font-black text-emerald-400 mt-0.5">{b.hp_avg.toFixed(1)}</div>
                </div>
              </div>
              <div className="text-[11px] text-slate-300 mt-3 line-clamp-2 italic">
                &ldquo;{b.rr_squad_fit}&rdquo;
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
                <th className="p-3">Batter Name</th>
                <th className="p-3">Pressure Score</th>
                <th className="p-3">90% CI</th>
                <th className="p-3">HP Strike Rate</th>
                <th className="p-3">HP Average</th>
                <th className="p-3">Boundary %</th>
                <th className="p-3">Dot Ball %</th>
                <th className="p-3">Base SR</th>
                <th className="p-3">SR Delta</th>
                <th className="p-3">Consistency</th>
                <th className="p-3">HP Balls</th>
                <th className="p-3 text-right">Card</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filtered.map((b) => (
                <tr
                  key={b.player_id}
                  onClick={() => setSelectedPlayer(b)}
                  className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <td className="p-3 font-black text-rr-gold">#{b.rank}</td>
                  <td className="p-3 font-bold text-white">{b.player_name}</td>
                  <td className="p-3 font-black text-rr-pink">{b.reliability_score.toFixed(2)}</td>
                  <td className="p-3 font-mono text-slate-400">{b.ci_90[0].toFixed(1)}–{b.ci_90[1].toFixed(1)}</td>
                  <td className="p-3 font-bold">{b.hp_sr.toFixed(1)}</td>
                  <td className="p-3">{b.hp_avg.toFixed(1)}</td>
                  <td className="p-3">{b.hp_boundary_pct.toFixed(1)}%</td>
                  <td className="p-3">{b.hp_dot_pct.toFixed(1)}%</td>
                  <td className="p-3 text-slate-400">{b.base_sr.toFixed(1)}</td>
                  <td className="p-3 font-bold text-emerald-400">+{b.sr_delta.toFixed(1)}</td>
                  <td className="p-3 font-mono text-rr-gold">{b.consistency_win_rate.toFixed(0)}%</td>
                  <td className="p-3 text-slate-400">{b.hp_balls}</td>
                  <td className="p-3 text-right">
                    <button className="px-2 py-0.5 rounded bg-slate-800 hover:bg-rr-pink text-[11px] font-bold text-slate-300 hover:text-white transition-colors">
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
        isBowler={false}
        matchSamples={matchSamplesData as MatchSample[]}
      />
    </div>
  );
}
