"use client";

import { useState } from "react";
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

        {/* Mobile toggle */}
        <button
          className="flex h-9 w-9 items-center justify-center rounded-md border md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="border-t bg-white md:hidden">
          <div className="container space-y-1 py-3">
            {productLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                {l.label}
              </Link>
            ))}
            <div className="pt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground px-3">
              Thesis
            </div>
            {thesisLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
              >
                {l.label}
              </Link>
            ))}
            <div className="flex gap-2 pt-3">
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <Link href="/pre-approval" onClick={() => setOpen(false)}>Cek Limit</Link>
              </Button>
              <Button size="sm" className="flex-1" asChild>
                <Link href="/properties" onClick={() => setOpen(false)}>Mulai</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
