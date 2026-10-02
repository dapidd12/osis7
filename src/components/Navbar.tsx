import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageSquarePlus, MessageSquare, Megaphone, Lock, MessageCircle, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useAppContext } from '../context/AppContext';
import { getWhatsAppUrl } from '../lib/socialUtils';

export default function Navbar() {
  const location = useLocation();
  const { settings } = useAppContext();

  const navLinks = [
    { 
      to: '/', 
      label: 'Kirim Aspirasi', 
      icon: MessageSquarePlus,
      badge: !settings.isAspirationOpen ? 'Tutup' : undefined,
    },
    { to: '/papan', label: 'Papan Aspirasi', icon: MessageSquare },
    { to: '/mading', label: 'Mading OSIS', icon: Megaphone },
  ];

  const waUrl = settings.socialLinks?.whatsapp
    ? getWhatsAppUrl(settings.socialLinks.whatsapp, settings.socialLinks.whatsappMessage)
    : null;

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo & School Branding */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 sm:w-11 sm:h-11 bg-sky-50 rounded-2xl flex items-center justify-center overflow-hidden border border-sky-200/80 shadow-xs"
              >
                <img 
                  src="https://raw.githubusercontent.com/dapidd12/storage/main/tes/1788314699811-20260902_090434.png" 
                  alt="Logo OSIS SMAN 1 Kemangkon" 
                  className="w-full h-full object-contain transition-transform group-hover:scale-105" 
                />
              </motion.div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-base sm:text-xl text-slate-900 tracking-tight leading-none">
                    Kotak Curhat OSIS
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] font-bold text-sky-700 tracking-wide uppercase mt-0.5">
                  SMAN 1 Kemangkon
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation & WhatsApp CS */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center p-1 bg-slate-100/90 rounded-2xl border border-slate-200/60 shadow-2xs">
              {navLinks.map(({ to, label, icon: Icon, badge }) => {
                const isActive = location.pathname === to;
                return (
                  <Link key={to} to={to}>
                    <motion.div
                      whileHover={{ y: -1 }}
                      whileTap={{ y: 1 }}
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all",
                        isActive
                          ? "bg-white text-sky-950 shadow-xs border border-slate-200/70"
                          : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                      )}
                    >
                      <Icon className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4", isActive ? "text-sky-600" : "text-slate-400")} />
                      <span className="hidden sm:inline">{label}</span>
                      {badge && (
                        <span className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[10px] font-black rounded-md border border-amber-200">
                          <Lock className="w-2.5 h-2.5" />
                          <span>{badge}</span>
                        </span>
                      )}
                    </motion.div>
                  </Link>
                );
              })}
            </div>

            {/* Quick WhatsApp CS Helpdesk button if phone is set */}
            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/90 transition-all shadow-2xs hover:shadow-xs group cursor-pointer"
                title="Hubungi Customer Service OSIS via WhatsApp"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <MessageCircle className="w-3.5 h-3.5 text-emerald-700 group-hover:scale-110 transition-transform" />
                <span>CS WhatsApp</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
