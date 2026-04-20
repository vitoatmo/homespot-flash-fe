import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { SessionTimer } from "@/components/session-timer";
import { JourneyProgress } from "@/components/organisms/journey-progress";

export const metadata: Metadata = {
  title: "Homespot Flash Service — AI Approval, Instant Buy Decision",
  description:
    "KPR BRI dalam satu sesi: AI pre-approval < 60 detik, VR property tour, dan komitmen pembelian instan.",
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <Nav />
        <JourneyProgress />
        <main className="min-h-[calc(100vh-8rem)]">{children}</main>
        <Footer />
        <SessionTimer />
      </body>
    </html>
  );
}
