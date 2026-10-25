import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Megaphone, Trash2, Plus, Calendar, Pin, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Announcement } from '../../types';

interface AdminMadingManagerProps {
  announcements: Announcement[];
  addAnnouncement: (title: string, content: string, author: string) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
}

export default function AdminMadingManager({
  announcements,
  addAnnouncement,
  deleteAnnouncement
}: AdminMadingManagerProps) {
  const [isAddingMading, setIsAddingMading] = useState(false);
  const [madingTitle, setMadingTitle] = useState('');
  const [madingContent, setMadingContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!madingTitle.trim() || !madingContent.trim()) return;

    setIsSubmitting(true);
    try {
      await addAnnouncement(madingTitle.trim(), madingContent.trim(), 'Admin OSIS');
      setMadingTitle('');
      setMadingContent('');
      setIsAddingMading(false);
      setNotification('Pengumuman berhasil diterbitkan ke mading publik!');
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      console.error('Gagal menerbitkan pengumuman:', err);
      alert('Gagal menerbitkan pengumuman. Pastikan koneksi stabil.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Yakin ingin menghapus pengumuman "${title}"? Tindakan ini tidak dapat dibatalkan.`)) {
      try {
        await deleteAnnouncement(id);
        setNotification('Pengumuman telah dihapus.');
        setTimeout(() => setNotification(null), 3000);
      } catch (err) {
        console.error('Gagal menghapus:', err);
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header bar */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-sky-100 text-sky-700 rounded-xl">
              <Megaphone className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Kelola Mading & Pengumuman OSIS
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Terbitkan informasi kegiatan, jadwal penting, atau maklumat resmi kepada seluruh siswa.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddingMading(!isAddingMading)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-2xl transition-all shadow-sm text-sm shrink-0 cursor-pointer"
        >
          {isAddingMading ? 'Batal Tambah' : (
            <>
              <Plus className="w-4 h-4" />
              <span>Buat Pengumuman</span>
            </>
          )}
        </button>
      </div>

      {notification && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-emerald-900 text-xs sm:text-sm font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Form tambah pengumuman */}
      {isAddingMading && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-top-3">
          <div className="border-b border-slate-100 pb-4 mb-6">
            <h3 className="text-lg font-black text-slate-900">Formulir Penerbitan Pengumuman</h3>
            <p className="text-xs text-slate-500">Pengumuman akan langsung terlihat di halaman Mading OSIS.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="madingTitleInput" className="block text-sm font-bold text-slate-900 mb-1.5">
                Judul Pengumuman <span className="text-rose-500">*</span>
              </label>
              <input
                id="madingTitleInput"
                type="text"
                value={madingTitle}
                onChange={(e) => setMadingTitle(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-sm font-medium text-slate-800 transition-all"
                placeholder="Contoh: Jadwal Class Meeting & Perlombaan Antarkelas 2026"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="madingContentInput" className="block text-sm font-bold text-slate-900">
                  Isi Pengumuman <span className="text-rose-500">*</span>
                </label>
                <span className="text-xs text-slate-400">{madingContent.length}/2000</span>
              </div>
              <textarea
                id="madingContentInput"
                rows={6}
                maxLength={2000}
                value={madingContent}
                onChange={(e) => setMadingContent(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-sm text-slate-800 leading-relaxed resize-none transition-all"
                placeholder="Tuliskan detail pengumuman secara rinci, tanggal pelaksanaan, persyaratan, dsb..."
                required
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddingMading(false)}
                className="px-5 py-2.5 text-slate-600 hover:text-slate-800 text-sm font-bold rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-md text-sm cursor-pointer"
              >
                {isSubmitting ? 'Menerbitkan...' : 'Terbitkan Pengumuman'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Daftar Pengumuman Mading */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 sm:px-7 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Daftar Pengumuman Aktif ({announcements.length})
          </span>
          <span className="text-xs text-slate-400">SMAN 1 Kemangkon</span>
        </div>

        <div className="divide-y divide-slate-100">
          {announcements.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <Megaphone className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-bold text-slate-700">Belum Ada Pengumuman di Mading</p>
              <p className="text-xs text-slate-400">Klik tombol "Buat Pengumuman" di atas untuk menambahkan informasi baru.</p>
            </div>
          ) : (
            announcements.map((announcement) => (
              <div 
                key={announcement.id} 
                className="p-6 hover:bg-slate-50/60 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-4"
              >
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[10px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full">
                      <Pin className="w-2.5 h-2.5 text-sky-600" />
                      Pengumuman
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true, locale: localeId })}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 break-words leading-snug">
                    {announcement.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 whitespace-pre-wrap break-words leading-relaxed">
                    {announcement.content}
                  </p>

                  <div className="pt-1 flex items-center gap-2 text-xs text-slate-400">
                    <span>Diterbitkan oleh:</span>
                    <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                      {announcement.author}
                    </span>
                  </div>
                </div>

                <div className="self-end sm:self-start shrink-0">
                  <button
                    type="button"
                    onClick={() => handleDelete(announcement.id, announcement.title)}
                    className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                    title="Hapus Pengumuman"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
