"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import { BookOpen, Trophy, ShieldAlert, CheckCircle2, Flame, ExternalLink, Calendar, Newspaper } from "lucide-react";
import iplIntelData from "@/data/ipl_2026_intelligence.json";
import caseStudiesData from "@/data/ipl_2026_case_studies.json";

export default function IPL2026ResearchPage() {
  const [activeTab, setActiveTab] = useState<"cases" | "leaders" | "news">("cases");

  return (
    <div className="min-h-screen bg-rr-dark text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-rr-border">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-rr-gold/20 text-rr-gold">
                <BookOpen className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-black text-white">IPL 2026 Cricket Intelligence & Match Research</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Cross-validated match reports, official scorecards, high-pressure case studies, and verified tactical news.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-rr-navy p-1 rounded-xl border border-rr-border text-xs">
            <button
              onClick={() => setActiveTab("cases")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                activeTab === "cases" ? "bg-rr-pink text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Pressure Case Studies
            </button>
            <button
              onClick={() => setActiveTab("leaders")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                activeTab === "leaders" ? "bg-rr-pink text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Season 2026 Leaders
            </button>
            <button
              onClick={() => setActiveTab("news")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                activeTab === "news" ? "bg-rr-pink text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              News Intelligence
            </button>
          </div>
        </div>

        {/* Tab 1: Pressure Case Studies */}
        {activeTab === "cases" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {caseStudiesData.map((cs) => (
                <div
                  key={cs.case_id}
                  className="p-5 rounded-2xl bg-rr-card border border-rr-border space-y-3 shadow-xl relative overflow-hidden"
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="px-2 py-0.5 rounded bg-rr-gold/20 text-rr-gold font-extrabold">
                      {cs.case_id} • {cs.stage}
                    </span>
                    <span className="text-[10px] font-mono text-rr-pink font-bold">PI: {cs.pressure_index}</span>
                  </div>
                  <h3 className="text-sm font-black text-white">{cs.title}</h3>
                  <div className="text-xs text-rr-cyan font-bold">{cs.teams}</div>
                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1.5">
                    <div>
                      <strong className="text-slate-200">Scenario:</strong> {cs.scenario}
                    </div>
                    <div>
                      <strong className="text-emerald-400">Execution:</strong> {cs.outcome}
                    </div>
                    <div className="text-rr-pink font-mono text-[11px] font-bold">
                      {cs.win_probability_swing}
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <span>Source: {cs.verified_source}</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> VERIFIED
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Season Leaders */}
        {activeTab === "leaders" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Batters 2026 */}
            <div className="p-5 bg-rr-card rounded-2xl border border-rr-border space-y-3">
              <h3 className="text-sm font-black uppercase text-rr-pink flex items-center gap-1.5">
                <Flame className="w-4 h-4" />
                IPL 2026 Leading Batters (Proprietary Data Pack)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-900 text-slate-400 text-[10px] font-bold">
                    <tr>
                      <th className="p-2">Player</th>
                      <th className="p-2">Runs</th>
                      <th className="p-2">Balls</th>
                      <th className="p-2">SR</th>
                      <th className="p-2">Avg</th>
                      <th className="p-2">Matches</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    {iplIntelData.top_batters_season_2026.slice(0, 8).map((b, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="p-2 font-bold text-white">{b.striker_name}</td>
                        <td className="p-2 font-bold text-rr-pink">{b.runs}</td>
                        <td className="p-2">{b.balls}</td>
                        <td className="p-2 font-mono">{b.sr}</td>
                        <td className="p-2 font-mono">{b.avg}</td>
                        <td className="p-2 text-slate-400">{b.matches}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Bowlers 2026 */}
            <div className="p-5 bg-rr-card rounded-2xl border border-rr-border space-y-3">
              <h3 className="text-sm font-black uppercase text-rr-blue-light flex items-center gap-1.5">
                <Trophy className="w-4 h-4" />
                IPL 2026 Leading Wicket Takers (Proprietary Data Pack)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-900 text-slate-400 text-[10px] font-bold">
                    <tr>
                      <th className="p-2">Player</th>
                      <th className="p-2">Wickets</th>
                      <th className="p-2">Economy</th>
                      <th className="p-2">SR</th>
                      <th className="p-2">Balls</th>
                      <th className="p-2">Matches</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    {iplIntelData.top_bowlers_season_2026.slice(0, 8).map((bw, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="p-2 font-bold text-white">{bw.bowler_name}</td>
                        <td className="p-2 font-bold text-rr-blue-light">{bw.wickets}</td>
                        <td className="p-2 font-mono">{bw.econ}</td>
                        <td className="p-2 font-mono">{bw.sr}</td>
                        <td className="p-2">{bw.balls_bowled}</td>
                        <td className="p-2 text-slate-400">{bw.matches}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: News & Strategic Intelligence */}
        {activeTab === "news" && (
          <div className="space-y-4">
            {iplIntelData.news_intelligence.map((item, idx) => (
              <div key={idx} className="p-5 bg-rr-card rounded-2xl border border-rr-border space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rr-navy text-rr-cyan border border-rr-border">
                      {item.category}
                    </span>
                    <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                      <Calendar className="w-3 h-3" /> {item.date} • {item.publisher}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                    {item.verification_status}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">{item.headline}</h3>
                <div className="flex items-center gap-2 text-xs text-rr-pink font-semibold">
                  <span>Players:</span>
                  <span>{item.players_mentioned.join(", ")}</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl text-xs text-slate-300 border border-slate-800">
                  <strong className="text-slate-200">Analytical Synthesis:</strong> {item.analytical_insight}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
