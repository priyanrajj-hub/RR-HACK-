"use client";

import React, { useState } from "react";
import { Sliders, RotateCcw, Activity, ShieldAlert, Flame, Trophy } from "lucide-react";

export interface PressureWeights {
  chaseWeight: number;     // default 0.50
  phaseWeight: number;     // default 0.25
  collapseWeight: number;  // default 0.15
  stakesWeight: number;    // default 0.10
  percentileCutoff: number;// default 72
}

interface PressureDialProps {
  weights: PressureWeights;
  onWeightsChange: (newWeights: PressureWeights) => void;
  onReset: () => void;
}

export default function PressureDial({
  weights,
  onWeightsChange,
  onReset,
}: PressureDialProps) {
  const [activeTab, setActiveTab] = useState<"formula" | "sliders">("sliders");

  const handleSliderChange = (key: keyof PressureWeights, value: number) => {
    onWeightsChange({
      ...weights,
      [key]: value,
    });
  };

  // Compute composite gauge value (0.0 to 1.0)
  const normalizedGauge = Math.min(
    1.0,
    weights.chaseWeight * 0.75 +
      weights.phaseWeight * 0.85 +
      weights.collapseWeight * 0.65 +
      weights.stakesWeight * 0.80
  );

  // SVG Gauge calculation
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - normalizedGauge * 0.75 * circumference;

  return (
    <div className="bg-rr-card border border-rr-border rounded-2xl p-6 shadow-xl relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-rr-pink/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-4 border-b border-rr-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-rr-pink/20 text-rr-pink">
              <Activity className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-bold text-white">Pressure Index Dial & Simulator</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tune delivery leverage weights and percentile cutoff to observe real-time rank sensitivity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab(activeTab === "sliders" ? "formula" : "sliders")}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-rr-navy border border-rr-border text-slate-300 hover:text-white hover:border-rr-pink transition-colors flex items-center gap-1.5"
          >
            <Sliders className="w-3.5 h-3.5 text-rr-pink" />
            {activeTab === "sliders" ? "View Formula" : "Tune Sliders"}
          </button>
          <button
            onClick={onReset}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-rr-navy border border-rr-border text-slate-400 hover:text-white hover:border-rr-blue transition-colors flex items-center gap-1.5"
            title="Reset to empirical baseline weights"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rr-blue-light" />
            Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Radial Pressure Gauge */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 bg-rr-dark/60 rounded-xl border border-slate-800">
          <div className="relative w-44 h-44 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="88"
                cy="88"
                r={radius}
                stroke="#1E293B"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * 0.25}
                strokeLinecap="round"
              />
              <circle
                cx="88"
                cy="88"
                r={radius}
                stroke="url(#rrGradient)"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-500 ease-out"
              />
              <defs>
                <linearGradient id="rrGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#254AA5" />
                  <stop offset="70%" stopColor="#EA1A85" />
                  <stop offset="100%" stopColor="#F5A623" />
                </linearGradient>
              </defs>
            </svg>

            {/* Center Gauge Value */}
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-black text-white tracking-tight">
                {normalizedGauge.toFixed(3)}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-rr-pink">
                Pressure Index (PI)
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">
                P{weights.percentileCutoff} Cutoff: 0.444
              </span>
            </div>
          </div>

          <div className="w-full mt-3 flex justify-between text-[11px] text-slate-400 px-2">
            <span>Low (0.0)</span>
            <span className="font-semibold text-rr-gold">72nd %ile Cutoff</span>
            <span>Extreme (1.0)</span>
          </div>
        </div>

        {/* Sliders or Formula View */}
        <div className="lg:col-span-8">
          {activeTab === "sliders" ? (
            <div className="space-y-4">
              {/* Chase Stress Slider */}
              <div className="p-3 bg-rr-dark/40 rounded-xl border border-slate-800/80">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-rr-pink" />
                    Chase Stress Weight (RRR vs CRR & Wickets)
                  </span>
                  <span className="font-mono font-bold text-rr-pink">
                    {(weights.chaseWeight * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="70"
                  step="5"
                  value={weights.chaseWeight * 100}
                  onChange={(e) => handleSliderChange("chaseWeight", parseFloat(e.target.value) / 100)}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rr-pink"
                />
              </div>

              {/* Phase Urgency Slider */}
              <div className="p-3 bg-rr-dark/40 rounded-xl border border-slate-800/80">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-rr-blue-light" />
                    Phase Leverage (Death Overs 16-20 Priority)
                  </span>
                  <span className="font-mono font-bold text-rr-blue-light">
                    {(weights.phaseWeight * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="50"
                  step="5"
                  value={weights.phaseWeight * 100}
                  onChange={(e) => handleSliderChange("phaseWeight", parseFloat(e.target.value) / 100)}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rr-blue-light"
                />
              </div>

              {/* Collapse Resource Stress Slider */}
              <div className="p-3 bg-rr-dark/40 rounded-xl border border-slate-800/80">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-rr-gold" />
                    Collapse / Innings 1 Wicket Deficit
                  </span>
                  <span className="font-mono font-bold text-rr-gold">
                    {(weights.collapseWeight * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="35"
                  step="5"
                  value={weights.collapseWeight * 100}
                  onChange={(e) => handleSliderChange("collapseWeight", parseFloat(e.target.value) / 100)}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rr-gold"
                />
              </div>

              {/* Match Stakes Slider */}
              <div className="p-3 bg-rr-dark/40 rounded-xl border border-slate-800/80">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-rr-cyan" />
                    Knockout & Final Overs Closeness Leverage
                  </span>
                  <span className="font-mono font-bold text-rr-cyan">
                    {(weights.stakesWeight * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="5"
                  value={weights.stakesWeight * 100}
                  onChange={(e) => handleSliderChange("stakesWeight", parseFloat(e.target.value) / 100)}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rr-cyan"
                />
              </div>
            </div>
          ) : (
            <div className="p-4 bg-rr-dark/70 rounded-xl border border-slate-800 space-y-3 text-xs leading-relaxed">
              <div className="font-bold text-white text-sm">Formal Delivery Pressure Equation:</div>
              <div className="font-mono bg-slate-900/90 p-2.5 rounded-lg text-rr-pink border border-slate-800 text-[11px] overflow-x-auto">
                PI = 0.50·P_chase + 0.25·L_phase + 0.15·S_match + 0.10·(W_stress)
              </div>
              <p className="text-slate-300">
                • <b>Innings 2 Chase:</b> P_chase scales required rate above par (8.5 RPO) amplified by remaining wickets in hand. Final 18 balls with ≤36 runs required receive a closeness surge (+0.15).
              </p>
              <p className="text-slate-300">
                • <b>Innings 1 Setting:</b> Evaluates wicket loss versus empirical expectation (μ_W = 0.28 per over) and triggers a collapse flag if ≥2 wickets fall in 18 balls.
              </p>
              <p className="text-slate-300">
                • <b>High Pressure Boundary:</b> Top 28% deliveries (PI ≥ 0.444) where wicket probability jumps by +68.1% (4.54% → 7.63%).
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
