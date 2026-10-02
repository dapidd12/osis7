import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { 
  Send, User, AlertCircle, Clock, Sparkles, MessageSquare, 
  HelpCircle, AlertTriangle, Lightbulb, CheckCircle2, Lock, 
  Settings, Tag, MessageCircle, Instagram, ShieldCheck, ArrowRight 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AspirationCategory } from '../types';
import { cn } from '../lib/utils';
import { getWhatsAppUrl, getInstagramUrl } from '../lib/socialUtils';

const getLogicalDay = () => {
  const d = new Date();
  if (d.getHours() < 6) {
    d.setDate(d.getDate() - 1);
  }
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

export default function KirimAspirasi() {
  const { addAspiration, settings, isSettingsLoaded } = useAppContext();
  const navigate = useNavigate();
  const isAdmin = typeof window !== 'undefined' && localStorage.getItem('adminAuth') === 'true';
  
  const [category, setCategory] = useState<AspirationCategory | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [authorName, setAuthorName] = useState('');

  // Selected Activity Topic (default to active topic from settings or 'Umum')
  const [selectedTopic, setSelectedTopic] = useState<string>('Umum');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (settings.activityTopic) {
      setSelectedTopic(settings.activityTopic);
    }
  }, [settings.activityTopic]);

  const categoryOptions: { label: AspirationCategory; icon: React.ElementType; desc: string }[] = [
    { label: 'Saran', icon: Lightbulb, desc: 'Ide & usulan perbaikan' },
    { label: 'Kritik', icon: AlertTriangle, desc: 'Keluhan konstruktif' },
    { label: 'Pertanyaan', icon: HelpCircle, desc: 'Tanya jawab seputar sekolah' },
    { label: 'Lainnya', icon: MessageSquare, desc: 'Aspirasi topik umum' },
  ];

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
    setValidationError(null);

    if (!settings.isAspirationOpen) {
      setValidationError("Pengiriman aspirasi saat ini sedang ditutup sementara oleh pengurus OSIS.");
      return;
    }

    if (!category) {
      setValidationError("Silakan pilih salah satu kategori aspirasi terlebih dahulu.");
      return;
    }

    if (!subject.trim()) {
      setValidationError("Judul aspirasi tidak boleh kosong.");
      return;
    }

    if (!message.trim() || message.trim().length < 10) {
      setValidationError("Tuliskan isi pesan aspirasi minimal 10 karakter agar pengurus OSIS dapat memahaminya.");
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

    setIsSubmitting(true);
    try {
      const payload = {
        category,
        subject: subject.trim(),
        message: message.trim(),
        isAnonymous,
        ...(isAnonymous ? {} : { authorName: authorName.trim() }),
        activityTopic: selectedTopic.trim() || 'Umum',
      };

      await addAspiration(payload);
      
      data.count += 1;
      localStorage.setItem('aspirationLimit', JSON.stringify(data));
      
      setSubmitted(true);
      setTimeout(() => {
        navigate('/papan');
      }, 2300);
    } catch (error) {
      console.error("Gagal mengirim:", error);
      setValidationError("Gagal mengirim aspirasi, pastikan jaringan internet stabil lalu coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // If aspirations are closed
  if (isSettingsLoaded && !settings.isAspirationOpen) {
    return (
      <div className="max-w-2xl mx-auto py-8 sm:py-16 text-center px-4">
        {isAdmin && (
          <div className="mb-6 p-4 bg-sky-50 border border-sky-200 rounded-2xl text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-sky-900 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="p-1 bg-sky-200 rounded-lg shrink-0">
                <Settings className="w-4 h-4 text-sky-700" />
              </span>
              <span>
                <strong>Mode Pengurus:</strong> Pengiriman aspirasi saat ini berstatus <strong>DITUTUP</strong> untuk siswa umum.
              </span>
            </div>
            <button
              onClick={() => navigate('/pengurus/dashboard?tab=pengaturan')}
              className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl transition-colors text-xs whitespace-nowrap self-start sm:self-auto cursor-pointer"
            >
              Buka Pengaturan
            </button>
          </div>
        )}

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-slate-200/90 text-center space-y-6"
        >
          <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mx-auto border border-rose-100 shadow-inner">
            <Lock className="w-10 h-10" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-200 uppercase tracking-wider">
              Status Ditutup Sementara
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Pengiriman Aspirasi Sedang Ditutup
            </h2>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
            <div className="flex items-center gap-2 font-bold text-slate-900 mb-1.5">
              <Sparkles className="w-4 h-4 text-sky-600" />
              <span>Pengumuman dari Pengurus OSIS:</span>
            </div>
            {settings.aspirationClosedMessage}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/papan')}
              className="w-full sm:w-auto px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-sm cursor-pointer"
            >
              Lihat Papan Aspirasi
            </button>
            <button
              type="button"
              onClick={() => navigate('/mading')}
              className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs sm:text-sm transition-all cursor-pointer"
            >
              Baca Mading OSIS
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (submitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl mx-auto py-16 text-center px-4"
      >
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="w-24 h-24 mx-auto mb-6 bg-white p-2 rounded-3xl shadow-md border border-slate-100 flex items-center justify-center"
        >
          <img 
            src="https://raw.githubusercontent.com/dapidd12/storage/main/tes/1788314699811-20260902_090434.png" 
            alt="Logo OSIS SMAN 1 Kemangkon" 
            className="w-full h-full object-contain" 
          />
        </motion.div>
        
        <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-slate-200/80 relative">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">Aspirasi Berhasil Dikirim!</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Terima kasih telah berkontribusi menyuarakan aspirasi untuk kemajuan SMAN 1 Kemangkon. Pesanmu akan segera ditinjau oleh Pengurus OSIS.
          </p>
          <p className="text-xs text-slate-400 mt-4">
            Mengarahkan ke Papan Aspirasi...
          </p>
        </div>
      </motion.div>
    );
  }

  if (limitReached) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl mx-auto py-16 text-center px-4"
      >
        <div className="w-20 h-20 mx-auto mb-6 bg-amber-50 rounded-3xl flex items-center justify-center p-3 border border-amber-200">
          <Clock className="w-10 h-10 text-amber-600" />
        </div>
        
        <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-slate-200/80">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">Batas Harian Tercapai</h2>
          <p className="text-slate-600 text-sm sm:text-base mb-4 leading-relaxed">
            Kamu telah mengirimkan <strong>2 aspirasi</strong> hari ini. Untuk memastikan setiap aspirasi ditinjau secara mendalam dan adil, batas pengiriman adalah 2 pesan per hari.
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 rounded-full text-xs font-semibold mb-6 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Batas kirim direset setiap pukul 06.00 WIB</span>
          </div>
          
          <div>
            <button
              onClick={() => navigate('/papan')}
              className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl transition-all shadow-sm text-sm cursor-pointer"
            >
              Lihat Papan Aspirasi
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  const waUrl = settings.socialLinks?.whatsapp
    ? getWhatsAppUrl(settings.socialLinks.whatsapp, settings.socialLinks.whatsappMessage)
    : null;

  return (
    <div className="max-w-3xl mx-auto py-2 sm:py-6 space-y-8">
      {/* Header Hero Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-center sm:items-start gap-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs"
      >
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="w-18 h-18 sm:w-20 sm:h-20 bg-sky-50 rounded-2xl p-2 shrink-0 border border-sky-200/70 shadow-2xs flex items-center justify-center overflow-hidden"
        >
          <img 
            src="https://raw.githubusercontent.com/dapidd12/storage/main/tes/1788314699811-20260902_090434.png" 
            alt="Logo OSIS SMAN 1 Kemangkon" 
            className="w-full h-full object-contain" 
          />
        </motion.div>
        
        <div className="text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
            <span className="text-[11px] font-bold text-sky-800 bg-sky-50 border border-sky-200 px-3 py-0.5 rounded-full">
              Wadah Aspirasi Siswa Resmi
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              SMAN 1 Kemangkon
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
            Sampaikan Suaramu untuk Sekolah
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
            Punya saran fasilitas, kritik konstruktif, atau ide kegiatan seru? Sampaikan aspirasimu langsung kepada Pengurus OSIS. Identitasmu dapat disembunyikan (100% anonim).
          </p>
        </div>
      </motion.div>

      {/* Main Form */}
      <motion.form 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit} 
        className="bg-white p-6 sm:p-10 rounded-3xl shadow-sm border border-slate-200/80 space-y-8"
      >
        {validationError && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-sm flex items-start gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <span className="font-semibold">{validationError}</span>
          </div>
        )}

        {/* STEP 1: Judul / Topik Kegiatan Aspirasi Aktif */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-black text-slate-900 flex items-center gap-2">
              <Tag className="w-4 h-4 text-sky-600" />
              <span>1. Topik / Kegiatan Aspirasi</span>
            </label>
            <span className="text-xs text-sky-700 font-bold bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
              Otomatis Terkoneksi
            </span>
          </div>

          {/* Activity Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-sky-50 to-indigo-50/60 border border-sky-200/90 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-sky-600 text-white">
                    Agenda OSIS Aktif
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    {settings.activityTopic && settings.activityTopic !== 'Umum' ? 'Kegiatan Khusus' : 'Aspirasi Umum'}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {settings.activityTopic || 'Umum'}
                </h3>
                {settings.activityTopicDescription && (
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {settings.activityTopicDescription}
                  </p>
                )}
              </div>

              {/* Tag choices if a special activity is active */}
              {settings.activityTopic && settings.activityTopic !== 'Umum' && (
                <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-sky-200 shrink-0 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setSelectedTopic(settings.activityTopic)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                      selectedTopic === settings.activityTopic
                        ? "bg-sky-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    Ikuti Agenda
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTopic('Umum')}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                      selectedTopic === 'Umum'
                        ? "bg-slate-800 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    Topik Umum
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* STEP 2: Category Selection */}
        <div className="pt-2 border-t border-slate-100">
          <label className="block text-sm font-black text-slate-900 mb-1.5">
            2. Pilih Kategori Aspirasi <span className="text-rose-500">*</span>
          </label>
          <p className="text-xs text-slate-500 mb-4">Pilih jenis masukan yang paling mencerminkan isi aspirasimu.</p>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {categoryOptions.map(({ label, icon: Icon, desc }) => (
              <button
                key={label}
                type="button"
                onClick={() => { setCategory(label); setValidationError(null); }}
                className={cn(
                  "p-4 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between",
                  category === label
                    ? "bg-sky-50 border-sky-400 ring-2 ring-sky-500/20 shadow-xs"
                    : "bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-slate-100/70"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center",
                    category === label ? "bg-sky-600 text-white" : "bg-white text-slate-600 border border-slate-200"
                  )}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {category === label && (
                    <CheckCircle2 className="w-4 h-4 text-sky-600" />
                  )}
                </div>
                <div>
                  <p className={cn("text-sm font-bold", category === label ? "text-sky-950" : "text-slate-900")}>
                    {label}
                  </p>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* STEP 3: Subject & Message */}
        <div className="space-y-6 pt-2 border-t border-slate-100">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="subject" className="block text-sm font-black text-slate-900">
                3. Judul Aspirasi <span className="text-rose-500">*</span>
              </label>
              <span className="text-xs text-slate-400">{subject.length}/80</span>
            </div>
            <input
              id="subject"
              type="text"
              required
              maxLength={80}
              value={subject}
              onChange={e => { setSubject(e.target.value); setValidationError(null); }}
              placeholder={
                selectedTopic !== 'Umum' 
                  ? `Contoh: Usulan Lomba E-Sport di ${selectedTopic}` 
                  : "Contoh: Usulan Perbaikan Kipas Angin di Ruang Kelas XI"
              }
              className="w-full px-4 py-3.5 bg-slate-50/60 border border-slate-200 rounded-2xl focus:outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100/60 transition-all font-medium text-slate-800 placeholder:text-slate-400 text-sm"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="message" className="block text-sm font-black text-slate-900">
                4. Detail Pesan Aspirasi <span className="text-rose-500">*</span>
              </label>
              <span className="text-xs text-slate-400">{message.length}/1000</span>
            </div>
            <textarea
              id="message"
              required
              rows={5}
              maxLength={1000}
              value={message}
              onChange={e => { setMessage(e.target.value); setValidationError(null); }}
              placeholder="Ceritakan detail saran, kritik, atau pertanyaanmu secara jelas dan objektif..."
              className="w-full px-4 py-3.5 bg-slate-50/60 border border-slate-200 rounded-2xl focus:outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100/60 transition-all font-medium text-slate-800 placeholder:text-slate-400 text-sm resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* STEP 4: Identity & Privacy */}
        <div className="pt-2 border-t border-slate-100">
          <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-black text-slate-900">Identitas Pengirim</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isAnonymous 
                    ? "Identitasmu dirahasiakan 100%. Nama kamu tidak akan ditampilkan kepada publik." 
                    : "Nama dan kelasmu akan dicantumkan secara terbuka pada kartu aspirasi."}
                </p>
              </div>

              <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shrink-0 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setIsAnonymous(true)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                    isAnonymous 
                      ? "bg-slate-900 text-white shadow-xs" 
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  Anonim (Rahasia)
                </button>
                <button
                  type="button"
                  onClick={() => setIsAnonymous(false)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                    !isAnonymous 
                      ? "bg-slate-900 text-white shadow-xs" 
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  Tampilkan Nama
                </button>
              </div>
            </div>

            <AnimatePresence>
              {!isAnonymous && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="overflow-hidden pt-2 border-t border-slate-200/80"
                >
                  <label htmlFor="authorName" className="block text-xs font-bold text-slate-800 mb-2">
                    Nama Lengkap & Kelas Siswa
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="authorName"
                      type="text"
                      required={!isAnonymous}
                      value={authorName}
                      onChange={e => setAuthorName(e.target.value)}
                      placeholder="Contoh: Pratama Surya (XI MIPA 2)"
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all text-sm font-medium text-slate-800"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Guidelines Reminder */}
        <div className="flex items-start gap-3 p-4 bg-sky-50/60 rounded-2xl border border-sky-100 text-sky-950 text-xs leading-relaxed">
          <AlertCircle className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-sky-900">Tata Krama Penyampaian Aspirasi: </span>
            <span>
              Gunakan bahasa yang sopan, santun, objektif, dan tidak menyinggung SARA atau mencemarkan nama baik perorangan demi menjaga lingkungan belajar SMAN 1 Kemangkon yang harmonis.
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-2xl transition-all shadow-md text-sm cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span>{isSubmitting ? 'Mengirim Aspirasi...' : 'Kirim Aspirasi ke Pengurus OSIS'}</span>
        </button>
      </motion.form>

      {/* Official OSIS Helpdesk Card */}
      {waUrl && (
        <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-sky-500/10 border border-emerald-200 rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Perlu Diskusi Cepat atau Bantuan Mendesak?
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Kamu juga dapat menghubungi layanan Customer Service resmi OSIS SMAN 1 Kemangkon langsung melalui WhatsApp.
              </p>
            </div>
          </div>

          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm shrink-0"
          >
            <span>Hubungi CS WhatsApp</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      )}
    </div>
  );
}
