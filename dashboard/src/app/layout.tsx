import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RR Pressure Index | SupeRR Selector S2",
  description: "Official Rajasthan Royals SupeRR Selector Season 2 Analytics: Identifying the Most Reliable Players Under Pressure across 200,999 deliveries.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-rr-dark text-slate-100 min-h-screen antialiased selection:bg-rr-pink selection:text-white">
        {children}
      </body>
    </html>
  );
}
