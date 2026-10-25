import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ExternalLink, Megaphone, Inbox, ClipboardList, BarChart3, Filter } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Aspiration } from '../types';
import { cn } from '../lib/utils';

// Modular Admin Components
import AdminStatsCards from '../components/admin/AdminStatsCards';
import AdminProfessionalCharts from '../components/admin/AdminProfessionalCharts';
import AdminAspirasiList from '../components/admin/AdminAspirasiList';
import AdminDisetujuiList from '../components/admin/AdminDisetujuiList';
import AdminMadingManager from '../components/admin/AdminMadingManager';
import AdminSettingsManager from '../components/admin/AdminSettingsManager';
import AdminReadingModal from '../components/admin/AdminReadingModal';

export default function AdminDashboard() {
  const { 
    aspirations, 
    updateAspirationStatus, 
    addResponse, 
    deleteAspiration, 
    announcements, 
    addAnnouncement, 
    deleteAnnouncement,
    settings, 
    updateSettings, 
    isSettingsLoaded 
  } = useAppContext();

  const [searchParams, setSearchParams] = useSearchParams();
  const rawActiveTab = searchParams.get('tab') || 'aspirasi';
  // Aliaskan 'disetujui' lama ke 'aspirasi-disetujui'
  const activeTab = rawActiveTab === 'disetujui' ? 'aspirasi-disetujui' : rawActiveTab;
  const setActiveTab = (tab: string) => setSearchParams({ tab });

  // Reading Modal state
  const [readingModalAspiration, setReadingModalAspiration] = useState<Aspiration | null>(null);

  // Pisahkan dataset Aspirasi dan Evaluasi secara presisi
  const aspirasiItems = useMemo(() => {
    return aspirations.filter(a => a.submissionType !== 'evaluation');
  }, [aspirations]);

  const evaluasiItems = useMemo(() => {
    return aspirations.filter(a => a.submissionType === 'evaluation');
  }, [aspirations]);

  // Statistik per kategori
  const aspirasiStats = useMemo(() => ({
    total: aspirasiItems.length,
    pending: aspirasiItems.filter(a => a.status === 'Pending').length,
    approved: aspirasiItems.filter(a => a.status === 'Approved').length,
    rejected: aspirasiItems.filter(a => a.status === 'Rejected').length,
  }), [aspirasiItems]);

  const evaluasiStats = useMemo(() => ({
    total: evaluasiItems.length,
    pending: evaluasiItems.filter(a => a.status === 'Pending').length,
    approved: evaluasiItems.filter(a => a.status === 'Approved').length,
    rejected: evaluasiItems.filter(a => a.status === 'Rejected').length,
  }), [evaluasiItems]);

  const combinedStats = useMemo(() => ({
    total: aspirations.length,
    pending: aspirations.filter(a => a.status === 'Pending').length,
    approved: aspirations.filter(a => a.status === 'Approved').length,
    rejected: aspirations.filter(a => a.status === 'Rejected').length,
  }), [aspirations]);

  const itemsPerPage = 5;

  // 1. Pagination & Filter State: Aspirasi Masuk (Pending & Rejected)
  const [aspirasiFilter, setAspirasiFilter] = useState<'Pending' | 'Approved' | 'Rejected'>('Pending');
  const [aspirasiPage, setAspirasiPage] = useState(1);

  const filteredAspirasiMasuk = useMemo(() => {
    return aspirasiItems.filter(a => a.status === (aspirasiFilter === 'Approved' ? 'Pending' : aspirasiFilter));
  }, [aspirasiItems, aspirasiFilter]);

  const totalAspirasiMasukPages = Math.max(1, Math.ceil(filteredAspirasiMasuk.length / itemsPerPage));
  const pagedAspirasiMasuk = useMemo(() => {
    const start = (aspirasiPage - 1) * itemsPerPage;
    return filteredAspirasiMasuk.slice(start, start + itemsPerPage);
  }, [filteredAspirasiMasuk, aspirasiPage]);

  // 2. Pagination State: Aspirasi Disetujui
  const [aspirasiDisetujuiPage, setAspirasiDisetujuiPage] = useState(1);
  const filteredAspirasiDisetujui = useMemo(() => {
    return aspirasiItems.filter(a => a.status === 'Approved');
  }, [aspirasiItems]);

  const totalAspirasiDisetujuiPages = Math.max(1, Math.ceil(filteredAspirasiDisetujui.length / itemsPerPage));
  const pagedAspirasiDisetujui = useMemo(() => {
    const start = (aspirasiDisetujuiPage - 1) * itemsPerPage;
    return filteredAspirasiDisetujui.slice(start, start + itemsPerPage);
  }, [filteredAspirasiDisetujui, aspirasiDisetujuiPage]);

  // 3. Pagination & Filter State: Evaluasi Masuk (Pending & Rejected)
  const [evaluasiFilter, setEvaluasiFilter] = useState<'Pending' | 'Approved' | 'Rejected'>('Pending');
  const [evaluasiPage, setEvaluasiPage] = useState(1);

  const filteredEvaluasiMasuk = useMemo(() => {
    return evaluasiItems.filter(a => a.status === (evaluasiFilter === 'Approved' ? 'Pending' : evaluasiFilter));
  }, [evaluasiItems, evaluasiFilter]);

  const totalEvaluasiMasukPages = Math.max(1, Math.ceil(filteredEvaluasiMasuk.length / itemsPerPage));
  const pagedEvaluasiMasuk = useMemo(() => {
    const start = (evaluasiPage - 1) * itemsPerPage;
    return filteredEvaluasiMasuk.slice(start, start + itemsPerPage);
  }, [filteredEvaluasiMasuk, evaluasiPage]);

  // 4. Pagination State: Evaluasi Disetujui
  const [evaluasiDisetujuiPage, setEvaluasiDisetujuiPage] = useState(1);
  const filteredEvaluasiDisetujui = useMemo(() => {
    return evaluasiItems.filter(a => a.status === 'Approved');
  }, [evaluasiItems]);

  const totalEvaluasiDisetujuiPages = Math.max(1, Math.ceil(filteredEvaluasiDisetujui.length / itemsPerPage));
  const pagedEvaluasiDisetujui = useMemo(() => {
    const start = (evaluasiDisetujuiPage - 1) * itemsPerPage;
    return filteredEvaluasiDisetujui.slice(start, start + itemsPerPage);
  }, [filteredEvaluasiDisetujui, evaluasiDisetujuiPage]);

  // Statistik Filter Scope ('all' | 'aspiration' | 'evaluation')
  const [statsScope, setStatsScope] = useState<'all' | 'aspiration' | 'evaluation'>('all');

  const activeStatsData = useMemo(() => {
    if (statsScope === 'aspiration') return aspirasiStats;
    if (statsScope === 'evaluation') return evaluasiStats;
    return combinedStats;
  }, [statsScope, aspirasiStats, evaluasiStats, combinedStats]);

  const activeChartDataset = useMemo(() => {
    if (statsScope === 'aspiration') return aspirasiItems;
    if (statsScope === 'evaluation') return evaluasiItems;
    return aspirations;
  }, [statsScope, aspirasiItems, evaluasiItems, aspirations]);

  const isEvaluationMode = settings.siteMode === 'evaluation';

  const pageTitles: Record<string, { title: string; desc: string }> = {
    'aspirasi': { title: 'Aspirasi Masuk', desc: 'Tinjau dan kelola pesan aspirasi siswa.' },
    'aspirasi-disetujui': { title: 'Aspirasi Disetujui', desc: 'Arsip aspirasi yang telah ditayangkan publik.' },
    'evaluasi': { title: 'Evaluasi Masuk', desc: 'Tinjau laporan evaluasi program kerja.' },
    'evaluasi-disetujui': { title: 'Evaluasi Disetujui', desc: 'Arsip evaluasi yang telah diverifikasi.' },
    'statistik': { title: 'Statistik & Analisis', desc: 'Ringkasan data dan visualisasi suara siswa.' },
    'mading': { title: 'Kelola Mading', desc: 'Publikasikan pengumuman resmi OSIS.' },
    'pengaturan': { title: 'Pengaturan Sistem', desc: 'Konfigurasi mode situs dan integrasi.' },
  };
  const currentPage = pageTitles[activeTab] || pageTitles['aspirasi'];
  const todayStr = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-4 border-b border-slate-200">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
            Panel Pengurus &mdash; {todayStr}
          </p>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5 truncate">
            {currentPage.title}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">{currentPage.desc}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border",
            isEvaluationMode
              ? "bg-purple-50 text-purple-800 border-purple-200"
              : "bg-sky-50 text-sky-800 border-sky-200"
          )}>
            <span className={cn("w-1.5 h-1.5 rounded-full", isEvaluationMode ? "bg-purple-500" : "bg-sky-500")} />
            {isEvaluationMode ? 'Evaluasi' : 'Aspirasi'}
          </span>
          <span className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border",
            settings.isAspirationOpen
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-amber-50 text-amber-800 border-amber-200"
          )}>
            <span className={cn("w-1.5 h-1.5 rounded-full", settings.isAspirationOpen ? "bg-emerald-500" : "bg-amber-500")} />
            {settings.isAspirationOpen ? 'Form Terbuka' : 'Form Tertutup'}
          </span>
        </div>
      </header>

      {/* =========================================================================
          TAB 1: Kategori Aspirasi - Aspirasi Masuk (Pending & Rejected)
         ========================================================================= */}
      {activeTab === 'aspirasi' && (
        <div className="space-y-4">
          <div className="bg-sky-50 border border-sky-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Inbox className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  Kelola Pesan Aspirasi Masuk
                </h3>
                <p className="text-xs text-slate-500">
                  Menampilkan seluruh pesan suara & curhat umum siswa yang perlu ditinjau atau ditolak.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-white text-sky-800 rounded-full border border-sky-200 shadow-2xs shrink-0">
              Kategori: Aspirasi Siswa
            </span>
          </div>

          <AdminAspirasiList
            isEvaluationMode={false}
            aspirationFilter={aspirasiFilter}
            setAspirationFilter={(f) => {
              setAspirasiFilter(f);
              setAspirasiPage(1);
            }}
            pageAspirations={pagedAspirasiMasuk}
            isLoadingDb={false}
            totalCount={filteredAspirasiMasuk.length}
            totalAllAspirations={aspirasiStats.total}
            pendingCount={aspirasiStats.pending}
            rejectedCount={aspirasiStats.rejected}
            aspirationPage={aspirasiPage}
            totalPages={totalAspirasiMasukPages}
            handlePrevPage={() => setAspirasiPage(p => Math.max(1, p - 1))}
            handleNextPage={() => setAspirasiPage(p => Math.min(totalAspirasiMasukPages, p + 1))}
            onUpdateStatus={updateAspirationStatus}
            onAddResponse={addResponse}
            onDeleteAspiration={deleteAspiration}
            onOpenModal={(asp) => setReadingModalAspiration(asp)}
            onReload={() => {}}
          />
        </div>
      )}

      {/* =========================================================================
          TAB 2: Kategori Aspirasi - Aspirasi Disetujui (Approved)
         ========================================================================= */}
      {activeTab === 'aspirasi-disetujui' && (
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Inbox className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  Arsip Aspirasi Disetujui
                </h3>
                <p className="text-xs text-slate-500">
                  Daftar aspirasi yang telah disetujui dan ditayangkan di Papan Aspirasi publik.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-white text-emerald-800 rounded-full border border-emerald-200 shadow-2xs shrink-0">
              Kategori: Aspirasi Siswa
            </span>
          </div>

          <AdminDisetujuiList
            isEvaluationMode={false}
            pageAspirations={pagedAspirasiDisetujui}
            isLoadingDb={false}
            totalCount={filteredAspirasiDisetujui.length}
            totalApprovedAll={aspirasiStats.approved}
            aspirationPage={aspirasiDisetujuiPage}
            totalPages={totalAspirasiDisetujuiPages}
            handlePrevPage={() => setAspirasiDisetujuiPage(p => Math.max(1, p - 1))}
            handleNextPage={() => setAspirasiDisetujuiPage(p => Math.min(totalAspirasiDisetujuiPages, p + 1))}
            onUpdateStatus={updateAspirationStatus}
            onAddResponse={addResponse}
            onDeleteAspiration={deleteAspiration}
            onOpenModal={(asp) => setReadingModalAspiration(asp)}
            onReload={() => {}}
          />
        </div>
      )}

      {/* =========================================================================
          TAB 3: Kategori Evaluasi - Evaluasi Masuk (Pending & Rejected)
         ========================================================================= */}
      {activeTab === 'evaluasi' && (
        <div className="space-y-4">
          <div className="bg-purple-50 border border-purple-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-purple-950 text-sm sm:text-base">
                  Kelola Pesan Evaluasi Masuk
                </h3>
                <p className="text-xs text-purple-700/80">
                  Menampilkan masukan evaluasi program kerja OSIS khusus dari siswa yang perlu ditinjau.
                </p>
              </div>
            </div>
            <span className="text-xs font-black px-3 py-1 bg-purple-600 text-white rounded-full shadow-2xs shrink-0">
              Kategori: Evaluasi OSIS
            </span>
          </div>

          <AdminAspirasiList
            isEvaluationMode={true}
            aspirationFilter={evaluasiFilter}
            setAspirationFilter={(f) => {
              setEvaluasiFilter(f);
              setEvaluasiPage(1);
            }}
            pageAspirations={pagedEvaluasiMasuk}
            isLoadingDb={false}
            totalCount={filteredEvaluasiMasuk.length}
            totalAllAspirations={evaluasiStats.total}
            pendingCount={evaluasiStats.pending}
            rejectedCount={evaluasiStats.rejected}
            aspirationPage={evaluasiPage}
            totalPages={totalEvaluasiMasukPages}
            handlePrevPage={() => setEvaluasiPage(p => Math.max(1, p - 1))}
            handleNextPage={() => setEvaluasiPage(p => Math.min(totalEvaluasiMasukPages, p + 1))}
            onUpdateStatus={updateAspirationStatus}
            onAddResponse={addResponse}
            onDeleteAspiration={deleteAspiration}
            onOpenModal={(asp) => setReadingModalAspiration(asp)}
            onReload={() => {}}
          />
        </div>
      )}

      {/* =========================================================================
          TAB 4: Kategori Evaluasi - Evaluasi Disetujui (Approved)
         ========================================================================= */}
      {activeTab === 'evaluasi-disetujui' && (
        <div className="space-y-4">
          <div className="bg-purple-50 border border-purple-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-purple-950 text-sm sm:text-base">
                  Arsip Evaluasi Disetujui
                </h3>
                <p className="text-xs text-purple-700/80">
                  Daftar laporan evaluasi program kerja yang telah diverifikasi dan disetujui pengurus.
                </p>
              </div>
            </div>
            <span className="text-xs font-black px-3 py-1 bg-purple-700 text-white rounded-full shadow-2xs shrink-0">
              Kategori: Evaluasi OSIS
            </span>
          </div>

          <AdminDisetujuiList
            isEvaluationMode={true}
            pageAspirations={pagedEvaluasiDisetujui}
            isLoadingDb={false}
            totalCount={filteredEvaluasiDisetujui.length}
            totalApprovedAll={evaluasiStats.approved}
            aspirationPage={evaluasiDisetujuiPage}
            totalPages={totalEvaluasiDisetujuiPages}
            handlePrevPage={() => setEvaluasiDisetujuiPage(p => Math.max(1, p - 1))}
            handleNextPage={() => setEvaluasiDisetujuiPage(p => Math.min(totalEvaluasiDisetujuiPages, p + 1))}
            onUpdateStatus={updateAspirationStatus}
            onAddResponse={addResponse}
            onDeleteAspiration={deleteAspiration}
            onOpenModal={(asp) => setReadingModalAspiration(asp)}
            onReload={() => {}}
          />
        </div>
      )}

      {/* =========================================================================
          TAB 5: Statistik & Diagram Analisis
         ========================================================================= */}
      {activeTab === 'statistik' && (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Statistik & Diagram Analisis
                </h1>
                <span className={cn(
                  "text-[10px] font-bold px-2.5 py-0.5 rounded-full border",
                  isEvaluationMode ? "text-purple-800 bg-purple-50 border-purple-200" : "text-sky-800 bg-sky-50 border-sky-200"
                )}>
                  {isEvaluationMode ? 'Mode Evaluasi Aktif' : 'Mode Aspirasi Aktif'}
                </span>
              </div>
              <p className="text-slate-500 text-xs sm:text-sm max-w-2xl leading-relaxed">
                Visualisasi data komprehensif demografi kategori suara siswa, status verifikasi, dan performa tanggapan OSIS.
              </p>
            </div>

            {/* Scope Filter Switcher */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 shrink-0 self-start md:self-auto">
              <button
                type="button"
                onClick={() => setStatsScope('all')}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                  statsScope === 'all'
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                )}
              >
                Semua ({combinedStats.total})
              </button>
              <button
                type="button"
                onClick={() => setStatsScope('aspiration')}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                  statsScope === 'aspiration'
                    ? "bg-sky-600 text-white shadow-2xs"
                    : "text-slate-500 hover:text-sky-700"
                )}
              >
                Aspirasi ({aspirasiStats.total})
              </button>
              <button
                type="button"
                onClick={() => setStatsScope('evaluation')}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                  statsScope === 'evaluation'
                    ? "bg-purple-600 text-white shadow-2xs"
                    : "text-slate-500 hover:text-purple-700"
                )}
              >
                Evaluasi ({evaluasiStats.total})
              </button>
            </div>
          </div>

          <AdminStatsCards
            isEvaluationMode={statsScope === 'evaluation'}
            stats={activeStatsData}
            activeTab={activeTab}
            aspirationFilter={aspirasiFilter}
            onSelectTotal={() => {
              if (statsScope === 'evaluation') {
                setActiveTab('evaluasi');
                setEvaluasiFilter('Pending');
              } else {
                setActiveTab('aspirasi');
                setAspirasiFilter('Pending');
              }
            }}
            onSelectPending={() => {
              if (statsScope === 'evaluation') {
                setActiveTab('evaluasi');
                setEvaluasiFilter('Pending');
              } else {
                setActiveTab('aspirasi');
                setAspirasiFilter('Pending');
              }
            }}
            onSelectApproved={() => {
              if (statsScope === 'evaluation') {
                setActiveTab('evaluasi-disetujui');
              } else {
                setActiveTab('aspirasi-disetujui');
              }
            }}
            onSelectRejected={() => {
              if (statsScope === 'evaluation') {
                setActiveTab('evaluasi');
                setEvaluasiFilter('Rejected');
              } else {
                setActiveTab('aspirasi');
                setAspirasiFilter('Rejected');
              }
            }}
          />

          <AdminProfessionalCharts aspirations={activeChartDataset} />
        </div>
      )}

      {/* =========================================================================
          TAB 6: Kelola Mading
         ========================================================================= */}
      {activeTab === 'mading' && (
        isEvaluationMode ? (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-4 max-w-xl mx-auto my-8">
            <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto border border-purple-200">
              <Megaphone className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900">
              Papan Pengumuman (Mading) Dinonaktifkan
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Website saat ini sedang berjalan pada <strong>Mode Evaluasi</strong>. Sesuai pengaturan, papan pengumuman disembunyikan dari halaman publik dan panel admin. Anda dapat mengaktifkannya kembali dengan beralih ke <strong>Mode Aspirasi</strong> di Pengaturan Sistem.
            </p>
            <button
              type="button"
              onClick={() => setActiveTab('pengaturan')}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-sm"
            >
              Buka Pengaturan Sistem
            </button>
          </div>
        ) : (
          <AdminMadingManager
            announcements={announcements}
            addAnnouncement={addAnnouncement}
            deleteAnnouncement={deleteAnnouncement}
          />
        )
      )}

      {/* =========================================================================
          TAB 7: Pengaturan Sistem
         ========================================================================= */}
      {activeTab === 'pengaturan' && (
        <AdminSettingsManager
          settings={settings}
          updateSettings={updateSettings}
          isSettingsLoaded={isSettingsLoaded}
        />
      )}

      {/* Full Reading & Action Modal */}
      <AdminReadingModal
        isEvaluationMode={readingModalAspiration?.submissionType === 'evaluation'}
        aspiration={readingModalAspiration}
        onClose={() => setReadingModalAspiration(null)}
        onUpdateStatus={updateAspirationStatus}
        onAddResponse={addResponse}
        onDelete={deleteAspiration}
        onReload={() => {}}
      />
    </div>
  );
}
