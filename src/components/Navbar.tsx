import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageSquarePlus, MessageSquare, Megaphone, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function Navbar() {
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Kirim Aspirasi', icon: MessageSquarePlus },
    { to: '/papan', label: 'Papan Aspirasi', icon: MessageSquare },
    { to: '/mading', label: 'Mading OSIS', icon: Megaphone },
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo & School Branding */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <motion.div 
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="w-11 h-11 bg-sky-50 rounded-2xl flex items-center justify-center overflow-hidden border border-sky-200/80 shadow-xs"
              >
                <img 
                  src="https://raw.githubusercontent.com/dapidd12/storage/main/tes/1788314699811-20260902_090434.png" 
                  alt="Logo OSIS SMAN 1 Kemangkon" 
                  className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                />
              </motion.div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-lg sm:text-xl text-slate-900 tracking-tight leading-none">
                    Kotak Curhat OSIS
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-sky-700 tracking-wide uppercase mt-0.5">
                  SMAN 1 Kemangkon
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="flex items-center p-1 bg-slate-100/80 rounded-2xl border border-slate-200/60">
              {navLinks.map(({ to, label, icon: Icon }) => {
                const isActive = location.pathname === to;
                return (
                  <Link key={to} to={to}>
                    <motion.div
                      whileHover={{ y: -1 }}
                      whileTap={{ y: 1 }}
                      className={cn(
                        "flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all",
                        isActive
                          ? "bg-white text-sky-900 shadow-xs border border-slate-200/70"
                          : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                      )}
                    >
                      <Icon className={cn("w-4 h-4", isActive ? "text-sky-600" : "text-slate-400")} />
                      <span className="hidden sm:inline">{label}</span>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
