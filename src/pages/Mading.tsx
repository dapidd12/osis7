import React from 'react';
import { useAppContext } from '../context/AppContext';
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { motion } from 'motion/react';
import { Megaphone, Calendar, ShieldCheck, Pin } from 'lucide-react';

export default function Mading() {
  const { announcements } = useAppContext();

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center space-y-3 py-6 sm:py-8"
      >
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-sky-50 border border-sky-200/80 rounded-3xl flex items-center justify-center mx-auto mb-4 text-sky-600 shadow-xs">
          <Megaphone className="w-8 h-8 sm:w-10 sm:h-10 text-sky-600" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-800 border border-sky-200/70">
          <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
          <span>Papan Pengumuman Resmi OSIS SMAN 1 Kemangkon</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Mading Informasi OSIS
        </h1>
        <p className="text-slate-600 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
          Temukan pengumuman penting, jadwal kegiatan kesiswaan, dan berita terkini langsung dari Pengurus OSIS.
        </p>
      </motion.div>

      {announcements.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {announcements.map((announcement, index) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.06 }}
              whileHover={{ y: -4 }}
              key={announcement.id} 
              className="bg-white rounded-3xl shadow-xs border border-slate-200/90 overflow-hidden flex flex-col transition-all hover:shadow-md hover:border-slate-300"
            >
              <div className="p-6 sm:p-7 flex-1 flex flex-col">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="flex items-center gap-1 text-[11px] font-bold text-sky-700 bg-sky-50 border border-sky-200/80 px-2.5 py-0.5 rounded-full">
                    <Pin className="w-3 h-3 text-sky-500" />
                    Pengumuman
                  </span>
                  <div className="flex items-center text-xs text-slate-400 gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true, locale: localeId })}</span>
                  </div>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 leading-snug break-words">
                  {announcement.title}
                </h3>
                
                <p className="text-slate-600 mb-6 text-sm break-words whitespace-pre-wrap leading-relaxed flex-1">
                  {announcement.content}
                </p>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 border border-sky-200 flex items-center justify-center font-bold text-xs">
                      {announcement.author.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{announcement.author}</p>
                      <p className="text-[10px] text-slate-500 font-medium">Pengurus OSIS</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                    SMAN 1 Kemangkon
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed max-w-lg mx-auto p-8"
        >
          <div className="w-20 h-20 mx-auto mb-4 opacity-50 grayscale">
            <img src="https://raw.githubusercontent.com/dapidd12/storage/main/tes/1788314699811-20260902_090434.png" alt="Logo OSIS SMAN 1 Kemangkon" className="w-full h-full object-contain" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Belum Ada Pengumuman Baru</h3>
          <p className="text-slate-500 text-sm">
            Pantau terus halaman ini untuk informasi terbaru dari Pengurus OSIS ya!
          </p>
        </motion.div>
      )}
    </div>
  );
}
