import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  MessageSquarePlus, MessageSquare, Megaphone, Lock, 
  MessageCircle, ClipboardCheck 
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useAppContext } from '../context/AppContext';
import { getWhatsAppUrl } from '../lib/socialUtils';

export default function Navbar() {
  const location = useLocation();
  const { settings } = useAppContext();
  const isEvaluationMode = settings.siteMode === 'evaluation';

  const navLinks = [
    { 
      to: '/', 
      label: isEvaluationMode ? 'Kirim Evaluasi' : 'Kirim Aspirasi', 
      icon: isEvaluationMode ? ClipboardCheck : MessageSquarePlus,
      badge: !settings.isAspirationOpen ? 'Tutup' : undefined,
    },
    // Sembunyikan Papan dan Mading saat Mode Evaluasi aktif (siswa hanya bisa mengirim evaluasi)
    ...(!isEvaluationMode ? [
      { to: '/papan', label: 'Papan Suara', icon: MessageSquare },
      { to: '/mading', label: 'Mading OSIS', icon: Megaphone }
    ] : [])
  ];

  const waUrl = settings.socialLinks?.whatsapp
    ? getWhatsAppUrl(settings.socialLinks.whatsapp, settings.socialLinks.whatsappMessage)
    : null;

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-white/60 shadow-warm-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18 sm:h-20 gap-3">
          {/* Logo & School Branding */}
          <div className="flex items-center min-w-0">
            <Link to="/" className="flex items-center gap-3 group">
              <div 
                className={cn(
                  "w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center p-1.5 border shadow-warm-sm transition-transform group-hover:scale-105",
                  isEvaluationMode 
                    ? "bg-purple-50 border-purple-200/80" 
                    : "bg-amber-50 border-amber-200/80"
                )}
              >
                <img 
                  src="https://raw.githubusercontent.com/dapidd12/storage/main/tes/1788314699811-20260902_090434.png" 
                  alt="Logo OSIS SMAN 1 Kemangkon" 
                  className="w-full h-full object-contain" 
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-display font-black text-lg sm:text-xl text-warm-ink tracking-tight leading-none">
                    {isEvaluationMode ? 'Kotak Evaluasi' : 'Curhat OSIS'}
                  </span>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider",
                    isEvaluationMode 
                      ? "bg-purple-100 text-purple-800" 
                      : "bg-amber-100 text-amber-900"
                  )}>
                    {isEvaluationMode ? 'Evaluasi' : 'Resmi'}
                  </span>
                </div>
                <p className="text-[11px] font-bold text-warm-muted tracking-wide uppercase mt-0.5 truncate">
                  SMAN 1 Kemangkon
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation Items & WhatsApp Support */}
          <div className="flex items-center gap-2 sm:gap-3">
            <nav className="flex items-center p-1 bg-warm-bg/90 rounded-2xl border border-amber-900/10 shadow-xs">
              {navLinks.map(({ to, label, icon: Icon, badge }) => {
                const isActive = location.pathname === to;
                return (
                  <Link key={to} to={to} className="relative">
                    <div
                      className={cn(
                        "flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-display font-bold transition-all relative z-10",
                        isActive
                          ? isEvaluationMode
                            ? "bg-purple-700 text-white shadow-warm-sm"
                            : "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-warm-sm"
                          : "text-warm-muted hover:text-warm-ink hover:bg-white/60"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{label}</span>
                      {badge && (
                        <span className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.2 bg-amber-100 text-amber-900 text-[9px] font-black rounded-full">
                          <Lock className="w-2.5 h-2.5" />
                          <span>{badge}</span>
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* Quick WhatsApp Helpdesk */}
            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 shadow-warm-sm hover:shadow-warm transition-all cursor-pointer"
                title="Hubungi Customer Service OSIS via WhatsApp"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500 motion-reduce:opacity-60" />
                <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
                <span>CS OSIS</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
