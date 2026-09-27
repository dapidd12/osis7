import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Filter, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { AspirationCategory } from '../types';
import { cn } from '../lib/utils';

export default function PapanAspirasi() {
  const { aspirations } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AspirationCategory | 'Semua'>('Semua');

  const categories: (AspirationCategory | 'Semua')[] = ['Semua', 'Saran', 'Kritik', 'Pertanyaan', 'Lainnya'];

  const approvedAspirations = aspirations.filter(a => a.status === 'Approved');

  const filteredAspirations = approvedAspirations.filter(a => {
    const matchesSearch = a.subject.toLowerCase().includes(searchTerm.toLowerCase()) || a.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || a.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4 max-w-2xl mx-auto py-8"
      >
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Papan Aspirasi</h1>
        <p className="text-lg text-slate-600">
          Suara kamu sangat berharga! Lihat aspirasi dari teman-teman yang telah ditanggapi oleh OSIS.
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between"
      >
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari aspirasi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-hide">
          <Filter className="w-5 h-5 text-slate-400 shrink-0 hidden sm:block" />
          {categories.map(cat => (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                selectedCategory === cat
                  ? "bg-sky-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {filteredAspirations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAspirations.map((aspiration, index) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              key={aspiration.id} 
              className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col transition-shadow hover:shadow-md"
            >
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-800">
                    {aspiration.category}
                  </span>
                  <span className="text-xs text-slate-400">
                    {formatDistanceToNow(new Date(aspiration.createdAt), { addSuffix: true, locale: localeId })}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug break-words">{aspiration.subject}</h3>
                <p className="text-slate-600 mb-6 text-sm break-words">{aspiration.message}</p>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-base font-bold">
                    {aspiration.isAnonymous ? '?' : (aspiration.authorName?.charAt(0).toUpperCase() || 'A')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {aspiration.isAnonymous ? 'Anonim' : aspiration.authorName}
                    </p>
                    <p className="text-xs text-slate-500">Siswa</p>
                  </div>
                </div>
              </div>

              {aspiration.response && (
                <div className="border-t border-slate-100 bg-sky-50/50 p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm overflow-hidden">
                      <img src="https://raw.githubusercontent.com/dapidd12/storage/main/tes/1788314699811-20260902_090434.png" alt="Logo OSIS SMAN 1 Kemangkon" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-sm font-bold text-sky-900">Tanggapan OSIS</span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {aspiration.response}
                  </p>
                </div>
              )}
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
          <h3 className="text-xl font-bold text-slate-900 mb-2">Belum ada aspirasi</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            Tidak ada aspirasi yang sesuai dengan pencarian atau kategori ini.
          </p>
        </motion.div>
      )}
    </div>
  );
}
