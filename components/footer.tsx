export function Footer() {
  return (
    <footer className="mt-12 border-t bg-primary text-primary-foreground sm:mt-20">
      <div className="container grid gap-6 py-8 sm:gap-8 sm:py-10 sm:grid-cols-2 md:grid-cols-4">
        <div className="col-span-full sm:col-span-2 md:col-span-1">
          <div className="text-base font-bold sm:text-lg">Homespot Flash Service</div>
          <p className="mt-2 text-sm text-white/70">
            AI-based approval, instant buying decision. One-session commitment untuk KPR BRI.
          </p>
        </div>
        <div>
          <div className="text-sm font-semibold">Produk</div>
          <ul className="mt-2 space-y-1 text-sm text-white/70">
            <li>AI Pre-Approval</li>
            <li>VR Property Tour</li>
            <li>One-Session Commitment</li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-semibold">Legal</div>
          <ul className="mt-2 space-y-1 text-sm text-white/70">
            <li>OJK Compliance</li>
            <li>BI SNAP</li>
            <li>UU PDP</li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-semibold">Kontak</div>
          <ul className="mt-2 space-y-1 text-sm text-white/70">
            <li>Call BRI 14017</li>
            <li>Kantor Pusat · Jakarta</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 pb-[max(env(safe-area-inset-bottom),1rem)] text-center text-[11px] text-white/60 sm:text-xs">
        © 2026 Bank BRI · Homespot Flash Service · Prototype (Thesis-backed)
      </div>
    </footer>
  );
}
