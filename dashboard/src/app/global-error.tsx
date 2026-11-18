"use client";

import React from "react";
import Link from "next/link";
import { RefreshCw, Home, ShieldAlert } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#070B19] text-slate-100 min-h-screen flex items-center justify-center p-6 antialiased">
        <div className="max-w-md w-full p-8 rounded-2xl bg-[#0D1530] border border-[#1E2C5A] shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-500">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black text-white">Royals Intelligence OS</h2>
            <p className="text-xs text-slate-400">
              The application recovered from an unexpected client event. Click below to refresh.
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
              className="px-5 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Page
            </button>

            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl bg-[#131F42] hover:bg-[#1A2A56] text-slate-300 font-bold text-xs flex items-center justify-center gap-2 border border-[#1E2C5A] transition-all"
            >
              <Home className="w-4 h-4" />
              Return Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
