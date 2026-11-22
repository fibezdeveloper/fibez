'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { LiquidButton } from '@/components/ui/liquid-button';
import { Paperclip, X, Loader2, AlertCircle, Film, FileText, UploadCloud } from 'lucide-react';
import {
  ATTACHMENT_ACCEPT,
  ATTACHMENT_MIME_EXT,
  MAX_ATTACHMENTS_PER_MESSAGE,
  MAX_ATTACHMENT_BYTES,
  attachmentUrl,
  formatBytes,
  isPdfType,
  isVideoType,
  type TicketAttachment,
} from '@/lib/ticket-attachments';

interface PendingItem {
  id: string;
  name: string;
  type: string;
  size: number;
  status: 'uploading' | 'done' | 'error';
  error?: string;
  attachment?: TicketAttachment;
  previewUrl?: string;
}

const TYPE_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'video/mp4': '.mp4',
  'video/quicktime': '.mov',
  'video/webm': '.webm',
  'application/pdf': '.pdf',
};

// Large phone screenshots are re-encoded smaller so they fit the upload limit.
async function shrinkImage(file: File): Promise<File> {
  if (file.type === 'image/gif' || file.size <= 1_500_000) return file;
  try {
    const bitmap = await createImageBitmap(file);
    let maxSide = 3200;
    let quality = 0.9;
    for (let attempt = 0; attempt < 4; attempt++) {
      const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const ctx = canvas.getContext('2d');
      if (!ctx) return file;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
      if (blob && blob.size <= MAX_ATTACHMENT_BYTES - 100_000) {
        bitmap.close?.();
        const base = file.name.replace(/\.[^.]+$/, '') || 'screenshot';
        return new File([blob], `${base}.jpg`, { type: 'image/jpeg' });
      }
      maxSide = Math.round(maxSide * 0.75);
      quality = Math.max(0.6, quality - 0.1);
    }
    bitmap.close?.();
  } catch {
    // fall through to the original file; the size check will report it
  }
  return file;
}

function normalizeName(file: File, index: number): File {
  const ext = file.name.toLowerCase().match(/\.[^.]+$/)?.[0] || '';
  const allowed = ATTACHMENT_MIME_EXT[file.type];
  if (!allowed || allowed.includes(ext)) return file;
  const fixed = `${file.name.replace(/\.[^.]+$/, '') || `screenshot-${index + 1}`}${TYPE_TO_EXT[file.type] ?? ''}`;
  return new File([file], fixed, { type: file.type });
}

