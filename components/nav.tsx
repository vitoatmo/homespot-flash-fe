"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Zap, BookOpen, Menu, X, ChevronDown } from "lucide-react";

const productLinks = [
  { href: "/properties", label: "Properti" },
  { href: "/pre-approval", label: "Cek Limit" },
  { href: "/status/APP-2026-00042", label: "Status KPR" },
];

const thesisLinks = [
  { href: "/journey", label: "Customer Journey Map" },
  { href: "/design-system", label: "Design System" },
  { href: "/admin/records", label: "Live Records (DB)" },
  { href: "/findings", label: "Findings" },
  { href: "/limitations", label: "Limitations & Future Work" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const [thesisOpen, setThesisOpen] = useState(false);

  // Lock scroll & close on ESC
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
      window.addEventListener("keydown", onKey);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", onKey);
      };
    }
    document.body.style.overflow = "";
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
      <div className="container flex h-14 items-center justify-between sm:h-16">
        <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground sm:h-9 sm:w-9">
            <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold text-primary">Homespot</div>
            <div className="text-[10px] text-accent sm:text-xs">Flash Service</div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {productLinks.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm font-medium hover:text-primary">
              {l.label}
            </Link>
          ))}
          <div
            className="relative"
            onMouseEnter={() => setThesisOpen(true)}
            onMouseLeave={() => setThesisOpen(false)}
          >
            <button className="flex items-center gap-1 text-sm font-medium hover:text-primary">
              <BookOpen className="h-3.5 w-3.5" />
              Thesis
              <ChevronDown className="h-3 w-3" />
            </button>
            {thesisOpen && (
              <div className="absolute right-0 top-full mt-1 w-60 overflow-hidden rounded-lg border bg-white shadow-lg">
                {thesisLinks.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="block px-4 py-2.5 text-sm hover:bg-muted"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button variant="outline" size="sm" asChild>
            <Link href="/pre-approval">Cek Limit Kilat</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/properties">Mulai</Link>
          </Button>
        </div>

        {/* Mobile toggle (44px touch) */}
        <button
          className="flex h-11 w-11 items-center justify-center rounded-md border md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Buka menu"
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 flex w-[85vw] max-w-sm flex-col bg-white shadow-2xl">
            <div className="flex h-14 items-center justify-between border-b px-4">
              <div className="text-sm font-semibold text-primary">Menu</div>
              <button
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-muted"
                aria-label="Tutup menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-4">
              <div className="space-y-1">
                {productLinks.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-md px-3 py-3 text-sm font-medium hover:bg-muted"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
              <div className="mt-4 px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Thesis
              </div>
              <div className="space-y-1">
                {thesisLinks.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-md px-3 py-2.5 text-sm hover:bg-muted"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex gap-2 border-t p-4 pb-[max(env(safe-area-inset-bottom),1rem)]">
              <Button variant="outline" className="flex-1" asChild>
                <Link href="/pre-approval" onClick={() => setOpen(false)}>Cek Limit</Link>
              </Button>
              <Button className="flex-1" asChild>
                <Link href="/properties" onClick={() => setOpen(false)}>Mulai</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
