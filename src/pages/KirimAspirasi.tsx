import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Send, User, AlertCircle, Heart, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AspirationCategory } from '../types';
import { cn } from '../lib/utils';

const getLogicalDay = () => {
  const d = new Date();
  // If it's before 6 AM, it counts as the previous logical day
  if (d.getHours() < 6) {
    d.setDate(d.getDate() - 1);
  }
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

export default function KirimAspirasi() {
  const { addAspiration } = useAppContext();
  const navigate = useNavigate();
  
  const [category, setCategory] = useState<AspirationCategory | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [authorName, setAuthorName] = useState('');

  const [submitted, setSubmitted] = useState(false);
  const [limitReached, setLimitReached] = useState(false);

  useEffect(() => {
    const logicalDay = getLogicalDay();
    const stored = localStorage.getItem('aspirationLimit');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.day === logicalDay && data.count >= 2) {
          setLimitReached(true);
        }
      } catch (e) {}
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message || !category) {
      alert("Oops! Jangan lupa pilih kategori dulu ya.");
      return;
    }

    // Rate Limit Check
    const logicalDay = getLogicalDay();
    const stored = localStorage.getItem('aspirationLimit');
    let data = { count: 0, day: logicalDay };
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.day === logicalDay) {
          data = parsed;
        }
      } catch (e) {}
    }

    if (data.count >= 2) {
      setLimitReached(true);
      return;
    }

    try {
      const payload = {
        category,
        subject,
        message,
        isAnonymous,
        ...(isAnonymous ? {} : { authorName }),
      };

      await addAspiration(payload);
      
      data.count += 1;
      localStorage.setItem('aspirationLimit', JSON.stringify(data));
      
      setSubmitted(true);
      setTimeout(() => {
        navigate('/papan');
      }, 2500);
    } catch (error) {
      console.error("Gagal mengirim:", error);
      alert("Ups! Gagal mengirim aspirasi, pastikan koneksi lancar. Coba lagi ya.");
    }
  };

  if (submitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl mx-auto py-24 text-center"
      >
        <motion.div 
          animate={{ y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="w-32 h-32 mx-auto mb-6"
        >
          <img src="https://raw.githubusercontent.com/dapidd12/storage/main/tes/1788314699811-20260902_090434.png" alt="Logo OSIS SMAN 1 Kemangkon" className="w-full h-full object-contain drop-shadow-xl" />
        </motion.div>
        
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 relative"
        >
          <Heart className="w-8 h-8 text-rose-400 absolute -top-4 -right-4 animate-bounce" fill="currentColor" />
          <h2 className="text-3xl font-extrabold text-slate-800 mb-3">Yeay! Terkirim! 🎉</h2>
          <p className="text-slate-600 text-lg">
            Terima kasih ya sudah berani bersuara. Curhatanmu akan segera dibaca oleh tim OSIS.
          </p>
        </motion.div>
      </motion.div>
    );
  }

  if (limitReached) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl mx-auto py-24 text-center px-4"
      >
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="w-32 h-32 mx-auto mb-6"
        >
          <img src="https://raw.githubusercontent.com/dapidd12/storage/main/tes/1788314699811-20260902_090434.png" alt="Maskot OSIS" className="w-full h-full object-contain drop-shadow-xl grayscale opacity-80" />
        </motion.div>
        
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 relative">
          <Clock className="w-8 h-8 text-amber-500 absolute -top-4 -right-4 animate-pulse" />
          <h2 className="text-3xl font-extrabold text-slate-800 mb-3">Wah, Udah Limit! 😅</h2>
          <p className="text-slate-600 text-lg mb-6">
            Kamu udah ngirim 2 aspirasi hari ini. Biar tim OSIS nggak kewalahan, kasih kesempatan yang lain dulu ya.
          </p>
          <p className="text-sm font-bold text-slate-400">
            (Batas reset setiap jam 6 pagi)
          </p>
          
          <button
            onClick={() => navigate('/papan')}
            className="mt-8 px-6 py-3 bg-sky-100 text-sky-700 font-bold rounded-2xl hover:bg-sky-200 transition-colors"
          >
            Lihat Papan Aspirasi
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-4 sm:py-8">
      {/* Header with Mascot */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-center sm:items-end gap-4 mb-8 px-4"
      >
        <motion.div 
          whileHover={{ rotate: [0, -10, 10, -10, 0] }}
          className="w-24 h-24 shrink-0 z-10"
        >
          <img src="https://raw.githubusercontent.com/dapidd12/storage/main/tes/1788314699811-20260902_090434.png" alt="Maskot OSIS" className="w-full h-full object-contain drop-shadow-md" />
        </motion.div>
        
        <div className="bg-sky-100 p-5 rounded-3xl rounded-tl-sm sm:rounded-bl-sm sm:rounded-tl-3xl relative w-full border border-sky-200">
          <div className="absolute w-4 h-4 bg-sky-100 -left-2 bottom-6 rotate-45 hidden sm:block border-l border-b border-sky-200"></div>
          <div className="absolute w-4 h-4 bg-sky-100 left-1/2 -top-2 -translate-x-1/2 rotate-45 sm:hidden border-t border-l border-sky-200"></div>
          <h1 className="text-xl font-bold text-sky-900 mb-1">Hai, Teman! 👋</h1>
          <p className="text-sky-800 text-sm">
            Ada keluhan, saran, atau ide seru buat sekolah kita? Yuk, tulis aja di bawah. Tenang, rahasiamu aman bareng aku!
          </p>
        </div>
      </motion.div>

      <motion.form 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit} 
        className="bg-white p-6 sm:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8 relative overflow-hidden"
      >
        {/* Decorative blobs */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-sky-50 rounded-full blur-2xl opacity-60 pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-amber-50 rounded-full blur-2xl opacity-60 pointer-events-none"></div>

        <div className="relative z-10">
          <label className="block text-sm font-bold text-slate-800 mb-4">Topik curhatannya tentang apa nih?</label>
          <div className="flex flex-wrap gap-3">
            {(['Saran', 'Kritik', 'Pertanyaan', 'Lainnya'] as AspirationCategory[]).map((cat, i) => (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + (i * 0.05) }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={cn(
                  "py-2.5 px-5 rounded-full text-sm font-bold transition-all shadow-sm",
                  category === cat
                    ? "bg-sky-500 text-white shadow-sky-200 ring-2 ring-sky-500 ring-offset-2"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                )}
              >
                {cat}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <div>
            <label htmlFor="subject" className="block text-sm font-bold text-slate-800 mb-2">
              Beri judul singkat ya ✍️
            </label>
            <input
              id="subject"
              type="text"
              required
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Contoh: AC Kelas XI IPA 2 panas banget!"
              className="w-full px-5 py-4 bg-slate-50/50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100 transition-all font-medium text-slate-700 placeholder:text-slate-400"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-bold text-slate-800 mb-2">
              Ceritain detailnya di sini 💭
            </label>
            <textarea
              id="message"
              required
              rows={5}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Jadi gini ceritanya..."
              className="w-full px-5 py-4 bg-slate-50/50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100 transition-all font-medium text-slate-700 placeholder:text-slate-400 resize-none"
            />
          </div>
        </div>

        <div className="relative z-10 bg-slate-50/80 p-5 rounded-[2rem] border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-800">Sembunyikan Identitas? 🕵️‍♂️</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Biar rahasia, pilih anonim aja.</p>
            </div>
            <motion.label 
              whileTap={{ scale: 0.9 }}
              className="relative inline-flex items-center cursor-pointer"
            >
              <input 
                type="checkbox" 
                checked={isAnonymous} 
                onChange={e => setIsAnonymous(e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-sky-500 shadow-inner"></div>
            </motion.label>
          </div>

          <AnimatePresence>
            {!isAnonymous && (
              <motion.div 
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 20 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="overflow-hidden"
              >
                <label htmlFor="authorName" className="block text-sm font-bold text-slate-800 mb-2">
                  Nama Panggilan / Kelas
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="authorName"
                    type="text"
                    required={!isAnonymous}
                    value={authorName}
                    onChange={e => setAuthorName(e.target.value)}
                    placeholder="Contoh: Budi (XI IPS 1)"
                    className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-sky-300 focus:ring-4 focus:ring-sky-100 transition-all font-medium text-slate-700"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div 
          whileHover={{ scale: 1.01 }}
          className="relative z-10 flex items-start gap-3 p-4 bg-rose-50 text-rose-800 rounded-2xl border border-rose-100/50"
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
          <p className="text-xs sm:text-sm font-medium leading-relaxed">
            Plis banget, pakai bahasa yang sopan ya. Dilarang nulis ujaran kebencian, SARA, atau perundungan (bullying).
          </p>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="relative z-10 w-full flex items-center justify-center gap-2 py-4 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all shadow-xl shadow-slate-900/20"
        >
          <Send className="w-5 h-5" />
          Kirim Sekarang! 🚀
        </motion.button>
      </motion.form>
    </div>
  );
}
