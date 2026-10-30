import React from 'react';
import { Mailbox, ShieldCheck, Users, MessageSquareHeart } from 'lucide-react';
import PaperPlane from './PaperPlane';

const INCOMING = [
  { icon: ShieldCheck, text: 'Anonim atau nama, kamu yang pilih' },
  { icon: Users, text: 'Dibaca pengurus, bukan ditumpuk' },
  { icon: MessageSquareHeart, text: 'Jawaban resmi di papan suara' },
];

const OUTGOING = [
  'Pengurus membacanya utuh',
  'Dibahas bersama kesiswaan',
  'Jawabannya terbit di papan',
];

/**
 * The peak of the landing page.
 *
 * A pinned act: the frame holds still while one sheet of paper folds and drops
 * into the box, and the box answers. Everything is driven by the act's progress
 * variable, which the engine already publishes, so there is no scroll listener
 * here and nothing that can start looping on its own.
 *
 * This replaced a four-card "how it works" grid. The grid described the process
 * in four identical boxes (the most recognisable generated-layout tell there
 * is) and it was taller than the form it introduces. One object doing the thing
 * says the same, and it is the part people remember.
 *
 * Every copy block carries a one-value cue: inside a single pinned act there is
 * no hand-off to wait for, so each block arrives and stays for its own point in
 * the story. Removing a block hides only its content, never the box.
 */
export default function VoiceJourneySection() {
  return (
    <section
      id="alur"
      data-sc-act="pin"
      data-sc-span="2.6"
      className="lp-pass relative -mx-4 sm:mx-0"
      aria-labelledby="alur-title"
    >
      <div className="lp-stage flex items-center justify-center px-4 sm:px-6">
        <div className="mx-auto w-full max-w-5xl">
          <div className="grid items-center gap-8 md:grid-cols-[1fr_13rem_1fr] md:gap-6">
            {/* what goes in */}
            <div className="space-y-4 md:justify-self-end md:text-right" data-sc-cue="0 1 0.18 0">
              <h2
                id="alur-title"
                className="text-balance font-display text-xl font-black leading-tight tracking-tight text-warm-ink sm:text-2xl"
              >
                Kamu menulisnya sekali.
                <br />
                Kotaknya yang bekerja.
              </h2>

              <ul className="space-y-2.5">
                {INCOMING.map(({ icon: Icon, text }) => (
                  <li
                    key={text}
                    className="flex items-center gap-2.5 text-xs font-semibold text-warm-muted md:flex-row-reverse"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white text-amber-600 shadow-warm-sm">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* the paper and the box */}
            <div className="relative mx-auto flex w-full max-w-[14rem] flex-col items-center">
              <div className="relative z-10 mb-[-1rem] w-full">
                <PaperPlane className="lp-paper" />
              </div>

              <div className="lp-box relative z-0 w-full">
                <div className="relative overflow-hidden rounded-t-2xl rounded-b-xl border border-amber-900/20 bg-gradient-to-b from-amber-200 to-amber-300 shadow-[0_18px_40px_-14px_rgba(120,72,15,0.45),0_2px_6px_-2px_rgba(15,41,51,0.18)]">
                  <div className="flex h-12 items-center justify-center">
                    <span className="h-1.5 w-24 rounded-full bg-amber-900/35 shadow-[inset_0_2px_3px_rgba(15,41,51,0.35)]" />
                  </div>
                  <div className="border-t border-amber-900/15 bg-white/70 px-4 py-2.5">
                    <p className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-amber-900">
                      <Mailbox className="h-3 w-3" />
                      Kotak OSIS
                    </p>
                  </div>
                </div>

                {/* the catch: light leaving the slot once the paper is in */}
                <div
                  aria-hidden="true"
                  className="lp-catch pointer-events-none absolute -inset-x-6 -top-10 h-24 rounded-full bg-amber-300/60 blur-2xl"
                />
              </div>

              <p className="lp-count mt-5 text-center text-[11px] font-semibold text-warm-muted">
                Kotak dibuka lagi
                <br />
                <span className="font-display text-lg font-black tracking-tight text-warm-ink">
                  06:00 WIB
                </span>
              </p>
            </div>

            {/* what comes out */}
            <div className="space-y-3 md:justify-self-start" data-sc-cue="0.42">
              <ol className="space-y-2.5">
                {OUTGOING.map((step, i) => (
                  <li key={step} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-warm-ink text-[10px] font-bold text-white">
                      {i + 1}
                    </span>
                    <span className="text-xs font-semibold leading-relaxed text-warm-muted">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
