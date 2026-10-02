import React from 'react';
import { Inbox, Clock, CheckCircle2, XCircle, ArrowUpRight, TrendingUp } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AdminStatsCardsProps {
  stats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  activeTab: string;
  aspirationFilter: 'Pending' | 'Approved' | 'Rejected';
  onSelectPending: () => void;
  onSelectApproved: () => void;
  onSelectRejected: () => void;
  onSelectTotal: () => void;
}

export default function AdminStatsCards({
  stats,
  activeTab,
  aspirationFilter,
  onSelectPending,
  onSelectApproved,
  onSelectRejected,
  onSelectTotal
}: AdminStatsCardsProps) {
  const approvalRate = stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0;
  const pendingRate = stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0;
  const rejectionRate = stats.total > 0 ? Math.round((stats.rejected / stats.total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {/* Total Masuk */}
      <button
        type="button"
        onClick={onSelectTotal}
        className={cn(
          "text-left p-6 rounded-3xl border transition-all cursor-pointer relative overflow-hidden group shadow-xs",
          activeTab === 'aspirasi' && aspirationFilter === 'Pending'
            ? "bg-white border-slate-300 ring-2 ring-slate-900/10 shadow-md"
            : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md"
        )}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Inbox className="w-5 h-5 text-slate-700" />
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            Database Siswa
          </span>
        </div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Aspirasi Masuk</p>
        <div className="flex items-baseline gap-2 mt-1">
          <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{stats.total}</p>
          <span className="text-xs font-semibold text-slate-400">pesan</span>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Semua pengirim</span>
          <span className="font-semibold text-slate-700 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
            Buka &rarr;
          </span>
        </div>
      </button>

      {/* Perlu Ditinjau (Pending) */}
      <button
        type="button"
        onClick={onSelectPending}
        className={cn(
          "text-left p-6 rounded-3xl border transition-all cursor-pointer relative overflow-hidden group shadow-xs",
          activeTab === 'aspirasi' && aspirationFilter === 'Pending'
            ? "bg-amber-50/90 border-amber-300 ring-2 ring-amber-400/50 shadow-md"
            : "bg-white border-slate-200 hover:border-amber-300 hover:bg-amber-50/40 hover:shadow-md"
        )}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Clock className="w-5 h-5 text-amber-700" />
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
            {pendingRate}% dari total
          </span>
        </div>
        <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Perlu Ditinjau</p>
        <div className="flex items-baseline gap-2 mt-1">
          <p className="text-3xl sm:text-4xl font-black text-amber-700 tracking-tight">{stats.pending}</p>
          <span className="text-xs font-semibold text-amber-600">menunggu</span>
        </div>
        <div className="mt-3 pt-3 border-t border-amber-200/60 flex items-center justify-between text-xs text-amber-800">
          <span className="font-medium">Antrean persetujuan</span>
          <span className="font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
            Tinjau &rarr;
          </span>
        </div>
      </button>

      {/* Disetujui (Approved) */}
      <button
        type="button"
        onClick={onSelectApproved}
        className={cn(
          "text-left p-6 rounded-3xl border transition-all cursor-pointer relative overflow-hidden group shadow-xs",
          activeTab === 'disetujui'
            ? "bg-emerald-50/90 border-emerald-300 ring-2 ring-emerald-400/50 shadow-md"
            : "bg-white border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 hover:shadow-md"
        )}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-105 transition-transform">
            <CheckCircle2 className="w-5 h-5 text-emerald-700" />
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
            {approvalRate}% disetujui
          </span>
        </div>
        <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Disetujui & Publik</p>
        <div className="flex items-baseline gap-2 mt-1">
          <p className="text-3xl sm:text-4xl font-black text-emerald-700 tracking-tight">{stats.approved}</p>
          <span className="text-xs font-semibold text-emerald-600">tampil</span>
        </div>
        <div className="mt-3 pt-3 border-t border-emerald-200/60 flex items-center justify-between text-xs text-emerald-800">
          <span className="font-medium">Tampil di Papan Siswa</span>
          <span className="font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
            Riwayat &rarr;
          </span>
        </div>
      </button>

      {/* Ditolak (Rejected) */}
      <button
        type="button"
        onClick={onSelectRejected}
        className={cn(
          "text-left p-6 rounded-3xl border transition-all cursor-pointer relative overflow-hidden group shadow-xs",
          activeTab === 'aspirasi' && aspirationFilter === 'Rejected'
            ? "bg-rose-50/90 border-rose-300 ring-2 ring-rose-400/50 shadow-md"
            : "bg-white border-slate-200 hover:border-rose-300 hover:bg-rose-50/40 hover:shadow-md"
        )}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center group-hover:scale-105 transition-transform">
            <XCircle className="w-5 h-5 text-rose-700" />
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-900 border border-rose-200">
            {rejectionRate}% ditolak
          </span>
        </div>
        <p className="text-xs font-bold text-rose-800 uppercase tracking-wider">Ditolak / Arsip</p>
        <div className="flex items-baseline gap-2 mt-1">
          <p className="text-3xl sm:text-4xl font-black text-rose-700 tracking-tight">{stats.rejected}</p>
          <span className="text-xs font-semibold text-rose-600">pesan</span>
        </div>
        <div className="mt-3 pt-3 border-t border-rose-200/60 flex items-center justify-between text-xs text-rose-800">
          <span className="font-medium">Tidak dipublikasikan</span>
          <span className="font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
            Lihat &rarr;
          </span>
        </div>
      </button>
    </div>
  );
}
