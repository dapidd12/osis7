import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { 
  collection, query, where, orderBy, limit, startAfter, 
  getDocs, getCountFromServer, QueryDocumentSnapshot, DocumentData 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAppContext } from '../context/AppContext';
import { Aspiration } from '../types';

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
  const activeTab = searchParams.get('tab') || 'aspirasi';
  const setActiveTab = (tab: string) => setSearchParams({ tab });

  // Reading Modal state
  const [readingModalAspiration, setReadingModalAspiration] = useState<Aspiration | null>(null);

  // Database-driven Pagination state (5 items per page)
  const [aspirationFilter, setAspirationFilter] = useState<'Pending' | 'Approved' | 'Rejected'>('Pending');
  const [aspirationPage, setAspirationPage] = useState(1);
  const [pageAspirations, setPageAspirations] = useState<Aspiration[]>([]);
  const [isLoadingDb, setIsLoadingDb] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Store cursor snapshots for each page boundary
  const pageCursorsRef = useRef<{ [page: number]: QueryDocumentSnapshot<DocumentData> | null }>({ 1: null });
  const itemsPerPage = 5;

  const loadAspirationsPage = useCallback(async (
    targetPage: number,
    filter: 'Pending' | 'Approved' | 'Rejected',
    dir: 'next' | 'prev' | 'reset' = 'next'
  ) => {
    setIsLoadingDb(true);
    try {
      // 1. Fetch exact total count from Firestore for this status
      const countSnap = await getCountFromServer(
        query(collection(db, 'aspirations'), where('status', '==', filter))
      );
      const count = countSnap.data().count;
      setTotalCount(count);

      // 2. Determine cursor
      const cursor = dir === 'reset' || targetPage === 1 ? null : pageCursorsRef.current[targetPage - 1];

      // 3. Query Firestore for 5 items
      let q = query(
        collection(db, 'aspirations'),
        where('status', '==', filter),
        orderBy('createdAt', 'desc'),
        limit(itemsPerPage)
      );

      if (cursor) {
        q = query(
          collection(db, 'aspirations'),
          where('status', '==', filter),
          orderBy('createdAt', 'desc'),
          startAfter(cursor),
          limit(itemsPerPage)
        );
      }

      const snap = await getDocs(q);
      const items: Aspiration[] = snap.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt || new Date().toISOString())
        } as Aspiration;
      });

      // Save cursor for this page
      if (snap.docs.length > 0) {
        const lastDoc = snap.docs[snap.docs.length - 1];
        pageCursorsRef.current[targetPage] = lastDoc;
      }

      setPageAspirations(items);
      setAspirationPage(targetPage);
    } catch (err) {
      console.error("Gagal memuat aspirasi dari database:", err);
    } finally {
      setIsLoadingDb(false);
    }
  }, []);

  // Sync activeTab with aspirationFilter
  useEffect(() => {
    if (activeTab === 'disetujui') {
      setAspirationFilter('Approved');
    } else if (activeTab === 'aspirasi') {
      setAspirationFilter(prev => (prev === 'Approved' ? 'Pending' : prev));
    }
  }, [activeTab]);

  // Fetch page 1 when filter changes
  useEffect(() => {
    pageCursorsRef.current = { 1: null };
    setAspirationPage(1);
    loadAspirationsPage(1, aspirationFilter, 'reset');
  }, [aspirationFilter, loadAspirationsPage]);

  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));

  const handleNextPage = () => {
    if (aspirationPage >= totalPages || isLoadingDb) return;
    loadAspirationsPage(aspirationPage + 1, aspirationFilter, 'next');
  };

  const handlePrevPage = () => {
    if (aspirationPage <= 1 || isLoadingDb) return;
    loadAspirationsPage(aspirationPage - 1, aspirationFilter, 'prev');
  };

  const reloadCurrentPage = () => {
    loadAspirationsPage(aspirationPage, aspirationFilter, 'reset');
  };

  // High-level stats
  const stats = {
    total: aspirations.length,
    pending: aspirations.filter(a => a.status === 'Pending').length,
    approved: aspirations.filter(a => a.status === 'Approved').length,
    rejected: aspirations.filter(a => a.status === 'Rejected').length,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Tab 1: Aspirasi Masuk */}
      {activeTab === 'aspirasi' && (
        <AdminAspirasiList
          aspirationFilter={aspirationFilter}
          setAspirationFilter={setAspirationFilter}
          pageAspirations={pageAspirations}
          isLoadingDb={isLoadingDb}
          totalCount={totalCount}
          totalAllAspirations={stats.total}
          pendingCount={stats.pending}
          rejectedCount={stats.rejected}
          aspirationPage={aspirationPage}
          totalPages={totalPages}
          handlePrevPage={handlePrevPage}
          handleNextPage={handleNextPage}
          onUpdateStatus={updateAspirationStatus}
          onAddResponse={addResponse}
          onDeleteAspiration={deleteAspiration}
          onOpenModal={(asp) => setReadingModalAspiration(asp)}
          onReload={reloadCurrentPage}
        />
      )}

      {/* Tab 2: Riwayat Disetujui */}
      {activeTab === 'disetujui' && (
        <AdminDisetujuiList
          pageAspirations={pageAspirations}
          isLoadingDb={isLoadingDb}
          totalCount={totalCount}
          totalApprovedAll={stats.approved}
          aspirationPage={aspirationPage}
          totalPages={totalPages}
          handlePrevPage={handlePrevPage}
          handleNextPage={handleNextPage}
          onUpdateStatus={updateAspirationStatus}
          onAddResponse={addResponse}
          onDeleteAspiration={deleteAspiration}
          onOpenModal={(asp) => setReadingModalAspiration(asp)}
          onReload={reloadCurrentPage}
        />
      )}

      {/* Tab 3: Dedicated Statistik & Diagram Analisis */}
      {activeTab === 'statistik' && (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Statistik & Diagram Analisis
                </h1>
                <span className="text-[10px] font-bold text-sky-800 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full">
                  SMAN 1 Kemangkon
                </span>
              </div>
              <p className="text-slate-500 text-xs sm:text-sm max-w-2xl leading-relaxed">
                Visualisasi data komprehensif demografi kategori suara siswa, status verifikasi, dan performa tanggapan OSIS.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <Link
                to="/papan"
                target="_blank"
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs"
                title="Buka Papan Aspirasi Siswa"
              >
                <span>Lihat Papan Publik</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>

          <AdminStatsCards
            stats={stats}
            activeTab={activeTab}
            aspirationFilter={aspirationFilter}
            onSelectTotal={() => { setActiveTab('aspirasi'); setAspirationFilter('Pending'); }}
            onSelectPending={() => { setActiveTab('aspirasi'); setAspirationFilter('Pending'); }}
            onSelectApproved={() => { setActiveTab('disetujui'); }}
            onSelectRejected={() => { setActiveTab('aspirasi'); setAspirationFilter('Rejected'); }}
          />

          <AdminProfessionalCharts aspirations={aspirations} />
        </div>
      )}

      {/* Tab 4: Kelola Mading */}
      {activeTab === 'mading' && (
        <AdminMadingManager
          announcements={announcements}
          addAnnouncement={addAnnouncement}
          deleteAnnouncement={deleteAnnouncement}
        />
      )}

      {/* Tab 5: Pengaturan Sistem */}
      {activeTab === 'pengaturan' && (
        <AdminSettingsManager
          settings={settings}
          updateSettings={updateSettings}
          isSettingsLoaded={isSettingsLoaded}
        />
      )}

      {/* Full Reading & Action Modal */}
      <AdminReadingModal
        aspiration={readingModalAspiration}
        onClose={() => setReadingModalAspiration(null)}
        onUpdateStatus={updateAspirationStatus}
        onAddResponse={addResponse}
        onDelete={deleteAspiration}
        onReload={reloadCurrentPage}
      />
    </div>
  );
}
