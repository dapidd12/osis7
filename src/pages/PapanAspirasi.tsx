import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { 
  Filter, Search, ChevronLeft, ChevronRight, Eye, ChevronDown, 
  ChevronUp, Maximize2, X, MessageSquare, Layers, Lock, ShieldCheck, 
  Tag, MessageCircle, ArrowRight, Instagram, Check, 
  User, Sparkles, MessageSquareHeart, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, Navigate } from 'react-router-dom';
import { AspirationCategory, Aspiration } from '../types';
import { cn } from '../lib/utils';
import Reveal from '../components/motion/Reveal';

export default function PapanAspirasi() {
  const { aspirations, settings, isSettingsLoaded } = useAppContext();
  const isAdmin = typeof window !== 'undefined' && localStorage.getItem('adminAuth') === 'true';
  const isEvaluationMode = settings.siteMode === 'evaluation';

  // Jika Mode Evaluasi aktif, siswa diarahkan ke kirim evaluasi (tidak ada papan publik)
  if (isSettingsLoaded && isEvaluationMode) {
    return <Navigate to="/" replace />;
  }

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AspirationCategory | 'Semua'>('Semua');
  const [selectedTopic, setSelectedTopic] = useState<string | 'Semua'>('Semua');

  // Pagination state (load per 6 pesan for a balanced 2x3 or 3x2 grid)
  const [currentPage, setCurrentPage] = useState(1);
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev'>('next');
  const itemsPerPage = 6;
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

  const getCategoryBadgeClass = (category: AspirationCategory) => {
    switch (category) {
      case 'Saran':
        return 'bg-amber-100 text-amber-900 border-amber-200';
      case 'Kritik':
        return 'bg-rose-100 text-rose-900 border-rose-200';
      case 'Pertanyaan':
        return 'bg-sky-100 text-sky-900 border-sky-200';
      default:
        return 'bg-emerald-100 text-emerald-900 border-emerald-200';
    }
  };

  return (
    <div ref={boardRef} className="space-y-8 sm:space-y-12">
      {/* Notice if aspirations are closed */}
      {isSettingsLoaded && !settings.isAspirationOpen && (
        <div className="p-4 bg-amber-50/90 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-warm-ink shadow-warm-sm">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-amber-100 text-amber-800 rounded-xl shrink-0">
              <Lock className="w-4 h-4" />
            </span>
            <span>
              <strong>Pemberitahuan:</strong> Pengiriman formulir aspirasi baru saat ini sedang <strong>ditutup sementara</strong>. Kamu tetap dapat membaca seluruh arsip suara yang telah disetujui di bawah ini.
            </span>
          </div>
          {isAdmin && (
            <Link
              to="/pengurus/dashboard?tab=pengaturan"
              className="px-3.5 py-1.5 bg-warm-ink hover:bg-slate-800 text-white font-bold rounded-xl text-xs whitespace-nowrap self-start sm:self-auto cursor-pointer shadow-warm-sm transition-all"
            >
              Pengaturan &rarr;
            </Link>
          )}
        </div>
      )}

      {/* Header Banner */}
      <Reveal className="text-center space-y-3 max-w-2xl mx-auto py-6 sm:py-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold glass-pill shadow-warm-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Wadah Terbuka Siswa SMAN 1 Kemangkon</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-display font-black text-warm-ink tracking-tight">
          Papan Suara Siswa
        </h1>

        <p className="text-xs sm:text-base text-warm-muted leading-relaxed">
          Arsip aspirasi, ide fasilitas, dan kritik membangun yang telah ditelaah beserta tanggapan resmi dari Pengurus OSIS.
        </p>

        {settings.activityTopic && settings.activityTopic !== 'Umum' && (
          <div className="pt-1">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-display font-bold bg-amber-50 text-amber-900 border border-amber-200 shadow-2xs">
              <Tag className="w-3.5 h-3.5 text-amber-600" />
              <span>Agenda Sedang Berjalan: <strong>{settings.activityTopic}</strong></span>
            </span>
          </div>
        )}
      </Reveal>

      {/* Filter and Search Archive Deck */}
      <Reveal className="glass-card p-5 sm:p-7 rounded-[2rem] shadow-warm-sm border border-white/80 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-light" />
            <input
              type="text"
              placeholder="Cari aspirasi berdasarkan judul, pesan, atau topik kegiatan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-10 py-3 bg-white/90 border border-slate-200/80 focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 rounded-2xl text-xs sm:text-sm font-medium text-warm-ink placeholder:text-warm-light transition-all outline-none shadow-xs"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-warm-light hover:text-warm-ink cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between sm:justify-end gap-2 text-xs font-display font-bold text-warm-ink self-end md:self-auto shrink-0">
              <span className="px-2">Hal {safeCurrentPage} dari {totalPages} ({totalCount} suara)</span>
              <div className="inline-flex gap-1.5 bg-amber-50/60 p-1 rounded-xl border border-amber-200/60">
                <button
                  type="button"
                  onClick={handlePrevPage}
                  disabled={safeCurrentPage === 1}
                  className="p-1.5 rounded-lg bg-white hover:bg-amber-100 disabled:opacity-30 disabled:cursor-not-allowed shadow-xs transition-all cursor-pointer"
                  title="Halaman Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4 text-warm-ink" />
                </button>
                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={safeCurrentPage === totalPages}
                  className="p-1.5 rounded-lg bg-white hover:bg-amber-100 disabled:opacity-30 disabled:cursor-not-allowed shadow-xs transition-all cursor-pointer"
                  title="Halaman Selanjutnya"
                >
                  <ChevronRight className="w-4 h-4 text-warm-ink" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-amber-900/10">
          <span className="text-xs font-bold text-warm-muted uppercase tracking-wider mr-1">
            Kategori:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-display font-bold transition-all cursor-pointer",
                selectedCategory === cat
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-warm-sm shadow-glow-amber"
                  : "bg-white/80 text-warm-muted hover:text-warm-ink hover:bg-white border border-slate-200/80"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Activity Topic Filters if topics exist */}
        {availableTopics.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-amber-900/10">
            <span className="text-xs font-bold text-warm-muted uppercase tracking-wider mr-1">
              Agenda Khusus:
            </span>
            <button
              type="button"
              onClick={() => setSelectedTopic('Semua')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-display font-bold transition-all cursor-pointer",
                selectedTopic === 'Semua'
                  ? "bg-warm-ink text-white shadow-warm-sm"
                  : "bg-white/80 text-warm-muted hover:text-warm-ink hover:bg-white border border-slate-200/80"
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
                  "px-3 py-1.5 rounded-lg text-xs font-display font-bold transition-all cursor-pointer",
                  selectedTopic === topic
                    ? "bg-amber-500 text-white shadow-warm-sm"
                    : "bg-white/80 text-warm-muted hover:text-warm-ink hover:bg-white border border-slate-200/80"
                )}
              >
                {topic}
              </button>
            ))}
          </div>
        )}
      </Reveal>

      {/* Aspirations Grid */}
      {paginatedAspirations.length > 0 ? (
        <div 
          key={`page-public-${safeCurrentPage}-${selectedCategory}-${selectedTopic}-${searchTerm}`}
          className={cn(
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-300",
            slideDirection === 'next' 
              ? "animate-in fade-in slide-in-from-right-4 duration-300"
              : "animate-in fade-in slide-in-from-left-4 duration-300"
          )}
        >
          {paginatedAspirations.map((aspiration, index) => {
            const isExpanded = !!expandedMessageIds[aspiration.id];
            const isLong = (aspiration.message?.length || 0) > 130 || aspiration.message?.includes('\n');

            return (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                key={aspiration.id} 
                className="glass-card rounded-[2rem] p-6 sm:p-7 shadow-warm-sm hover:shadow-warm transition-all flex flex-col justify-between border border-white/90 relative group"
              >
                <div>
                  {/* Category, Topic Tag, Date */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={cn(
                        "px-3 py-0.5 rounded-full text-xs font-bold border",
                        getCategoryBadgeClass(aspiration.category)
                      )}>
                        {aspiration.category}
                      </span>
                      {aspiration.activityTopic && aspiration.activityTopic !== 'Umum' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                          <Tag className="w-2.5 h-2.5 text-amber-600" />
                          <span>{aspiration.activityTopic}</span>
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-warm-light whitespace-nowrap">
                      {formatDistanceToNow(new Date(aspiration.createdAt), { addSuffix: true, locale: localeId })}
                    </span>
                  </div>

                  {/* Subject Headline */}
                  <h3 className="text-base sm:text-lg font-display font-bold text-warm-ink mb-2.5 leading-snug break-words">
                    {aspiration.subject}
                  </h3>

                  {/* Message content */}
                  <div className="mb-5">
                    <p className={cn(
                      "text-warm-muted text-xs sm:text-sm break-words leading-relaxed font-sans",
                      !isExpanded && isLong ? "line-clamp-3" : "whitespace-pre-wrap"
                    )}>
                      {aspiration.message}
                    </p>

                    {isLong && (
                      <div className="flex items-center gap-2 mt-3 pt-1">
                        <button
                          type="button"
                          onClick={() => toggleMessageExpand(aspiration.id)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1 rounded-xl transition-all cursor-pointer"
                        >
                          {isExpanded ? (
                            <>
                              <span>Tutup</span>
                              <ChevronUp className="w-3 h-3" />
                            </>
                          ) : (
                            <>
                              <Eye className="w-3 h-3" />
                              <span>Baca Lengkap</span>
                              <ChevronDown className="w-3 h-3" />
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedModalAspiration(aspiration)}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-warm-light hover:text-warm-ink px-2 py-1 rounded-lg transition-colors cursor-pointer"
                          title="Buka tampilan modal dialog"
                        >
                          <Maximize2 className="w-3 h-3" />
                          <span>Pop-up</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer of Card: Author & OSIS Response */}
                <div className="space-y-4 pt-3 border-t border-slate-100 mt-auto">
                  {/* Author Sign-off */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-amber-100/80 text-amber-800 flex items-center justify-center text-xs font-bold shrink-0">
                      {aspiration.isAnonymous ? '🎭' : '👤'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-display font-bold text-warm-ink truncate">
                        {aspiration.isAnonymous ? 'Anonim (Identitas Terjaga)' : aspiration.authorName}
                      </p>
                      <p className="text-[10px] text-warm-light">
                        {aspiration.isAnonymous ? 'Siswa SMAN 1 Kemangkon' : 'Siswa SMAN 1 Kemangkon'}
                      </p>
                    </div>
                  </div>

                  {/* Official OSIS Response Container */}
                  {aspiration.response ? (
                    <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 relative space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                            <img 
                              src="https://raw.githubusercontent.com/dapidd12/storage/main/tes/1788314699811-20260902_090434.png" 
                              alt="Logo OSIS SMAN 1 Kemangkon" 
                              className="w-full h-full object-contain" 
                            />
                          </div>
                          <span className="text-xs font-display font-bold text-emerald-950">
                            Tanggapan Resmi OSIS
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-white/80 px-2 py-0.5 rounded-full border border-emerald-200">
                          Resmi
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed whitespace-pre-wrap break-words font-sans">
                        {aspiration.response}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2.5 text-xs text-warm-light italic flex items-center gap-2">
                      <MessageSquare className="w-3.5 h-3.5 text-warm-light/70" />
                      <span>Sedang dalam proses telaah Pengurus OSIS</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 glass-card rounded-[2rem] border border-slate-200/80 space-y-4 max-w-lg mx-auto p-8">
          <div className="w-16 h-16 mx-auto opacity-50 grayscale">
            <img 
              src="https://raw.githubusercontent.com/dapidd12/storage/main/tes/1788314699811-20260902_090434.png" 
              alt="Logo OSIS SMAN 1 Kemangkon" 
              className="w-full h-full object-contain" 
            />
          </div>
          <h3 className="text-lg font-display font-bold text-warm-ink">
            Belum ada aspirasi yang cocok
          </h3>
          <p className="text-warm-muted text-xs sm:text-sm">
            {searchTerm || selectedCategory !== 'Semua' || selectedTopic !== 'Semua'
              ? 'Tidak ada aspirasi yang sesuai dengan filter pencarian atau kategori ini.'
              : 'Belum ada arsip aspirasi yang disetujui untuk ditampilkan saat ini.'}
          </p>
          {(searchTerm || selectedCategory !== 'Semua' || selectedTopic !== 'Semua') && (
            <button
              type="button"
              onClick={() => { setSearchTerm(''); setSelectedCategory('Semua'); setSelectedTopic('Semua'); }}
              className="px-4 py-2 bg-warm-ink hover:bg-slate-800 text-white rounded-xl text-xs font-display font-bold shadow-warm-sm transition-all cursor-pointer"
            >
              Reset Filter Pencarian
            </button>
          )}
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            type="button"
            onClick={handlePrevPage}
            disabled={safeCurrentPage === 1}
            className="px-4.5 py-2.5 glass-card text-warm-ink rounded-xl text-xs font-display font-bold shadow-warm-sm hover:shadow-warm disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Sebelumnya</span>
          </button>
          <span className="text-xs font-display font-bold text-warm-ink px-3">
            Halaman {safeCurrentPage} dari {totalPages}
          </span>
          <button
            type="button"
            onClick={handleNextPage}
            disabled={safeCurrentPage === totalPages}
            className="px-4.5 py-2.5 glass-card text-warm-ink rounded-xl text-xs font-display font-bold shadow-warm-sm hover:shadow-warm disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>Selanjutnya</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Full Modal Reading Dialog */}
      <AnimatePresence>
        {selectedModalAspiration && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card rounded-[2.5rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 relative shadow-warm-lg border border-white/90"
            >
              <button
                type="button"
                onClick={() => setSelectedModalAspiration(null)}
                className="absolute top-5 right-5 p-2 rounded-xl bg-warm-bg hover:bg-white text-warm-ink shadow-warm-sm transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-wrap items-center gap-2 pr-10">
                <span className={cn(
                  "px-3 py-0.5 rounded-full text-xs font-bold border",
                  getCategoryBadgeClass(selectedModalAspiration.category)
                )}>
                  {selectedModalAspiration.category}
                </span>
                {selectedModalAspiration.activityTopic && selectedModalAspiration.activityTopic !== 'Umum' && (
                  <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
                    <Tag className="w-3 h-3 text-amber-600" />
                    <span>{selectedModalAspiration.activityTopic}</span>
                  </span>
                )}
                <span className="text-xs font-mono text-warm-light">
                  {new Date(selectedModalAspiration.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-warm-ink mb-3 leading-snug">
                  {selectedModalAspiration.subject}
                </h2>
                <div className="bg-white/80 p-5 rounded-2xl border border-slate-200/80 text-warm-ink text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-sans">
                  {selectedModalAspiration.message}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-warm-muted font-display font-medium">
                <span>Pengirim:</span>
                <strong className="text-warm-ink">
                  {selectedModalAspiration.isAnonymous ? '🎭 Anonim (Identitas Dirahasiakan)' : `👤 ${selectedModalAspiration.authorName}`}
                </strong>
              </div>

              {selectedModalAspiration.response ? (
                <div className="p-5 rounded-2xl bg-emerald-50/90 border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-2 font-display font-bold text-emerald-950 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Tanggapan Resmi Pengurus OSIS:</span>
                  </div>
                  <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed whitespace-pre-wrap font-sans">
                    {selectedModalAspiration.response}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-warm-light italic">
                  Sedang dalam penelaahan Pengurus OSIS.
                </p>
              )}

              <div className="pt-2 text-right">
                <button
                  type="button"
                  onClick={() => setSelectedModalAspiration(null)}
                  className="px-6 py-2.5 bg-warm-ink text-white font-display font-bold text-xs rounded-xl shadow-warm hover:shadow-warm-lg transition-all cursor-pointer"
                >
                  Tutup Tampilan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
