import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, MessageCircle, Instagram, ExternalLink, MapPin, 
  Heart, Sparkles, X, ArrowUpRight 
} from 'lucide-react';
import Navbar from './Navbar';
import WelcomeSplash from './WelcomeSplash';
import MaintenancePage from './MaintenancePage';
import AdminMaintenanceBanner from './AdminMaintenanceBanner';
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
    <div className="min-h-screen bg-slate-100/60 font-sans text-slate-900 flex flex-col selection:bg-sky-500 selection:text-white relative">
      {settings.isMaintenanceMode && isAdmin && <AdminMaintenanceBanner />}
      <WelcomeSplash />
      <Navbar />

      <motion.main 
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10"
      >
        <Outlet />
      </motion.main>

      {/* Floating WhatsApp CS Button */}
      {hasWa && (
        <aside aria-label="Customer Service WhatsApp" className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
          <AnimatePresence>
            {showWaTooltip && (
              <motion.div
                initial={{ opacity: 0, x: 10, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 10, scale: 0.95 }}
                className="bg-white p-3 rounded-2xl shadow-xl border border-slate-200 text-xs text-slate-800 max-w-xs hidden sm:flex items-start gap-2"
              >
                <div>
                  <p className="font-bold text-slate-900">Butuh Bantuan Langsung?</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">Chat CS OSIS SMAN 1 Kemangkon via WhatsApp.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowWaTooltip(false)}
                  className="text-slate-400 hover:text-slate-600 p-0.5"
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
            className="flex items-center gap-2.5 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold text-xs sm:text-sm shadow-xl shadow-emerald-600/30 hover:shadow-emerald-600/40 transition-all hover:scale-105 active:scale-95 group"
            title="Chat CS OSIS via WhatsApp"
          >
            <div className="relative">
              <MessageCircle className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-300 rounded-full animate-ping" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-300 rounded-full" />
            </div>
            <span className="hidden sm:inline font-bold">Chat CS OSIS</span>
          </a>
        </aside>
      )}

      {/* Professional Modern Footer */}
      <footer className="bg-slate-900 text-white border-t border-slate-800 pt-12 pb-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Column 1: School Brand & Identity */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-sky-500 rounded-2xl flex items-center justify-center p-1 overflow-hidden shadow-inner border border-sky-400/30">
                  <img 
                    src="https://raw.githubusercontent.com/dapidd12/storage/main/tes/1788314699811-20260902_090434.png" 
                    alt="Logo OSIS SMAN 1 Kemangkon" 
                    className="w-full h-full object-contain" 
                  />
                </div>
                <div>
                  <h3 className="font-black text-lg text-white leading-tight">Kotak Curhat OSIS</h3>
                  <p className="text-xs font-bold text-sky-400 uppercase tracking-wider">SMAN 1 Kemangkon</p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm">
                Saluran resmi penyampaian aspirasi, saran konstruktif, dan kritik membangun untuk memajukan almamater SMAN 1 Kemangkon. Suaramu berarti, didengar, dan ditindaklanjuti.
              </p>

              <div className="flex items-start gap-2 text-xs text-slate-400 pt-1">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>Kec. Kemangkon, Kab. Purbalingga, Jawa Tengah 53381</span>
              </div>
            </div>

            {/* Column 2: Official Social Media Channels */}
            <div className="md:col-span-4 space-y-4">
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                Media Sosial & Layanan CS OSIS
              </p>

              <div className="space-y-2.5">
                {/* Instagram */}
                <a
                  href={igUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-all hover:border-pink-500/50 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center group-hover:bg-pink-500 group-hover:text-white transition-colors">
                      <Instagram className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Instagram OSIS</p>
                      <p className="text-[11px] text-slate-400">
                        {settings.socialLinks?.instagram || '@osissman1kemangkon'}
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-pink-400 transition-colors" />
                </a>

                {/* TikTok */}
                <a
                  href={ttUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-all hover:border-slate-500 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-700 text-slate-200 flex items-center justify-center font-black text-xs group-hover:bg-white group-hover:text-slate-950 transition-colors">
                      TT
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">TikTok OSIS</p>
                      <p className="text-[11px] text-slate-400">
                        {settings.socialLinks?.tiktok || '@osis_smansakemangkon'}
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                </a>

                {/* WhatsApp CS */}
                {hasWa && (
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-all hover:border-emerald-500/50 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <MessageCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Layanan CS / Helpdesk</p>
                        <p className="text-[11px] text-emerald-400 font-medium">WhatsApp Helpdesk OSIS</p>
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                  </a>
                )}
              </div>
            </div>

            {/* Column 3: Quick Navigation */}
            <div className="md:col-span-3 space-y-4">
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                Akses Cepat
              </p>

              <nav className="flex flex-col space-y-2 text-xs font-medium text-slate-300">
                <Link to="/" className="hover:text-sky-400 transition-colors">
                  &bull; Formulir Kirim Aspirasi
                </Link>
                <Link to="/papan" className="hover:text-sky-400 transition-colors">
                  &bull; Papan Aspirasi Siswa
                </Link>
                <Link to="/mading" className="hover:text-sky-400 transition-colors">
                  &bull; Mading & Pengumuman OSIS
                </Link>
                <div className="pt-2">
                  <Link 
                    to="/pengurus/login" 
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800/90 hover:bg-slate-800 border border-slate-700 transition-colors"
                  >
                    <Shield className="w-3.5 h-3.5 text-sky-400" />
                    <span>Portal Pengurus OSIS</span>
                  </Link>
                </div>
              </nav>
            </div>
          </div>

          {/* Bottom Copyright & Guarantee */}
          <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 text-center sm:text-left">
            <div>
              <p className="font-semibold text-slate-300">
                &copy; {new Date().getFullYear()} OSIS SMAN 1 Kemangkon &bull; Kab. Purbalingga
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Dikembangkan dengan dedikasi untuk transparansi dan kemajuan almamater.
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-slate-400 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Privasi Pengirim Dijamin 100% Aman & Terlindungi</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
