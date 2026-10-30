import React from 'react';
import { Link } from 'react-router-dom';
import {
  Heart, ShieldCheck, MessageCircle, ArrowDownRight,
  Send, Lightbulb, Users, Clock3,
} from 'lucide-react';

interface DimensionalHeroProps {
  isEvaluationMode?: boolean;
  activityTopic?: string;
  onScrollToForm?: () => void;
  isAspirationOpen?: boolean;
}

/**
 * The opening screen, built as four planes rather than one flat block:
 *
 *   0  ground      graph paper and a warm wash, static
 *   1  mid         the skewed note strip, one line saying what is accepted here
 *   2  subject     the headline and the two actions
 *   3  fore        the school crest and the three promises, overlapping plane 2
 *
 * Nothing on this plane moves by itself. It used to: three blurred orbs plus
 * two badges with `animate-float`, all infinite, under a `useScroll` parallax
 * that re-composited the whole hero on every wheel event. The greeting is a
 * still, and the page's motion budget belongs to the acts below.
 */
export default function DimensionalHero({
  isEvaluationMode,
  activityTopic,
  onScrollToForm,
  isAspirationOpen = true,
}: DimensionalHeroProps) {
  const promises = isEvaluationMode
    ? ['Evaluasi dibaca pengurus', 'Objektif & konstruktif', 'Dirahasiakan']
    : ['Bebas anonim', 'Direspon resmi', 'Aman & terbuka'];

  return (
    <section className="relative -mt-4 pt-10 pb-16 sm:pt-16 sm:pb-24">
      {/* Plane 0: the ground. Graph paper, so the page reads as a school
          noticeboard rather than a generic gradient. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="lp-grid absolute inset-0 opacity-60" />
        <div className="absolute -left-24 top-4 h-64 w-64 rounded-full bg-amber-200/30 blur-3xl" />
        <div className="absolute -right-16 bottom-10 h-56 w-56 rounded-full bg-sky-200/25 blur-3xl" />
      </div>

      <div className="mx-auto max-w-5xl">
        {/* Plane 1: the note strip. One line, and it is the first thing a
            student needs to know: what this page accepts right now. */}
        <div className="lp-hero-note relative mx-auto mb-10 w-fit max-w-full" data-sc-in data-sc-stagger="80">
          <div className="flex items-center gap-2.5 rounded-full border border-amber-900/10 bg-white/85 py-2 pl-2 pr-4 shadow-warm-sm backdrop-blur-sm">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <Clock3 className="h-3.5 w-3.5" />
            </span>
            <p className="m-0 text-[11px] font-semibold tracking-tight text-warm-muted sm:text-xs">
              {isAspirationOpen ? (
                <>
                  Kotak dibuka. Kirim satu kali per hari,{' '}
                  <span className="font-bold text-warm-ink">reset pukul 06:00 WIB</span>.
                </>
              ) : (
                <>
                  Kotak sedang ditutup pengurus.{' '}
                  <span className="font-bold text-warm-ink">Arsip tetap terbuka</span>.
                </>
              )}
            </p>
          </div>
        </div>

        {/* Plane 2: the subject. */}
        <div className="lp-hero-subject text-center" data-sc-in data-sc-stagger="90">
          <h1 className="mx-auto max-w-3xl text-balance font-display text-[2rem] font-black leading-[1.08] tracking-[-0.03em] text-warm-ink sm:text-5xl md:text-[3.6rem]">
            {isEvaluationMode ? (
              <>
                Sampaikan evaluasimu.
                <br />
                <span className="text-amber-700">Bantu kami berbenah.</span>
              </>
            ) : (
              <>
                Setiap suara masuk
                <br />
                <span className="text-amber-700">ke kotak yang sama.</span>
              </>
            )}
          </h1>

          <p className="mx-auto mt-5 max-w-[46ch] text-pretty text-sm leading-relaxed text-warm-muted sm:text-base">
            {isEvaluationMode
              ? 'Catat kendala, usul perbaikan, dan penilaian program kerja OSIS. Semua dibaca pengurus, tanpa perlu menyebut namamu.'
              : 'Usul fasilitas, kritik yang membangun, atau sekadar uneg-uneg. Tulis anonim, dan pengurus tetap membacanya.'}
          </p>

          {activityTopic && activityTopic !== 'Umum' && (
            <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-amber-200/80 bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-900">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Agenda berjalan: <span className="font-bold">{activityTopic}</span>
            </p>
          )}

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onScrollToForm}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-warm-ink px-6 py-3.5 text-sm font-display font-bold text-white shadow-warm transition-[transform,box-shadow,background-color] duration-150 ease-out hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-warm-lg active:translate-y-0 active:scale-[0.98] motion-reduce:transform-none sm:w-auto"
            >
              <Send className="h-4 w-4" />
              <span>{isEvaluationMode ? 'Tulis evaluasi' : 'Tulis aspirasi'}</span>
              <ArrowDownRight className="h-4 w-4 opacity-60" />
            </button>

            {!isEvaluationMode && (
              <Link
                to="/papan"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-900/10 bg-white/80 px-6 py-3.5 text-sm font-display font-bold text-warm-ink shadow-warm-sm backdrop-blur-sm transition-[transform,box-shadow,background-color] duration-150 ease-out hover:-translate-y-0.5 hover:bg-white active:translate-y-0 active:scale-[0.98] motion-reduce:transform-none sm:w-auto"
              >
                <MessageCircle className="h-4 w-4 text-sky-600" />
                <span>Baca papan suara</span>
              </Link>
            )}
          </div>
        </div>

        {/* Plane 3: the fore. A card lifted off the page by a real edge, not a
            halo. Three promises, each a state the engine guarantees. */}
        <div className="lp-hero-fore mx-auto mt-12 grid max-w-2xl grid-cols-1 gap-px overflow-hidden rounded-3xl border border-amber-900/10 bg-amber-900/10 shadow-warm sm:mt-16 sm:grid-cols-3">
          {[
            { icon: isEvaluationMode ? ShieldCheck : Heart, label: promises[0], sub: 'Selalu' },
            { icon: Users, label: promises[1], sub: 'Setiap hari' },
            { icon: isEvaluationMode ? Lightbulb : ShieldCheck, label: promises[2], sub: 'Tanpa syarat' },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="bg-white/90 px-5 py-4 backdrop-blur-sm">
              <Icon className="mb-2 h-4 w-4 text-amber-600" />
              <p className="m-0 text-xs font-display font-bold text-warm-ink">{label}</p>
              <p className="m-0 mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-warm-light">
                {sub}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
