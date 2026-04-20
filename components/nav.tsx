import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Zap className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold text-primary">Homespot</div>
            <div className="text-xs text-accent">Flash Service</div>
          </div>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/properties" className="text-sm font-medium hover:text-primary">Properti</Link>
          <Link href="/pre-approval" className="text-sm font-medium hover:text-primary">Cek Limit</Link>
          <Link href="/status/APP-2026-00042" className="text-sm font-medium hover:text-primary">Status KPR</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/pre-approval">Cek Limit Kilat</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/properties">Mulai</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
