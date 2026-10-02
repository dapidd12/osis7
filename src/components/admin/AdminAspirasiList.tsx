import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { 
  Check, X, Trash2, ChevronLeft, ChevronRight, Loader2, 
  Database, Eye, Maximize2, MessageCircleReply, ChevronDown, 
  ChevronUp, Send, User, Sparkles, Filter, RefreshCw, Tag 
} from 'lucide-react';
import { Aspiration } from '../../types';
import { cn } from '../../lib/utils';

interface AdminAspirasiListProps {
  aspirationFilter: 'Pending' | 'Approved' | 'Rejected';
  setAspirationFilter: (filter: 'Pending' | 'Approved' | 'Rejected') => void;
  pageAspirations: Aspiration[];
  isLoadingDb: boolean;
  totalCount: number;
  totalAllAspirations: number;
  pendingCount: number;
  rejectedCount: number;
  aspirationPage: number;
  totalPages: number;
  handlePrevPage: () => void;
  handleNextPage: () => void;
  onUpdateStatus: (id: string, status: Aspiration['status']) => Promise<void>;
  onAddResponse: (id: string, response: string) => Promise<void>;
  onDeleteAspiration: (id: string) => Promise<void>;
  onOpenModal: (aspiration: Aspiration) => void;
  onReload: () => void;
}

