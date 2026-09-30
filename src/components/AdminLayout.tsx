import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, MessageSquare, Menu, X, History } from 'lucide-react';
import { cn } from '../lib/utils';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    navigate('/pengurus/login');
  };

  // Simple auth check - don't render layout if on login page
  if (location.pathname === '/pengurus/login') {
    return <Outlet />;
  }

  // Redirect if not logged in
  if (localStorage.getItem('adminAuth') !== 'true') {
    return <Navigate to="/pengurus/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900">
      {/* Mobile Header */}
      <div className="flex items-center p-4 bg-slate-900 text-white sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 -ml-2 mr-2 text-slate-300 hover:text-white"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center shadow-inner overflow-hidden">
            <img src="https://raw.githubusercontent.com/dapidd12/storage/main/tes/1788314699811-20260902_090434.png" alt="Logo OSIS SMAN 1 Kemangkon" className="w-full h-full object-cover" />
          </div>
          <h2 className="font-bold text-lg">Admin Panel</h2>
        </div>
      </div>

      {/* Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 transition-opacity" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "w-64 bg-slate-900 text-white flex flex-col fixed inset-y-0 left-0 top-[72px] z-40 transition-transform duration-300 ease-in-out",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 hidden items-center gap-3 border-b border-slate-800">
          <div className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center shadow-inner overflow-hidden">
            <img src="https://raw.githubusercontent.com/dapidd12/storage/main/tes/1788314699811-20260902_090434.png" alt="Logo OSIS SMAN 1 Kemangkon" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="font-bold text-lg leading-tight">Admin Panel</h2>
            <p className="text-xs text-slate-400">Kotak Curhat OSIS</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link
            to="/pengurus/dashboard?tab=aspirasi"
            onClick={() => setIsMobileMenuOpen(false)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
              location.pathname.includes('/pengurus/dashboard') && (!location.search || location.search.includes('tab=aspirasi'))
                ? "bg-sky-600 text-white shadow-sm" 
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Aspirasi Masuk</span>
          </Link>
          <Link
            to="/pengurus/dashboard?tab=disetujui"
            onClick={() => setIsMobileMenuOpen(false)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
              location.search.includes('tab=disetujui')
                ? "bg-green-600 text-white shadow-sm" 
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            <History className="w-5 h-5" />
            <span className="font-medium">Riwayat Disetujui</span>
          </Link>
          <Link
            to="/pengurus/dashboard?tab=mading"
            onClick={() => setIsMobileMenuOpen(false)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
              location.search.includes('tab=mading')
                ? "bg-sky-600 text-white shadow-sm" 
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="font-medium">Kelola Mading</span>
          </Link>
          <div className="h-4"></div>
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="font-medium">Ke Papan Publik</span>
          </Link>
        </nav>
        
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Keluar</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full min-h-screen p-4 sm:p-8 pt-6">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
