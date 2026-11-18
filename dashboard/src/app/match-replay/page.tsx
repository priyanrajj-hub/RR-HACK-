"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import { PlayCircle, FastForward, RotateCcw, Activity, ShieldAlert, Award } from "lucide-react";
import matchSamplesData from "@/data/match_samples.json";
import { MatchSample } from "@/types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function MatchReplayPage() {
  const matches = matchSamplesData as MatchSample[];
  const [selectedMatchIdx, setSelectedMatchIdx] = useState(0);
  const [currentBallIdx, setCurrentBallIdx] = useState(15);

  const activeMatch = matches[selectedMatchIdx] || matches[0];
  const balls = activeMatch.balls;
  const currentBall = balls[Math.min(currentBallIdx, balls.length - 1)];

  const chartData = balls.slice(0, currentBallIdx + 1).map((b) => ({
    label: `${b.over}.${b.ball}`,
    PressureIndex: b.pressure_index,
    RRR: b.rrr,
    RunsNeeded: b.runs_needed,
    WicketsInHand: b.wickets_in_hand,
  }));

  return (
    <div className="min-h-screen bg-rr-dark text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-rr-border">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-rr-pink/20 text-rr-pink">
                <PlayCircle className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-black text-white">Ball-by-Ball Match State Replay</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Sequential reconstruction of real high-pressure chases, showing dynamic required rates, wickets, and leverage.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {matches.map((m, idx) => (
              <button
                key={m.match_id}
                onClick={() => {
                  setSelectedMatchIdx(idx);
                  setCurrentBallIdx(15);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  selectedMatchIdx === idx
                    ? "bg-rr-pink text-white"
                    : "bg-rr-navy border border-rr-border text-slate-400 hover:text-white"
                }`}
              >
                Match #{m.match_id} ({m.stage})
              </button>
            ))}
          </div>
        </div>

        {/* Live Match State Telemetry Box */}
        {currentBall && (
          <div className="p-6 rounded-2xl bg-gradient-to-r from-rr-card via-rr-navy to-rr-card border border-rr-border shadow-2xl grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
            <div className="p-3 bg-slate-900/80 rounded-xl">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Target</div>
              <div className="text-xl font-black text-white mt-0.5">{activeMatch.target}</div>
              <div className="text-[10px] text-slate-400">Innings 2 Chase</div>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-xl">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Runs Needed</div>
              <div className="text-xl font-black text-rr-pink mt-0.5">{currentBall.runs_needed}</div>
              <div className="text-[10px] text-slate-400">off {currentBall.balls_left} balls</div>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-xl">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Required Rate</div>
              <div className="text-xl font-black text-rr-gold mt-0.5">{currentBall.rrr.toFixed(1)}</div>
              <div className="text-[10px] text-slate-400">Runs / Over</div>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-xl">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Wickets Left</div>
              <div className="text-xl font-black text-emerald-400 mt-0.5">{currentBall.wickets_in_hand}</div>
              <div className="text-[10px] text-slate-400">In Hand</div>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-xl">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Pressure Index</div>
              <div className="text-xl font-black text-rr-cyan mt-0.5">{currentBall.pressure_index.toFixed(3)}</div>
              <div className="text-[10px] text-slate-400">Leverage: High</div>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-xl">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Current Ball</div>
              <div className="text-xl font-black text-white mt-0.5">{currentBall.over}.{currentBall.ball}</div>
              <div className="text-[10px] text-slate-400">
                {currentBall.is_wicket ? "WICKET!" : `${currentBall.runs_scored} Runs`}
              </div>
            </div>
          </div>
        )}

        {/* Playback Slider */}
        <div className="p-4 bg-rr-card rounded-xl border border-rr-border space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-300">
              Scrub Timeline (Ball {currentBallIdx + 1} of {balls.length}):
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentBallIdx(0)}
                className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white"
                title="Restart"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setCurrentBallIdx(Math.min(balls.length - 1, currentBallIdx + 1))}
                className="px-2 py-1 rounded bg-rr-pink text-white font-bold text-[11px] flex items-center gap-1"
              >
                <FastForward className="w-3 h-3" /> Step Ball
              </button>
            </div>
          </div>
          <input
            type="range"
            min="0"
            max={balls.length - 1}
            value={currentBallIdx}
            onChange={(e) => setCurrentBallIdx(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rr-pink"
          />
        </div>

        {/* Dynamic Pressure Trajectory Chart */}
        <div className="p-6 bg-rr-card rounded-2xl border border-rr-border space-y-3">
          <h3 className="text-sm font-black uppercase text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-rr-pink" />
            Pressure Index Progression Through Chase
          </h3>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2C5A" />
                <XAxis dataKey="label" stroke="#94A3B8" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 1]} stroke="#94A3B8" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0A1128", borderColor: "#1E2C5A", fontSize: "11px", color: "#FFF" }}
                />
                <Line
                  type="monotone"
                  dataKey="PressureIndex"
                  stroke="#EA1A85"
                  strokeWidth={2.5}
                  dot={{ fill: "#EA1A85", r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
}
