"use client";

import { useState } from "react";
import Image from "next/image";
import { ProductArtwork } from "./product-artwork";

type Media = { id: string; url: string; alt: string; type: string };

export function ProductGallery({
  media,
  name,
  seed,
  label,
}: {
  media: Media[];
  name: string;
  seed: string;
  label?: string | null;
}) {
  const [active, setActive] = useState(0);

  if (media.length === 0) {
    return (
      <div className="card aspect-square overflow-hidden">
        <ProductArtwork seed={seed} label={label} />
      </div>
    );
  }

  const current = media[Math.min(active, media.length - 1)];

  return (
    <div className="space-y-3">
      <div className="card relative aspect-square overflow-hidden bg-surface-2">
        {current.type === "video" ? (
          <video
            key={current.url}
            src={current.url}
            controls
            playsInline
            preload="metadata"
            className="h-full w-full bg-ink object-contain"
          />
        ) : (
          <Image
            src={current.url}
            alt={current.alt || name}
            fill
            priority
            sizes="(min-width: 1024px) 520px, 92vw"
            className="object-cover"
          />
        )}
      </div>

      {media.length > 1 && (
        <ul className="grid grid-cols-5 gap-2 sm:grid-cols-6">
          {media.map((m, i) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`View ${m.type} ${i + 1}`}
                aria-current={i === active}
                className={`relative block aspect-square w-full overflow-hidden rounded-lg border transition-colors ${
                  i === active
                    ? "border-signal ring-2 ring-signal-soft"
                    : "border-line hover:border-signal/50"
                }`}
              >
                {m.type === "video" ? (
                  <span className="flex h-full w-full items-center justify-center bg-ink text-white">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                ) : (
                  <Image
                    src={m.url}
                    alt=""
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
