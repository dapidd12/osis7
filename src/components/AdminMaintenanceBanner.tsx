import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, ArrowRight, Settings } from 'lucide-react';

export default function AdminMaintenanceBanner() {
  return (
    <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs sm:text-sm font-bold flex flex-wrap items-center justify-between gap-2 shadow-sm sticky top-0 z-60">
      <div className="flex items-center gap-2">
        <span className="p-1 bg-amber-600/30 rounded-md">
          <Wrench className="w-3.5 h-3.5" />
        </span>
        <span>
          <strong>Mode Pemeliharaan Aktif:</strong> Siswa umum saat ini melihat halaman maintenance. Anda dapat mengakses karena telah login sebagai Pengurus.
        </span>
      </div>

      <Link
        to="/pengurus/dashboard?tab=pengaturan"
        className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-950 text-white rounded-lg hover:bg-slate-800 transition-colors text-xs font-semibold shrink-0"
      >
        <Settings className="w-3 h-3" />
        <span>Kelola di Pengaturan</span>
        <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}
