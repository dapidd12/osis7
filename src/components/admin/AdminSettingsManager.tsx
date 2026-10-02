import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { 
  Settings, Wrench, Shield, CheckCircle2, AlertTriangle, 
  Lock, Unlock, Save, Loader2, Info, ExternalLink, 
  Tag, Compass, MessageCircle, Instagram, Share2, Sparkles, Check
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SystemSettings } from '../../types';
import { cn } from '../../lib/utils';
import { getInstagramUrl, getTikTokUrl, getWhatsAppUrl } from '../../lib/socialUtils';

interface AdminSettingsManagerProps {
  settings: SystemSettings;
  updateSettings: (newSettings: Partial<SystemSettings>) => Promise<void>;
  isSettingsLoaded: boolean;
}

export default function AdminSettingsManager({
  settings,
  updateSettings,
  isSettingsLoaded
}: AdminSettingsManagerProps) {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(settings.isMaintenanceMode);
  const [maintenanceMessage, setMaintenanceMessage] = useState(settings.maintenanceMessage);
  const [isAspirationOpen, setIsAspirationOpen] = useState(settings.isAspirationOpen);
  const [aspirationClosedMessage, setAspirationClosedMessage] = useState(settings.aspirationClosedMessage);

  // Activity Topic
  const [activityTopic, setActivityTopic] = useState(settings.activityTopic || 'Umum');
  const [activityTopicDescription, setActivityTopicDescription] = useState(settings.activityTopicDescription || '');

  // Social Links
  const [instagram, setInstagram] = useState(settings.socialLinks?.instagram || '');
  const [tiktok, setTiktok] = useState(settings.socialLinks?.tiktok || '');
  const [whatsapp, setWhatsapp] = useState(settings.socialLinks?.whatsapp || '');
  const [whatsappMessage, setWhatsappMessage] = useState(settings.socialLinks?.whatsappMessage || '');

  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isSettingsLoaded) {
      setIsMaintenanceMode(settings.isMaintenanceMode);
      setMaintenanceMessage(settings.maintenanceMessage);
      setIsAspirationOpen(settings.isAspirationOpen);
      setAspirationClosedMessage(settings.aspirationClosedMessage);
      setActivityTopic(settings.activityTopic || 'Umum');
      setActivityTopicDescription(settings.activityTopicDescription || '');
      setInstagram(settings.socialLinks?.instagram || '');
      setTiktok(settings.socialLinks?.tiktok || '');
      setWhatsapp(settings.socialLinks?.whatsapp || '');
      setWhatsappMessage(settings.socialLinks?.whatsappMessage || '');
    }
  }, [settings, isSettingsLoaded]);

  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingSettings(true);
    setSaveSuccess(null);
    try {
      await updateSettings({
        isMaintenanceMode,
        maintenanceMessage: maintenanceMessage.trim(),
        isAspirationOpen,
        aspirationClosedMessage: aspirationClosedMessage.trim(),
        activityTopic: activityTopic.trim() || 'Umum',
        activityTopicDescription: activityTopicDescription.trim(),
        socialLinks: {
          instagram: instagram.trim(),
          tiktok: tiktok.trim(),
          whatsapp: whatsapp.trim(),
          whatsappMessage: whatsappMessage.trim(),
        },
        updatedBy: 'Admin OSIS (sangsaka2627)',
      });
      setSaveSuccess('Seluruh pengaturan sistem berhasil disimpan dan langsung diperbarui di halaman publik!');
      setTimeout(() => setSaveSuccess(null), 5000);
    } catch (err) {
      console.error('Gagal menyimpan pengaturan:', err);
      alert('Gagal menyimpan pengaturan sistem. Pastikan koneksi internet stabil.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const topicPresets = [
    { title: 'Umum', desc: 'Aspirasi, saran, dan pertanyaan terbuka seputar lingkungan dan kegiatan SMAN 1 Kemangkon.' },
    { title: 'Class Meeting 2026', desc: 'Saran, evaluasi perlombaan, dan masukan pelaksanaan Class Meeting antarkelas.' },
    { title: 'Pekan Olahraga & Seni (PORSENI)', desc: 'Aspirasi seputar cabang lomba, jadwal pertandingan, dan partisipasi siswa.' },
    { title: 'Peringatan Hari Guru Nasional', desc: 'Ide konsep acara, apresiasi untuk bapak/ibu guru, dan persembahan siswa.' },
    { title: 'Bulan Bahasa & Sastra', desc: 'Usulan kegiatan literasi, lomba cipta puisi, dan kreativitas bahasa.' },
    { title: 'Fasilitas & Kebersihan Sekolah', desc: 'Masukan seputar sarana belajar, toilet, kantin sehat, dan kebersihan kelas.' },
    { title: 'Pemilihan Ketua OSIS (PILKETOS)', desc: 'Aspirasi untuk calon ketua OSIS dan harapan kepengurusan periode baru.' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner & Save Action */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-2 bg-sky-100 text-sky-700 rounded-xl">
              <Settings className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold text-sky-800 bg-sky-50 border border-sky-200 px-3 py-0.5 rounded-full">
              Pusat Kendali Operasional
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Pengaturan Sistem & Konten Publik
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Kelola judul tema kegiatan aspirasi, tautan media sosial resmi OSIS (Instagram, TikTok, CS WhatsApp), serta status pemeliharaan sistem.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleSaveSettings()}
            disabled={isSavingSettings}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer text-sm"
          >
            {isSavingSettings ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-sky-400" />
                <span>Simpan Pengaturan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-900 text-sm font-semibold animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* SECTION 1: Judul / Topik Kegiatan Aspirasi Aktif */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-sky-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-600 text-white rounded-2xl shadow-sm">
              <Tag className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900">
                  1. Judul / Tema Kegiatan Aspirasi
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200">
                  {activityTopic === 'Umum' ? 'Umum Sekolah' : 'Kegiatan Khusus'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Tentukan nama kegiatan sekolah (misal: "Class Meeting", "Hari Guru") atau "Umum" agar siswa fokus menyampaikan aspirasi sesuai agenda.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <label htmlFor="topicInput" className="block text-sm font-bold text-slate-900 mb-2">
              Nama Kegiatan / Topik Aspirasi <span className="text-rose-500">*</span>
            </label>
            <input
              id="topicInput"
              type="text"
              value={activityTopic}
              onChange={(e) => setActivityTopic(e.target.value)}
              placeholder="Contoh: Class Meeting 2026 atau Umum"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 font-bold text-slate-900 text-sm"
              required
            />
          </div>

          {/* Preset Buttons */}
          <div>
            <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
              Pilihan Cepat Template Kegiatan OSIS:
            </span>
            <div className="flex flex-wrap gap-2">
              {topicPresets.map(preset => (
                <button
                  key={preset.title}
                  type="button"
                  onClick={() => {
                    setActivityTopic(preset.title);
                    setActivityTopicDescription(preset.desc);
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer",
                    activityTopic === preset.title
                      ? "bg-sky-600 text-white border-sky-600 shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  )}
                >
                  {preset.title}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="topicDesc" className="block text-sm font-bold text-slate-900">
                Deskripsi / Catatan Singkat Kegiatan (Opsional)
              </label>
              <span className="text-xs text-slate-400">{activityTopicDescription.length}/300</span>
            </div>
            <textarea
              id="topicDesc"
              rows={3}
              maxLength={300}
              value={activityTopicDescription}
              onChange={(e) => setActivityTopicDescription(e.target.value)}
              placeholder="Jelaskan arahan aspirasi yang diharapkan dari siswa..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs sm:text-sm text-slate-800 resize-none leading-relaxed"
            />
          </div>

          {/* Live Preview Box */}
          <div className="pt-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Pratinjau Banner Topik di Halaman Formulir Kirim Aspirasi:
            </p>
            <div className="bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 rounded-2xl p-5 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-600 text-white">
                  Fokus Aspirasi Aktif
                </span>
                <span className="text-xs text-slate-500 font-semibold">SMAN 1 Kemangkon</span>
              </div>
              <h4 className="text-base font-black text-slate-900">
                {activityTopic || 'Umum'}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {activityTopicDescription || 'Aspirasi terbuka untuk seluruh siswa seputar kegiatan dan lingkungan sekolah.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Media Sosial & Layanan CS WhatsApp OSIS */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-emerald-50/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600 text-white rounded-2xl shadow-sm">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                2. Media Sosial & Layanan CS WhatsApp OSIS
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Tautan ini akan otomatis tampil di Footer publik, Navbar, halaman Kirim Aspirasi, dan Mading OSIS.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Instagram */}
            <div>
              <label htmlFor="igInput" className="block text-sm font-bold text-slate-900 mb-1.5 flex items-center gap-2">
                <Instagram className="w-4 h-4 text-pink-600" />
                <span>Akun Instagram OSIS</span>
              </label>
              <input
                id="igInput"
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="Contoh: @osissman1kemangkon atau URL"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm font-medium text-slate-800"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Tautan publik: <strong className="text-slate-600">{getInstagramUrl(instagram)}</strong>
              </p>
            </div>

            {/* TikTok */}
            <div>
              <label htmlFor="tiktokInput" className="block text-sm font-bold text-slate-900 mb-1.5 flex items-center gap-2">
                <span className="font-black text-slate-900 text-sm">TT</span>
                <span>Akun TikTok OSIS</span>
              </label>
              <input
                id="tiktokInput"
                type="text"
                value={tiktok}
                onChange={(e) => setTiktok(e.target.value)}
                placeholder="Contoh: @osis_smansakemangkon atau URL"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm font-medium text-slate-800"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Tautan publik: <strong className="text-slate-600">{getTikTokUrl(tiktok)}</strong>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
            {/* WhatsApp Phone */}
            <div>
              <label htmlFor="waInput" className="block text-sm font-bold text-slate-900 mb-1.5 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Nomor Layanan CS / Helpdesk WhatsApp</span>
              </label>
              <input
                id="waInput"
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="Contoh: 081234567890 atau 6281234567890"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium text-slate-800"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Akan otomatis dihubungkan ke link <code className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded">wa.me</code>
              </p>
            </div>

            {/* WhatsApp Pre-filled message */}
            <div>
              <label htmlFor="waMsgInput" className="block text-sm font-bold text-slate-900 mb-1.5">
                Template Pesan Otomatis WhatsApp (Greeting)
              </label>
              <input
                id="waMsgInput"
                type="text"
                value={whatsappMessage}
                onChange={(e) => setWhatsappMessage(e.target.value)}
                placeholder="Halo Pengurus OSIS SMAN 1 Kemangkon..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-slate-800"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Pesan pembuka yang otomatis muncul di ruang chat WhatsApp siswa
              </p>
            </div>
          </div>

          {/* Social Links Test Buttons */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold text-slate-600">
              Uji Coba Tautan Langsung:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={getInstagramUrl(instagram)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-pink-300 text-slate-700 hover:text-pink-600 rounded-xl text-xs font-bold transition-all shadow-2xs"
              >
                <Instagram className="w-3.5 h-3.5 text-pink-600" />
                <span>Buka Instagram</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>

              <a
                href={getTikTokUrl(tiktok)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-400 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-bold transition-all shadow-2xs"
              >
                <span className="text-xs font-black">TT</span>
                <span>Buka TikTok</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>

              <a
                href={getWhatsAppUrl(whatsapp, whatsappMessage)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Chat CS WhatsApp</span>
                <ExternalLink className="w-3 h-3 text-emerald-200" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: Mode Pemeliharaan (Maintenance Mode) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-amber-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500 text-slate-950 rounded-2xl shadow-sm">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                3. Pengaturan Mode Pemeliharaan (Maintenance Mode)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Kunci akses publik untuk perawatan sistem berkala atau renovasi konten
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-700">
              {isMaintenanceMode ? "Status: AKTIF" : "Status: NONAKTIF"}
            </span>
            <button
              type="button"
              onClick={() => setIsMaintenanceMode(!isMaintenanceMode)}
              className={cn(
                "relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                isMaintenanceMode ? "bg-amber-500" : "bg-slate-300"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                  isMaintenanceMode ? "translate-x-6" : "translate-x-0"
                )}
              />
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-start gap-3 text-xs sm:text-sm text-amber-900 leading-relaxed">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-950 mb-0.5">Aturan Akses Maintenance Mode:</p>
              <ul className="list-disc pl-4 space-y-1 text-xs text-amber-900/90">
                <li>
                  <strong>Siswa & Publik:</strong> Otomatis melihat layar maintenance dengan pesan resmi di bawah, tanpa tombol akses login.
                </li>
                <li>
                  <strong>Pengurus / Admin:</strong> Akun yang telah login dapat membuka seluruh halaman web secara leluasa dan melihat banner pengingat pemeliharaan di bagian atas.
                </li>
              </ul>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="maintenanceMsg" className="block text-sm font-bold text-slate-900">
                Pesan Pemberitahuan untuk Siswa
              </label>
              <span className="text-xs text-slate-400">{maintenanceMessage.length}/500</span>
            </div>
            <textarea
              id="maintenanceMsg"
              rows={4}
              maxLength={500}
              value={maintenanceMessage}
              onChange={(e) => setMaintenanceMessage(e.target.value)}
              placeholder="Tuliskan alasan pemeliharaan dan perkiraan waktu selesai..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm text-slate-800 leading-relaxed resize-none"
            />

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Pilihan Cepat Template:</span>
              <button
                type="button"
                onClick={() => setMaintenanceMessage("Website Kotak Curhat OSIS sedang dalam pemeliharaan berkala untuk peningkatan kualitas layanan dan performa sistem. Silakan kembali beberapa saat lagi.")}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-xl font-medium transition-colors cursor-pointer"
              >
                Pemeliharaan Rutin
              </button>
              <button
                type="button"
                onClick={() => setMaintenanceMessage("Website sedang dinonaktifkan sementara untuk proses rekapitulasi data dan rapat kerja evaluasi kepengurusan OSIS SMAN 1 Kemangkon. Kami akan segera kembali online.")}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-xl font-medium transition-colors cursor-pointer"
              >
                Rekapitulasi Evaluasi
              </button>
              <button
                type="button"
                onClick={() => setMaintenanceMessage("Pengurus OSIS sedang melakukan pembaruan fitur baru pada Kotak Curhat demi kenyamanan seluruh siswa. Akses publik akan dibuka kembali segera hari ini.")}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-xl font-medium transition-colors cursor-pointer"
              >
                Pembaruan Fitur Baru
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: Fitur Buka / Tutup Pengiriman Aspirasi */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-100 text-sky-800 rounded-2xl">
              {isAspirationOpen ? <Unlock className="w-6 h-6 text-sky-700" /> : <Lock className="w-6 h-6 text-rose-700" />}
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                4. Fitur Buka / Tutup Pengiriman Aspirasi
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Kontrol ketersediaan formulir aspirasi tanpa harus mengaktifkan maintenance mode penuh
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-700">
              {isAspirationOpen ? "Status: DIBUKA" : "Status: DITUTUP"}
            </span>
            <button
              type="button"
              onClick={() => setIsAspirationOpen(!isAspirationOpen)}
              className={cn(
                "relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                isAspirationOpen ? "bg-emerald-600" : "bg-slate-300"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                  isAspirationOpen ? "translate-x-6" : "translate-x-0"
                )}
              />
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="closedMsg" className="block text-sm font-bold text-slate-900">
                Pesan Pengumuman Penutupan untuk Siswa
              </label>
              <span className="text-xs text-slate-400">{aspirationClosedMessage.length}/500</span>
            </div>
            <textarea
              id="closedMsg"
              rows={4}
              maxLength={500}
              value={aspirationClosedMessage}
              onChange={(e) => setAspirationClosedMessage(e.target.value)}
              placeholder="Jelaskan alasan penutupan formulir kepada siswa..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm text-slate-800 leading-relaxed resize-none"
            />

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Pilihan Cepat Template:</span>
              <button
                type="button"
                onClick={() => setAspirationClosedMessage("Pengiriman aspirasi saat ini sedang ditutup sementara oleh Pengurus OSIS untuk proses rekapitulasi data dan rapat kerja evaluasi. Kamu masih dapat melihat aspirasi yang telah disetujui di Papan Aspirasi dan pengumuman di Mading.")}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-xl font-medium transition-colors cursor-pointer"
              >
                Rekapitulasi Raker OSIS
              </button>
              <button
                type="button"
                onClick={() => setAspirationClosedMessage("Pengiriman aspirasi baru ditutup sementara selama masa libur akhir semester & ujian sekolah. Kotak Curhat akan dibuka kembali saat kegiatan belajar mengajar dimulai.")}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-xl font-medium transition-colors cursor-pointer"
              >
                Libur Semester & Ujian
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Floating Save Button Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-500 text-center sm:text-left">
          <span>Terakhir diperbarui: </span>
          <strong className="text-slate-800">
            {settings.updatedAt ? formatDistanceToNow(new Date(settings.updatedAt), { addSuffix: true, locale: localeId }) : "Belum pernah"}
          </strong>
          {settings.updatedBy && <span> &bull; {settings.updatedBy}</span>}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            to="/"
            target="_blank"
            className="flex-1 sm:flex-none text-center px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-colors text-xs cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Lihat Halaman Publik</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            type="button"
            onClick={() => handleSaveSettings()}
            disabled={isSavingSettings}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-2xl transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer text-sm"
          >
            {isSavingSettings ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan Semua Pengaturan</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
