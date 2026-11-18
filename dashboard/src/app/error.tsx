"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Home, ShieldAlert } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Royals Intelligence OS Runtime Caught Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#070B19] text-slate-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full p-8 rounded-2xl bg-gradient-to-b from-[#0D1530] to-[#0A1024] border border-[#1E2C5A] shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-500">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-pink-500/20 text-pink-400 border border-pink-500/30">
            Analytics State Recovered
          </span>
          <h2 className="text-xl font-black text-white">Royals Intelligence Telemetry</h2>
          <p className="text-xs text-slate-400">
            A temporary client cache mismatch was detected. You can instantly reload the latest validated build below.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                window.location.reload();
              } else {
                reset();
              }
            }}
            className="px-5 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-pink-500/25"
          >
            <RefreshCw className="w-4 h-4" />
            Reload Latest Build
          </button>

          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl bg-[#131F42] hover:bg-[#1A2A56] text-slate-300 font-bold text-xs flex items-center justify-center gap-2 border border-[#1E2C5A] transition-all"
          >
            <Home className="w-4 h-4" />
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
