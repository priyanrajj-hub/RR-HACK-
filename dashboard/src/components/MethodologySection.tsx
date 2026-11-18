"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, FileText, CheckCircle2, AlertTriangle, Layers, BookOpen, Download } from "lucide-react";

export default function MethodologySection() {
  const [openSection, setOpenSection] = useState<string | null>("pressure-def");

  const toggle = (id: string) => {
    setOpenSection(openSection === id ? null : id);
  };

  return (
    <div className="bg-rr-card border border-rr-border rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-rr-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-rr-blue/20 text-rr-blue-light">
              <BookOpen className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-bold text-white">Methodology, Validation & Limitations</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Comprehensive documentation of sabermetric logic, validation benchmarks, and recruitment boundaries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/RR_Pressure_Report.pdf"
            download
            className="px-4 py-2 rounded-xl bg-rr-pink hover:bg-rr-pink-light text-white font-bold text-xs shadow-lg shadow-rr-pink/20 transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download PDF Report (8 Pages)
          </a>
          <a
            href="/RR_Pressure_Presentation.pptx"
            download
            className="px-4 py-2 rounded-xl bg-rr-navy hover:bg-slate-800 border border-rr-border text-slate-200 font-bold text-xs transition-all flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-rr-cyan" />
            Download PPTX
          </a>
        </div>
      </div>

      {/* Accordion 1: Pressure Definition */}
      <div className="rounded-xl border border-slate-800 bg-rr-dark/60 overflow-hidden">
        <button
          onClick={() => toggle("pressure-def")}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center gap-2.5 font-bold text-sm text-slate-200">
            <Layers className="w-4 h-4 text-rr-pink" />
            1. Multi-Vector Pressure Index Formulation (PI ∈ [0, 1])
          </div>
          {openSection === "pressure-def" ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>
        {openSection === "pressure-def" && (
          <div className="p-4 pt-0 text-xs text-slate-300 space-y-2 border-t border-slate-800/60 leading-relaxed">
            <p>
              Pressure is formulated as a continuous delivery-level metric combining 4 distinct leverage vectors:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-400">
              <li>
                <strong className="text-slate-200">Innings 2 Chase Leverage (50%):</strong> Measured from required run rate (RRR) relative to par (8.5 RPO) and remaining wickets in hand (W_hand). Close finishes with ≤18 balls and ≤36 runs receive a +0.15 closeness bonus.
              </li>
              <li>
                <strong className="text-slate-200">Innings 1 Setting Stress (50%):</strong> Wickets lost versus empirical expectation ($\mu_W = 0.28$ per over) plus an active <em>Collapse Flag</em> triggered when ≥2 wickets fall in any 18-delivery rolling window.
              </li>
              <li>
                <strong className="text-slate-200">Phase Leverage (25–30%):</strong> Death overs (16–20) weighted at 0.90, middle overs (7–15) at 0.55, and powerplay overs (1–6) at 0.45.
              </li>
              <li>
                <strong className="text-slate-200">Match Stakes (15–20%):</strong> Knockout, playoff, and tournament final matches carry an additive +0.20 multiplier. Super Overs are assigned $PI = 1.0$.
              </li>
            </ul>
            <div className="p-2.5 bg-slate-900 rounded-lg text-slate-300 font-mono text-[11px] mt-2 border border-slate-800">
              Cutoff: 72nd Percentile (PI ≥ 0.4442) isolates 56,292 deliveries where wicket hazard spikes by +68.1% (4.54% → 7.63%).
            </div>
          </div>
        )}
      </div>

      {/* Accordion 2: Performance Baselines & Scoring */}
      <div className="rounded-xl border border-slate-800 bg-rr-dark/60 overflow-hidden">
        <button
          onClick={() => toggle("scoring-logic")}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center gap-2.5 font-bold text-sm text-slate-200">
            <CheckCircle2 className="w-4 h-4 text-rr-blue-light" />
            2. Performance Baselines, Empirical Bayes & Consistency
          </div>
          {openSection === "scoring-logic" ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>
        {openSection === "scoring-logic" && (
          <div className="p-4 pt-0 text-xs text-slate-300 space-y-2 border-t border-slate-800/60 leading-relaxed">
            <p>
              To isolate genuine player skill from situational luck, our pipeline operates across 4 stages:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-400">
              <li>
                <strong className="text-slate-200">Context-Expected Baselines:</strong> Expected runs ($E[Runs]$) and expected wickets ($P(Wicket)$) are computed across each $(Phase, BowlingType, PressureBucket)$ matrix slice.
              </li>
              <li>
                <strong className="text-slate-200">Delivery Net Impact:</strong> Wickets are valued at 7.5 runs based on empirical T20 run-expectancy shift. Net impact reflects runs scored/saved relative to expectation.
              </li>
              <li>
                <strong className="text-slate-200">Empirical Bayes Shrinkage:</strong> Players with smaller samples are regressed toward replacement level using prior weight $K = 50-55$ deliveries ($\lambda = N / (N + K)$).
              </li>
              <li>
                <strong className="text-slate-200">Match Consistency:</strong> Evaluates the win rate of positive-impact matches and penalizes volatility (sigma_match).
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Accordion 3: Fair Comparisons & Eligibility */}
      <div className="rounded-xl border border-slate-800 bg-rr-dark/60 overflow-hidden">
        <button
          onClick={() => toggle("fair-comp")}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center gap-2.5 font-bold text-sm text-slate-200">
            <Layers className="w-4 h-4 text-rr-gold" />
            3. Fair Comparison: Eligibility & Competition Quality Calibration
          </div>
          {openSection === "fair-comp" ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>
        {openSection === "fair-comp" && (
          <div className="p-4 pt-0 text-xs text-slate-300 space-y-2 border-t border-slate-800/60 leading-relaxed">
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-400">
              <li>
                <strong className="text-slate-200">Eligibility Floor:</strong> Minimum 120 high-pressure legal balls faced/bowled AND ≥15 matches. 120 deliveries equals 20 full pressure overs, providing sufficient statistical power for 90% bootstrap confidence intervals with spread &lt; 7.5 points.
              </li>
              <li>
                <strong className="text-slate-200">Competition Quality Weighting:</strong> IPL matches receive 1.30x weighting (the world&apos;s toughest franchise league); Tier-1 T20Is between top-9 nations receive 1.10x; emerging and associate matches receive 0.65x.
              </li>
              <li>
                <strong className="text-slate-200">Phase-Conditioned Baseline Comparison:</strong> Death bowlers are compared against death-phase expectations, completely eliminating the bias where powerplay bowlers falsely look more economical than death yorker specialists.
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Accordion 4: Limitations */}
      <div className="rounded-xl border border-slate-800 bg-rr-dark/60 overflow-hidden">
        <button
          onClick={() => toggle("limitations")}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center gap-2.5 font-bold text-sm text-slate-200">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            4. Reliability Validation & Honest Methodological Limitations
          </div>
          {openSection === "limitations" ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>
        {openSection === "limitations" && (
          <div className="p-4 pt-0 text-xs text-slate-300 space-y-2 border-t border-slate-800/60 leading-relaxed">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <div className="font-bold text-white mb-1">Batters Delivery Reliability</div>
                <div className="text-rr-pink font-mono text-sm">r = 0.379 | Spearman-Brown = 0.550</div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Odd vs even delivery sequence test-retest shows strong internal consistency across balls.
                </div>
              </div>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <div className="font-bold text-white mb-1">Bowlers Delivery Reliability</div>
                <div className="text-rr-blue-light font-mono text-sm">r = 0.152 | Spearman-Brown = 0.263</div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Single-delivery bowling outcomes carry higher edge/luck variance, requiring Bayes shrinkage.
                </div>
              </div>
            </div>
            <p className="font-semibold text-slate-200 mt-2">Documented Model Limitations:</p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-400">
              <li>Fielding anomalies (dropped catches, misfields) are unrecorded in ball-by-ball logs and charged to bowler economy.</li>
              <li>Ground dimensions and pitch variations create residual noise partially mitigated by phase expectations.</li>
              <li>Emerging players with fewer than 120 pressure balls are shrunk toward replacement level to prevent small-sample bias.</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
