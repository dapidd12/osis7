import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { 
  Send, User, AlertCircle, Clock, MessageSquare, 
  HelpCircle, AlertTriangle, Lightbulb, CheckCircle2, Lock, 
  Settings, Tag, MessageCircle, ArrowRight, ClipboardCheck,
  ShieldCheck, Check, Sparkles, Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AspirationCategory } from '../types';
import { cn } from '../lib/utils';
import { getWhatsAppUrl } from '../lib/socialUtils';
import Reveal from '../components/motion/Reveal';
import DimensionalHero from '../components/DimensionalHero';
import VoiceJourneySection from '../components/VoiceJourneySection';
import { 
  getClientIp, 
  checkIpSubmissionLimit, 
  recordIpSubmission, 
  getResetCycleInfo, 
  formatRemainingTime 
} from '../lib/ipRateLimit';

export default function KirimAspirasi() {
  const { addAspiration, settings, isSettingsLoaded } = useAppContext();
  const navigate = useNavigate();
  const formRef = useRef<HTMLDivElement>(null);
  const isAdmin = typeof window !== 'undefined' && localStorage.getItem('adminAuth') === 'true';
  const isEvaluationMode = settings.siteMode === 'evaluation';
  
  const [category, setCategory] = useState<AspirationCategory | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [authorName, setAuthorName] = useState('');

  // Selected Activity Topic (default to active topic from settings or 'Umum')
  const [selectedTopic, setSelectedTopic] = useState<string>('Umum');

  const [clientIp, setClientIp] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [remainingTimeText, setRemainingTimeText] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const waUrl = settings.socialLinks?.whatsapp
    ? getWhatsAppUrl(settings.socialLinks.whatsapp, settings.socialLinks.whatsappMessage)
    : null;

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Initialize and check IP rate limit (1x per day per IP, resets at 06:00 AM)
  useEffect(() => {
    let isMounted = true;

    const updateCountdown = () => {
      const cycleInfo = getResetCycleInfo();
      setRemainingTimeText(formatRemainingTime(cycleInfo.msUntilReset));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 30000);

    const initIpAndLimit = async () => {
      const ip = await getClientIp();
      if (!isMounted) return;
      setClientIp(ip);

      const mode = isEvaluationMode ? 'evaluation' : 'aspiration';
      const checkResult = await checkIpSubmissionLimit(ip, mode);
      if (isMounted && checkResult.limitReached) {
        setLimitReached(true);
      }
    };

    initIpAndLimit();

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isEvaluationMode]);

  useEffect(() => {
    if (settings.activityTopic) {
      setSelectedTopic(settings.activityTopic);
    } else if (isEvaluationMode) {
      setSelectedTopic('Evaluasi Program Kerja OSIS');
    }
  }, [settings.activityTopic, isEvaluationMode]);

  const categoryOptions: { 
    label: AspirationCategory; 
    icon: React.ElementType; 
    desc: string; 
    activeHalo: string;
    badgeStyle: string;
    iconStyle: string;
  }[] = isEvaluationMode ? [
    { 
      label: 'Saran', 
      icon: Lightbulb, 
      desc: 'Solusi & usulan perbaikan agenda kegiatan', 
      activeHalo: 'border-amber-300 bg-amber-50/90 text-amber-950 ring-4 ring-amber-400/20 shadow-warm', 
      badgeStyle: 'bg-amber-100 text-amber-800',
      iconStyle: 'text-amber-600 bg-amber-100'
    },
    { 
      label: 'Kritik', 
      icon: AlertTriangle, 
      desc: 'Kritik objektif & evaluasi kendala di lapangan', 
      activeHalo: 'border-rose-300 bg-rose-50/90 text-rose-950 ring-4 ring-rose-400/20 shadow-warm', 
      badgeStyle: 'bg-rose-100 text-rose-800',
      iconStyle: 'text-rose-600 bg-rose-100'
    },
    { 
      label: 'Pertanyaan', 
      icon: HelpCircle, 
      desc: 'Klarifikasi & tanya jawab teknis pelaksanaan', 
      activeHalo: 'border-sky-300 bg-sky-50/90 text-sky-950 ring-4 ring-sky-400/20 shadow-warm', 
      badgeStyle: 'bg-sky-100 text-sky-800',
      iconStyle: 'text-sky-600 bg-sky-100'
    },
    { 
      label: 'Lainnya', 
      icon: MessageSquare, 
      desc: 'Topik evaluasi kesiswaan lainnya', 
      activeHalo: 'border-purple-300 bg-purple-50/90 text-purple-950 ring-4 ring-purple-400/20 shadow-warm', 
      badgeStyle: 'bg-purple-100 text-purple-800',
      iconStyle: 'text-purple-600 bg-purple-100'
    },
  ] : [
    { 
      label: 'Saran', 
      icon: Lightbulb, 
      desc: 'Ide inovatif, fasilitas kelas, & usulan program baru', 
      activeHalo: 'border-amber-300 bg-amber-50/90 text-amber-950 ring-4 ring-amber-400/20 shadow-warm', 
      badgeStyle: 'bg-amber-100 text-amber-800',
      iconStyle: 'text-amber-600 bg-amber-100'
    },
    { 
      label: 'Kritik', 
      icon: AlertTriangle, 
      desc: 'Masukan kendala & keluhan yang membangun', 
      activeHalo: 'border-rose-300 bg-rose-50/90 text-rose-950 ring-4 ring-rose-400/20 shadow-warm', 
      badgeStyle: 'bg-rose-100 text-rose-800',
      iconStyle: 'text-rose-600 bg-rose-100'
    },
    { 
      label: 'Pertanyaan', 
      icon: HelpCircle, 
      desc: 'Tanya jawab seputar kegiatan & kebijakan sekolah', 
      activeHalo: 'border-sky-300 bg-sky-50/90 text-sky-950 ring-4 ring-sky-400/20 shadow-warm', 
      badgeStyle: 'bg-sky-100 text-sky-800',
      iconStyle: 'text-sky-600 bg-sky-100'
    },
    { 
      label: 'Lainnya', 
      icon: MessageSquare, 
      desc: 'Curhat santai, pesan semangat, & topik bebas', 
      activeHalo: 'border-emerald-300 bg-emerald-50/90 text-emerald-950 ring-4 ring-emerald-400/20 shadow-warm', 
      badgeStyle: 'bg-emerald-100 text-emerald-800',
      iconStyle: 'text-emerald-600 bg-emerald-100'
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!settings.isAspirationOpen) {
      setValidationError(
        isEvaluationMode 
          ? "Pengiriman evaluasi saat ini sedang ditutup sementara oleh Pengurus OSIS."
          : "Pengiriman aspirasi saat ini sedang ditutup sementara oleh Pengurus OSIS."
      );
      return;
    }

    if (!category) {
      setValidationError(
        isEvaluationMode
          ? "Silakan pilih salah satu kategori evaluasi terlebih dahulu."
          : "Silakan pilih salah satu kategori aspirasi terlebih dahulu."
      );
      return;
    }

    if (!subject.trim()) {
      setValidationError(
        isEvaluationMode 
          ? "Judul evaluasi tidak boleh kosong." 
          : "Judul aspirasi tidak boleh kosong."
      );
      return;
    }

    if (!message.trim() || message.trim().length < 10) {
      setValidationError(
        isEvaluationMode
          ? "Tuliskan isi masukan evaluasi minimal 10 karakter agar pengurus OSIS dapat memahaminya."
          : "Tuliskan isi pesan aspirasi minimal 10 karakter agar pengurus OSIS dapat memahaminya."
      );
      return;
    }

    // Double check IP rate limit before submitting
    const effectiveIp = clientIp || (await getClientIp());
    const mode = isEvaluationMode ? 'evaluation' : 'aspiration';
    const limitCheck = await checkIpSubmissionLimit(effectiveIp, mode);

    if (limitCheck.limitReached) {
      setLimitReached(true);
      setValidationError(
        `Batas pengiriman harian tercapai. Maksimal 1× pengiriman per hari untuk masing-masing IP. Kuota direset kembali setiap pukul 06:00 WIB.`
      );
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
        activityTopic: selectedTopic.trim() || (isEvaluationMode ? 'Evaluasi Program Kerja OSIS' : 'Umum'),
        submissionType: (isEvaluationMode ? 'evaluation' : 'aspiration') as 'aspiration' | 'evaluation',
        clientIp: effectiveIp
      };

      await addAspiration(payload);
      
      // Record submission limit for this IP
      await recordIpSubmission(effectiveIp, mode);
      setLimitReached(true);
      setSubmitted(true);

      // In Aspiration Mode: redirect to public board
      if (!isEvaluationMode) {
        setTimeout(() => {
          navigate('/papan');
        }, 2800);
      }
    } catch (error) {
      console.error("Gagal mengirim:", error);
      setValidationError(
        isEvaluationMode
          ? "Gagal mengirim evaluasi, pastikan jaringan internet stabil lalu coba lagi."
          : "Gagal mengirim aspirasi, pastikan jaringan internet stabil lalu coba lagi."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // If aspirations/evaluations are closed
  if (isSettingsLoaded && !settings.isAspirationOpen) {
    return (
      <div className="max-w-2xl mx-auto py-12 sm:py-20 text-center px-4">
        {isAdmin && (
          <div className="mb-6 p-4 glass-card rounded-2xl text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-warm-ink shadow-warm-sm border border-amber-200">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 bg-amber-100 text-amber-800 rounded-xl shrink-0">
                <Settings className="w-4 h-4" />
              </span>
              <span>
                <strong>Mode Pengurus:</strong> Pengiriman saat ini berstatus <strong>DITUTUP</strong> untuk siswa umum.
              </span>
            </div>
            <button
              onClick={() => navigate('/pengurus/dashboard?tab=pengaturan')}
              className="px-3.5 py-1.5 bg-warm-ink hover:bg-slate-800 text-white font-bold rounded-xl text-xs whitespace-nowrap self-start sm:self-auto cursor-pointer shadow-warm-sm transition-all"
            >
              Buka Pengaturan
            </button>
          </div>
        )}

        <div className="glass-card p-8 sm:p-12 rounded-[2.5rem] shadow-warm-lg text-center space-y-6 relative border border-white/80">
          <div className="w-18 h-18 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mx-auto shadow-warm-sm border border-rose-100">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
              Sedang Istirahat Sementara
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-black text-warm-ink">
              {isEvaluationMode ? 'Pengiriman Evaluasi Sedang Ditutup' : 'Kotak Curhat Sedang Istirahat'}
            </h2>
          </div>

          <div className="bg-white/80 border border-amber-900/10 rounded-2xl p-5 text-left text-xs sm:text-sm text-warm-ink leading-relaxed whitespace-pre-wrap font-sans">
            <div className="flex items-center gap-2 font-display font-bold text-warm-ink mb-2">
              <MessageSquare className="w-4 h-4 text-amber-600" />
              <span>Pengumuman dari Pengurus OSIS:</span>
            </div>
            {settings.aspirationClosedMessage || 'Kotak curhat sedang ditutup sementara untuk proses rekapitulasi data dan rapat kerja.'}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            {!isEvaluationMode && (
              <button
                type="button"
                onClick={() => navigate('/papan')}
                className="w-full sm:w-auto px-6 py-3 bg-warm-ink hover:bg-slate-800 text-white font-display font-bold rounded-2xl text-xs sm:text-sm shadow-warm hover:shadow-warm-lg transition-all cursor-pointer"
              >
                Lihat Papan Suara Siswa
              </button>
            )}
            {!isEvaluationMode && (
              <button
                type="button"
                onClick={() => navigate('/mading')}
                className="w-full sm:w-auto px-6 py-3 bg-white/90 hover:bg-white text-warm-ink font-display font-bold rounded-2xl text-xs sm:text-sm border border-slate-200 shadow-warm-sm transition-all cursor-pointer"
              >
                Baca Mading OSIS
              </button>
            )}
            {isEvaluationMode && waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-display font-bold rounded-2xl text-xs sm:text-sm shadow-warm transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Hubungi Layanan CS OSIS</span>
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Tampilan Tanda Terima Bukti Kirim (Submitted Receipt)
  if (submitted) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8 sm:p-12 rounded-[2.5rem] shadow-warm-lg border border-white/80 text-center space-y-6 relative overflow-hidden"
        >
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-warm-sm border border-emerald-200">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              Pesan Telah Diterima
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-black text-warm-ink">
              {isEvaluationMode ? 'Evaluasi Berhasil Dikirimkan!' : 'Aspirasimu Berhasil Masuk!'}
            </h2>
            <p className="text-xs sm:text-sm text-warm-muted leading-relaxed max-w-md mx-auto">
              Terima kasih telah berpartisipasi menyuarakan pendapat. Pesanmu segera ditelaah dan diverifikasi dengan penuh hormat oleh Pengurus OSIS SMAN 1 Kemangkon.
            </p>
          </div>

          {/* Receipt details */}
          <div className="bg-white/80 border border-slate-200/80 rounded-2xl p-5 text-left text-xs space-y-2.5 font-sans">
            <div className="flex justify-between border-b border-slate-100 pb-2 text-warm-ink">
              <span className="text-warm-muted">Kategori Pesan:</span>
              <strong className="font-bold text-warm-ink">{category || 'Umum'}</strong>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2 text-warm-ink">
              <span className="text-warm-muted">Status Pengirim:</span>
              <strong className="font-bold text-warm-ink">{isAnonymous ? 'Anonim (Dirahasiakan)' : authorName}</strong>
            </div>
            <div className="flex justify-between text-warm-ink">
              <span className="text-warm-muted">Waktu Pengiriman:</span>
              <strong className="font-bold text-warm-ink">{new Date().toLocaleTimeString('id-ID')} WIB</strong>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            {!isEvaluationMode ? (
              <button
                type="button"
                onClick={() => navigate('/papan')}
                className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-display font-bold rounded-2xl text-xs sm:text-sm shadow-warm-lg shadow-glow-amber transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Buka Papan Suara Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="w-full sm:w-auto px-7 py-3.5 bg-purple-700 hover:bg-purple-800 text-white font-display font-bold rounded-2xl text-xs sm:text-sm shadow-warm transition-all cursor-pointer"
              >
                Kembali ke Beranda
              </button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // Tampilan Kupon Harian Habis (Rate Limit 1x per day)
  if (limitReached) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4">
        <div className="glass-card p-8 sm:p-12 rounded-[2.5rem] shadow-warm-lg border border-white/80 text-center space-y-6 relative">
          <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-warm-sm border border-amber-200">
            <Clock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
              Batas 1× Kirim Per Hari
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-black text-warm-ink">
              {isEvaluationMode ? 'Batas Pengiriman Evaluasi Hari Ini Tercapai' : 'Kuota Curhat Harianmu Sudah Digunakan'}
            </h2>
            <p className="text-xs sm:text-sm text-warm-muted leading-relaxed max-w-md mx-auto">
              Kamu telah mengirimkan 1 pesan hari ini dari jaringan perangkat ini ({clientIp || 'aktif'}). Aturan 1 kali kirim per hari ini memastikan pesan yang masuk tetap tertib, berbobot, dan bebas spam.
            </p>
          </div>

          {/* Reset countdown box */}
          <div className="bg-white/80 border border-slate-200/80 rounded-2xl p-5 text-left text-xs space-y-2.5 font-sans">
            <div className="flex items-center justify-between text-warm-ink">
              <span className="text-warm-muted">Waktu Reset Otomatis:</span>
              <strong className="font-bold text-warm-ink">Setiap 06:00 WIB Pagi</strong>
            </div>
            <div className="flex items-center justify-between text-warm-ink">
              <span className="text-warm-muted">Sisa Waktu Menunggu:</span>
              <span className="px-3 py-1 rounded-full font-bold bg-amber-100 text-amber-900 border border-amber-200 text-xs">
                {remainingTimeText || 'Menghitung...'}
              </span>
            </div>
            {isEvaluationMode && (
              <p className="text-[11px] text-warm-muted pt-2 border-t border-slate-100 leading-relaxed">
                Catatan: Pada Mode Evaluasi, data masukan hanya ditujukan langsung ke pengurus OSIS tanpa dipublikasikan di papan umum demi kenyamanan evaluasi.
              </p>
            )}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            {!isEvaluationMode && (
              <button
                type="button"
                onClick={() => navigate('/papan')}
                className="w-full sm:w-auto px-6 py-3 bg-warm-ink hover:bg-slate-800 text-white font-display font-bold rounded-2xl text-xs sm:text-sm shadow-warm transition-all cursor-pointer"
              >
                Lihat Papan Suara Siswa
              </button>
            )}
            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-display font-bold rounded-2xl text-xs sm:text-sm shadow-warm transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Hubungi CS WhatsApp OSIS</span>
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* 1. THE OPENING SCREEN. Static by design: see DimensionalHero. */}
      <DimensionalHero
        isEvaluationMode={isEvaluationMode}
        activityTopic={settings.activityTopic}
        onScrollToForm={scrollToForm}
        isAspirationOpen={settings.isAspirationOpen}
      />

      {/* 2. THE PEAK. One pinned act: the paper folds, drops, and the box
             answers. It owns the largest scroll span on the page. */}
      <VoiceJourneySection />

      {/* 3. THE FIRST ARRIVAL. A heading before a form, sitting on its own
             ground rather than on a card: a card here would make the form read
             as the second half of a marketing section. */}
      <div className="mx-auto mt-16 max-w-3xl sm:mt-24">
        <div className="mb-8 border-t border-amber-900/10 pt-8">
          <h2 className="m-0 font-display text-2xl font-black tracking-tight text-warm-ink sm:text-3xl">
            {isEvaluationMode ? 'Tulis lembar evaluasimu' : 'Tulis aspirasimu'}
          </h2>
          <p className="m-0 mt-2 max-w-[46ch] text-xs leading-relaxed text-warm-muted sm:text-sm">
            Empat bagian, sekitar dua menit. Bisa kamu hentikan kapan saja sebelum
            tombol kirim ditekan.
          </p>
        </div>

      {/* MAIN SUBMISSION FORM */}
        <div ref={formRef}>
          <Reveal className="glass-card rounded-[2.5rem] p-6 sm:p-10 md:p-12 shadow-warm-lg border border-white/90 space-y-8 relative">
            {validationError && (
              <motion.div 
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-rose-50 border border-rose-200/90 rounded-2xl text-rose-800 text-sm flex items-start gap-3 shadow-xs"
              >
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <span className="font-semibold">{validationError}</span>
              </motion.div>
            )}

            {/* Form Header */}
            <div className="border-b border-amber-900/10 pb-6">
              <p className="text-xs sm:text-sm text-warm-muted leading-relaxed">
                Semua masukan akan dibaca dengan seksama oleh Pengurus OSIS. Isi formulir dengan santun dan objektif.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* STEP 1: Topik Kegiatan Terkait */}
              <div className="space-y-3">
                <label className="text-sm font-display font-bold text-warm-ink flex items-center gap-2">
                  <Tag className="w-4 h-4 text-amber-600" />
                  <span>{isEvaluationMode ? '1. Agenda Kegiatan yang Dievaluasi' : '1. Agenda / Topik Terkait'}</span>
                </label>

                <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/60 border border-amber-200/70 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base sm:text-lg font-display font-bold text-warm-ink">
                        {settings.activityTopic || (isEvaluationMode ? 'Evaluasi Program Kerja OSIS' : 'Umum (Kesiswaan & Sekolah)')}
                      </h3>
                      {settings.activityTopicDescription && (
                        <p className="text-xs text-warm-muted mt-1 leading-relaxed">
                          {settings.activityTopicDescription}
                        </p>
                      )}
                    </div>

                    {/* Tag choices if a special activity is active */}
                    {settings.activityTopic && settings.activityTopic !== 'Umum' && (
                      <div className="flex items-center gap-1.5 bg-white/90 p-1.5 rounded-xl border border-amber-200/80 shrink-0 self-start sm:self-auto shadow-2xs">
                        <button
                          type="button"
                          onClick={() => setSelectedTopic(settings.activityTopic)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-display font-bold transition-all cursor-pointer",
                            selectedTopic === settings.activityTopic
                              ? "bg-amber-500 text-white shadow-xs"
                              : "text-warm-muted hover:text-warm-ink hover:bg-amber-50"
                          )}
                        >
                          Ikuti Agenda
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedTopic('Umum')}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-display font-bold transition-all cursor-pointer",
                            selectedTopic === 'Umum'
                              ? "bg-warm-ink text-white shadow-xs"
                              : "text-warm-muted hover:text-warm-ink hover:bg-amber-50"
                          )}
                        >
                          Topik Umum
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* STEP 2: Category Selector */}
              <div className="pt-2 border-t border-amber-900/10 space-y-3">
                <div className="flex items-baseline justify-between">
                  <label className="text-sm font-display font-bold text-warm-ink">
                    {isEvaluationMode ? '2. Pilih Kategori Evaluasi' : '2. Pilih Jenis Aspirasimu'} <span className="text-rose-500">*</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {categoryOptions.map(({ label, icon: Icon, desc, activeHalo, iconStyle }) => {
                    const isSelected = category === label;
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => { setCategory(label); setValidationError(null); }}
                        className={cn(
                          "p-4 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between gap-3 relative",
                          isSelected
                            ? activeHalo
                            : "bg-white/80 border-slate-200/90 hover:border-amber-300 hover:bg-amber-50/30 hover:shadow-warm-sm"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconStyle} shadow-2xs`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </span>
                          )}
                        </div>

                        <div>
                          <p className="font-display font-bold text-sm text-warm-ink">
                            {label}
                          </p>
                          <p className="text-[11px] text-warm-muted leading-tight mt-0.5 line-clamp-2">
                            {desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STEP 3: Judul & Isi Pesan */}
              <div className="pt-2 border-t border-amber-900/10 space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="subject" className="text-sm font-display font-bold text-warm-ink">
                      {isEvaluationMode ? '3. Judul Pokok Evaluasi' : '3. Judul Aspirasi / Ide'} <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-xs font-mono text-warm-light">{subject.length}/80</span>
                  </div>
                  <input
                    id="subject"
                    type="text"
                    required
                    maxLength={80}
                    value={subject}
                    onChange={e => { setSubject(e.target.value); setValidationError(null); }}
                    placeholder={
                      isEvaluationMode
                        ? `Contoh: Evaluasi Sarana dan Waktu Mulai ${selectedTopic !== 'Umum' ? selectedTopic : 'Kegiatan OSIS'}`
                        : (selectedTopic !== 'Umum' 
                            ? `Contoh: Usulan Lomba Mini Soccer di ${selectedTopic}` 
                            : "Contoh: Usulan Perbaikan Kipas Angin dan Buku di Ruang Baca")
                    }
                    className="w-full px-4 py-3.5 bg-white/90 border border-slate-200/90 rounded-2xl focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 shadow-warm-sm font-sans font-medium text-warm-ink placeholder:text-warm-light text-sm transition-all"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="message" className="text-sm font-display font-bold text-warm-ink">
                      {isEvaluationMode ? '4. Uraian Detail Masukan' : '4. Uraian Lengkap Cerita / Aspirasi'} <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-xs font-mono text-warm-light">{message.length}/1000</span>
                  </div>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    maxLength={1000}
                    value={message}
                    onChange={e => { setMessage(e.target.value); setValidationError(null); }}
                    placeholder={
                      isEvaluationMode
                        ? "Jelaskan kendala apa yang terjadi, mengapa hal tersebut menjadi catatan, serta apa saran rekomendasi perbaikan untuk kepengurusan OSIS..."
                        : "Ceritakan saran, keluhan fasilitas, uneg-uneg, atau ide kreatifmu secara nyaman dan jelas..."
                    }
                    className="w-full px-4 py-3.5 bg-white/90 border border-slate-200/90 rounded-2xl focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 shadow-warm-sm font-sans font-medium text-warm-ink placeholder:text-warm-light text-sm resize-none leading-relaxed transition-all"
                  />
                </div>
              </div>

              {/* STEP 4: Mode Anonim vs Tampilkan Nama */}
              <div className="pt-2 border-t border-amber-900/10">
                <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-200/60 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="font-display font-bold text-sm text-warm-ink">Privasi & Identitas Pengirim</p>
                      <p className="text-xs text-warm-muted mt-0.5 leading-relaxed">
                        {isAnonymous 
                          ? "Identitasmu dirahasiakan 100%. Nama dan data pribadi tidak akan pernah dipublikasikan." 
                          : `Namamu akan ditampilkan secara terbuka pada kartu ${isEvaluationMode ? 'evaluasi' : 'aspirasi'}.`}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-amber-200/80 shrink-0 self-start sm:self-auto shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setIsAnonymous(true)}
                        className={cn(
                          "px-3.5 py-1.5 rounded-xl text-xs font-display font-bold transition-all cursor-pointer",
                          isAnonymous 
                            ? "bg-warm-ink text-white shadow-warm-sm" 
                            : "text-warm-muted hover:text-warm-ink hover:bg-amber-50"
                        )}
                      >
                        🎭 Anonim (Rahasia)
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAnonymous(false)}
                        className={cn(
                          "px-3.5 py-1.5 rounded-xl text-xs font-display font-bold transition-all cursor-pointer",
                          !isAnonymous 
                            ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-warm-sm" 
                            : "text-warm-muted hover:text-warm-ink hover:bg-amber-50"
                        )}
                      >
                        👤 Tampilkan Nama
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {!isAnonymous && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden pt-3 border-t border-amber-200/60"
                      >
                        <label htmlFor="authorName" className="block text-xs font-bold text-warm-ink mb-1.5">
                          Nama Lengkap / Panggilan & Kelas Siswa
                        </label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-light" />
                          <input
                            id="authorName"
                            type="text"
                            required={!isAnonymous}
                            value={authorName}
                            onChange={e => setAuthorName(e.target.value)}
                            placeholder="Contoh: Budi Santoso (XI IPS 1)"
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-amber-400 text-sm font-medium text-warm-ink"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Friendly Guidelines */}
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-sky-50/70 border border-sky-100 text-xs leading-relaxed text-sky-950">
                <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold text-sky-950">Komitmen Bersama: </strong>
                  <span>
                    {isEvaluationMode
                      ? 'Evaluasi yang disampaikan secara santun, objektif, dan konstruktif akan menjadi prioritas pembahasan rapat pengurus OSIS.'
                      : 'Gunakan bahasa yang santun, saling menghargai, dan objektif demi menjaga lingkungan SMAN 1 Kemangkon yang harmonis dan menyenangkan.'}
                  </span>
                </div>
              </div>

              {/* Submit Button & Rate Limit Info */}
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={isSubmitting || limitReached}
                  className={cn(
                    "w-full flex items-center justify-center gap-3 py-4 px-6 text-white font-display font-bold text-base sm:text-lg rounded-2xl shadow-warm-lg transition-all cursor-pointer disabled:opacity-50",
                    isEvaluationMode 
                      ? "bg-purple-700 hover:bg-purple-800 shadow-glow-sky" 
                      : "bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500 hover:from-orange-600 hover:via-rose-600 hover:to-amber-600 shadow-glow-rose hover:scale-[1.01] active:scale-[0.99]"
                  )}
                >
                  {isEvaluationMode ? <ClipboardCheck className="w-5 h-5" /> : <Send className="w-5 h-5" />}
                  <span>
                    {isSubmitting 
                      ? (isEvaluationMode ? 'Mengirim Lembar Evaluasi...' : 'Mengirimkan Aspirasi...') 
                      : limitReached
                        ? 'Batas Harian Tercapai (Reset 06:00 WIB)'
                        : (isEvaluationMode ? 'Kirim Lembar Evaluasi ke OSIS' : 'Kirim Aspirasi Sekarang')}
                  </span>
                </button>
              
                <div className="flex flex-col sm:flex-row items-center justify-between gap-1 text-[11px] text-warm-muted px-1 font-semibold text-center sm:text-left">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Batas pengiriman: <strong>1× per hari per IP</strong></span>
                  </span>
                  <span>Reset otomatis pukul <strong>06:00 WIB</strong> ({remainingTimeText || 'Siklus harian'})</span>
                </div>
              </div>
            </form>
          </Reveal>
        </div>
      </div>

      {/* Official OSIS Helpdesk WhatsApp Card */}
      {waUrl && (
        <Reveal className="max-w-3xl mx-auto">
          <div className="glass-card rounded-3xl p-6 sm:p-7 shadow-warm-sm border border-emerald-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-warm-ink text-sm sm:text-base">
                  Perlu Respon Cepat atau Tanya Jawab Mendesak?
                </h3>
                <p className="text-xs text-warm-muted mt-0.5">
                  Kamu bisa langsung berdiskusi dengan helpdesk Customer Service OSIS SMAN 1 Kemangkon via WhatsApp.
                </p>
              </div>
            </div>

            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-display font-bold rounded-xl shadow-warm-sm hover:scale-105 active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              <span>Hubungi CS WhatsApp</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </Reveal>
      )}
    </div>
  );
}
