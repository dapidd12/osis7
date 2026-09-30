import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Shield } from 'lucide-react';
import Navbar from './Navbar';
import WelcomeSplash from './WelcomeSplash';

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col selection:bg-sky-500 selection:text-white">
      <WelcomeSplash />
      <Navbar />
      <motion.main 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10"
      >
        <Outlet />
      </motion.main>
      <footer className="bg-white border-t border-slate-200/80 py-8 px-4 text-center text-sm text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left sm:text-left text-center">
            <p className="font-bold text-slate-800">&copy; {new Date().getFullYear()} OSIS SMAN 1 Kemangkon</p>
            <p className="text-xs text-slate-400 mt-0.5">Wadah aspirasi resmi siswa SMAN 1 Kemangkon, Purbalingga</p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <Link 
              to="/pengurus" 
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="Portal Khusus Pengurus OSIS"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Portal Pengurus</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
