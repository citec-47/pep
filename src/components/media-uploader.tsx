"use client";

import { useState } from "react";
import Image from "next/image";

export type MediaItem = { url: string; type: "image" | "video" };

/** POSTs one file to the admin upload route and returns the stored media item. */
async function uploadFile(file: File): Promise<MediaItem> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.url) {
    throw new Error(body.error ?? "Upload failed.");
  }
  return { url: body.url, type: body.type === "video" ? "video" : "image" };
}

const dropzone =
  "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-line bg-base px-4 py-8 text-center transition-colors hover:border-signal/50";

function UploadIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-2 text-muted">
      <path d="M12 16V4m0 0L8 8m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
    </svg>
  );
}

/**
 * Ordered gallery of images and videos. The parent keeps the list in state and
 * submits it as hidden `media` inputs encoded `type::url`.
 */
export function MediaUploader({
  media,
  onChange,
  onUploadingChange,
}: {
  media: MediaItem[];
  onChange: (next: MediaItem[]) => void;
  onUploadingChange?: (uploading: boolean) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    onUploadingChange?.(true);
    setError(null);

    const uploaded: MediaItem[] = [];
    try {
      for (const file of Array.from(files)) {
        try {
          uploaded.push(await uploadFile(file));
        } catch (err) {
          setError(err instanceof Error ? err.message : "Upload failed.");
        }
      }
      if (uploaded.length > 0) onChange([...media, ...uploaded]);
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
    }
  }

  function move(idx: number, dir: -1 | 1) {
    const j = idx + dir;
    if (j < 0 || j >= media.length) return;
    const next = [...media];
    [next[idx], next[j]] = [next[j], next[idx]];
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <label className={dropzone}>
        <UploadIcon />
        <span className="text-sm font-medium text-ink-soft">
          {uploading ? "Uploading…" : "Click to upload photos or video"}
        </span>
        <span className="mt-0.5 text-xs text-muted">
          JPG, PNG, WebP or MP4 · up to 100 MB each
        </span>
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </label>

      {error && (
        <p className="rounded-lg bg-alert-soft px-3 py-2 text-xs text-alert">
          {error}
        </p>
      )}

      {media.length > 0 && (
        <ul className="space-y-2">
          {media.map((m, i) => (
            <li
              key={`${m.url}-${i}`}
              className="flex items-center gap-3 rounded-xl border border-line bg-base p-2"
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-ink/80">
                {m.type === "video" ? (
                  <span className="flex h-full w-full items-center justify-center text-white">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                ) : (
                  <Image src={m.url} alt="" fill sizes="56px" className="object-cover" />
                )}
              </div>

              <span className="flex-1 truncate text-xs text-muted">
                {i === 0
                  ? "★ Cover"
                  : `${m.type === "video" ? "Video" : "Photo"} ${i + 1}`}
              </span>

              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up" className="rounded p-1 text-ink-soft hover:text-signal-deep disabled:opacity-30">
                ▲
              </button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === media.length - 1} aria-label="Move down" className="rounded p-1 text-ink-soft hover:text-signal-deep disabled:opacity-30">
                ▼
              </button>
              <button type="button" onClick={() => onChange(media.filter((_, j) => j !== i))} aria-label="Remove" className="rounded p-1 text-ink-soft hover:text-alert">
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Single hero image, used by the category form. */
export function SingleImageUpload({
  value,
  onChange,
  name,
}: {
  value: string;
  onChange: (url: string) => void;
  name: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const item = await uploadFile(file);
      if (item.type === "video") {
        setError("Please choose an image for the category banner.");
      } else {
        onChange(item.url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={value} />

      {value ? (
        <div className="flex items-center gap-3 rounded-xl border border-line bg-base p-2">
          <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-surface-2">
            <Image src={value} alt="" fill sizes="96px" className="object-cover" />
          </div>
          <span className="flex-1 truncate text-xs text-muted">{value}</span>
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Remove image"
            className="rounded p-1 text-ink-soft hover:text-alert"
          >
            ✕
          </button>
        </div>
      ) : (
        <label className={dropzone}>
          <UploadIcon />
          <span className="text-sm font-medium text-ink-soft">
            {uploading ? "Uploading…" : "Click to upload a banner image"}
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              handleFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </label>
      )}

      {error && (
        <p className="rounded-lg bg-alert-soft px-3 py-2 text-xs text-alert">
          {error}
        </p>
      )}
    </div>
  );
}
