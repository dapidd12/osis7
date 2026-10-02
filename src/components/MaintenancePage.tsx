import React from 'react';
import { Wrench, Shield, Clock, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { SystemSettings } from '../types';

interface MaintenancePageProps {
  settings: SystemSettings;
}

export default function MaintenancePage({ settings }: MaintenancePageProps) {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between p-4 sm:p-8 font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Brand Bar */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between py-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 p-1.5 flex items-center justify-center overflow-hidden">
            <img 
              src="https://raw.githubusercontent.com/dapidd12/storage/main/tes/1788314699811-20260902_090434.png" 
              alt="Logo OSIS SMAN 1 Kemangkon" 
              className="w-full h-full object-contain" 
            />
          </div>
          <div>
            <h1 className="font-bold text-base sm:text-lg text-white leading-none">Kotak Curhat OSIS</h1>
            <p className="text-xs text-sky-400 font-semibold tracking-wide uppercase mt-1">SMAN 1 Kemangkon</p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-slate-400 bg-slate-800/60 border border-slate-700/60">
          <Shield className="w-3.5 h-3.5 text-amber-400" />
          <span>Layanan Siswa</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl w-full mx-auto my-auto py-12 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          {/* Animated Mascot / Icon */}
          <div className="relative w-28 h-28 mx-auto">
            <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl animate-pulse" />
            <motion.div
              animate={{ rotate: [0, -6, 6, -6, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="relative w-full h-full bg-slate-800/90 border border-slate-700 rounded-3xl p-4 flex items-center justify-center shadow-xl shadow-slate-950/50"
            >
              <img 
                src="https://raw.githubusercontent.com/dapidd12/storage/main/tes/1788314699811-20260902_090434.png" 
                alt="Logo OSIS" 
                className="w-full h-full object-contain drop-shadow" 
              />
            </motion.div>
            <div className="absolute -bottom-2 -right-2 bg-amber-500 text-slate-950 p-2 rounded-xl shadow-md border-2 border-slate-900">
              <Wrench className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
          </div>

          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Mode Pemeliharaan Aktif</span>
          </div>

          {/* Title & Announcement Message */}
          <div className="space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Website Sedang Dalam Pemeliharaan
            </h2>
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 sm:p-7 text-left space-y-3 text-slate-300 shadow-lg">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Pemberitahuan Resmi Pengurus OSIS:</span>
              </div>
              <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap text-slate-200">
                {settings.maintenanceMessage}
              </p>
            </div>
          </div>

          {/* Explanation note */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-medium pt-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <span>Akses publik ditutup sementara. Website akan dibuka kembali setelah pemeliharaan selesai.</span>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl w-full mx-auto py-4 text-center text-xs text-slate-500 border-t border-slate-800">
        &copy; {new Date().getFullYear()} OSIS SMAN 1 Kemangkon &bull; Purbalingga, Jawa Tengah
      </footer>
    </div>
  );
}
