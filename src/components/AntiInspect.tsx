import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Lock } from 'lucide-react';

export default function AntiInspect() {
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const showNotice = useCallback((msg: string) => {
    setWarningMessage(msg);
  }, []);

  useEffect(() => {
    if (!warningMessage) return;
    const timer = setTimeout(() => {
      setWarningMessage(null);
    }, 2800);
    return () => clearTimeout(timer);
  }, [warningMessage]);

  useEffect(() => {
    // 1. Console security banner
    const printSecurityBanner = () => {
      try {
        console.clear();
        console.log(
          '%c⚠️ PERINGATAN SISTEM KEAMANAN OSIS',
          'color: #dc2626; font-size: 22px; font-weight: 900; background: #fef2f2; padding: 8px 16px; border-radius: 8px; border: 2px solid #ef4444; font-family: sans-serif;'
        );
        console.log(
          '%cFitur Inspect Element dan Developer Tools dinonaktifkan untuk menjaga keamanan, privasi pengirim, dan integritas data aspirasi / evaluasi siswa SMAN 1 Kemangkon.',
          'font-size: 13px; color: #475569; font-weight: 600; line-height: 1.6; font-family: sans-serif;'
        );
      } catch {
        // Silently ignore if console is overridden
      }
    };

    printSecurityBanner();

    // 2. Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      showNotice('Klik kanan dinonaktifkan demi keamanan dan privasi data.');
      return false;
    };

    // 3. Disable inspect element & devtools shortcut keys
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;
      const keyUpper = e.key.toUpperCase();

      // F12
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        e.stopPropagation();
        showNotice('Tombol F12 (Developer Tools) dinonaktifkan.');
        return false;
      }

      // Ctrl + Shift + I / J / C / K / E (Inspect, Console, Inspector)
      if (
        isCtrlOrCmd &&
        isShift &&
        ['I', 'J', 'C', 'K', 'E'].includes(keyUpper)
      ) {
        e.preventDefault();
        e.stopPropagation();
        showNotice('Pintasan Inspect Element dinonaktifkan.');
        return false;
      }

      // Ctrl + U (View Source)
      if (isCtrlOrCmd && !isShift && keyUpper === 'U') {
        e.preventDefault();
        e.stopPropagation();
        showNotice('Melihat sumber halaman (View Source) dinonaktifkan.');
        return false;
      }

      // Ctrl + S (Save Page)
      if (isCtrlOrCmd && !isShift && keyUpper === 'S') {
        e.preventDefault();
        e.stopPropagation();
        showNotice('Penyimpanan halaman langsung dinonaktifkan.');
        return false;
      }

      // Mac Command + Option + I / J / C
      if (e.metaKey && e.altKey && ['I', 'J', 'C'].includes(keyUpper)) {
        e.preventDefault();
        e.stopPropagation();
        showNotice('Pintasan Developer Tools dinonaktifkan.');
        return false;
      }
    };

    // 4. Disable image/asset drag
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu, { capture: true });
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    document.addEventListener('dragstart', handleDragStart, { capture: true });

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu, { capture: true });
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      document.removeEventListener('dragstart', handleDragStart, { capture: true });
    };
  }, [showNotice]);

  return (
    <aside aria-label="Notifikasi Keamanan" className="pointer-events-none fixed top-5 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-md px-4">
      <AnimatePresence>
        {warningMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="pointer-events-auto mx-auto flex items-center gap-3 bg-slate-900/95 text-white px-4 py-3 rounded-2xl shadow-2xl border border-rose-500/40 backdrop-blur-md"
          >
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30">
              <ShieldAlert className="h-4 w-4 text-rose-400 motion-reduce:opacity-60" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-400">Proteksi Anti-Inspect</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500" />
              </div>
              <p className="text-xs font-semibold text-slate-200 mt-0.5 leading-snug">
                {warningMessage}
              </p>
            </div>
            <div className="p-1 text-slate-400">
              <Lock className="w-3.5 h-3.5" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}
