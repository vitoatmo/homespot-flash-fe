import { ExternalLink } from "lucide-react";

type Props = {
  url: string;          // raw Matterport URL (show or models)
  title: string;
  className?: string;
};

// Convert any Matterport URL into an embeddable one.
// my.matterport.com/show/?m=ID  -> my.matterport.com/show/?m=ID&play=1&qs=1
// my.matterport.com/models/ID   -> my.matterport.com/show/?m=ID
export function toEmbedUrl(url: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (!u.hostname.includes("matterport.com")) return null;
    let id = u.searchParams.get("m");
    if (!id) {
      const parts = u.pathname.split("/").filter(Boolean);
      if (parts[0] === "models" && parts[1]) id = parts[1];
    }
    if (!id) return null;
    return `https://my.matterport.com/show/?m=${id}&play=1&qs=1&hr=0&brand=0`;
  } catch {
    return null;
  }
}

export function MatterportEmbed({ url, title, className }: Props) {
  const src = toEmbedUrl(url);
  if (!src) {
    return (
      <div className="rounded-xl border bg-muted/40 p-6 text-sm text-muted-foreground">
        Tour 3D tidak tersedia untuk properti ini.
      </div>
    );
  }
  return (
    <div className={className}>
      <div className="relative aspect-video overflow-hidden rounded-xl border bg-black">
        <iframe
          src={src}
          title={`Tour 3D — ${title}`}
          allow="xr-spatial-tracking; gyroscope; accelerometer; fullscreen"
          allowFullScreen
          loading="lazy"
          className="absolute inset-0 h-full w-full"
        />
      </div>
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
      >
        Buka di Matterport <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}