export function useAttachmentUploader() {
  const [items, setItems] = useState<PendingItem[]>([]);
  const itemsRef = useRef<PendingItem[]>([]);
  itemsRef.current = items;

  useEffect(() => {
    return () => {
      for (const it of itemsRef.current) if (it.previewUrl) URL.revokeObjectURL(it.previewUrl);
    };
  }, []);

  const patch = useCallback((id: string, next: Partial<PendingItem>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...next } : it)));
  }, []);

  const addFiles = useCallback(
    (incoming: File[]) => {
      const room = MAX_ATTACHMENTS_PER_MESSAGE - itemsRef.current.filter((i) => i.status !== 'error').length;
      incoming.forEach((raw, index) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const isMedia = raw.type.startsWith('image/') || raw.type.startsWith('video/') || isPdfType(raw.type);
        const base: PendingItem = { id, name: raw.name || 'attachment', type: raw.type, size: raw.size, status: 'uploading' };

        if (index >= room) {
          setItems((prev) => [
            ...prev,
            { ...base, status: 'error', error: `You can attach up to ${MAX_ATTACHMENTS_PER_MESSAGE} files.` },
          ]);
          return;
        }
        if (!isMedia || !ATTACHMENT_MIME_EXT[raw.type]) {
          setItems((prev) => [
            ...prev,
            { ...base, status: 'error', error: 'Only screenshots, short clips and PDF invoices.' },
          ]);
          return;
        }

        setItems((prev) => [...prev, { ...base, previewUrl: URL.createObjectURL(raw) }]);

        (async () => {
          const file = normalizeName(raw.type.startsWith('image/') ? await shrinkImage(raw) : raw, index);
          if (file.size > MAX_ATTACHMENT_BYTES) {
            patch(id, {
              status: 'error',
              size: file.size,
              error: isVideoType(file.type)
                ? `Clip is ${formatBytes(file.size)}. Maximum is 4 MB, so trim it or record a shorter one.`
                : `File is ${formatBytes(file.size)}. Maximum is 4 MB.`,
            });
            return;
          }
          try {
            const form = new FormData();
            form.append('file', file);
            const res = await fetch('/api/tickets/attachments', { method: 'POST', body: form });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data.attachment) {
              patch(id, { status: 'error', error: data.error || 'Upload failed. Try again.' });
              return;
            }
            patch(id, { status: 'done', size: file.size, name: file.name, attachment: data.attachment });
          } catch {
            patch(id, { status: 'error', error: 'Upload failed. Check your connection and try again.' });
          }
        })();
      });
    },
    [patch]
  );

  const remove = useCallback((id: string) => {
    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  const reset = useCallback(() => {
    setItems((prev) => {
      for (const it of prev) if (it.previewUrl) URL.revokeObjectURL(it.previewUrl);
      return [];
    });
  }, []);

  return {
    items,
    addFiles,
    remove,
    reset,
    uploading: items.some((i) => i.status === 'uploading'),
    attachments: items.flatMap((i) => (i.status === 'done' && i.attachment ? [i.attachment] : [])),
  };
}

export type AttachmentUploader = ReturnType<typeof useAttachmentUploader>;

/** Pull image files out of a paste event so people can paste a screenshot straight into the box. */
export function filesFromPaste(e: React.ClipboardEvent): File[] {
  return Array.from(e.clipboardData?.files ?? []).filter((f) => f.type.startsWith('image/'));
}

export function AttachmentDropArea({
  uploader,
  disabled,
  children,
}: {
  uploader: AttachmentUploader;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const [dragging, setDragging] = useState(false);
  const depth = useRef(0);

  const hasFiles = (e: React.DragEvent) => Array.from(e.dataTransfer?.types ?? []).includes('Files');

  return (
    <div
      className="relative"
      onDragEnter={(e) => {
        if (disabled || !hasFiles(e)) return;
        e.preventDefault();
        depth.current += 1;
        setDragging(true);
      }}
      onDragOver={(e) => {
        if (disabled || !hasFiles(e)) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
      }}
      onDragLeave={(e) => {
        if (disabled || !hasFiles(e)) return;
        depth.current = Math.max(0, depth.current - 1);
        if (depth.current === 0) setDragging(false);
      }}
      onDrop={(e) => {
        if (disabled || !hasFiles(e)) return;
        e.preventDefault();
        depth.current = 0;
        setDragging(false);
        uploader.addFiles(Array.from(e.dataTransfer.files));
      }}
    >
      {children}
      {dragging && (
        <div className="absolute inset-0 z-10 rounded-xl border-2 border-dashed border-white/60 bg-black/80 flex flex-col items-center justify-center gap-1.5 pointer-events-none">
          <UploadCloud className="w-6 h-6 text-white" />
          <span className="text-xs font-mono text-white">Drop screenshots or clips to attach</span>
        </div>
      )}
    </div>
  );
}

export function AttachButton({ uploader, disabled }: { uploader: AttachmentUploader; disabled?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const full = uploader.items.filter((i) => i.status !== 'error').length >= MAX_ATTACHMENTS_PER_MESSAGE;

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ATTACHMENT_ACCEPT}
        className="hidden"
        onChange={(e) => {
          uploader.addFiles(Array.from(e.target.files ?? []));
          e.target.value = '';
        }}
      />
      <LiquidButton
        size="sm"
        variant="dark"
        disabled={disabled || full}
        onClick={() => inputRef.current?.click()}
        title="Attach screenshots, short clips or a PDF invoice (max 4 MB each)"
      >
        <Paperclip className="w-3.5 h-3.5" />
        <span>Attach</span>
      </LiquidButton>
    </>
  );
}

export function AttachmentTray({ uploader }: { uploader: AttachmentUploader }) {
  if (uploader.items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {uploader.items.map((it) => (
        <div
          key={it.id}
          className={`relative w-24 rounded-xl border overflow-hidden bg-[#141417] ${
            it.status === 'error' ? 'border-red-500/50' : 'border-white/10'
          }`}
          title={it.error || it.name}
        >
          <div className="h-16 flex items-center justify-center bg-black">
            {it.previewUrl && !isVideoType(it.type) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={it.previewUrl} alt={it.name} className="w-full h-full object-cover" />
            ) : isPdfType(it.type) ? (
              <FileText className="w-6 h-6 text-zinc-400" />
            ) : (
              <Film className="w-6 h-6 text-zinc-400" />
            )}
            {it.status === 'uploading' && (
              <div className="absolute inset-x-0 top-0 h-16 bg-black/60 flex items-center justify-center">
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              </div>
            )}
            {it.status === 'error' && (
              <div className="absolute inset-x-0 top-0 h-16 bg-black/70 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
            )}
          </div>
          <div className="px-1.5 py-1 text-[10px] font-mono text-zinc-300 truncate">{it.name}</div>
          <button
            type="button"
            onClick={() => uploader.remove(it.id)}
            className="absolute top-1 right-1 p-0.5 rounded-full bg-black/80 text-white hover:bg-white hover:text-black transition-colors cursor-pointer"
            aria-label={`Remove ${it.name}`}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
      {uploader.items
        .filter((i) => i.status === 'error' && i.error)
        .map((i) => (
          <p key={`err-${i.id}`} className="basis-full text-[11px] font-mono text-red-400">
            {i.name}: {i.error}
          </p>
        ))}
    </div>
  );
}

export function AttachmentGallery({ attachments }: { attachments?: TicketAttachment[] | null }) {
  const [lightbox, setLightbox] = useState<TicketAttachment | null>(null);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox]);

  if (!attachments || attachments.length === 0) return null;

  return (
    <>
      <div className="flex flex-wrap gap-2 pt-1">
        {attachments.map((a) =>
          isPdfType(a.type) ? (
            <a
              key={a.key}
              href={attachmentUrl(a.key)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#141417] hover:border-white/40 transition-colors max-w-full"
              title={a.name}
            >
              <span className="w-9 h-9 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-rose-400" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-semibold text-white truncate">{a.name}</span>
                <span className="block text-[11px] text-zinc-500">
                  PDF{a.size ? ` · ${formatBytes(a.size)}` : ''} · Open
                </span>
              </span>
            </a>
          ) : isVideoType(a.type) ? (
            <video
              key={a.key}
              controls
              preload="metadata"
              playsInline
              src={attachmentUrl(a.key)}
              className="max-h-56 max-w-full rounded-xl border border-white/10 bg-black"
            />
          ) : (
            <button
              key={a.key}
              type="button"
              onClick={() => setLightbox(a)}
              className="rounded-xl border border-white/10 overflow-hidden bg-black cursor-zoom-in hover:border-white/40 transition-colors"
              title={a.name}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={attachmentUrl(a.key)} alt={a.name} loading="lazy" className="max-h-56 max-w-full object-contain" />
            </button>
          )
        )}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-label={lightbox.name}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={attachmentUrl(lightbox.key)} alt={lightbox.name} className="max-h-full max-w-full object-contain rounded-lg" />
          <button
            type="button"
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            onClick={() => setLightbox(null)}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </>
  );
}
