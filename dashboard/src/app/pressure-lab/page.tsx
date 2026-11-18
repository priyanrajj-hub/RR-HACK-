"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import { Activity, Flame, ShieldAlert, Trophy, Layers, CheckCircle2 } from "lucide-react";
import modelEvalData from "@/data/model_evaluation.json";
import pressureDistData from "@/data/pressure_distribution.json";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from "recharts";

export default function PressureLabPage() {
  const [activeTab, setActiveTab] = useState<"wp" | "distribution" | "features">("wp");

  const calData = modelEvalData.win_probability_model.calibration_curve;
  const metricsComp = pressureDistData.metrics_comparison;

  return (
    <div className="min-h-screen bg-rr-dark text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-rr-border">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-rr-pink/20 text-rr-pink">
                <Activity className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-black text-white">Pressure Quantification & ML Laboratory</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Empirical calibration, Win Probability (WP) modeling, and delivery leverage index dynamics.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-rr-navy p-1 rounded-xl border border-rr-border text-xs">
            <button
              onClick={() => setActiveTab("wp")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                activeTab === "wp" ? "bg-rr-pink text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Win Probability Model
            </button>
            <button
              onClick={() => setActiveTab("distribution")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                activeTab === "distribution" ? "bg-rr-pink text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Pressure Distribution
            </button>
            <button
              onClick={() => setActiveTab("features")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                activeTab === "features" ? "bg-rr-pink text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Feature Architecture
            </button>
          </div>
        </div>

        {/* Tab 1: Win Probability Model Calibration */}
        {activeTab === "wp" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 p-6 bg-rr-card rounded-2xl border border-rr-border space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-black uppercase text-white">
                    Reliability Diagram: Calibration Curve (Holdout Validation)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Brier Score: {modelEvalData.win_probability_model.brier_score} | Log Loss: {modelEvalData.win_probability_model.log_loss}
                  </p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                  {modelEvalData.win_probability_model.status}
                </span>
              </div>

              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={calData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E2C5A" />
                    <XAxis
                      dataKey="predicted_prob"
                      domain={[0, 1]}
                      stroke="#94A3B8"
                      tick={{ fontSize: 10 }}
                      label={{ value: "Predicted Probability", position: "insideBottom", offset: -5, fill: "#94A3B8", fontSize: 10 }}
                    />
                    <YAxis
                      domain={[0, 1]}
                      stroke="#94A3B8"
                      tick={{ fontSize: 10 }}
                      label={{ value: "Empirical True Probability", angle: -90, position: "insideLeft", fill: "#94A3B8", fontSize: 10 }}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0A1128", borderColor: "#1E2C5A", fontSize: "11px", color: "#FFF" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="empirical_prob"
                      name="Empirical Reality"
                      stroke="#EA1A85"
                      strokeWidth={2.5}
                      dot={{ fill: "#EA1A85", r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="predicted_prob"
                      name="Perfect Calibration"
                      stroke="#64748B"
                      strokeDasharray="4 4"
                      dot={false}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[11px] text-slate-400 text-center">
                Evaluated across 23,743 holdout deliveries from independent test matches (GroupKFold by match_id).
              </p>
            </div>

            {/* Model Architecture Summary */}
            <div className="lg:col-span-4 space-y-4">
              <div className="p-5 bg-rr-card rounded-2xl border border-rr-border space-y-3">
                <h4 className="text-xs font-bold uppercase text-rr-cyan">Model Architecture</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Algorithm:</span>
                    <span className="font-mono text-white font-bold">{modelEvalData.win_probability_model.algorithm}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Training Samples:</span>
                    <span className="font-mono text-white">{modelEvalData.win_probability_model.training_samples.toLocaleString()} balls</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Validation Samples:</span>
                    <span className="font-mono text-white">{modelEvalData.win_probability_model.validation_samples.toLocaleString()} balls</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Brier Score Loss:</span>
                    <span className="font-mono text-emerald-400 font-bold">{modelEvalData.win_probability_model.brier_score}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Log Loss:</span>
                    <span className="font-mono text-emerald-400 font-bold">{modelEvalData.win_probability_model.log_loss}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-gradient-to-br from-rr-card to-rr-navy rounded-2xl border border-rr-border space-y-2 text-xs">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  No Data Leakage Enforced
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  Every feature is computed strictly prior to delivery execution. Deliveries from the same match never bridge across training and validation folds.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Distribution Comparison */}
        {activeTab === "distribution" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 p-6 bg-rr-card rounded-2xl border border-rr-border space-y-4">
              <h3 className="text-sm font-black uppercase text-white">
                Empirical Metrics: Ordinary Deliveries vs High Pressure
              </h3>
              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metricsComp}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E2C5A" />
                    <XAxis dataKey="label" stroke="#94A3B8" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#94A3B8" tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: "#0A1128", borderColor: "#1E2C5A", fontSize: "11px", color: "#FFF" }} />
                    <Bar dataKey="wicket_pct" name="Wicket Rate (%)" fill="#EA1A85" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="boundary_pct" name="Boundary %" fill="#254AA5" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="dot_pct" name="Dot Ball %" fill="#64748B" radius={[4, 4, 0, 0]} />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed text-center">
                Wicket hazard increases from 4.54% to 7.63% (+68.1% relative jump) proving high pressure is an empirically distinct match environment.
              </p>
            </div>

            <div className="lg:col-span-4 space-y-3">
              <div className="p-5 bg-rr-card rounded-2xl border border-rr-border space-y-2">
                <h4 className="text-xs font-bold uppercase text-rr-gold">Distribution Percentiles</h4>
                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span>Mean Pressure Index:</span>
                    <span className="font-mono text-white">{pressureDistData.distribution_summary.mean.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span>25th Percentile:</span>
                    <span className="font-mono text-white">{pressureDistData.distribution_summary.p25.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span>50th Percentile (Median):</span>
                    <span className="font-mono text-white">{pressureDistData.distribution_summary.p50.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span>72nd Percentile (Cutoff):</span>
                    <span className="font-mono text-rr-pink font-bold">{pressureDistData.threshold.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span>90th Percentile:</span>
                    <span className="font-mono text-white">{pressureDistData.distribution_summary.p90.toFixed(3)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Feature Architecture */}
        {activeTab === "features" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-rr-card rounded-2xl border border-rr-border space-y-3">
              <div className="flex items-center gap-2 text-rr-pink font-bold">
                <Flame className="w-5 h-5" />
                <h4>Innings 2: Chase Leverage Formulation</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Combines required run rate (RRR) relative to par (8.5 RPO) scaled by remaining wickets in hand. Final 18 deliveries with ≤36 runs required trigger an acute closeness surge.
              </p>
              <div className="p-3 bg-slate-900 rounded-lg font-mono text-[11px] text-rr-pink border border-slate-800">
                P_chase = 0.25 + 0.07*(RRR - 8.5) + 0.08*WktStress + 0.15*CloseFinish
              </div>
            </div>

            <div className="p-6 bg-rr-card rounded-2xl border border-rr-border space-y-3">
              <div className="flex items-center gap-2 text-rr-blue-light font-bold">
                <ShieldAlert className="w-5 h-5" />
                <h4>Innings 1: Setting Stress & Collapse Detection</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Tracks wickets lost against expected wicket curves (0.28 per over) and activates a Collapse Flag whenever ≥2 wickets fall in any 18-delivery rolling window.
              </p>
              <div className="p-3 bg-slate-900 rounded-lg font-mono text-[11px] text-rr-blue-light border border-slate-800">
                P_inn1 = 0.20 + 0.12*WktDeficit + 0.18*CollapseFlag + 0.20*DeathOvers
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