export default function AdminAspirasiList({
  aspirationFilter,
  setAspirationFilter,
  pageAspirations,
  isLoadingDb,
  totalCount,
  totalAllAspirations,
  pendingCount,
  rejectedCount,
  aspirationPage,
  totalPages,
  handlePrevPage,
  handleNextPage,
  onUpdateStatus,
  onAddResponse,
  onDeleteAspiration,
  onOpenModal,
  onReload
}: AdminAspirasiListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [expandedMessageIds, setExpandedMessageIds] = useState<Record<string, boolean>>({});

  const toggleMessageExpand = (id: string) => {
    setExpandedMessageIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleResponseSubmit = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!responseText.trim()) return;
    await onAddResponse(id, responseText.trim());
    setResponseText('');
    setExpandedId(null);
    onReload();
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-300">
      {/* Top Header & Sub-tabs */}
      <div className="p-6 sm:px-8 border-b border-slate-200 bg-slate-50/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">Daftar Aspirasi Masuk</h2>
              <span className="flex items-center gap-1 text-[11px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full">
                <Database className="w-3 h-3 text-sky-500" />
                Paginasi per 5 Database
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Kategori saat ini: <strong className="text-slate-800">{totalCount}</strong> pesan &bull; Total database: <strong className="text-slate-800">{totalAllAspirations}</strong> pesan.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={onReload}
              className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all shadow-2xs cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title="Segarkan data tabel"
            >
              <RefreshCw className={cn("w-3.5 h-3.5 text-sky-600", isLoadingDb && "animate-spin")} />
              <span className="hidden sm:inline">Segarkan</span>
            </button>

            {totalPages > 1 && (
              <div className="inline-flex items-center gap-1 bg-white border border-slate-200 p-1.5 rounded-xl text-xs font-semibold text-slate-600 shadow-2xs">
                <span className="px-1.5">Hal {aspirationPage}/{totalPages}</span>
                <button
                  type="button"
                  onClick={handlePrevPage}
                  disabled={aspirationPage === 1 || isLoadingDb}
                  className="p-1 rounded-lg bg-slate-50 hover:bg-slate-100 disabled:opacity-40 transition-all cursor-pointer"
                  title="Halaman Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-700" />
                </button>
                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={aspirationPage === totalPages || isLoadingDb}
                  className="p-1 rounded-lg bg-slate-50 hover:bg-slate-100 disabled:opacity-40 transition-all cursor-pointer"
                  title="Halaman Selanjutnya"
                >
                  <ChevronRight className="w-4 h-4 text-slate-700" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sub-tabs for Aspirasi */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setAspirationFilter('Pending')}
            className={cn(
              "px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5",
              aspirationFilter === 'Pending' 
                ? "bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs" 
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            )}
          >
            <span>Perlu Ditinjau (Pending)</span>
            <span className="px-2 py-0.2 rounded-full text-xs font-extrabold bg-amber-200/80 text-amber-950">
              {pendingCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setAspirationFilter('Rejected')}
            className={cn(
              "px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5",
              aspirationFilter === 'Rejected' 
                ? "bg-rose-100 text-rose-900 border border-rose-300 shadow-2xs" 
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            )}
          >
            <span>Ditolak / Arsip</span>
            <span className="px-2 py-0.2 rounded-full text-xs font-extrabold bg-rose-200/80 text-rose-950">
              {rejectedCount}
            </span>
          </button>
        </div>
      </div>

      {/* Cards List */}
      <div className="divide-y divide-slate-100">
        {isLoadingDb ? (
          <div className="p-16 text-center text-slate-500 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-sky-600 mx-auto" />
            <p className="text-sm font-semibold">Memuat 5 pesan dari database...</p>
          </div>
        ) : pageAspirations.length === 0 ? (
          <div className="p-16 text-center text-slate-500 space-y-2">
            <p className="font-bold text-slate-700">Tidak ada aspirasi dalam kategori ini.</p>
            <p className="text-xs text-slate-400">Seluruh pesan telah diproses atau belum ada data masuk.</p>
          </div>
        ) : (
          pageAspirations.map((aspiration) => {
            const isTextLong = aspiration.message.length > 180;
            const isExpanded = expandedMessageIds[aspiration.id];

            return (
              <div 
                key={aspiration.id} 
                className="p-6 sm:p-8 hover:bg-slate-50/50 transition-colors flex flex-col space-y-4"
              >
                {/* Meta row */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                      aspiration.status === 'Pending' ? "bg-amber-100 text-amber-800" :
                      aspiration.status === 'Approved' ? "bg-emerald-100 text-emerald-800" :
                      "bg-rose-100 text-rose-800"
                    )}>
                      {aspiration.status}
                    </span>
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                      {aspiration.category}
                    </span>
                    {aspiration.activityTopic && aspiration.activityTopic !== 'Umum' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                        <Tag className="w-2.5 h-2.5 text-amber-700" />
                        <span>{aspiration.activityTopic}</span>
                      </span>
                    )}
                    <span className="text-xs text-slate-400">
                      {formatDistanceToNow(new Date(aspiration.createdAt), { addSuffix: true, locale: localeId })}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenModal(aspiration)}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Buka Pop-up Dialog</span>
                  </button>
                </div>

                {/* Subject & Message */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug">
                    {aspiration.subject}
                  </h3>
                  <div className="text-slate-600 text-sm whitespace-pre-wrap break-words leading-relaxed bg-slate-50/60 p-4 rounded-2xl border border-slate-100">
                    <p className={!isExpanded && isTextLong ? "line-clamp-2" : ""}>
                      {aspiration.message}
                    </p>
                    {isTextLong && (
                      <button
                        type="button"
                        onClick={() => toggleMessageExpand(aspiration.id)}
                        className="mt-2 text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
                      >
                        {isExpanded ? (
                          <>
                            <span>Tutup Ringkas</span>
                            <ChevronUp className="w-3.5 h-3.5" />
                          </>
                        ) : (
                          <>
                            <span>Baca Selengkapnya</span>
                            <ChevronDown className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Sender identity */}
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Pengirim: </span>
                  <span className="font-bold text-slate-700">
                    {aspiration.isAnonymous ? "Anonim (Identitas Dirahasiakan)" : (aspiration.authorName || "Siswa")}
                  </span>
                </div>

                {/* Existing Response Preview if any */}
                {aspiration.response && (
                  <div className="p-4 bg-sky-50/60 border border-sky-100 rounded-2xl text-xs sm:text-sm text-sky-950">
                    <span className="font-bold text-sky-900 block mb-1">Tanggapan Resmi OSIS:</span>
                    <p className="whitespace-pre-wrap">{aspiration.response}</p>
                  </div>
                )}

                {/* Inline Reply Form */}
                {expandedId === aspiration.id && (
                  <form onSubmit={(e) => handleResponseSubmit(e, aspiration.id)} className="space-y-3 pt-2">
                    <textarea
                      rows={3}
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder="Tuliskan tanggapan resmi dari pihak OSIS..."
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs sm:text-sm"
                      required
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setExpandedId(null)}
                        className="px-3 py-1.5 text-xs text-slate-600 font-bold hover:bg-slate-100 rounded-lg cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 text-xs bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        Kirim Balasan
                      </button>
                    </div>
                  </form>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        if (window.confirm('Yakin ingin menghapus permanen aspirasi ini?')) {
                          await onDeleteAspiration(aspiration.id);
                          onReload();
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                      title="Hapus Aspirasi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {aspiration.status === 'Pending' && (
                      <>
                        <button
                          type="button"
                          onClick={async () => {
                            await onUpdateStatus(aspiration.id, 'Rejected');
                            onReload();
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-colors border border-rose-200 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Tolak</span>
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            await onUpdateStatus(aspiration.id, 'Approved');
                            onReload();
                          }}
                          className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Setujui</span>
                        </button>
                      </>
                    )}

                    {aspiration.status === 'Rejected' && (
                      <button
                        type="button"
                        onClick={async () => {
                          await onUpdateStatus(aspiration.id, 'Pending');
                          onReload();
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-xl transition-colors border border-amber-200 cursor-pointer"
                      >
                        <span>Pulihkan ke Pending</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setExpandedId(expandedId === aspiration.id ? null : aspiration.id);
                        setResponseText(aspiration.response || '');
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      <MessageCircleReply className="w-3.5 h-3.5" />
                      <span>{aspiration.response ? 'Edit Balasan' : 'Beri Balasan'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="p-4 sm:p-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/60">
          <div className="flex items-center gap-2 text-xs text-slate-500 order-2 sm:order-1">
            <span>
              Menampilkan {pageAspirations.length} dari <strong className="text-slate-800">{totalCount}</strong> aspirasi ({aspirationFilter})
            </span>
          </div>

          <div className="flex items-center gap-2 order-1 sm:order-2">
            <button
              type="button"
              onClick={handlePrevPage}
              disabled={aspirationPage === 1 || isLoadingDb}
              className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold bg-white border border-slate-200 text-slate-700 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-all shadow-2xs cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>

            <span className="px-3.5 py-2 bg-sky-50 border border-sky-200 text-sky-800 rounded-xl text-xs font-bold shadow-2xs">
              Hal {aspirationPage} / {totalPages}
            </span>

            <button
              type="button"
              onClick={handleNextPage}
              disabled={aspirationPage === totalPages || isLoadingDb}
              className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold bg-white border border-slate-200 text-slate-700 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-all shadow-2xs cursor-pointer"
            >
              <span>Selanjutnya</span>
              {isLoadingDb ? (
                <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
