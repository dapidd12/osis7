import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { 
  X, Check, AlertTriangle, RotateCcw, Trash2, 
  MessageCircleReply, ExternalLink, User, Lock, Sparkles, Send, Tag 
} from 'lucide-react';
import { Aspiration } from '../../types';
import { cn } from '../../lib/utils';

interface AdminReadingModalProps {
  aspiration: Aspiration | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: Aspiration['status']) => Promise<void>;
  onAddResponse: (id: string, response: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onReload: () => void;
}

export default function AdminReadingModal({
  aspiration,
  onClose,
  onUpdateStatus,
  onAddResponse,
  onDelete,
  onReload
}: AdminReadingModalProps) {
  if (!aspiration) return null;

  const [isReplying, setIsReplying] = useState(false);
  const [modalResponseText, setModalResponseText] = useState(aspiration.response || '');
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);

  const handleSaveReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalResponseText.trim()) return;
    setIsSubmittingResponse(true);
    try {
      await onAddResponse(aspiration.id, modalResponseText.trim());
      aspiration.response = modalResponseText.trim();
      setIsReplying(false);
      onReload();
    } catch (err) {
      console.error('Gagal membalas:', err);
    } finally {
      setIsSubmittingResponse(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 sm:p-7 border-b border-slate-100 flex items-start justify-between gap-4 sticky top-0 bg-white/95 backdrop-blur-xs z-10">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={cn(
                "px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider",
                aspiration.status === 'Pending' ? "bg-amber-100 text-amber-800" :
                aspiration.status === 'Approved' ? "bg-emerald-100 text-emerald-800" :
                "bg-rose-100 text-rose-800"
              )}>
                {aspiration.status}
              </span>
              <span className="text-xs font-medium text-slate-600 bg-slate-100 px-3 py-0.5 rounded-full">
                {aspiration.category}
              </span>
              {aspiration.activityTopic && aspiration.activityTopic !== 'Umum' && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 bg-amber-50 border border-amber-200 px-3 py-0.5 rounded-full">
                  <Tag className="w-3 h-3 text-amber-700" />
                  <span>Agenda: {aspiration.activityTopic}</span>
                </span>
              )}
              <span className="text-xs text-slate-400">
                {formatDistanceToNow(new Date(aspiration.createdAt), { addSuffix: true, locale: localeId })}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 break-words leading-snug">
              {aspiration.subject}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors shrink-0 cursor-pointer"
            title="Tutup dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-7 space-y-6 flex-1">
          {/* Author Badge */}
          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
            <User className="w-4 h-4 text-slate-400" />
            <span className="text-slate-500">Pengirim:</span>
            <span className="font-bold text-slate-800">
              {aspiration.isAnonymous ? "Anonim (Identitas Dirahasiakan)" : (aspiration.authorName || "Siswa")}
            </span>
          </div>

          {/* Full Message */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Isi Pesan Lengkap Aspirasi:
            </p>
            <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 text-sm text-slate-800 whitespace-pre-wrap break-words leading-relaxed font-normal">
              {aspiration.message}
            </div>
          </div>

          {/* OSIS Response Section */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                <span>Tanggapan Resmi Pengurus OSIS</span>
              </p>
              {!isReplying && (
                <button
                  type="button"
                  onClick={() => setIsReplying(true)}
                  className="text-xs font-bold text-sky-600 hover:text-sky-700 cursor-pointer"
                >
                  {aspiration.response ? "Sunting Tanggapan" : "+ Beri Tanggapan"}
                </button>
              )}
            </div>

            {isReplying ? (
              <form onSubmit={handleSaveReply} className="space-y-3 bg-sky-50/50 p-4 rounded-2xl border border-sky-200">
                <textarea
                  rows={4}
                  value={modalResponseText}
                  onChange={(e) => setModalResponseText(e.target.value)}
                  placeholder="Tuliskan tanggapan resmi dari pihak OSIS..."
                  className="w-full p-3 bg-white border border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs sm:text-sm text-slate-800 resize-none"
                  required
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsReplying(false)}
                    className="px-3.5 py-1.5 text-slate-600 hover:text-slate-800 text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingResponse}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg text-xs cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmittingResponse ? "Menyimpan..." : "Kirim Tanggapan"}</span>
                  </button>
                </div>
              </form>
            ) : aspiration.response ? (
              <div className="p-4 bg-sky-50/70 border border-sky-200/80 rounded-2xl text-xs sm:text-sm text-sky-950 leading-relaxed whitespace-pre-wrap break-words">
                {aspiration.response}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-200/70 rounded-2xl text-xs text-slate-400 italic">
                Belum ada tanggapan resmi dari OSIS untuk aspirasi ini.
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50/60 flex flex-wrap items-center justify-between gap-3 sticky bottom-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={async () => {
                if (window.confirm('Yakin ingin menghapus permanen aspirasi ini?')) {
                  await onDelete(aspiration.id);
                  onReload();
                  onClose();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-rose-200"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {aspiration.status === 'Pending' && (
              <>
                <button
                  type="button"
                  onClick={async () => {
                    await onUpdateStatus(aspiration.id, 'Rejected');
                    onReload();
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-colors cursor-pointer border border-rose-200"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Tolak Aspirasi</span>
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await onUpdateStatus(aspiration.id, 'Approved');
                    onReload();
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Setujui & Publikasikan</span>
                </button>
              </>
            )}

            {aspiration.status === 'Approved' && (
              <>
                <button
                  type="button"
                  onClick={async () => {
                    if (window.confirm('Tarik aspirasi ini kembali ke status Pending? Pesan tidak akan lagi tampil di papan publik siswa.')) {
                      await onUpdateStatus(aspiration.id, 'Pending');
                      onReload();
                      onClose();
                    }
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-xl transition-colors cursor-pointer border border-amber-200"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Tarik ke Pending</span>
                </button>
              </>
            )}

            {aspiration.status === 'Rejected' && (
              <button
                type="button"
                onClick={async () => {
                  await onUpdateStatus(aspiration.id, 'Pending');
                  onReload();
                  onClose();
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-xl transition-colors cursor-pointer border border-amber-200"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Pulihkan ke Pending</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
