import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Filter, Search, ChevronLeft, ChevronRight, Eye, ChevronDown, ChevronUp, Maximize2, X, MessageSquare, Layers } from 'lucide-react';
import { motion } from 'motion/react';
import { AspirationCategory, Aspiration } from '../types';
import { cn } from '../lib/utils';

export default function PapanAspirasi() {
  const { aspirations } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AspirationCategory | 'Semua'>('Semua');

  // Pagination state (load per 5 pesan)
  const [currentPage, setCurrentPage] = useState(1);
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev'>('next');
  const itemsPerPage = 5;
  const boardRef = useRef<HTMLDivElement>(null);

  // Message shortening and full read states
  const [expandedMessageIds, setExpandedMessageIds] = useState<Record<string, boolean>>({});
  const [selectedModalAspiration, setSelectedModalAspiration] = useState<Aspiration | null>(null);

  const toggleMessageExpand = (id: string) => {
    setExpandedMessageIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const categories: (AspirationCategory | 'Semua')[] = ['Semua', 'Saran', 'Kritik', 'Pertanyaan', 'Lainnya'];

  const approvedAspirations = aspirations.filter(a => a.status === 'Approved');

  const filteredAspirations = approvedAspirations.filter(a => {
    const matchesSearch = 
      a.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
      a.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || a.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Reset page to 1 when search or category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  const totalCount = filteredAspirations.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedAspirations = filteredAspirations.slice(startIndex, startIndex + itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setSlideDirection('next');
      setCurrentPage(prev => prev + 1);
      boardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setSlideDirection('prev');
      setCurrentPage(prev => prev - 1);
      boardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div ref={boardRef} className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4 max-w-2xl mx-auto py-8"
      >
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Papan Aspirasi</h1>
        <p className="text-lg text-slate-600">
          Suara kamu sangat berharga! Lihat aspirasi dari teman-teman yang telah ditanggapi oleh OSIS.
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between"
      >
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari aspirasi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all text-sm"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-hide">
          <Filter className="w-5 h-5 text-slate-400 shrink-0 hidden sm:block" />
          {categories.map(cat => (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors cursor-pointer",
                selectedCategory === cat
                  ? "bg-sky-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Info Bar & Top Pagination */}
      {totalCount > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="flex items-center gap-1.5 font-bold text-sky-700 bg-sky-50 border border-sky-200 px-3 py-1 rounded-full text-xs">
              <Layers className="w-3.5 h-3.5 text-sky-500" />
              Dimuat per 5 pesan
            </span>
            <span className="text-xs sm:text-sm text-slate-500">
              Menampilkan <strong className="text-slate-800">{startIndex + 1}–{Math.min(startIndex + paginatedAspirations.length, totalCount)}</strong> dari <strong className="text-slate-800">{totalCount}</strong> aspirasi
            </span>
          </div>

          {totalPages > 1 && (
            <div className="inline-flex items-center gap-2 bg-white border border-slate-200 p-1.5 rounded-xl shadow-xs self-start sm:self-auto">
              <button
                type="button"
                onClick={handlePrevPage}
                disabled={safeCurrentPage === 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Sebelumnya</span>
              </button>

              <span className="px-3 py-1 bg-sky-50 text-sky-800 font-bold text-xs rounded-lg border border-sky-100">
                Hal {safeCurrentPage} / {totalPages}
              </span>

              <button
                type="button"
                onClick={handleNextPage}
                disabled={safeCurrentPage === totalPages}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                title="Halaman Selanjutnya"
              >
                <span>Selanjutnya</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {paginatedAspirations.length > 0 ? (
        <div 
          key={`page-public-${safeCurrentPage}-${selectedCategory}-${searchTerm}`}
          className={cn(
            "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 transition-all duration-300",
            slideDirection === 'next' 
              ? "animate-in fade-in slide-in-from-right-6 duration-300"
              : "animate-in fade-in slide-in-from-left-6 duration-300"
          )}
        >
          {paginatedAspirations.map((aspiration, index) => {
            const isExpanded = !!expandedMessageIds[aspiration.id];
            const isLong = (aspiration.message?.length || 0) > 130 || aspiration.message?.includes('\n');

            return (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                key={aspiration.id} 
                className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col transition-all hover:shadow-md hover:border-slate-300"
              >
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800">
                      {aspiration.category}
                    </span>
                    <span className="text-xs text-slate-400 whitespace-nowrap">
                      {formatDistanceToNow(new Date(aspiration.createdAt), { addSuffix: true, locale: localeId })}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug break-words">
                    {aspiration.subject}
                  </h3>

                  {/* Message content: compact with Read More if long */}
                  <div className="mb-4 flex-1">
                    <p className={cn(
                      "text-slate-600 text-sm break-words leading-relaxed",
                      !isExpanded && isLong ? "line-clamp-3" : "whitespace-pre-wrap"
                    )}>
                      {aspiration.message}
                    </p>

                    {isLong && (
                      <div className="flex items-center gap-2 mt-2 pt-1">
                        <button
                          type="button"
                          onClick={() => toggleMessageExpand(aspiration.id)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                          {isExpanded ? (
                            <>
                              <span>Tutup</span>
                              <ChevronUp className="w-3 h-3" />
                            </>
                          ) : (
                            <>
                              <Eye className="w-3 h-3" />
                              <span>Baca Selengkapnya</span>
                              <ChevronDown className="w-3 h-3" />
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedModalAspiration(aspiration)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                          title="Buka tampilan modal dialog"
                        >
                          <Maximize2 className="w-3 h-3" />
                          <span>Pop-up</span>
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 pt-3 border-t border-slate-100 mt-auto">
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-sm font-bold shrink-0">
                      {aspiration.isAnonymous ? '?' : (aspiration.authorName?.charAt(0).toUpperCase() || 'S')}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {aspiration.isAnonymous ? 'Anonim' : aspiration.authorName}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {aspiration.isAnonymous ? 'Identitas dirahasiakan' : 'Siswa SMAN 1 Kemangkon'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* OSIS Response Banner */}
                {aspiration.response ? (
                  <div className="border-t border-sky-100 bg-gradient-to-br from-sky-50/70 to-sky-50/30 p-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-xs overflow-hidden shrink-0 border border-sky-200">
                          <img src="https://raw.githubusercontent.com/dapidd12/storage/main/tes/1788314699811-20260902_090434.png" alt="Logo OSIS SMAN 1 Kemangkon" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xs font-bold text-sky-900">Tanggapan Resmi OSIS</span>
                      </div>
                      <span className="text-[10px] font-semibold text-sky-600 bg-white/80 px-2 py-0.5 rounded-full border border-sky-200/60">
                        Resmi
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap break-words">
                      {aspiration.response}
                    </p>
                  </div>
                ) : (
                  <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-3 text-xs text-slate-400 italic flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-300" />
                    <span>Menunggu tanggapan dari pengurus OSIS</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed"
        >
          <div className="w-20 h-20 mx-auto mb-4 opacity-50 grayscale">
            <img src="https://raw.githubusercontent.com/dapidd12/storage/main/tes/1788314699811-20260902_090434.png" alt="Logo OSIS SMAN 1 Kemangkon" className="w-full h-full object-contain" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Belum ada aspirasi</h3>
          <p className="text-slate-500 max-w-md mx-auto text-sm">
            {searchTerm || selectedCategory !== 'Semua' 
              ? 'Tidak ada aspirasi yang sesuai dengan kata kunci pencarian atau kategori ini.' 
              : 'Belum ada aspirasi yang disetujui untuk ditampilkan saat ini.'}
          </p>
          {(searchTerm || selectedCategory !== 'Semua') && (
            <button
              type="button"
              onClick={() => { setSearchTerm(''); setSelectedCategory('Semua'); }}
              className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Reset Pencarian & Kategori
            </button>
          )}
        </motion.div>
      )}

      {/* Bottom Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs sm:text-sm text-slate-500 font-medium order-2 sm:order-1 text-center sm:text-left">
            Menampilkan <strong className="text-slate-800">{startIndex + 1}–{Math.min(startIndex + paginatedAspirations.length, totalCount)}</strong> dari total <strong className="text-slate-800">{totalCount}</strong> aspirasi
          </div>

          <div className="flex items-center gap-2 order-1 sm:order-2">
            <button
              type="button"
              onClick={handlePrevPage}
              disabled={safeCurrentPage === 1}
              className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold bg-white border border-slate-200 text-slate-700 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-all shadow-2xs cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>

            <span className="px-3.5 py-2 bg-sky-50 border border-sky-200 text-sky-800 rounded-xl text-xs font-bold shadow-2xs">
              Hal {safeCurrentPage} / {totalPages}
            </span>

            <button
              type="button"
              onClick={handleNextPage}
              disabled={safeCurrentPage === totalPages}
              className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold bg-white border border-slate-200 text-slate-700 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-all shadow-2xs cursor-pointer"
            >
              <span>Selanjutnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Reading Modal for Students */}
      {selectedModalAspiration && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setSelectedModalAspiration(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 sm:p-7 border-b border-slate-100 flex items-start justify-between gap-4 sticky top-0 bg-white/95 backdrop-blur-xs z-10">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800">
                    {selectedModalAspiration.category}
                  </span>
                  <span className="text-xs text-slate-400">
                    {formatDistanceToNow(new Date(selectedModalAspiration.createdAt), { addSuffix: true, locale: localeId })}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 break-words leading-snug">
                  {selectedModalAspiration.subject}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedModalAspiration(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors shrink-0 cursor-pointer"
                title="Tutup Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 sm:p-7 space-y-6 flex-1 overflow-y-auto">
              <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-sm shrink-0">
                  {selectedModalAspiration.isAnonymous ? '?' : (selectedModalAspiration.authorName?.charAt(0).toUpperCase() || 'S')}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {selectedModalAspiration.isAnonymous ? 'Siswa (Anonim)' : selectedModalAspiration.authorName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {selectedModalAspiration.isAnonymous ? 'Identitas dirahasiakan' : 'Siswa SMAN 1 Kemangkon'}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Isi Pesan Aspirasi</p>
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 text-sm sm:text-base text-slate-800 leading-relaxed break-words whitespace-pre-wrap selection:bg-sky-100">
                  {selectedModalAspiration.message}
                </div>
              </div>

              {selectedModalAspiration.response && (
                <div className="bg-sky-50/70 border border-sky-100 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold text-sky-900">
                    <div className="w-5 h-5 rounded-full overflow-hidden border border-sky-300">
                      <img src="https://raw.githubusercontent.com/dapidd12/storage/main/tes/1788314699811-20260902_090434.png" alt="Logo OSIS" className="w-full h-full object-cover" />
                    </div>
                    <span>Tanggapan Resmi Pengurus OSIS:</span>
                  </div>
                  <p className="text-sm text-sky-950 whitespace-pre-wrap leading-relaxed">
                    {selectedModalAspiration.response}
                  </p>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50/80 rounded-b-3xl flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedModalAspiration(null)}
                className="px-5 py-2 text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
