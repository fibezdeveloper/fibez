// Cipher Scramble Engine & Clipboard Utilities

const CIPHER_POOL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*24579";
const activeLoops = new WeakMap<HTMLElement, number>();

export function runCipherDecode(el: HTMLElement | null, finalStr: string, duration = 420) {
  if (!el || !finalStr) return;
  if (activeLoops.has(el)) {
    cancelAnimationFrame(activeLoops.get(el)!);
  }

  const start = performance.now();

  function frame(now: number) {
    if (!el) return;
    const progress = Math.min((now - start) / duration, 1);
    const lockedChars = Math.floor(progress * finalStr.length);

    let result = "";
    for (let i = 0; i < finalStr.length; i++) {
      const ch = finalStr[i];
      if (ch === " ") {
        result += " ";
      } else if (i < lockedChars || progress === 1) {
        result += ch;
      } else {
        result += CIPHER_POOL[Math.floor(Math.random() * CIPHER_POOL.length)];
      }
    }
    el.textContent = result;

    if (progress < 1) {
      activeLoops.set(el, requestAnimationFrame(frame));
    } else {
      el.textContent = finalStr;
      activeLoops.delete(el);
    }
  }

  activeLoops.set(el, requestAnimationFrame(frame));
}

// Global Custom Event for Toast Dispatches
export function copyToClipboardWithToast(label: string, payload: string) {
  if (typeof window === 'undefined') return;

  // Use navigator.clipboard if available, with textarea fallback
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(payload).catch(() => {
      fallbackCopy(payload);
    });
  } else {
    fallbackCopy(payload);
  }

  window.dispatchEvent(
    new CustomEvent('fibez:toast', {
      detail: { label, payload }
    })
  );
}

function fallbackCopy(text: string) {
  const tempInput = document.createElement('textarea');
  tempInput.value = text;
  tempInput.style.position = 'fixed';
  tempInput.style.left = '-9999px';
  document.body.appendChild(tempInput);
  tempInput.select();
  try {
    document.execCommand('copy');
  } catch {
    // Ignore error
  }
  document.body.removeChild(tempInput);
}
