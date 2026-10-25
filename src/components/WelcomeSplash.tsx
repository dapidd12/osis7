import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Megaphone } from 'lucide-react';

export default function WelcomeSplash() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if user already dismissed the welcome notice
    const hasSeen = localStorage.getItem('osis_curhat_welcomed_v3');
    if (!hasSeen) {
      setShow(true);
    }
  }, []);

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('osis_curhat_welcomed_v3', 'true');
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={false}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          className="overflow-hidden border-b border-amber-900/10 bg-amber-50"
        >
          <div className="mx-auto max-w-7xl px-4 py-2.5 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-3 text-xs sm:text-sm">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-200 text-amber-900">
                  <Megaphone className="h-3.5 w-3.5" />
                </span>
                <p className="m-0 truncate font-medium text-warm-ink">
                  <strong className="font-bold">Halo warga SMAN 1 Kemangkon.</strong>{' '}
                  <span className="hidden text-warm-muted sm:inline">
                    Kotak Curhat OSIS punya alur baru: tulis, kirim, dan jawabannya terbit di papan.
                  </span>
                </p>
              </div>

              <button
                type="button"
                onClick={handleDismiss}
                className="shrink-0 cursor-pointer rounded-lg border border-amber-900/15 bg-white px-2.5 py-1 text-[11px] font-bold text-warm-ink transition-colors duration-150 hover:bg-amber-100"
              >
                Tutup
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
