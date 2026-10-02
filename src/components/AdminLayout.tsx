import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, LogOut, Megaphone, Menu, X, History, 
  Settings, BarChart3, ExternalLink, ShieldCheck, Sparkles 
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppContext } from '../context/AppContext';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings, aspirations, announcements } = useAppContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    if (window.confirm('Keluar dari Panel Admin OSIS?')) {
      localStorage.removeItem('adminAuth');
      navigate('/pengurus/login');
    }
  };

  // Simple auth check - don't render layout if on login page
  if (location.pathname === '/pengurus/login') {
    return <Outlet />;
  }

  // Redirect if not logged in
  if (typeof window !== 'undefined' && localStorage.getItem('adminAuth') !== 'true') {
    return <Navigate to="/pengurus/login" replace />;
  }

  const currentTab = new URLSearchParams(location.search).get('tab') || 'aspirasi';

  const pendingCount = aspirations.filter(a => a.status === 'Pending').length;
  const approvedCount = aspirations.filter(a => a.status === 'Approved').length;

  const menuItems = [
    {
      to: '/pengurus/dashboard?tab=aspirasi',
      tabKey: 'aspirasi',
      label: 'Aspirasi Masuk',
      icon: LayoutDashboard,
      badge: pendingCount > 0 ? pendingCount : undefined,
      badgeColor: 'bg-amber-500 text-slate-950',
    },
    {
      to: '/pengurus/dashboard?tab=disetujui',
      tabKey: 'disetujui',
      label: 'Riwayat Disetujui',
      icon: History,
      badge: approvedCount > 0 ? approvedCount : undefined,
      badgeColor: 'bg-emerald-500 text-slate-950',
    },
    {
      to: '/pengurus/dashboard?tab=statistik',
      tabKey: 'statistik',
      label: 'Statistik & Diagram',
      icon: BarChart3,
    },
    {
      to: '/pengurus/dashboard?tab=mading',
      tabKey: 'mading',
      label: 'Kelola Mading',
      icon: Megaphone,
      badge: announcements.length > 0 ? announcements.length : undefined,
      badgeColor: 'bg-slate-700 text-slate-200',
    },
    {
      to: '/pengurus/dashboard?tab=pengaturan',
      tabKey: 'pengaturan',
      label: 'Pengaturan Sistem',
      icon: Settings,
      dotAlert: settings.isMaintenanceMode || !settings.isAspirationOpen,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100/70 font-sans text-slate-900 flex flex-col lg:flex-row">
      {/* Mobile Top Bar */}
      <header className="lg:hidden flex items-center justify-between p-4 bg-slate-900 text-white sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 -ml-2 text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Buka Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500 overflow-hidden shrink-0 flex items-center justify-center p-0.5 shadow-inner">
              <img 
                src="https://raw.githubusercontent.com/dapidd12/storage/main/tes/1788314699811-20260902_090434.png" 
                alt="Logo OSIS" 
                className="w-full h-full object-contain" 
              />
            </div>
            <div>
              <h2 className="font-black text-sm leading-tight text-white">Admin OSIS</h2>
              <p className="text-[10px] text-sky-400 font-semibold uppercase">SMAN 1 Kemangkon</p>
            </div>
          </div>
        </div>

        <Link
          to="/papan"
          target="_blank"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors border border-slate-700"
        >
          <span>Papan Publik</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </Link>
      </header>

      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 transition-opacity" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar (Desktop fixed left, Mobile drawer) */}
      <aside className={cn(
        "w-64 bg-slate-900 text-white flex flex-col fixed inset-y-0 left-0 z-40 transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-500 overflow-hidden shrink-0 flex items-center justify-center p-1 shadow-inner border border-sky-400/30">
            <img 
              src="https://raw.githubusercontent.com/dapidd12/storage/main/tes/1788314699811-20260902_090434.png" 
              alt="Logo OSIS" 
              className="w-full h-full object-contain" 
            />
          </div>
          <div className="min-w-0">
            <h2 className="font-black text-base leading-tight text-white tracking-tight">Admin Panel</h2>
            <p className="text-[11px] text-sky-400 font-bold uppercase tracking-wider mt-0.5 truncate">
              SMAN 1 Kemangkon
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 pt-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
            Menu Utama
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.tabKey;

            return (
              <Link
                key={item.tabKey}
                to={item.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center justify-between px-3.5 py-3 rounded-2xl font-bold text-sm transition-all group",
                  isActive
                    ? "bg-sky-600 text-white shadow-md shadow-sky-600/25 ring-1 ring-sky-500/50"
                    : "text-slate-400 hover:bg-slate-800/80 hover:text-white"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-white" : "text-slate-400 group-hover:text-sky-400 transition-colors")} />
                  <span className="truncate">{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {item.badge !== undefined && (
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-black",
                      isActive ? "bg-white text-sky-900" : item.badgeColor
                    )}>
                      {item.badge}
                    </span>
                  )}
                  {item.dotAlert && (
                    <span 
                      className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" 
                      title="Pengaturan khusus aktif"
                    />
                  )}
                </div>
              </Link>
            );
          })}

          <div className="pt-4 pb-2 px-3 text-[10px] font-black uppercase tracking-wider text-slate-400">
            Akses Eksternal
          </div>

          <Link
            to="/papan"
            target="_blank"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-bold text-sm text-slate-400 hover:bg-slate-800/80 hover:text-white transition-all group"
          >
            <div className="flex items-center gap-3">
              <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
              <span>Papan Publik Siswa</span>
            </div>
            <span className="text-[10px] text-slate-400 group-hover:text-white transition-colors">&rarr;</span>
          </Link>
        </nav>

        {/* Footer with User info and Logout */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 space-y-3">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-8 h-8 rounded-xl bg-slate-800 text-sky-400 border border-slate-700 flex items-center justify-center font-black text-xs shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">Pengurus OSIS</p>
              <p className="text-[10px] text-slate-400 font-medium">Sesi Aktif (Admin)</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors cursor-pointer border border-transparent hover:border-rose-500/20"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Akun Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full lg:pl-64 min-h-screen">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
