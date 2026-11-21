import React from 'react';

const URL_RE = /https?:\/\/[^\s<>"']+/gi;
const TRAILING_PUNCT = /[.,;:!?)\]}]+$/;

// Turns http(s) links in plain text into clickable links. Only http and https are matched, so
// javascript: and data: URLs never become links. Everything else stays plain text (React escapes it).
export default function LinkifiedText({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  let last = 0;
  let n = 0;

  for (const match of text.matchAll(URL_RE)) {
    const start = match.index ?? 0;
    let url = match[0];
    const trailing = url.match(TRAILING_PUNCT)?.[0] ?? '';
    if (trailing) url = url.slice(0, -trailing.length);
    if (!url) continue;

    if (start > last) parts.push(text.slice(last, start));
    parts.push(
      <a
        key={`l${n++}`}
        href={url}
        target="_blank"
        rel="noopener noreferrer nofollow ugc"
        className="text-sky-400 underline underline-offset-2 hover:text-sky-300 break-all"
      >
        {url}
      </a>
    );
    last = start + url.length;
  }
  if (last < text.length) parts.push(text.slice(last));

  return <>{parts}</>;
}
