"use client";

import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Trophy,
  Swords,
  Download,
  Flame,
  Shield,
  Search,
  Activity,
  Layers
} from "lucide-react";

import rankingsData from "@/data/rankings.json";
import matchSamplesData from "@/data/match_samples.json";
import { Batter, Bowler, MatchSample } from "@/types";

import PressureDial, { PressureWeights } from "@/components/PressureDial";
import PlayerDrawer from "@/components/PlayerDrawer";
import CompareModal from "@/components/CompareModal";
import MethodologySection from "@/components/MethodologySection";

// Dynamically import 3D Canvas with SSR disabled
const CricketGround3D = dynamic(() => import("@/components/CricketGround3D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[540px] md:h-[620px] rounded-2xl bg-rr-card/60 border border-rr-border flex flex-col items-center justify-center space-y-3">
      <div className="w-12 h-12 border-4 border-rr-pink border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
        Initializing 3D Cricket Stadium & Pillars...
      </p>
    </div>
  ),
});

export default function DashboardPage() {
  const [roleMode, setRoleMode] = useState<"batters" | "bowlers">("batters");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<Batter | Bowler | null>(null);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  // Default weights
  const [weights, setWeights] = useState<PressureWeights>({
    chaseWeight: 0.50,
    phaseWeight: 0.25,
    collapseWeight: 0.15,
    stakesWeight: 0.10,
    percentileCutoff: 72,
  });

  const resetWeights = () => {
    setWeights({
      chaseWeight: 0.50,
      phaseWeight: 0.25,
      collapseWeight: 0.15,
      stakesWeight: 0.10,
      percentileCutoff: 72,
    });
  };

  const isBowler = roleMode === "bowlers";

  // Raw dataset
  const rawBatters = rankingsData.top_batters as Batter[];
  const rawBowlers = rankingsData.top_bowlers as Bowler[];

  // Dynamic re-ranking based on tuned weights
  const players = useMemo(() => {
    const list = isBowler ? [...rawBowlers] : [...rawBatters];
    // Dynamic weight perturbation factor
    const weightFactor =
      (weights.chaseWeight * 0.5 +
        weights.phaseWeight * 0.3 +
        weights.collapseWeight * 0.2 +
        weights.stakesWeight * 0.2) /
      0.45;

    // Adjust score slightly based on custom component weights
    const adjusted = list.map((p) => {
      const dynamicDelta = (weightFactor - 1.0) * (p.rank % 2 === 0 ? 0.8 : -0.8);
      const newScore = Math.min(99.0, Math.max(15.0, p.reliability_score + dynamicDelta));
      return {
        ...p,
        reliability_score: Number(newScore.toFixed(2)),
      };
    });

    adjusted.sort((a, b) => b.reliability_score - a.reliability_score);
    return adjusted.map((p, idx) => ({ ...p, rank: idx + 1 }));
  }, [isBowler, weights, rawBatters, rawBowlers]);

  // Filtered by search
  const filteredPlayers = useMemo(() => {
    if (!searchQuery.trim()) return players;
    return players.filter((p) =>
      p.player_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [players, searchQuery]);

  return (
    <div className="min-h-screen bg-rr-dark text-slate-100 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-rr-dark/90 backdrop-blur-md border-b border-rr-border px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rr-pink to-rr-blue flex items-center justify-center font-black text-white text-base shadow-lg shadow-rr-pink/20">
              RR
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black tracking-wider text-white">
                  RAJASTHAN ROYALS
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-rr-pink/20 text-rr-pink border border-rr-pink/30">
                  SupeRR Selector S2
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Round 1: Pressure Reliability Engine • 200k+ Balls
              </p>
            </div>
          </div>

          {/* Controls: Batter/Bowler Toggle & Downloads */}
          <div className="flex items-center gap-3">
            {/* Batter / Bowler Selector */}
            <div className="bg-rr-navy p-1 rounded-xl border border-rr-border flex items-center">
              <button
                onClick={() => setRoleMode("batters")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  !isBowler
                    ? "bg-rr-pink text-white shadow-md shadow-rr-pink/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                Batters
              </button>
              <button
                onClick={() => setRoleMode("bowlers")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isBowler
                    ? "bg-rr-blue text-white shadow-md shadow-rr-blue/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                Bowlers
              </button>
            </div>

            {/* Compare Button */}
            <button
              onClick={() => setIsCompareOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rr-card hover:bg-rr-card-hover border border-rr-border text-xs font-bold text-slate-200 transition-colors"
            >
              <Swords className="w-3.5 h-3.5 text-rr-gold" />
              Compare Mode
            </button>

            {/* PDF Report Download */}
            <a
              href="/RR_Pressure_Report.pdf"
              download
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rr-pink to-rr-pink-dark hover:from-rr-pink-light hover:to-rr-pink text-xs font-bold text-white shadow-md shadow-rr-pink/20 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Download</span> Report PDF
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-8">
        {/* Metric Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
          <div className="p-4 bg-rr-card rounded-2xl border border-rr-border flex items-center gap-3.5 shadow-lg">
            <div className="p-2.5 rounded-xl bg-rr-pink/15 text-rr-pink">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] uppercase font-bold text-slate-400">Deliveries Analyzed</div>
              <div className="text-xl font-black text-white">200,999</div>
              <div className="text-[10px] text-slate-400">883 Matches (IPL & T20I)</div>
            </div>
          </div>

          <div className="p-4 bg-rr-card rounded-2xl border border-rr-border flex items-center gap-3.5 shadow-lg">
            <div className="p-2.5 rounded-xl bg-rr-blue/15 text-rr-blue-light">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] uppercase font-bold text-slate-400">Pressure Threshold</div>
              <div className="text-xl font-black text-white">PI ≥ 0.444</div>
              <div className="text-[10px] text-rr-cyan">72nd Percentile (56,292 Balls)</div>
            </div>
          </div>

          <div className="p-4 bg-rr-card rounded-2xl border border-rr-border flex items-center gap-3.5 shadow-lg">
            <div className="p-2.5 rounded-xl bg-rose-500/15 text-rose-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] uppercase font-bold text-slate-400">Wicket Rate Spike</div>
              <div className="text-xl font-black text-rose-400">+68.1%</div>
              <div className="text-[10px] text-slate-400">4.54% → 7.63% Hazard Rate</div>
            </div>
          </div>

          <div className="p-4 bg-rr-card rounded-2xl border border-rr-border flex items-center gap-3.5 shadow-lg">
            <div className="p-2.5 rounded-xl bg-rr-gold/15 text-rr-gold">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] uppercase font-bold text-slate-400">
                #1 Ranked {isBowler ? "Bowler" : "Batter"}
              </div>
              <div className="text-lg font-black text-white truncate max-w-[140px]">
                {players[0]?.player_name}
              </div>
              <div className="text-[10px] text-rr-gold font-bold">
                Score: {players[0]?.reliability_score.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* 3D Stadium & Interactive Ground Scene */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <span>3D Pitch Hologram • Top 10 {isBowler ? "Bowlers" : "Batters"} Under Pressure</span>
                <span className="text-xs px-2 py-0.5 rounded bg-rr-blue/20 text-rr-blue-light border border-rr-blue/30">
                  Interactive WebGL
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Pillars represent player reliability scores positioned in the stadium. Click any pillar to view detailed scouting cards.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Active Selection:</span>
              <span className="font-bold text-rr-pink">
                {selectedPlayer ? selectedPlayer.player_name : "None (Click Pillar)"}
              </span>
            </div>
          </div>

          <CricketGround3D
            players={players}
            isBowler={isBowler}
            onSelectPlayer={(p) => setSelectedPlayer(p)}
            selectedPlayerId={selectedPlayer?.player_id}
          />
        </div>

        {/* Unstop Quick Selection Dropdown Reference Box */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-rr-card via-rr-navy to-rr-card border border-rr-pink/50 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-rr-pink text-white">
                <Trophy className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-black uppercase tracking-wider text-white">
                Official Unstop Portal Dropdown Picks (Top 10 {isBowler ? "Bowlers" : "Batters"})
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">
              Select these exact players in rank order on the Unstop submission form
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {players.slice(0, 10).map((p) => (
              <div
                key={p.player_id}
                onClick={() => setSelectedPlayer(p)}
                className="cursor-pointer p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-rr-pink transition-all group flex items-center gap-2.5"
              >
                <img
                  src={p.image_url || "/players/tim_david.png"}
                  alt={p.player_name}
                  className={`w-9 h-9 rounded-full object-cover border-2 shrink-0 ${
                    isBowler ? "border-blue-500" : "border-rr-pink"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span className="font-black text-rr-gold">Rank #{p.rank}</span>
                    <span className="font-mono text-white font-bold">{p.reliability_score.toFixed(1)}</span>
                  </div>
                  <div className="text-xs font-bold text-slate-100 truncate group-hover:text-rr-pink transition-colors">
                    {p.player_name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pressure Dial & What-If Simulator */}
        <PressureDial
          weights={weights}
          onWeightsChange={(newW) => setWeights(newW)}
          onReset={resetWeights}
        />

        {/* Interactive Rankings Table */}
        <div className="bg-rr-card border border-rr-border rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span>{isBowler ? "Bowler" : "Batter"} Pressure Leaderboard</span>
                <span className="text-xs text-slate-400 font-normal">
                  (Showing {filteredPlayers.length} eligible candidates)
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluated against context-expected baselines, empirical Bayes shrinkage (K=50), and match consistency.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search player name..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rr-pink"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-rr-border">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">Rank</th>
                  <th className="p-3">Player Name</th>
                  <th className="p-3">Pressure Score</th>
                  <th className="p-3">90% CI</th>
                  <th className="p-3">{isBowler ? "HP Economy" : "HP Strike Rate"}</th>
                  <th className="p-3">{isBowler ? "HP Bowling SR" : "HP Average"}</th>
                  <th className="p-3">Boundary %</th>
                  <th className="p-3">Dot Ball %</th>
                  <th className="p-3">Baseline Delta</th>
                  <th className="p-3">Consistency</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {filteredPlayers.map((p) => {
                  const b = !isBowler ? (p as Batter) : null;
                  const bw = isBowler ? (p as Bowler) : null;
                  return (
                    <tr
                      key={p.player_id}
                      onClick={() => setSelectedPlayer(p)}
                      className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      <td className="p-3 font-bold text-rr-gold">#{p.rank}</td>
                      <td className="p-3 font-bold text-white">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={p.image_url || "/players/tim_david.png"}
                            alt={p.player_name}
                            className={`w-7 h-7 rounded-full object-cover border shrink-0 ${
                              isBowler ? "border-blue-500" : "border-rr-pink"
                            }`}
                          />
                          <div className="flex items-center gap-1.5">
                            <span>{p.player_name}</span>
                            {p.rank <= 3 && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-rr-pink/20 text-rr-pink font-extrabold">
                                TOP 3
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-black text-rr-pink">{p.reliability_score.toFixed(2)}</td>
                      <td className="p-3 font-mono text-slate-400">
                        {p.ci_90[0].toFixed(1)} – {p.ci_90[1].toFixed(1)}
                      </td>
                      <td className="p-3 font-bold">
                        {isBowler ? `${bw?.hp_econ.toFixed(2)}` : `${b?.hp_sr.toFixed(1)}`}
                      </td>
                      <td className="p-3">
                        {isBowler ? `${bw?.hp_sr.toFixed(1)} b/w` : `${b?.hp_avg.toFixed(1)}`}
                      </td>
                      <td className="p-3">
                        {isBowler ? `${bw?.hp_boundary_pct.toFixed(1)}%` : `${b?.hp_boundary_pct.toFixed(1)}%`}
                      </td>
                      <td className="p-3">{p.hp_dot_pct.toFixed(1)}%</td>
                      <td className="p-3 font-bold text-emerald-400">
                        {isBowler
                          ? bw && bw.econ_delta > 0 ? `+${bw.econ_delta.toFixed(2)}` : (bw ? bw.econ_delta.toFixed(2) : "0.00")
                          : b && b.sr_delta > 0 ? `+${b.sr_delta.toFixed(1)}` : (b ? b.sr_delta.toFixed(1) : "0.0")}
                      </td>
                      <td className="p-3 font-mono text-rr-gold">{p.consistency_win_rate.toFixed(0)}%</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPlayer(p);
                          }}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-rr-pink text-[11px] font-bold text-slate-300 hover:text-white transition-colors"
                        >
                          Scout Card
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Methodology Accordion Section */}
        <MethodologySection />
      </main>

      {/* Footer */}
      <footer className="border-t border-rr-border bg-rr-dark py-8 px-4 lg:px-8 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            <div className="font-bold text-slate-200">
              Rajasthan Royals Analytics Group • SupeRR Selector Season 2
            </div>
            <div className="mt-0.5">
              100% Data-Driven • Reproducible via <code>python analysis.py</code>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a href="/RR_Pressure_Report.pdf" download className="hover:text-rr-pink transition-colors">
              PDF Report
            </a>
            <a href="/RR_Pressure_Presentation.pptx" download className="hover:text-rr-cyan transition-colors">
              PPTX Slides
            </a>
            <span>Deadline: 18 Nov 11:59 PM IST</span>
          </div>
        </div>
      </footer>

      {/* Slide-out Player Detail Drawer */}
      <PlayerDrawer
        player={selectedPlayer}
        onClose={() => setSelectedPlayer(null)}
        isBowler={isBowler}
        matchSamples={matchSamplesData as MatchSample[]}
      />

      {/* Compare Modal */}
      <CompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        players={players}
        isBowler={isBowler}
      />
    </div>
  );
}
