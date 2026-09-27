import React from 'react';
import { useAppContext } from '../context/AppContext';
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { motion } from 'motion/react';
import { Megaphone, Calendar } from 'lucide-react';

export default function Mading() {
  const { announcements } = useAppContext();

  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4 max-w-2xl mx-auto py-8"
      >
        <div className="w-20 h-20 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-6 text-sky-600 shadow-inner">
          <Megaphone className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Mading OSIS</h1>
        <p className="text-lg text-slate-600">
          Informasi dan pengumuman terbaru langsung dari Pengurus OSIS SMAN 1 Kemangkon.
        </p>
      </motion.div>

      {announcements.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {announcements.map((announcement, index) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              key={announcement.id} 
              className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col"
            >
              <div className="p-6 flex-1">
                <h3 className="text-xl font-bold text-slate-900 mb-3 leading-snug break-words">{announcement.title}</h3>
                <p className="text-slate-700 mb-6 text-sm break-words whitespace-pre-wrap">{announcement.content}</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                      {announcement.author.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">{announcement.author}</p>
                      <p className="text-[10px] text-slate-500">Pengurus OSIS</p>
                    </div>
                  </div>
                  <div className="flex items-center text-xs text-slate-400 gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true, locale: localeId })}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-24 bg-white rounded-3xl border border-slate-200 border-dashed"
        >
          <div className="w-24 h-24 mx-auto mb-4 opacity-50 grayscale">
            <img src="https://raw.githubusercontent.com/dapidd12/storage/main/tes/1788314699811-20260902_090434.png" alt="Logo OSIS SMAN 1 Kemangkon" className="w-full h-full object-contain" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Belum ada pengumuman</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            Pantau terus halaman ini untuk informasi terbaru dari OSIS ya!
          </p>
        </motion.div>
      )}
    </div>
  );
}
