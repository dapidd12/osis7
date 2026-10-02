import React, { useState, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { 
  CheckCircle2, Trash2, ChevronLeft, ChevronRight, Loader2, 
  Database, Eye, Maximize2, MessageCircleReply, ChevronDown, 
  ChevronUp, RotateCcw, User, Sparkles, Filter, ExternalLink, 
  Search, Check, MessageSquare, RefreshCw, Tag 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Aspiration, AspirationCategory } from '../../types';
import { cn } from '../../lib/utils';

interface AdminDisetujuiListProps {
  pageAspirations: Aspiration[];
  isLoadingDb: boolean;
  totalCount: number;
  totalApprovedAll: number;
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

export default function AdminDisetujuiList({
  pageAspirations,
  isLoadingDb,
  totalCount,
  totalApprovedAll,
  aspirationPage,
  totalPages,
  handlePrevPage,
  handleNextPage,
  onUpdateStatus,
  onAddResponse,
  onDeleteAspiration,
  onOpenModal,
  onReload
}: AdminDisetujuiListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [expandedMessageIds, setExpandedMessageIds] = useState<Record<string, boolean>>({});

  // Sub-filter for response status
  const [responseFilter, setResponseFilter] = useState<'all' | 'responded' | 'unresponded'>('all');
  const [searchLocal, setSearchLocal] = useState('');

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

  // Filter the current page aspirations based on local responseFilter & search
  const displayedAspirations = useMemo(() => {
    return pageAspirations.filter(item => {
      const hasResponse = !!item.response?.trim();
      if (responseFilter === 'responded' && !hasResponse) return false;
      if (responseFilter === 'unresponded' && hasResponse) return false;

      if (searchLocal.trim()) {
        const query = searchLocal.toLowerCase();
        const matchSub = item.subject.toLowerCase().includes(query);
        const matchMsg = item.message.toLowerCase().includes(query);
        const matchResp = item.response?.toLowerCase().includes(query);
        if (!matchSub && !matchMsg && !matchResp) return false;
      }

      return true;
    });
  }, [pageAspirations, responseFilter, searchLocal]);

  const countRespondedPage = pageAspirations.filter(a => !!a.response?.trim()).length;
  const countUnrespondedPage = pageAspirations.length - countRespondedPage;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-300">
      {/* Top Banner & Title */}
      <div className="p-6 sm:px-8 border-b border-slate-200 bg-emerald-50/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                <CheckCircle2 className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-900">Riwayat Aspirasi Disetujui (Approved)</h2>
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                Live di Papan Siswa
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Seluruh aspirasi di bawah ini telah disetujui pengurus dan tampil secara publik di Papan Aspirasi. Total: <strong className="text-slate-900">{totalCount}</strong> pesan disetujui.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onReload}
              className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all shadow-2xs cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title="Segarkan data"
            >
              <RefreshCw className={cn("w-3.5 h-3.5 text-emerald-600", isLoadingDb && "animate-spin")} />
              <span className="hidden sm:inline">Segarkan</span>
            </button>

            <Link
              to="/papan"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs border border-slate-200 shadow-2xs transition-colors"
            >
              <span>Papan Publik</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            {totalPages > 1 && (
              <div className="inline-flex items-center gap-1.5 bg-white border border-slate-200 p-1.5 rounded-xl text-xs font-semibold text-slate-600 shadow-2xs">
                <span className="px-2">Hal {aspirationPage} / {totalPages}</span>
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

        {/* Filter Pills & Search in page */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-emerald-100/70">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Filter Balasan di Halaman Ini:</span>
            <button
              type="button"
              onClick={() => setResponseFilter('all')}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                responseFilter === 'all'
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              )}
            >
              Semua ({pageAspirations.length})
            </button>
            <button
              type="button"
              onClick={() => setResponseFilter('responded')}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                responseFilter === 'responded'
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              )}
            >
              Sudah Dibalas ({countRespondedPage})
            </button>
            <button
              type="button"
              onClick={() => setResponseFilter('unresponded')}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                responseFilter === 'unresponded'
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              )}
            >
              Belum Dibalas ({countUnrespondedPage})
            </button>
          </div>

          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchLocal}
              onChange={(e) => setSearchLocal(e.target.value)}
              placeholder="Cari di halaman ini..."
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>
        </div>
      </div>

      {/* Cards List */}
      <div className="divide-y divide-slate-100">
        {isLoadingDb ? (
          <div className="p-16 text-center text-slate-500 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
            <p className="text-sm font-semibold">Memuat riwayat disetujui dari database...</p>
          </div>
        ) : displayedAspirations.length === 0 ? (
          <div className="p-16 text-center text-slate-500 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-300 mx-auto" />
            <p className="font-bold text-slate-700">Tidak ada aspirasi disetujui pada kriteria ini.</p>
            <p className="text-xs text-slate-400">
              {searchLocal ? "Coba ganti kata kunci pencarian." : "Setujui aspirasi pada tab Aspirasi Masuk untuk menampilkannya di sini."}
            </p>
          </div>
        ) : (
          displayedAspirations.map((aspiration) => {
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
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Disetujui
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
                    {aspiration.response ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                        Sudah Ditanggapi
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        Belum Ditanggapi
                      </span>
                    )}
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
                        className="mt-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
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

                {/* Official Response Box */}
                {aspiration.response ? (
                  <div className="p-5 bg-sky-50/80 border border-sky-200/90 rounded-2xl space-y-1.5 text-xs sm:text-sm text-sky-950">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sky-900 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                        Tanggapan Resmi OSIS:
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap leading-relaxed text-slate-800">
                      {aspiration.response}
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50/60 border border-amber-200/70 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-900">
                    <span>Aspirasi ini belum memiliki tanggapan resmi dari OSIS.</span>
                    <button
                      type="button"
                      onClick={() => {
                        setExpandedId(aspiration.id);
                        setResponseText('');
                      }}
                      className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors shrink-0 cursor-pointer"
                    >
                      + Beri Tanggapan Sekarang
                    </button>
                  </div>
                )}

                {/* Inline Reply Form */}
                {expandedId === aspiration.id && (
                  <form onSubmit={(e) => handleResponseSubmit(e, aspiration.id)} className="space-y-3 pt-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <label className="block text-xs font-bold text-slate-700">
                      {aspiration.response ? "Edit Tanggapan OSIS:" : "Tulis Tanggapan Resmi OSIS:"}
                    </label>
                    <textarea
                      rows={3}
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder="Tuliskan tindak lanjut atau jawaban resmi untuk siswa..."
                      className="w-full p-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm text-slate-800"
                      required
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setExpandedId(null)}
                        className="px-3 py-1.5 text-xs text-slate-600 font-bold hover:bg-slate-200 rounded-lg cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Simpan Tanggapan
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
                        if (window.confirm('Yakin ingin menghapus permanen aspirasi yang disetujui ini?')) {
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
                    <button
                      type="button"
                      onClick={async () => {
                        if (window.confirm('Tarik aspirasi ini kembali ke status Pending? Pesan tidak akan lagi tampil di papan publik siswa.')) {
                          await onUpdateStatus(aspiration.id, 'Pending');
                          onReload();
                        }
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-xl transition-colors border border-amber-200 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Tarik ke Pending</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setExpandedId(expandedId === aspiration.id ? null : aspiration.id);
                        setResponseText(aspiration.response || '');
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-bold rounded-xl transition-colors border border-sky-200 cursor-pointer"
                    >
                      <MessageCircleReply className="w-3.5 h-3.5" />
                      <span>{aspiration.response ? 'Edit Tanggapan' : 'Beri Tanggapan'}</span>
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
              Menampilkan {displayedAspirations.length} dari <strong className="text-slate-800">{totalCount}</strong> aspirasi disetujui
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

            <span className="px-3.5 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold shadow-2xs">
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
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
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
