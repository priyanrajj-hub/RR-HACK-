"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Activity,
  Flame,
  Shield,
  BookOpen,
  PlayCircle,
  Coins,
  Bot,
  Database,
  Download,
  Swords
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/pressure-lab", label: "Pressure Lab", icon: Activity },
    { href: "/batters", label: "Batters", icon: Flame },
    { href: "/bowlers", label: "Bowlers", icon: Shield },
    { href: "/research/ipl-2026", label: "IPL 2026 Intel", icon: BookOpen },
    { href: "/match-replay", label: "Match Replay", icon: PlayCircle },
    { href: "/auction-lab", label: "Auction Lab", icon: Coins },
    { href: "/ai-analyst", label: "AI Copilot", icon: Bot },
    { href: "/data-pipeline", label: "Data Pipeline", icon: Database },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-rr-dark/95 backdrop-blur-md border-b border-rr-border px-4 lg:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rr-pink to-rr-blue flex items-center justify-center font-black text-white text-sm shadow-md shadow-rr-pink/20 group-hover:scale-105 transition-transform">
            RR
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-wider text-white">
                ROYALS INTELLIGENCE OS
              </span>
              <span className="hidden sm:inline px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-rr-pink/20 text-rr-pink border border-rr-pink/30">
                v2.0
              </span>
            </div>
            <p className="text-[10px] text-slate-400 -mt-0.5">
              Intelligence Under Pressure • 200k+ Balls
            </p>
          </div>
        </Link>

        {/* Links */}
        <div className="hidden lg:flex items-center gap-1 overflow-x-auto scrollbar-none py-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? "bg-rr-card text-rr-pink border border-rr-pink/30 shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-rr-pink" : "text-slate-400"}`} />
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <a
            href="/RR_Pressure_Report.pdf"
            download
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rr-pink hover:bg-rr-pink-light text-white text-xs font-bold shadow-md shadow-rr-pink/20 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Report</span> PDF
          </a>
        </div>
      </div>

      {/* Mobile Nav Sub-row */}
      <div className="xl:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-800/60 mt-2 scrollbar-none">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold whitespace-nowrap flex items-center gap-1 ${
                isActive
                  ? "bg-rr-pink text-white"
                  : "text-slate-400 hover:text-white bg-slate-900"
              }`}
            >
              <Icon className="w-3 h-3" />
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
