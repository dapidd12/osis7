import React from 'react';
import { Wrench, Shield, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { SystemSettings } from '../types';

interface MaintenancePageProps {
  settings: SystemSettings;
}

export default function MaintenancePage({ settings }: MaintenancePageProps) {
  return (
    <div className="min-h-screen bg-warm-bg text-warm-ink flex flex-col justify-between p-4 sm:p-8 font-sans selection:bg-rose-500 selection:text-white relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-amber-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-rose-200/30 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand Bar */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between py-4 border-b border-amber-900/10 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white p-1.5 flex items-center justify-center shadow-warm-sm border border-amber-200/70">
            <img 
              src="https://raw.githubusercontent.com/dapidd12/storage/main/tes/1788314699811-20260902_090434.png" 
              alt="Logo OSIS SMAN 1 Kemangkon" 
              className="w-full h-full object-contain" 
            />
          </div>
          <div>
            <h1 className="font-display font-black text-base sm:text-lg text-warm-ink leading-none">Kotak Curhat OSIS</h1>
            <p className="text-[11px] text-warm-muted font-bold uppercase tracking-wider mt-1">SMAN 1 Kemangkon</p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-display font-bold text-warm-ink glass-pill shadow-warm-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Layanan Siswa</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl w-full mx-auto my-auto py-12 text-center space-y-6 relative z-10">
        <div className="glass-card p-8 sm:p-12 rounded-[2.5rem] shadow-warm-lg border border-white/90 space-y-6">
          <div className="w-18 h-18 bg-amber-50 text-amber-700 rounded-3xl flex items-center justify-center mx-auto shadow-warm-sm border border-amber-200/70 p-3">
            <Wrench className="w-9 h-9 text-amber-600" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200/80">
              Pemeliharaan Berkala
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-black text-warm-ink">
              Website Sedang Dalam Pemeliharaan
            </h2>
            <p className="text-xs sm:text-sm text-warm-muted leading-relaxed max-w-md mx-auto">
              Pengurus OSIS sedang melakukan pembaruan berkala dan rekapitulasi data demi kenyamanan dan kelancaran bersama.
            </p>
          </div>

          <div className="bg-white/80 border border-amber-200/60 rounded-2xl p-5 text-left space-y-2.5 font-sans">
            <div className="flex items-center gap-2 text-xs font-display font-bold text-warm-ink">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Pemberitahuan Resmi Pengurus OSIS:</span>
            </div>
            <p className="text-xs sm:text-sm text-warm-ink leading-relaxed whitespace-pre-wrap">
              {settings.maintenanceMessage || 'Sistem sedang ditingkatkan. Mohon kembali dalam beberapa saat lagi.'}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-warm-muted font-medium pt-1">
            <Clock className="w-4 h-4 text-warm-light" />
            <span>Akses publik dibuka kembali segera setelah pemeliharaan selesai.</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl w-full mx-auto py-4 text-center text-xs text-warm-muted border-t border-amber-900/10 relative z-10">
        &copy; {new Date().getFullYear()} OSIS SMAN 1 Kemangkon &bull; Purbalingga, Jawa Tengah
      </footer>
    </div>
  );
}
