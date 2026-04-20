export function Footer() {
  return (
    <footer className="mt-20 border-t bg-primary text-primary-foreground">
      <div className="container grid gap-8 py-10 md:grid-cols-4">
        <div>
          <div className="text-lg font-bold">Homespot Flash Service</div>
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
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/60">
        © 2026 Bank BRI · Homespot Flash Service · Prototype (Thesis-backed)
      </div>
    </footer>
  );
}
