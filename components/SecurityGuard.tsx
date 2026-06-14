'use client';

import { useEffect } from 'react';

export default function SecurityGuard() {
  useEffect(() => {
    // ── 1. Block keyboard shortcuts (F12, Ctrl+Shift+I/J/C, Ctrl+U, Ctrl+S) ──
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      const ctrl = e.ctrlKey || e.metaKey; // Ctrl (Win) atau Cmd (Mac)
      const shift = e.shiftKey;
      const alt = e.altKey; // Option di Mac

      const blocked =
        key === 'F12' ||
        // Windows: Ctrl+Shift+I/J/C | Mac: Cmd+Option+I/J/C
        (ctrl && (shift || alt) && ['I', 'i', 'J', 'j', 'C', 'c'].includes(key)) ||
        // Windows: Ctrl+U/S | Mac: Cmd+U/S
        (ctrl && ['U', 'u', 'S', 's'].includes(key));

      if (blocked) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // ── 2. Disable right-click context menu ──
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // ── 3. DevTools size detection → blur page ──
    const detectDevTools = () => {
      const threshold = 160;
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;
      if (widthDiff > threshold || heightDiff > threshold) {
        document.body.style.filter = 'blur(8px)';
        document.body.style.pointerEvents = 'none';
      } else {
        document.body.style.filter = '';
        document.body.style.pointerEvents = '';
      }
    };

    // ── 4. Console warning (production only) ──
    if (process.env.NODE_ENV === 'production') {
      const noop = () => {};
      try {
        const methods = ['log','warn','error','info','debug','table','dir','group','groupEnd','time','timeEnd','trace'] as const;
        methods.forEach((m) => {
          try { (console as any)[m] = noop; } catch {}
        });
      } catch {}

      const clearTimer = setInterval(() => {
        try { window.console.clear(); } catch {}
      }, 2000);

      const devTimer = setInterval(detectDevTools, 1000);
      document.addEventListener('keydown', handleKeyDown, true);
      document.addEventListener('contextmenu', handleContextMenu);

      return () => {
        clearInterval(clearTimer);
        clearInterval(devTimer);
        document.removeEventListener('keydown', handleKeyDown, true);
        document.removeEventListener('contextmenu', handleContextMenu);
        document.body.style.filter = '';
        document.body.style.pointerEvents = '';
      };
    }

    // Dev mode: hanya block keyboard + right-click
    const devTimer = setInterval(detectDevTools, 1000);
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      clearInterval(devTimer);
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.body.style.filter = '';
      document.body.style.pointerEvents = '';
    };
  }, []);

  return null;
}
