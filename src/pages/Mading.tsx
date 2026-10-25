import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Megaphone, Calendar, ShieldCheck, Pin, Instagram, MessageCircle, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { getInstagramUrl, getTikTokUrl, getWhatsAppUrl } from '../lib/socialUtils';
import Reveal from '../components/motion/Reveal';

export default function Mading() {
  const { announcements, settings } = useAppContext();
  const isEvaluationMode = settings.siteMode === 'evaluation';

  // Sembunyikan papan pengumuman jika mode evaluasi aktif
  if (isEvaluationMode) {
    return <Navigate to="/" replace />;
  }

  const igUrl = getInstagramUrl(settings.socialLinks?.instagram || '');
  const ttUrl = getTikTokUrl(settings.socialLinks?.tiktok || '');
  const waUrl = settings.socialLinks?.whatsapp 
    ? getWhatsAppUrl(settings.socialLinks.whatsapp, settings.socialLinks.whatsappMessage)
    : null;

  return (
    <div className="space-y-8 sm:space-y-12 max-w-6xl mx-auto">
      {/* Header Banner */}
      <Reveal className="text-center space-y-3 max-w-2xl mx-auto py-6 sm:py-8">
        <div className="w-14 h-14 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center mx-auto shadow-warm-sm border border-amber-200/80 mb-2">
          <Megaphone className="w-7 h-7 text-amber-600" />
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold glass-pill shadow-warm-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Papan Pengumuman Resmi SMAN 1 Kemangkon</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-display font-black text-warm-ink tracking-tight">
          Mading Informasi OSIS
        </h1>

        <p className="text-xs sm:text-base text-warm-muted max-w-xl mx-auto leading-relaxed">
          Temukan pengumuman resmi kesiswaan, jadwal kegiatan sekolah, seleksi lomba, dan rilis terkini langsung dari Pengurus OSIS.
        </p>

        {/* School Social Media Pills */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
          <a
            href={igUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-display font-bold glass-pill text-warm-ink hover:text-rose-600 shadow-warm-sm hover:shadow-warm transition-all cursor-pointer"
          >
            <Instagram className="w-3.5 h-3.5 text-rose-500" />
            <span>{settings.socialLinks?.instagram || '@osissman1kemangkon'}</span>
            <ArrowUpRight className="w-3 h-3 text-warm-light" />
          </a>

          <a
            href={ttUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-display font-bold glass-pill text-warm-ink hover:text-slate-900 shadow-warm-sm hover:shadow-warm transition-all cursor-pointer"
          >
            <span className="w-3.5 h-3.5 text-[10px] font-black flex items-center justify-center bg-slate-900 text-white rounded">TT</span>
            <span>{settings.socialLinks?.tiktok || '@osis_smansakemangkon'}</span>
            <ArrowUpRight className="w-3 h-3 text-warm-light" />
          </a>

          {waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-display font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-warm-sm hover:shadow-warm transition-all cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>CS WhatsApp</span>
              <ArrowUpRight className="w-3 h-3 text-emerald-600" />
            </a>
          )}
        </div>
      </Reveal>

      {/* Announcements Notice Board Grid */}
      {announcements.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {announcements.map((announcement, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.08 }}
              whileHover={{ y: -4 }}
              key={announcement.id} 
              className="glass-card rounded-[2rem] p-6 sm:p-7 shadow-warm-sm hover:shadow-warm transition-all flex flex-col justify-between border border-white/90 relative group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200/80">
                    <Pin className="w-3 h-3 text-amber-600" />
                    Pengumuman Resmi
                  </span>
                  <div className="flex items-center text-xs font-mono text-warm-light gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true, locale: localeId })}</span>
                  </div>
                </div>

                <h3 className="text-lg sm:text-xl font-display font-bold text-warm-ink mb-3 leading-snug break-words">
                  {announcement.title}
                </h3>
                
                <p className="text-warm-muted text-xs sm:text-sm break-words whitespace-pre-wrap leading-relaxed flex-1 font-sans mb-6">
                  {announcement.content}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-display font-bold text-xs shadow-2xs">
                    {announcement.author.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-display font-bold text-warm-ink">{announcement.author}</p>
                    <p className="text-[10px] text-warm-light">Pengurus OSIS</p>
                  </div>
                </div>

                <span className="text-[10px] font-semibold text-warm-muted bg-amber-50/80 px-2.5 py-0.5 rounded-full border border-amber-200/60">
                  SMAN 1 Kemangkon
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 glass-card rounded-[2rem] border border-slate-200/80 max-w-lg mx-auto p-8 space-y-3">
          <div className="w-16 h-16 mx-auto opacity-50 grayscale">
            <img 
              src="https://raw.githubusercontent.com/dapidd12/storage/main/tes/1788314699811-20260902_090434.png" 
              alt="Logo OSIS SMAN 1 Kemangkon" 
              className="w-full h-full object-contain" 
            />
          </div>
          <h3 className="text-lg font-display font-bold text-warm-ink">Belum Ada Pengumuman Baru</h3>
          <p className="text-warm-muted text-xs sm:text-sm">
            Mading digital sedang bersih. Nantikan rilis pengumuman dan agenda kesiswaan berikutnya langsung dari Pengurus OSIS!
          </p>
        </div>
      )}
    </div>
  );
}
