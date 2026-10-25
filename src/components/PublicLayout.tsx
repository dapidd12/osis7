import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageCircle, Instagram, ExternalLink, MapPin,
  X, ShieldCheck, ArrowUpRight, Heart, Sparkles
} from 'lucide-react';
import Navbar from './Navbar';
import WelcomeSplash from './WelcomeSplash';
import MaintenancePage from './MaintenancePage';
import AdminMaintenanceBanner from './AdminMaintenanceBanner';
import ScrollProgress from './motion/ScrollProgress';
import { useAppContext } from '../context/AppContext';
import { getInstagramUrl, getTikTokUrl, getWhatsAppUrl } from '../lib/socialUtils';

export default function PublicLayout() {
  const { settings, isSettingsLoaded } = useAppContext();
  const isAdmin = typeof window !== 'undefined' && localStorage.getItem('adminAuth') === 'true';
  const [showWaTooltip, setShowWaTooltip] = useState(false);

  // If maintenance mode is active and user is NOT logged in as admin, show maintenance page
  if (isSettingsLoaded && settings.isMaintenanceMode && !isAdmin) {
    return <MaintenancePage settings={settings} />;
  }

  const igUrl = getInstagramUrl(settings.socialLinks?.instagram || '');
  const ttUrl = getTikTokUrl(settings.socialLinks?.tiktok || '');
  const waUrl = getWhatsAppUrl(settings.socialLinks?.whatsapp || '', settings.socialLinks?.whatsappMessage);
  const hasWa = !!settings.socialLinks?.whatsapp;

  return (
    <div className="min-h-screen bg-warm-bg font-sans text-warm-ink flex flex-col selection:bg-rose-500 selection:text-white relative">
      <ScrollProgress />
      {settings.isMaintenanceMode && isAdmin && <AdminMaintenanceBanner />}
      <WelcomeSplash />
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Outlet />
      </main>

      {/* Floating WhatsApp CS Button */}
      {hasWa && (
        <aside aria-label="Customer Service WhatsApp" className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
          <AnimatePresence>
            {showWaTooltip && (
              <motion.div
                initial={{ opacity: 0, x: 8, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 8, scale: 0.95 }}
                className="glass-card p-3.5 rounded-2xl shadow-warm-lg text-xs text-warm-ink max-w-xs hidden sm:flex items-start gap-2.5"
              >
                <div>
                  <p className="font-display font-bold text-warm-ink">Butuh Bantuan Langsung?</p>
                  <p className="text-warm-muted text-[11px] mt-0.5">Chat CS OSIS SMAN 1 Kemangkon via WhatsApp.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowWaTooltip(false)}
                  className="text-warm-light hover:text-warm-ink p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            onMouseEnter={() => setShowWaTooltip(true)}
            className="flex items-center gap-2.5 px-4.5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-display font-bold text-xs sm:text-sm shadow-warm-lg shadow-glow-emerald hover:scale-105 active:scale-95 transition-all group cursor-pointer"
            title="Chat CS OSIS via WhatsApp"
          >
            <MessageCircle className="h-5 w-5 text-white" />
            <span className="hidden sm:inline font-bold tracking-wide">Bantuan CS OSIS</span>
          </a>
        </aside>
      )}

      {/* Warm & Friendly School Footer */}
      <footer className="mt-20 border-t border-amber-900/10 bg-gradient-to-b from-transparent via-amber-50/40 to-amber-100/30 pt-12 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Column 1: School Identity */}
            <div className="md:col-span-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white p-1 shadow-warm-sm border border-amber-200/60 overflow-hidden flex items-center justify-center">
                  <img 
                    src="https://raw.githubusercontent.com/dapidd12/storage/main/tes/1788314699811-20260902_090434.png" 
                    alt="Logo OSIS SMAN 1 Kemangkon" 
                    className="w-full h-full object-contain" 
                  />
                </div>
                <div>
                  <h3 className="font-display font-black text-lg text-warm-ink tracking-tight">
                    OSIS SMAN 1 Kemangkon
                  </h3>
                  <p className="text-xs font-semibold text-amber-700 tracking-wider uppercase">
                    Kotak Curhat & Aspirasi Siswa
                  </p>
                </div>
              </div>

              <p className="text-warm-muted text-xs sm:text-sm leading-relaxed max-w-md">
                Kanal komunikasi resmi untuk menyampaikan saran, kritik membangun, dan evaluasi program demi mewujudkan suasana belajar yang harmonis, terbuka, dan bersahabat bagi seluruh warga sekolah.
              </p>

              <div className="flex items-center gap-2 text-xs text-warm-muted">
                <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Kecamatan Kemangkon, Kabupaten Purbalingga, Jawa Tengah</span>
              </div>
            </div>

            {/* Column 2: Social & Quick Access */}
            <div className="md:col-span-6 flex flex-col sm:flex-row justify-between gap-6 md:pl-8">
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-warm-ink">
                  Kanal Media Sosial
                </p>
                <div className="flex flex-col gap-2.5 text-xs font-semibold">
                  <a 
                    href={igUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-warm-muted hover:text-rose-600 flex items-center gap-2 transition-colors"
                  >
                    <Instagram className="w-4 h-4 text-rose-500" />
                    <span>Instagram Resmi OSIS</span>
                    <ArrowUpRight className="w-3 h-3 text-warm-light" />
                  </a>
                  <a 
                    href={ttUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-warm-muted hover:text-slate-900 flex items-center gap-2 transition-colors"
                  >
                    <span className="w-4 h-4 text-[10px] font-black flex items-center justify-center bg-slate-900 text-white rounded">TT</span>
                    <span>TikTok Resmi OSIS</span>
                    <ArrowUpRight className="w-3 h-3 text-warm-light" />
                  </a>
                  {waUrl && (
                    <a 
                      href={waUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-warm-muted hover:text-emerald-700 flex items-center gap-2 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-600" />
                      <span>WhatsApp Helpdesk CS</span>
                      <ArrowUpRight className="w-3 h-3 text-warm-light" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-amber-900/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-warm-muted">
            <p>
              &copy; {new Date().getFullYear()} OSIS SMAN 1 Kemangkon. Seluruh hak cipta dilindungi.
            </p>
            <div className="flex items-center gap-2 text-warm-muted">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Privasi Pengirim Terjaga 100% Aman</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
