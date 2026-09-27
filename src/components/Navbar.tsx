import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageSquarePlus, MessageSquare, ShieldCheck, Megaphone } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center overflow-hidden"
              >
                <img src="https://raw.githubusercontent.com/dapidd12/storage/main/tes/1788314699811-20260902_090434.png" alt="Logo OSIS SMAN 1 Kemangkon" className="w-full h-full object-cover" />
              </motion.div>
              <span className="font-bold text-xl text-sky-900 tracking-tight">Curhat OSIS</span>
            </Link>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-4">
            <Link to="/">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm border",
                  location.pathname === '/' 
                    ? "bg-sky-500 text-white border-sky-600 shadow-sky-500/20" 
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <MessageSquarePlus className="w-4 h-4 inline-block mr-2" />
                <span className="hidden sm:inline">Kirim Aspirasi</span>
              </motion.div>
            </Link>
            <Link to="/papan">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm border",
                  location.pathname === '/papan' 
                    ? "bg-sky-500 text-white border-sky-600 shadow-sky-500/20" 
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <MessageSquare className="w-4 h-4 inline-block mr-2" />
                <span className="hidden sm:inline">Papan Aspirasi</span>
              </motion.div>
            </Link>
            <Link to="/mading">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm border",
                  location.pathname === '/mading' 
                    ? "bg-sky-500 text-white border-sky-600 shadow-sky-500/20" 
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Megaphone className="w-4 h-4 inline-block mr-2" />
                <span className="hidden sm:inline">Mading OSIS</span>
              </motion.div>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
