import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { 
  Filter, Search, ChevronLeft, ChevronRight, Eye, ChevronDown, 
  ChevronUp, Maximize2, X, MessageSquare, Layers, Lock, ShieldCheck, 
  Tag, MessageCircle, ArrowRight, Instagram, Sparkles 
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { AspirationCategory, Aspiration } from '../types';
import { cn } from '../lib/utils';
import { getWhatsAppUrl, getInstagramUrl, getTikTokUrl } from '../lib/socialUtils';

export default function PapanAspirasi() {
  const { aspirations, settings, isSettingsLoaded } = useAppContext();
  const isAdmin = typeof window !== 'undefined' && localStorage.getItem('adminAuth') === 'true';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AspirationCategory | 'Semua'>('Semua');
  const [selectedTopic, setSelectedTopic] = useState<string | 'Semua'>('Semua');

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

  // Available unique topics
  const availableTopics = useMemo(() => {
    const set = new Set<string>();
    approvedAspirations.forEach(a => {
      if (a.activityTopic && a.activityTopic.trim() && a.activityTopic.trim() !== 'Umum') {
        set.add(a.activityTopic.trim());
      }
    });
    return Array.from(set);
  }, [approvedAspirations]);

  const filteredAspirations = approvedAspirations.filter(a => {
    const matchesSearch = 
      a.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
      a.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.activityTopic && a.activityTopic.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'Semua' || a.category === selectedCategory;
    const matchesTopic = selectedTopic === 'Semua' || (a.activityTopic || 'Umum') === selectedTopic;
    
    return matchesSearch && matchesCategory && matchesTopic;
  });

  // Reset page to 1 when search or category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedTopic]);

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

  const waUrl = settings.socialLinks?.whatsapp
    ? getWhatsAppUrl(settings.socialLinks.whatsapp, settings.socialLinks.whatsappMessage)
    : null;

  return (
    <div ref={boardRef} className="space-y-6 sm:space-y-8">
      {/* Notice if aspirations are closed */}
      {isSettingsLoaded && !settings.isAspirationOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-amber-50 border border-amber-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-amber-950 shadow-2xs"
        >
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-amber-200 text-amber-900 rounded-lg shrink-0">
              <Lock className="w-4 h-4" />
            </span>
            <span>
              <strong>Pemberitahuan:</strong> Pengiriman formulir aspirasi baru saat ini sedang <strong>ditutup sementara</strong> oleh Pengurus OSIS. Kamu tetap dapat membaca seluruh aspirasi yang telah disetujui di bawah ini.
            </span>
          </div>
          {isAdmin && (
            <Link
              to="/pengurus/dashboard?tab=pengaturan"
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-colors text-xs whitespace-nowrap self-start sm:self-auto cursor-pointer shrink-0"
            >
              Pengaturan &rarr;
            </Link>
          )}
        </motion.div>
      )}

      {/* Header Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-3 max-w-2xl mx-auto py-4 sm:py-6"
      >
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-800 border border-sky-200/80">
          <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
          <span>Suara Resmi Siswa SMAN 1 Kemangkon</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Papan Aspirasi</h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Wadah keterbukaan dan kolaborasi siswa. Lihat aspirasi yang telah disetujui beserta tanggapan resmi dari Pengurus OSIS.
        </p>

        {settings.activityTopic && settings.activityTopic !== 'Umum' && (
          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 text-sky-900 shadow-2xs">
              <Tag className="w-3.5 h-3.5 text-sky-600" />
              <span>Agenda Aktif Saat Ini: <strong>{settings.activityTopic}</strong></span>
            </span>
          </div>
        )}
      </motion.div>

      {/* Filter and Search Bar */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4"
      >
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari aspirasi berdasarkan judul, pesan, atau kegiatan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-xs sm:text-sm font-medium text-slate-800 transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between sm:justify-end gap-2 text-xs font-semibold text-slate-600 self-end md:self-auto shrink-0">
              <span className="px-2">Hal {safeCurrentPage} dari {totalPages}</span>
              <div className="inline-flex gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={handlePrevPage}
                  disabled={safeCurrentPage === 1}
                  className="p-1.5 rounded-lg bg-white hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs transition-all cursor-pointer"
                  title="Halaman Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-700" />
                </button>
                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={safeCurrentPage === totalPages}
                  className="p-1.5 rounded-lg bg-white hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs transition-all cursor-pointer"
                  title="Halaman Selanjutnya"
                >
                  <ChevronRight className="w-4 h-4 text-slate-700" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
            Kategori:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                selectedCategory === cat
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100/80 text-slate-600 hover:bg-slate-200"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Activity Topic Filters if topics exist */}
        {availableTopics.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
              <Tag className="w-3 h-3 text-sky-500" />
              <span>Agenda:</span>
            </span>
            <button
              type="button"
              onClick={() => setSelectedTopic('Semua')}
              className={cn(
                "px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer",
                selectedTopic === 'Semua'
                  ? "bg-sky-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              Semua Agenda
            </button>
            {availableTopics.map(topic => (
              <button
                key={topic}
                type="button"
                onClick={() => setSelectedTopic(topic)}
                className={cn(
                  "px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border",
                  selectedTopic === topic
                    ? "bg-sky-600 text-white border-sky-600 shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                )}
              >
                {topic}
              </button>
            ))}
          </div>
        )}
      </motion.div>

      {/* Aspirations Grid */}
      {paginatedAspirations.length > 0 ? (
        <div 
          key={`page-public-${safeCurrentPage}-${selectedCategory}-${selectedTopic}-${searchTerm}`}
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
                  {/* Category, Topic Tag, Date */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800">
                        {aspiration.category}
                      </span>
                      {aspiration.activityTopic && aspiration.activityTopic !== 'Umum' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                          <Tag className="w-2.5 h-2.5 text-amber-700" />
                          <span>{aspiration.activityTopic}</span>
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 whitespace-nowrap">
                      {formatDistanceToNow(new Date(aspiration.createdAt), { addSuffix: true, locale: localeId })}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2 leading-snug break-words">
                    {aspiration.subject}
                  </h3>

                  {/* Message content */}
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
                  
                  {/* Author */}
                  <div className="flex items-center gap-2.5 pt-3 border-t border-slate-100 mt-auto">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold shrink-0">
                      {aspiration.isAnonymous ? '?' : (aspiration.authorName?.charAt(0).toUpperCase() || 'S')}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {aspiration.isAnonymous ? 'Anonim' : aspiration.authorName}
                      </p>
                      <p className="text-[10px] text-slate-400">
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
                    <span>Menunggu verifikasi tanggapan dari pengurus OSIS</span>
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
            {searchTerm || selectedCategory !== 'Semua' || selectedTopic !== 'Semua'
              ? 'Tidak ada aspirasi yang sesuai dengan kata kunci pencarian atau kategori ini.' 
              : 'Belum ada aspirasi yang disetujui untuk ditampilkan saat ini.'}
          </p>
          {(searchTerm || selectedCategory !== 'Semua' || selectedTopic !== 'Semua') && (
            <button
              type="button"
              onClick={() => { setSearchTerm(''); setSelectedCategory('Semua'); setSelectedTopic('Semua'); }}
              className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Reset Filter Pencarian
            </button>
          )}
        </motion.div>
      )}

      {/* Bottom Pagination Controls */}
      {totalPages > 1 && (
        <div className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
          <p className="text-xs text-slate-500 order-2 sm:order-1">
            Menampilkan {paginatedAspirations.length} dari <strong className="text-slate-900">{totalCount}</strong> aspirasi disetujui
          </p>

          <div className="flex items-center gap-2 order-1 sm:order-2">
            <button
              type="button"
              onClick={handlePrevPage}
              disabled={safeCurrentPage === 1}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-slate-50 border border-slate-200 text-slate-700 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>

            <span className="px-3.5 py-2 bg-sky-50 border border-sky-200 text-sky-800 rounded-xl text-xs font-bold">
              Hal {safeCurrentPage} / {totalPages}
            </span>

            <button
              type="button"
              onClick={handleNextPage}
              disabled={safeCurrentPage === totalPages}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-slate-50 border border-slate-200 text-slate-700 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-all cursor-pointer"
            >
              <span>Selanjutnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Callout Card to submit or ask via WhatsApp */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-sky-100 text-sky-700 rounded-lg">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-sky-800">Suaramu Penting</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900">
            Punya Ide atau Masukan Baru untuk Sekolah?
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Kirimkan aspirasimu sekarang ke kotak curhat OSIS atau diskusikan langsung melalui helpdesk WhatsApp OSIS SMAN 1 Kemangkon.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-all"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Tanya CS WhatsApp</span>
            </a>
          )}

          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <span>Kirim Aspirasi Sekarang</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Modal Dialog */}
      {selectedModalAspiration && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setSelectedModalAspiration(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800">
                    {selectedModalAspiration.category}
                  </span>
                  {selectedModalAspiration.activityTopic && selectedModalAspiration.activityTopic !== 'Umum' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                      <Tag className="w-2.5 h-2.5 text-amber-700" />
                      <span>{selectedModalAspiration.activityTopic}</span>
                    </span>
                  )}
                  <span className="text-xs text-slate-400">
                    {formatDistanceToNow(new Date(selectedModalAspiration.createdAt), { addSuffix: true, locale: localeId })}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 leading-snug break-words">
                  {selectedModalAspiration.subject}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedModalAspiration(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors shrink-0 cursor-pointer"
                title="Tutup dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
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
