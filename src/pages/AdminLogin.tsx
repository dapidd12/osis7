import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { KeyRound, ArrowLeft, ShieldCheck, Lock } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  const { settings } = useAppContext();
  const isEvaluationMode = settings.siteMode === 'evaluation';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'sangsaka2627') {
      localStorage.setItem('adminAuth', 'true');
      navigate('/pengurus/dashboard');
    } else {
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-warm-bg flex items-center justify-center p-4 font-sans text-warm-ink relative overflow-hidden">
      {/* Background ambient orbs */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-amber-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        <Link 
          to="/" 
          className="inline-flex items-center text-warm-muted hover:text-warm-ink mb-6 transition-colors text-xs font-display font-bold"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Halaman Utama Siswa
        </Link>
        
        <div className="glass-card rounded-[2.5rem] p-8 sm:p-10 shadow-warm-lg border border-white/90">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-warm-sm border border-amber-200/80 p-2">
            <img 
              src="https://raw.githubusercontent.com/dapidd12/storage/main/tes/1788314699811-20260902_090434.png" 
              alt="Logo OSIS SMAN 1 Kemangkon" 
              className="w-full h-full object-contain" 
            />
          </div>
          
          <div className="text-center mb-8 space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200/70">
              <Lock className="w-3 h-3 text-amber-700" />
              <span>Portal Pengurus OSIS</span>
            </div>
            <h1 className="text-2xl font-display font-bold text-warm-ink tracking-tight">
              Autentikasi Pengurus
            </h1>
            <p className="text-warm-muted text-xs">
              {isEvaluationMode ? 'Akses pengelolaan Kotak Evaluasi OSIS' : 'Akses pengelolaan Kotak Curhat OSIS'}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-display font-bold text-warm-ink mb-2">
                Kata Sandi Otorisasi
              </label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-light" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi..."
                  className="w-full pl-11 pr-4 py-3 bg-white/90 border border-slate-200/90 rounded-2xl focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 shadow-warm-sm transition-all text-warm-ink text-sm font-medium"
                  autoFocus
                />
              </div>
              {error && (
                <p className="text-rose-600 text-xs mt-2 font-semibold animate-in fade-in">
                  Kata sandi salah. Silakan coba lagi.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-display font-bold text-sm rounded-2xl shadow-warm-lg shadow-glow-amber hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
            >
              Masuk ke Dashboard
            </button>
          </form>

          <div className="mt-8 pt-4 border-t border-slate-100 text-center text-[11px] text-warm-muted">
            <span>SMAN 1 Kemangkon • Periode 2026/2027</span>
          </div>
        </div>
      </div>
    </div>
  );
}
