import React from 'react';

const LINE_WIDTHS = ['82%', '64%', '46%'];

/**
 * A folded sheet of paper, drawn as markup rather than an image.
 *
 * It has to take the accent colour, sit in the text layer, stay sharp on every
 * density, and be animatable property by property. A generated picture can do
 * none of those, so the object is a div.
 *
 * The flap is a real 3D rotation around its top edge. At a third of the act it
 * is flat and the note is half its height, which is what folding means. When
 * reduced motion is on, the flap simply starts flat and stays there.
 */
export default function PaperPlane({
  className = '',
  lines = 3,
}: {
  className?: string;
  lines?: number;
}) {
  return (
    <div className={`relative ${className}`} aria-hidden="true" style={{ perspective: '520px' }}>
      {/* the sheet under the fold */}
      <div className="overflow-hidden rounded-b-[10px] rounded-t-sm border border-amber-900/15 bg-[#fffdf7] px-4 pb-3.5 pt-1 shadow-warm-sm">
        <div className="space-y-1.5">
          {LINE_WIDTHS.slice(0, lines).map((w, i) => (
            <span key={i} className="block h-[3px] rounded-full bg-warm-ink/12" style={{ width: w }} />
          ))}
        </div>
      </div>

      {/* the flap, hinged on the shared edge */}
      <div className="lp-paper__flap">
        <div className="rounded-t-[10px] border border-b-0 border-amber-900/15 bg-[#fff6de] px-4 pb-3 pt-3.5 shadow-warm-sm">
          <div className="space-y-1.5">
            {LINE_WIDTHS.slice(0, lines).map((w, i) => (
              <span key={i} className="block h-[3px] rounded-full bg-amber-900/15" style={{ width: w }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
