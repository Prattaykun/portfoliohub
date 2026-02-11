// components/MediaCard.tsx
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

export type MediaItem = {
  id?: string;
  type?: "image" | "video" | "link" | "text" | string;
  url?: string;
  title?: string;
  description?: string;
  [k: string]: any;
};

type Props = {
  item: MediaItem;
  sectionName?: string;
  onExpand: (item: MediaItem) => void;
};

/**
 * Small helper to convert some youtube urls to embeddable urls.
 * Kept simple and defensive.
 */
const isYouTube = (u?: string) => !!u && (u.includes("youtube.com") || u.includes("youtu.be"));
const toYouTubeEmbed = (url: string) => {
  try {
    if (url.includes("watch?v=")) return url.replace("watch?v=", "embed/");
    if (url.includes("youtu.be/")) return url.replace("youtu.be/", "youtube.com/embed/");
  } catch {}
  return url;
};

export default function MediaCard({ item, onExpand }: Props) {
  const type = String(item.type || "").toLowerCase();
  const title = item.title || "(untitled)";
  const url = item.url || "";
  const desc = item.description || "";

  // tilt state (degrees)
  const [tilt, setTilt] = React.useState({ rx: 0, ry: 0, scale: 1 });
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const rafRef = React.useRef<number | null>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (rafRef.current) return;

    const el = rootRef.current;
    if (!el) return;
    
    // Use rAF to throttle updates
    rafRef.current = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width; // 0..1
      const py = (e.clientY - rect.top) / rect.height; // 0..1
      const ry = (px - 0.5) * 10; // rotateY -10deg..10deg
      const rx = (0.5 - py) * 8;  // rotateX -8deg..8deg
      setTilt({ rx, ry, scale: 1.02 });
      rafRef.current = null;
    });
  };

  const handleMouseLeave = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setTilt({ rx: 0, ry: 0, scale: 1 });
  };

  // modern card shadow + glass + subtle border
  const cardStyle: React.CSSProperties = {
    transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale(${tilt.scale})`,
    transition: tilt.scale > 1 ? "transform 50ms linear" : "transform 300ms cubic-bezier(.2,.9,.2,1)",
    willChange: "transform",
  };

  return (
    <div
      ref={rootRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={cardStyle}
      className="relative rounded-2xl overflow-hidden group bg-gradient-to-tr from-white/4 to-white/6 border border-white/6 shadow-lg hover:shadow-2xl transition-shadow duration-300"
    >
      {/* clickable overlay opens modal/expand */}
      <button
        onClick={() => onExpand(item)}
        aria-label={`Expand ${title}`}
        className="absolute inset-0 z-20 cursor-pointer"
      />

      {/* IMAGE CARD */}
      {type === "image" && url && (
        <div className="relative h-44 md:h-56 w-full bg-gray-900">
          <Image
            src={url}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 400px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute left-3 right-3 bottom-3 text-white z-30">
            <div className="font-semibold text-sm md:text-base truncate">{title}</div>
            {desc && <div className="text-xs text-white/80 line-clamp-2 mt-1">{desc}</div>}
          </div>
        </div>
      )}

      {/* VIDEO CARD */}
      {type === "video" && url && (
        <div className="p-4 bg-slate-900">
          {isYouTube(url) ? (
            <div className="relative w-full h-40 rounded-md overflow-hidden mb-3">
              <iframe
                src={toYouTubeEmbed(url)}
                title={title}
                className="w-full h-full"
                allowFullScreen
                loading="lazy"
              />
            </div>
          ) : (
            <div className="relative w-full h-40 rounded-md overflow-hidden mb-3 bg-black/50 flex items-center justify-center">
              <div className="text-white text-sm">External Video</div>
            </div>
          )}
          <div className="px-1">
            <div className="font-semibold text-white truncate">{title}</div>
            {desc && <div className="text-xs text-gray-300 mt-1 line-clamp-2">{desc}</div>}
          </div>
        </div>
      )}

      {/* TEXT CARD */}
      {type === "text" && (
        <div className="p-4 bg-slate-900">
          <div className="font-semibold text-white mb-2 truncate">{title}</div>
          <div className="text-sm text-gray-200 bg-white/5 p-3 rounded-md border border-white/6 whitespace-pre-wrap max-h-36 overflow-auto">
            {url}
          </div>
        </div>
      )}

      {/* LINK CARD - always show /website.png as requested */}
      {type === "link" && url && (
        <div className="relative h-44 md:h-56 w-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center">
          <div className="absolute inset-0 flex items-center justify-center px-4">
            <div className="flex items-center w-full">
              <div className="w-20 h-20 rounded-lg overflow-hidden flex items-center justify-center bg-white/5 border border-white/8 mr-4 flex-shrink-0">
                <Image src="/worldwide.gif" alt="website" width={52} height={52} className="object-contain" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white truncate">{title}</div>
                <div className="text-xs text-gray-300 mt-1 truncate">{url}</div>
                {desc && <div className="text-xs text-gray-400 mt-2 line-clamp-2">{desc}</div>}
              </div>
            </div>
          </div>
          <div className="absolute inset-0 left-0 bg-gradient-to-t from-black/25 to-transparent" />
        </div>
      )}

      {/* FALLBACK */}
      {!["image", "video", "text", "link"].includes(type) && (
        <div className="p-4 bg-slate-900">
          <div className="font-semibold text-white">{title}</div>
          {desc && <div className="text-xs text-gray-300 mt-2">{desc}</div>}
        </div>
      )}

      {/* ACTIONS */}
      <div className="p-3 border-t border-white/6 flex items-center justify-end gap-3 bg-gradient-to-t from-slate-900/70 to-transparent z-10">
        <button
          onClick={() => onExpand(item)}
          className="px-3 py-1 rounded-lg bg-white/6 hover:bg-white/10 text-sm text-white transition"
        >
          Expand
        </button>

        {type !== "text" && url && (
          <Link
            href={url}
            target="_blank"
            onClick={(e) => e.stopPropagation()}
            className="px-3 py-1 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-sm text-white transition"
          >
            Open ↗
          </Link>
        )}
      </div>
    </div>
  );
}
