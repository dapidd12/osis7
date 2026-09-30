import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Check, X, MessageCircleReply, Trash2, ChevronDown, ChevronUp, PieChart as PieChartIcon, Menu, ChevronLeft, ChevronRight, Loader2, Database, Eye, FileText, Maximize2, History, RotateCcw, ExternalLink, Megaphone, LayoutDashboard } from 'lucide-react';
import { cn } from '../lib/utils';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useSearchParams, Link } from 'react-router-dom';
import { collection, query, where, orderBy, limit, startAfter, getDocs, getCountFromServer, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Aspiration } from '../types';

export default function AdminDashboard() {
  const { aspirations, updateAspirationStatus, addResponse, deleteAspiration, announcements, addAnnouncement, deleteAnnouncement } = useAppContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'aspirasi';
  const setActiveTab = (tab: string) => setSearchParams({ tab });
  
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [isMobileTabOpen, setIsMobileTabOpen] = useState(false);

  // Message shortening and full read states
  const [expandedMessageIds, setExpandedMessageIds] = useState<Record<string, boolean>>({});
  const [readingModalAspiration, setReadingModalAspiration] = useState<Aspiration | null>(null);

  const toggleMessageExpand = (id: string) => {
    setExpandedMessageIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  // Announcement form state
  const [madingTitle, setMadingTitle] = useState('');
  const [madingContent, setMadingContent] = useState('');
  const [isAddingMading, setIsAddingMading] = useState(false);

  // Database-driven Pagination state
  const [aspirationFilter, setAspirationFilter] = useState<'Pending' | 'Approved' | 'Rejected'>('Pending');
  const [aspirationPage, setAspirationPage] = useState(1);
  const [pageAspirations, setPageAspirations] = useState<Aspiration[]>([]);
  const [isLoadingDb, setIsLoadingDb] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev'>('next');
  
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
      // 1. Fetch exact total count from Firestore
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
      if (dir !== 'reset') {
        setSlideDirection(dir);
      }
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

  // Fetch page 1 when filter changes or on mount
  useEffect(() => {
    pageCursorsRef.current = { 1: null };
    setAspirationPage(1);
    loadAspirationsPage(1, aspirationFilter, 'reset');
  }, [aspirationFilter, loadAspirationsPage]);

  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));

  const handleNextPage = () => {
    if (aspirationPage >= totalPages || isLoadingDb) return;
    setExpandedId(null);
    loadAspirationsPage(aspirationPage + 1, aspirationFilter, 'next');
  };

  const handlePrevPage = () => {
    if (aspirationPage <= 1 || isLoadingDb) return;
    setExpandedId(null);
    loadAspirationsPage(aspirationPage - 1, aspirationFilter, 'prev');
  };

  const stats = {
    total: aspirations.length,
    pending: aspirations.filter(a => a.status === 'Pending').length,
    approved: aspirations.filter(a => a.status === 'Approved').length,
    rejected: aspirations.filter(a => a.status === 'Rejected').length,
  };

  // Prepare data for the chart
  const categoryCounts = aspirations.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.keys(categoryCounts).map(key => ({
    name: key,
    value: categoryCounts[key]
  }));

  const COLORS = ['#38bdf8', '#fbbf24', '#34d399', '#f87171', '#818cf8'];

  const handleResponseSubmit = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!responseText.trim()) return;
    await addResponse(id, responseText);
    setResponseText('');
    setExpandedId(null);
    loadAspirationsPage(aspirationPage, aspirationFilter, 'reset');
  };

  const handleMadingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!madingTitle.trim() || !madingContent.trim()) return;
    // We use a default author for simplicity since it's just 'osis123' logging in
    addAnnouncement(madingTitle, madingContent, 'Admin OSIS');
    setMadingTitle('');
    setMadingContent('');
    setIsAddingMading(false);
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Panel Administrasi OSIS</h1>
            <span className="text-[11px] font-bold text-sky-800 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full">
              SMAN 1 Kemangkon
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Pusat pengelolaan, persetujuan, dan tanggapan resmi aspirasi siswa secara real-time.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/papan"
            target="_blank"
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs"
            title="Buka Papan Aspirasi Siswa"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            <span>Lihat Papan Publik</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <button
          type="button"
          onClick={() => { setActiveTab('aspirasi'); setAspirationFilter('Pending'); }}
          className="text-left bg-white p-6 rounded-3xl shadow-sm border border-slate-200 hover:border-slate-400 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-500">Total Aspirasi Masuk</p>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">Semua Siswa</span>
          </div>
          <p className="text-4xl font-extrabold text-slate-900 mt-2">{stats.total}</p>
          <p className="text-xs text-slate-400 mt-1">Akumulasi seluruh pengirim di database</p>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('aspirasi'); setAspirationFilter('Pending'); }}
          className={cn(
            "text-left p-6 rounded-3xl shadow-sm border transition-all cursor-pointer",
            activeTab === 'aspirasi' && aspirationFilter === 'Pending'
              ? "bg-amber-100/70 border-amber-300 ring-2 ring-amber-400/50 shadow-md"
              : "bg-amber-50 border-amber-100 hover:border-amber-300 hover:shadow-md"
          )}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-amber-700">Perlu Ditinjau</p>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">Pending</span>
          </div>
          <p className="text-4xl font-extrabold text-amber-700 mt-2">{stats.pending}</p>
          <p className="text-xs text-amber-700/70 mt-1 font-medium">Aspirasi menunggu persetujuan &rarr;</p>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('disetujui')}
          className={cn(
            "text-left p-6 rounded-3xl shadow-sm border transition-all cursor-pointer",
            activeTab === 'disetujui'
              ? "bg-green-100/70 border-green-300 ring-2 ring-green-400/50 shadow-md"
              : "bg-green-50 border-green-100 hover:border-green-300 hover:shadow-md"
          )}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-green-700">Disetujui</p>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-800">Approved</span>
          </div>
          <p className="text-4xl font-extrabold text-green-700 mt-2">{stats.approved}</p>
          <p className="text-xs text-green-700/70 mt-1 font-medium">Buka Riwayat Disetujui &rarr;</p>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('aspirasi'); setAspirationFilter('Rejected'); }}
          className={cn(
            "text-left p-6 rounded-3xl shadow-sm border transition-all cursor-pointer",
            activeTab === 'aspirasi' && aspirationFilter === 'Rejected'
              ? "bg-red-100/70 border-red-300 ring-2 ring-red-400/50 shadow-md"
              : "bg-red-50 border-red-100 hover:border-red-300 hover:shadow-md"
          )}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-red-600">Ditolak</p>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">Rejected</span>
          </div>
          <p className="text-4xl font-extrabold text-red-700 mt-2">{stats.rejected}</p>
          <p className="text-xs text-red-600/70 mt-1 font-medium">Aspirasi tidak dipublikasi &rarr;</p>
        </button>
      </div>

      {/* Chart Section */}
      {aspirations.length > 0 && (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-sky-500" />
            Distribusi Kategori Aspirasi
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Main Tab Navigation */}
      <div className="flex border-b border-slate-200 gap-2 pb-px overflow-x-auto">
        <button
          type="button"
          onClick={() => { setActiveTab('aspirasi'); setAspirationFilter('Pending'); }}
          className={cn(
            "flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-sm transition-all whitespace-nowrap cursor-pointer",
            activeTab === 'aspirasi'
              ? "border-sky-600 text-sky-600 bg-sky-50/50 rounded-t-xl"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
          )}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Aspirasi Masuk</span>
          {stats.pending > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-800 font-extrabold">
              {stats.pending}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('disetujui')}
          className={cn(
            "flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-sm transition-all whitespace-nowrap cursor-pointer",
            activeTab === 'disetujui'
              ? "border-green-600 text-green-700 bg-green-50/50 rounded-t-xl"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
          )}
        >
          <History className="w-4 h-4" />
          <span>Riwayat Disetujui</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800 font-extrabold">
            {stats.approved}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('mading')}
          className={cn(
            "flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-sm transition-all whitespace-nowrap cursor-pointer",
            activeTab === 'mading'
              ? "border-sky-600 text-sky-600 bg-sky-50/50 rounded-t-xl"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
          )}
        >
          <Megaphone className="w-4 h-4" />
          <span>Kelola Mading</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600 font-semibold">
            {announcements.length}
          </span>
        </button>
      </div>



      {activeTab === 'aspirasi' ? (
        /* Aspirations List */
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 sm:px-8 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">Daftar Aspirasi</h2>
                  <span className="flex items-center gap-1 text-[11px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full">
                    <Database className="w-3 h-3 text-sky-500" />
                    Load per 5 dari Database
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Pesan dimuat per 5 data dari database saat menekan tombol Selanjutnya. Kategori ini: <strong className="text-slate-800">{totalCount}</strong> aspirasi &bull; Total keseluruhan: <strong className="text-slate-800">{stats.total}</strong> aspirasi.
                </p>
              </div>

              {totalPages > 1 && (
                <div className="inline-flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl text-xs font-semibold text-slate-600 self-start sm:self-auto shadow-inner">
                  <span className="px-2">Hal {aspirationPage} dari {totalPages}</span>
                  <button
                    onClick={handlePrevPage}
                    disabled={aspirationPage === 1 || isLoadingDb}
                    className="p-1 rounded-lg bg-white shadow-xs hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-all"
                    title="Halaman Sebelumnya"
                  >
                    <ChevronLeft className="w-4 h-4 text-slate-700" />
                  </button>
                  <button
                    onClick={handleNextPage}
                    disabled={aspirationPage === totalPages || isLoadingDb}
                    className="p-1 rounded-lg bg-white shadow-xs hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-all"
                    title="Halaman Selanjutnya"
                  >
                    <ChevronRight className="w-4 h-4 text-slate-700" />
                  </button>
                </div>
              )}
            </div>

            {/* Sub-tabs for Aspirasi */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setAspirationFilter('Pending')}
                className={cn("px-4 py-2 text-sm font-bold rounded-xl transition-all", aspirationFilter === 'Pending' ? "bg-amber-100 text-amber-800" : "bg-slate-50 text-slate-500 hover:bg-slate-100")}
              >
                Menunggu ({stats.pending})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('disetujui')}
                className="px-4 py-2 text-sm font-bold rounded-xl transition-all bg-green-50 text-green-700 hover:bg-green-100 flex items-center gap-1.5 cursor-pointer"
                title="Buka tab Riwayat Disetujui khusus pesan yang sudah disetujui"
              >
                <History className="w-3.5 h-3.5" />
                <span>Disetujui ({stats.approved})</span>
                <span className="text-xs font-black">&rarr;</span>
              </button>
              <button
                onClick={() => setAspirationFilter('Rejected')}
                className={cn("px-4 py-2 text-sm font-bold rounded-xl transition-all", aspirationFilter === 'Rejected' ? "bg-red-100 text-red-800" : "bg-slate-50 text-slate-500 hover:bg-slate-100")}
              >
                Ditolak ({stats.rejected})
              </button>
            </div>
          </div>
          
          {isLoadingDb ? (
            <div className="p-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-sky-600 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-600">Memuat 5 pesan dari database...</p>
            </div>
          ) : pageAspirations.length === 0 ? (
            <div className="p-12 text-center text-slate-500">Belum ada aspirasi di kategori ini.</div>
          ) : (
            <div 
              key={`page-${aspirationFilter}-${aspirationPage}`}
              className={cn(
                "divide-y divide-slate-100 transition-all duration-300",
                slideDirection === 'next' 
                  ? "animate-in fade-in slide-in-from-right-6 duration-300"
                  : "animate-in fade-in slide-in-from-left-6 duration-300"
              )}
            >
              {pageAspirations.map((aspiration) => (
                <div key={aspiration.id} className="p-6 sm:px-8 hover:bg-slate-50/50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                          aspiration.status === 'Pending' ? "bg-amber-100 text-amber-800" :
                          aspiration.status === 'Approved' ? "bg-green-100 text-green-800" :
                          "bg-red-100 text-red-800"
                        )}>
                          {aspiration.status}
                        </span>
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                          {aspiration.category}
                        </span>
                        <span className="text-xs text-slate-400">
                          {formatDistanceToNow(new Date(aspiration.createdAt), { addSuffix: true, locale: localeId })}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug break-words">{aspiration.subject}</h3>
                      
                      {/* Pesan aspirasi: disingkat rapi secara default agar tidak penuh, dengan opsi baca selengkapnya */}
                      {(() => {
                        const isExpanded = !!expandedMessageIds[aspiration.id];
                        const isLong = (aspiration.message?.length || 0) > 130 || aspiration.message?.includes('\n');

                        if (!isLong) {
                          return (
                            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 my-3">
                              <p className="text-sm text-slate-800 leading-relaxed break-words whitespace-pre-wrap">
                                {aspiration.message}
                              </p>
                            </div>
                          );
                        }

                        return (
                          <div className={cn(
                            "border rounded-2xl p-4 my-3 transition-all duration-200",
                            isExpanded 
                              ? "bg-sky-50/40 border-sky-200/90 shadow-xs" 
                              : "bg-slate-50/80 border-slate-200/80"
                          )}>
                            {isExpanded && (
                              <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-sky-100 text-xs font-bold text-sky-800">
                                <span className="flex items-center gap-1.5">
                                  <FileText className="w-3.5 h-3.5 text-sky-600" />
                                  Teks Pesan Lengkap:
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setReadingModalAspiration(aspiration)}
                                  className="text-[11px] font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1 hover:underline"
                                  title="Buka tampilan modal dialog"
                                >
                                  <Maximize2 className="w-3 h-3" />
                                  Buka Pop-up
                                </button>
                              </div>
                            )}

                            <p className={cn(
                              "text-sm text-slate-800 leading-relaxed break-words",
                              isExpanded ? "whitespace-pre-wrap" : "line-clamp-2 text-slate-700"
                            )}>
                              {aspiration.message}
                            </p>

                            <div className="flex items-center gap-2 mt-3 pt-1">
                              <button
                                type="button"
                                onClick={() => toggleMessageExpand(aspiration.id)}
                                className={cn(
                                  "inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-2xs",
                                  isExpanded
                                    ? "bg-white hover:bg-slate-100 text-slate-600 border border-slate-200"
                                    : "bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200/80"
                                )}
                              >
                                {isExpanded ? (
                                  <>
                                    <span>Tutup / Singkat Teks</span>
                                    <ChevronUp className="w-3.5 h-3.5" />
                                  </>
                                ) : (
                                  <>
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>Baca Selengkapnya</span>
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  </>
                                )}
                              </button>

                              {!isExpanded && (
                                <button
                                  type="button"
                                  onClick={() => setReadingModalAspiration(aspiration)}
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 px-2.5 py-1.5 rounded-xl transition-colors"
                                  title="Buka modal baca lengkap"
                                >
                                  <Maximize2 className="w-3 h-3" />
                                  <span>Buka Pop-up</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Status Tanggapan OSIS jika sudah ada */}
                      {aspiration.response && (
                        <div className="bg-sky-50 border border-sky-100 rounded-2xl p-3.5 mb-3 flex items-start gap-2.5">
                          <MessageCircleReply className="w-4 h-4 text-sky-600 mt-0.5 shrink-0" />
                          <div className="text-xs text-sky-950">
                            <span className="font-bold text-sky-800">Tanggapan OSIS: </span>
                            <span className="whitespace-pre-wrap">{aspiration.response}</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="text-sm font-medium text-slate-500 flex items-center gap-2 mt-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs text-slate-600">
                          {aspiration.isAnonymous ? '?' : aspiration.authorName?.charAt(0).toUpperCase()}
                        </div>
                        Dari: <span className="font-semibold text-slate-700">{aspiration.isAnonymous ? 'Anonim' : aspiration.authorName}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0">
                      {aspiration.status === 'Pending' && (
                        <>
                          <button
                            onClick={async () => {
                              await updateAspirationStatus(aspiration.id, 'Approved');
                              loadAspirationsPage(aspirationPage, aspirationFilter, 'reset');
                            }}
                            className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 rounded-xl transition-colors text-sm font-bold"
                            title="Setujui (Tampil di Publik)"
                          >
                            <Check className="w-4 h-4" />
                            Setujui
                          </button>
                          <button
                            onClick={async () => {
                              await updateAspirationStatus(aspiration.id, 'Rejected');
                              loadAspirationsPage(aspirationPage, aspirationFilter, 'reset');
                            }}
                            className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 rounded-xl transition-colors text-sm font-bold"
                            title="Tolak"
                          >
                            <X className="w-4 h-4" />
                            Tolak
                          </button>
                        </>
                      )}
                      
                      <button
                        onClick={() => {
                          if (expandedId === aspiration.id) {
                            setExpandedId(null);
                          } else {
                            setExpandedId(aspiration.id);
                            setResponseText(aspiration.response || '');
                          }
                        }}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-xl transition-colors text-sm font-bold",
                          aspiration.response 
                            ? "bg-sky-100 text-sky-800 hover:bg-sky-200" 
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        )}
                      >
                        <MessageCircleReply className="w-4 h-4" />
                        {aspiration.response ? 'Edit Balasan' : 'Beri Balasan'}
                        {expandedId === aspiration.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      
                      <button
                        onClick={async () => {
                          if (window.confirm('Yakin ingin menghapus aspirasi ini?')) {
                            await deleteAspiration(aspiration.id);
                            loadAspirationsPage(aspirationPage, aspirationFilter, 'reset');
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Section for Reply */}
                  {expandedId === aspiration.id && (
                    <div className="mt-6 pt-6 border-t border-slate-200 animate-in fade-in slide-in-from-top-2">
                      <form onSubmit={(e) => handleResponseSubmit(e, aspiration.id)}>
                        <label className="block text-sm font-bold text-slate-900 mb-2">
                          {aspiration.response ? 'Perbarui Tanggapan OSIS' : 'Tulis Tanggapan Resmi OSIS'}
                        </label>
                        <textarea
                          rows={4}
                          value={responseText}
                          onChange={e => setResponseText(e.target.value)}
                          placeholder="Ketik tanggapan resmi dari OSIS di sini..."
                          className="w-full px-5 py-4 bg-white border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all resize-none mb-4"
                        />
                        <div className="flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => setExpandedId(null)}
                            className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                          >
                            Batal
                          </button>
                          <button
                            type="submit"
                            className="px-6 py-2.5 text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 rounded-xl transition-colors"
                          >
                            Simpan Tanggapan
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 sm:p-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/60">
              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium order-2 sm:order-1">
                <Database className="w-4 h-4 text-sky-500 shrink-0" />
                <span>
                  Menampilkan <strong className="text-slate-800">{(aspirationPage - 1) * itemsPerPage + 1}–{(aspirationPage - 1) * itemsPerPage + pageAspirations.length}</strong> dari <strong className="text-slate-800">{totalCount}</strong> aspirasi di database
                </span>
              </div>
              
              <div className="flex items-center gap-2 order-1 sm:order-2">
                <button
                  onClick={handlePrevPage}
                  disabled={aspirationPage === 1 || isLoadingDb}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold bg-white border border-slate-200 text-slate-700 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-all shadow-xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Sebelumnya</span>
                </button>

                <span className="px-3.5 py-2 bg-sky-50 border border-sky-200 text-sky-700 rounded-xl text-xs font-bold shadow-xs">
                  Hal {aspirationPage} / {totalPages}
                </span>

                <button
                  onClick={handleNextPage}
                  disabled={aspirationPage === totalPages || isLoadingDb}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold bg-white border border-slate-200 text-slate-700 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-all shadow-xs"
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
      ) : activeTab === 'disetujui' ? (
        /* Riwayat Aspirasi Disetujui (Approved History) */
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 sm:px-8 border-b border-slate-200 bg-gradient-to-r from-green-50/70 via-emerald-50/30 to-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-green-100 text-green-700 flex items-center justify-center">
                    <History className="w-4 h-4" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">Riwayat Aspirasi Disetujui</h2>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-green-800 bg-green-100 border border-green-200 px-3 py-1 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Tampil di Papan Publik
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
                  Pesan aspirasi di bawah ini telah disetujui dan aktif tampil di Papan Aspirasi siswa. Pengurus OSIS tetap dapat <strong>memberi balasan</strong>, <strong>mengubah balasan</strong>, <strong>menarik kembali ke status pending</strong>, maupun <strong>menghapus aspirasi</strong> kapan saja.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to="/papan"
                  target="_blank"
                  className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-xl transition-all border border-sky-200 shadow-2xs shrink-0"
                  title="Buka Papan Aspirasi Siswa di tab baru"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Lihat Papan Publik</span>
                </Link>

                {totalPages > 1 && (
                  <div className="inline-flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl text-xs font-semibold text-slate-600 self-start sm:self-auto shadow-inner">
                    <span className="px-2">Hal {aspirationPage} dari {totalPages}</span>
                    <button
                      onClick={handlePrevPage}
                      disabled={aspirationPage === 1 || isLoadingDb}
                      className="p-1 rounded-lg bg-white shadow-xs hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-all"
                      title="Halaman Sebelumnya"
                    >
                      <ChevronLeft className="w-4 h-4 text-slate-700" />
                    </button>
                    <button
                      onClick={handleNextPage}
                      disabled={aspirationPage === totalPages || isLoadingDb}
                      className="p-1 rounded-lg bg-white shadow-xs hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-all"
                      title="Halaman Selanjutnya"
                    >
                      <ChevronRight className="w-4 h-4 text-slate-700" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Quick stats mini counters */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-green-100">
              <div className="bg-white/80 border border-green-200/70 rounded-2xl p-3">
                <p className="text-[11px] font-bold text-slate-500">Total Disetujui</p>
                <p className="text-xl font-black text-slate-900 mt-0.5">{stats.approved} <span className="text-xs font-semibold text-slate-500">pesan</span></p>
              </div>
              <div className="bg-white/80 border border-green-200/70 rounded-2xl p-3">
                <p className="text-[11px] font-bold text-sky-600">Sudah Diberi Balasan</p>
                <p className="text-xl font-black text-sky-700 mt-0.5">
                  {aspirations.filter(a => a.status === 'Approved' && a.response).length} <span className="text-xs font-semibold text-sky-600">pesan</span>
                </p>
              </div>
              <div className="bg-white/80 border border-green-200/70 rounded-2xl p-3 col-span-2 sm:col-span-1">
                <p className="text-[11px] font-bold text-amber-600">Belum Ada Balasan</p>
                <p className="text-xl font-black text-amber-700 mt-0.5">
                  {aspirations.filter(a => a.status === 'Approved' && !a.response).length} <span className="text-xs font-semibold text-amber-600">pesan</span>
                </p>
              </div>
            </div>
          </div>

          {isLoadingDb ? (
            <div className="p-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-green-600 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-600">Memuat 5 pesan disetujui dari database...</p>
            </div>
          ) : pageAspirations.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mx-auto">
                <History className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Belum ada aspirasi yang disetujui</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Aspirasi yang Anda setujui di tab "Aspirasi Masuk" akan otomatis masuk ke sini dan tampil di papan aspirasi siswa.
              </p>
              <button
                type="button"
                onClick={() => { setActiveTab('aspirasi'); setAspirationFilter('Pending'); }}
                className="mt-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Ke Aspirasi Masuk &rarr;
              </button>
            </div>
          ) : (
            <div
              key={`page-approved-${aspirationPage}`}
              className={cn(
                "divide-y divide-slate-100 transition-all duration-300",
                slideDirection === 'next'
                  ? "animate-in fade-in slide-in-from-right-6 duration-300"
                  : "animate-in fade-in slide-in-from-left-6 duration-300"
              )}
            >
              {pageAspirations.map((aspiration) => (
                <div key={aspiration.id} className="p-6 sm:px-8 hover:bg-slate-50/50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5 mb-3">
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-green-100 text-green-800 border border-green-200">
                          Disetujui
                        </span>
                        <span className="text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                          {aspiration.category}
                        </span>
                        <span className="text-xs text-slate-400">
                          {formatDistanceToNow(new Date(aspiration.createdAt), { addSuffix: true, locale: localeId })}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug break-words">
                        {aspiration.subject}
                      </h3>

                      {/* Pesan aspirasi: disingkat rapi secara default agar tidak penuh, dengan opsi baca selengkapnya */}
                      {(() => {
                        const isExpanded = !!expandedMessageIds[aspiration.id];
                        const isLong = (aspiration.message?.length || 0) > 130 || aspiration.message?.includes('\n');

                        if (!isLong) {
                          return (
                            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 my-3">
                              <p className="text-sm text-slate-800 leading-relaxed break-words whitespace-pre-wrap">
                                {aspiration.message}
                              </p>
                            </div>
                          );
                        }

                        return (
                          <div className={cn(
                            "border rounded-2xl p-4 my-3 transition-all duration-200",
                            isExpanded 
                              ? "bg-sky-50/40 border-sky-200/90 shadow-xs" 
                              : "bg-slate-50/80 border-slate-200/80"
                          )}>
                            {isExpanded && (
                              <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-sky-100 text-xs font-bold text-sky-800">
                                <span className="flex items-center gap-1.5">
                                  <FileText className="w-3.5 h-3.5 text-sky-600" />
                                  Teks Pesan Lengkap:
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setReadingModalAspiration(aspiration)}
                                  className="text-[11px] font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1 hover:underline cursor-pointer"
                                  title="Buka tampilan modal dialog"
                                >
                                  <Maximize2 className="w-3 h-3" />
                                  Buka Pop-up
                                </button>
                              </div>
                            )}

                            <p className={cn(
                              "text-sm text-slate-800 leading-relaxed break-words",
                              isExpanded ? "whitespace-pre-wrap" : "line-clamp-2 text-slate-700"
                            )}>
                              {aspiration.message}
                            </p>

                            <div className="flex items-center gap-2 mt-3 pt-1">
                              <button
                                type="button"
                                onClick={() => toggleMessageExpand(aspiration.id)}
                                className={cn(
                                  "inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-2xs cursor-pointer",
                                  isExpanded
                                    ? "bg-white hover:bg-slate-100 text-slate-600 border border-slate-200"
                                    : "bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200/80"
                                )}
                              >
                                {isExpanded ? (
                                  <>
                                    <span>Tutup / Singkat Teks</span>
                                    <ChevronUp className="w-3.5 h-3.5" />
                                  </>
                                ) : (
                                  <>
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>Baca Selengkapnya</span>
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  </>
                                )}
                              </button>

                              {!isExpanded && (
                                <button
                                  type="button"
                                  onClick={() => setReadingModalAspiration(aspiration)}
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer"
                                  title="Buka modal baca lengkap"
                                >
                                  <Maximize2 className="w-3 h-3" />
                                  <span>Buka Pop-up</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Status Tanggapan OSIS */}
                      {aspiration.response ? (
                        <div className="bg-sky-50 border border-sky-200/80 rounded-2xl p-4 mb-3">
                          <div className="flex items-center justify-between mb-1.5 text-xs font-bold text-sky-900">
                            <span className="flex items-center gap-2">
                              <MessageCircleReply className="w-4 h-4 text-sky-600" />
                              Tanggapan Resmi Pengurus OSIS:
                            </span>
                            <span className="text-[11px] font-medium text-sky-600 bg-sky-100/70 px-2 py-0.5 rounded-md">
                              Tampil di Papan Siswa
                            </span>
                          </div>
                          <p className="text-sm text-sky-950 whitespace-pre-wrap leading-relaxed">
                            {aspiration.response}
                          </p>
                        </div>
                      ) : (
                        <div className="bg-amber-50/70 border border-amber-200/70 rounded-2xl p-3 mb-3 text-xs text-amber-800 flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <MessageCircleReply className="w-4 h-4 text-amber-600" />
                            Aspirasi ini belum memiliki balasan resmi dari OSIS.
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setExpandedId(aspiration.id);
                              setResponseText('');
                            }}
                            className="font-bold text-amber-700 hover:underline hover:text-amber-900 text-xs cursor-pointer"
                          >
                            + Tulis Balasan Sekarang
                          </button>
                        </div>
                      )}

                      <div className="text-sm font-medium text-slate-500 flex items-center gap-2 mt-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs text-slate-600 font-bold">
                          {aspiration.isAnonymous ? '?' : (aspiration.authorName?.charAt(0).toUpperCase() || 'S')}
                        </div>
                        Dari: <span className="font-semibold text-slate-700">{aspiration.isAnonymous ? 'Anonim (Identitas Dirahasiakan)' : aspiration.authorName}</span>
                      </div>
                    </div>

                    {/* Action buttons specifically for Approved items */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 shrink-0">
                      {/* Reply / Edit Reply button */}
                      <button
                        type="button"
                        onClick={() => {
                          if (expandedId === aspiration.id) {
                            setExpandedId(null);
                          } else {
                            setExpandedId(aspiration.id);
                            setResponseText(aspiration.response || '');
                          }
                        }}
                        className={cn(
                          "flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all text-sm font-bold shadow-2xs cursor-pointer",
                          aspiration.response 
                            ? "bg-sky-100 text-sky-800 hover:bg-sky-200" 
                            : "bg-amber-500 text-white hover:bg-amber-600"
                        )}
                        title={aspiration.response ? "Edit isi balasan OSIS" : "Beri balasan resmi OSIS"}
                      >
                        <MessageCircleReply className="w-4 h-4" />
                        <span>{aspiration.response ? 'Edit Balasan' : 'Beri Balasan'}</span>
                        {expandedId === aspiration.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      {/* Revert / Tarik ke Pending button */}
                      <button
                        type="button"
                        onClick={async () => {
                          if (window.confirm('Tarik aspirasi ini dari Papan Aspirasi publik dan kembalikan ke status Pending untuk ditinjau ulang?')) {
                            await updateAspirationStatus(aspiration.id, 'Pending');
                            loadAspirationsPage(aspirationPage, 'Approved', 'reset');
                          }
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl transition-colors text-sm font-semibold cursor-pointer"
                        title="Tarik kembali dari publik ke status Pending"
                      >
                        <RotateCcw className="w-4 h-4 text-slate-500" />
                        <span>Tarik ke Pending</span>
                      </button>

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={async () => {
                          if (window.confirm('Yakin ingin menghapus aspirasi yang sudah disetujui ini? Aspirasi akan dihapus secara permanen dari database dan papan publik.')) {
                            await deleteAspiration(aspiration.id);
                            loadAspirationsPage(aspirationPage, 'Approved', 'reset');
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                        title="Hapus Aspirasi Permanen"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Section for Reply Form */}
                  {expandedId === aspiration.id && (
                    <div className="mt-6 pt-6 border-t border-slate-200 animate-in fade-in slide-in-from-top-2">
                      <form onSubmit={(e) => handleResponseSubmit(e, aspiration.id)}>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <MessageCircleReply className="w-4 h-4 text-sky-600" />
                            {aspiration.response ? 'Perbarui Tanggapan Resmi OSIS' : 'Tulis Tanggapan Resmi OSIS'}
                          </label>
                          <span className="text-xs text-slate-400">
                            Tanggapan ini akan langsung diperbarui di Papan Aspirasi Siswa
                          </span>
                        </div>
                        <textarea
                          rows={4}
                          value={responseText}
                          onChange={e => setResponseText(e.target.value)}
                          placeholder="Ketik tanggapan resmi dari OSIS di sini..."
                          className="w-full px-5 py-4 bg-white border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all resize-none mb-4"
                        />
                        <div className="flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => setExpandedId(null)}
                            className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                          >
                            Batal
                          </button>
                          <button
                            type="submit"
                            className="px-6 py-2.5 text-sm font-bold bg-sky-600 text-white hover:bg-sky-700 rounded-xl transition-colors shadow-sm cursor-pointer"
                          >
                            {aspiration.response ? 'Simpan Perubahan Balasan' : 'Kirim Balasan'}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls for Approved History */}
          {totalPages > 1 && (
            <div className="p-4 sm:p-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/60">
              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium order-2 sm:order-1">
                <Database className="w-4 h-4 text-green-500 shrink-0" />
                <span>
                  Menampilkan <strong className="text-slate-800">{(aspirationPage - 1) * itemsPerPage + 1}–{(aspirationPage - 1) * itemsPerPage + pageAspirations.length}</strong> dari <strong className="text-slate-800">{totalCount}</strong> aspirasi disetujui di database
                </span>
              </div>
              
              <div className="flex items-center gap-2 order-1 sm:order-2">
                <button
                  onClick={handlePrevPage}
                  disabled={aspirationPage === 1 || isLoadingDb}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold bg-white border border-slate-200 text-slate-700 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-all shadow-xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Sebelumnya</span>
                </button>

                <span className="px-3.5 py-2 bg-green-50 border border-green-200 text-green-800 rounded-xl text-xs font-bold shadow-xs">
                  Hal {aspirationPage} / {totalPages}
                </span>

                <button
                  onClick={handleNextPage}
                  disabled={aspirationPage === totalPages || isLoadingDb}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold bg-white border border-slate-200 text-slate-700 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-all shadow-xs"
                >
                  <span>Selanjutnya</span>
                  {isLoadingDb ? (
                    <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : activeTab === 'mading' ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900">Kelola Pengumuman Mading</h2>
            <button
              onClick={() => setIsAddingMading(!isAddingMading)}
              className="px-4 py-2 bg-sky-600 text-white font-bold rounded-xl hover:bg-sky-700 transition-colors text-sm"
            >
              {isAddingMading ? 'Batal Tambah' : '+ Buat Pengumuman'}
            </button>
          </div>

          {isAddingMading && (
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-top-2">
              <form onSubmit={handleMadingSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">Judul Pengumuman</label>
                  <input
                    type="text"
                    value={madingTitle}
                    onChange={(e) => setMadingTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                    placeholder="Contoh: Jadwal Class Meeting 2026"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">Isi Pengumuman</label>
                  <textarea
                    rows={5}
                    value={madingContent}
                    onChange={(e) => setMadingContent(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all resize-none"
                    placeholder="Tulis detail pengumuman di sini..."
                    required
                  />
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
                  >
                    Terbitkan Pengumuman
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="divide-y divide-slate-100">
              {announcements.length === 0 ? (
                <div className="p-12 text-center text-slate-500">Belum ada pengumuman di mading.</div>
              ) : (
                announcements.map((announcement) => (
                  <div key={announcement.id} className="p-6 hover:bg-slate-50/50 transition-colors flex justify-between items-start gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{announcement.title}</h3>
                      <p className="text-sm text-slate-600 mb-2 whitespace-pre-wrap break-words">{announcement.content}</p>
                      <span className="text-xs text-slate-400">
                        {formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true, locale: localeId })} oleh {announcement.author}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        if (window.confirm('Yakin ingin menghapus pengumuman ini?')) {
                          deleteAnnouncement(announcement.id);
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                      title="Hapus Pengumuman"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Modal Baca Lengkap Aspirasi Siswa */}
      {readingModalAspiration && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setReadingModalAspiration(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 sm:p-7 border-b border-slate-100 flex items-start justify-between gap-4 sticky top-0 bg-white/95 backdrop-blur-xs z-10">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={cn(
                    "px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider",
                    readingModalAspiration.status === 'Pending' ? "bg-amber-100 text-amber-800" :
                    readingModalAspiration.status === 'Approved' ? "bg-green-100 text-green-800" :
                    "bg-red-100 text-red-800"
                  )}>
                    {readingModalAspiration.status}
                  </span>
                  <span className="text-xs font-medium text-slate-600 bg-slate-100 px-3 py-0.5 rounded-full">
                    {readingModalAspiration.category}
                  </span>
                  <span className="text-xs text-slate-400">
                    {formatDistanceToNow(new Date(readingModalAspiration.createdAt), { addSuffix: true, locale: localeId })}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 break-words leading-snug">
                  {readingModalAspiration.subject}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setReadingModalAspiration(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors shrink-0"
                title="Tutup Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 sm:p-7 space-y-6 flex-1 overflow-y-auto">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Informasi Pengirim</p>
                <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-sm shrink-0">
                    {readingModalAspiration.isAnonymous ? '?' : (readingModalAspiration.authorName?.charAt(0).toUpperCase() || 'S')}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {readingModalAspiration.isAnonymous ? 'Siswa (Anonim)' : readingModalAspiration.authorName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {readingModalAspiration.isAnonymous ? 'Identitas dirahasiakan oleh sistem' : 'Siswa SMAN 1 Kemangkon'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Isi Pesan Aspirasi Lengkap</p>
                  <span className="text-xs font-medium text-slate-400">{readingModalAspiration.message.length} karakter</span>
                </div>
                <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 text-sm sm:text-base text-slate-800 leading-relaxed break-words whitespace-pre-wrap selection:bg-sky-100 font-normal">
                  {readingModalAspiration.message}
                </div>
              </div>

              {readingModalAspiration.response && (
                <div className="bg-sky-50/70 border border-sky-100 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold text-sky-800">
                    <MessageCircleReply className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>Tanggapan Resmi OSIS:</span>
                  </div>
                  <p className="text-sm text-sky-950 whitespace-pre-wrap leading-relaxed">
                    {readingModalAspiration.response}
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/80 rounded-b-3xl flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {readingModalAspiration.status === 'Pending' && (
                  <>
                    <button
                      type="button"
                      onClick={async () => {
                        await updateAspirationStatus(readingModalAspiration.id, 'Approved');
                        setReadingModalAspiration(null);
                        loadAspirationsPage(aspirationPage, aspirationFilter, 'reset');
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-xl transition-colors text-xs sm:text-sm font-bold shadow-xs"
                    >
                      <Check className="w-4 h-4" />
                      Setujui
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await updateAspirationStatus(readingModalAspiration.id, 'Rejected');
                        setReadingModalAspiration(null);
                        loadAspirationsPage(aspirationPage, aspirationFilter, 'reset');
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-xl transition-colors text-xs sm:text-sm font-bold shadow-xs cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                      Tolak
                    </button>
                  </>
                )}

                {readingModalAspiration.status === 'Approved' && (
                  <>
                    <button
                      type="button"
                      onClick={async () => {
                        if (window.confirm('Tarik aspirasi ini dari Papan Aspirasi publik dan kembalikan ke status Pending untuk ditinjau ulang?')) {
                          await updateAspirationStatus(readingModalAspiration.id, 'Pending');
                          setReadingModalAspiration(null);
                          loadAspirationsPage(aspirationPage, aspirationFilter, 'reset');
                        }
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl transition-colors text-xs sm:text-sm font-semibold cursor-pointer"
                      title="Kembalikan status ke Pending"
                    >
                      <RotateCcw className="w-4 h-4 text-slate-500" />
                      Tarik ke Pending
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (window.confirm('Yakin ingin menghapus aspirasi yang sudah disetujui ini? Tindakan ini permanen.')) {
                          await deleteAspiration(readingModalAspiration.id);
                          setReadingModalAspiration(null);
                          loadAspirationsPage(aspirationPage, aspirationFilter, 'reset');
                        }
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-xl transition-colors text-xs sm:text-sm font-bold cursor-pointer"
                      title="Hapus aspirasi"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                      Hapus
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => {
                    const asp = readingModalAspiration;
                    setReadingModalAspiration(null);
                    setExpandedId(asp.id);
                    setResponseText(asp.response || '');
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-sky-100 text-sky-800 hover:bg-sky-200 rounded-xl transition-colors text-xs sm:text-sm font-bold cursor-pointer"
                >
                  <MessageCircleReply className="w-4 h-4" />
                  {readingModalAspiration.response ? 'Edit Tanggapan' : 'Beri Tanggapan'}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setReadingModalAspiration(null)}
                className="px-5 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
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
