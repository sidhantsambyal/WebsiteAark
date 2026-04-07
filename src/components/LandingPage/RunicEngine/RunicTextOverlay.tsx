import React, { useMemo } from 'react';
import { motion, MotionValue } from 'framer-motion';

type Quadrant = 'top-left' | 'bottom-left' | 'top-right' | 'bottom-right';

type RunicSubsetConfig = {
  id: 'hardware-software' | 'platform-product' | 'semiconductor-enterprise';
  startIndex: number;
  endIndex: number;
  paragraph1: {
    intro: string;
    impact: string;
    position: Extract<Quadrant, 'top-left' | 'bottom-left'>;
  };
  paragraph2: {
    text: string;
    position: Extract<Quadrant, 'top-right' | 'bottom-right'>;
  };
};

const SUBSETS: RunicSubsetConfig[] = [
  {
    id: 'hardware-software',
    startIndex: 1,
    endIndex: 2,
    paragraph1: { intro: 'Whether it’s', impact: 'Hardware or\nSoftware', position: 'top-left' },
    paragraph2: {
      text: '[ We engineer products across mechanics, electronics and software]',
      position: 'bottom-right',
    },
  },
  {
    id: 'platform-product',
    startIndex: 3,
    endIndex: 4,
    paragraph1: { intro: 'Whether it’s', impact: 'Platform or\nProduct', position: 'bottom-left' },
    paragraph2: { text: '[ We build scalable platforms and products designed to evolve with your business.]', position: 'top-right' },
  },
  {
    id: 'semiconductor-enterprise',
    startIndex: 5,
    endIndex: 6,
    paragraph1: {
      intro: 'Across',
      impact: 'Semiconductor, Enterprise,\n& Industrial systems',
      position: 'top-left',
    },
    paragraph2: {
      text: '[ We engineer integrated solutions that perform in the real world ]',
      position: 'bottom-right',
    },
  },
];

const IN_OFFSET = 0.9;
const OUT_OFFSET = 0.3;

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}

function quadrantClass(q: Quadrant) {
  switch (q) {
    case 'top-left':
      return 'top-[max(7rem,6vh)] left-[max(2.5rem,4vw)] text-left';
    case 'bottom-left':
      return 'bottom-[max(9rem,6vh)] left-[max(2.5rem,6vw)] text-left';
    case 'top-right':
      return 'top-[max(9rem,6vh)] right-[max(2.5rem,6vw)] text-right';
    case 'bottom-right':
      return 'bottom-[max(9rem,6vh)] right-[max(2.5rem,4vw)] text-right';
  }
}

function pickSubset(progress: number) {
  // Prefer the newest subset once we enter its "in" window to avoid overlap flicker.
  for (let i = SUBSETS.length - 1; i >= 0; i -= 1) {
    const s = SUBSETS[i];
    const startWindow = s.startIndex - IN_OFFSET;
    const endWindow = s.endIndex + OUT_OFFSET;
    if (progress >= startWindow && progress <= endWindow) return s;
  }
  return null;
}

function typedText(fullText: string, t: number) {
  const pct = clamp01((t - 0.18) / 0.2);
  const count = Math.floor(pct * fullText.length);
  return fullText.slice(0, count);
}

export function RunicTextOverlay({
  carouselProgress,
  overlayOpacity,
}: {
  carouselProgress: number;
  overlayOpacity?: MotionValue<number>;
}) {
  const subset = useMemo(() => pickSubset(carouselProgress), [carouselProgress]);

  const localT = useMemo(() => {
    if (!subset) return 0;
    const startWindow = subset.startIndex - IN_OFFSET;
    const endWindow = subset.endIndex + OUT_OFFSET;
    return clamp01((carouselProgress - startWindow) / (endWindow - startWindow));
  }, [carouselProgress, subset]);

  const wrapperOpacity = useMemo(() => {
    if (!subset) return 0;
    const fadeIn = clamp01((localT - 0.02) / 0.12);
    const fadeOut = 1 - clamp01((localT - 0.86) / 0.12);
    return fadeIn * fadeOut;
  }, [localT, subset]);

  const wrapperBlur = useMemo(() => {
    if (!subset) return 12;
    const inBlur = 1 - clamp01((localT - 0.05) / 0.25);
    const outBlur = clamp01((localT - 0.85) / 0.20);
    return 12 * Math.max(inBlur, outBlur);
  }, [localT, subset]);

  if (!subset) return null;

  const p1Line1 = {
    opacity: clamp01((localT - 0.02) / 0.15),
    blur: 10 * (1 - clamp01((localT - 0.02) / 0.15)),
  };
  const p1Line2 = {
    opacity: clamp01((localT - 0.1) / 0.20),
    blur: 14 * (1 - clamp01((localT - 0.1) / 0.20)),
  };

  const p2Opacity = clamp01((localT - 0.16) / 0.15) * (1 - clamp01((localT - 0.9) / 0.08));
  const p2Text = typedText(subset.paragraph2.text, localT);

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-20"
      style={{
        opacity: overlayOpacity ?? 1,
        // The subset timing is driven by carouselProgress, so we apply that opacity separately.
        // (This keeps us from needing MotionValue math here.)
        willChange: 'opacity, filter, transform',
        transform: 'translateZ(0)',
        filter: `blur(${wrapperBlur}px)`,
      }}
    >
      <motion.div style={{ opacity: wrapperOpacity }} className="absolute inset-0">
        {/* Paragraph 1 */}
        <div className={`absolute ${quadrantClass(subset.paragraph1.position)} max-w-[min(30rem,32vw)]`}>
          <div
            className="font-[Raleway] text-[clamp(0.95rem,1.15vw,1.15rem)] tracking-[0.12em] text-white/90 "
            style={{ filter: `blur(${p1Line1.blur}px)`, opacity: p1Line1.opacity }}
          >
            {subset.paragraph1.intro}
          </div>
          <div
            className="mt-3 whitespace-pre-line font-[Raleway] font-light leading-[1.04] text-[clamp(2.4rem,3.5vw,3rem)] tracking-[0.06em] text-white"
            style={{ filter: `blur(${p1Line2.blur}px)`, opacity: p1Line2.opacity }}
          >
            {subset.paragraph1.impact}
          </div>
        </div>

        {/* Paragraph 2 */}
        <div className={`absolute ${quadrantClass(subset.paragraph2.position)} max-w-[min(26rem,34vw)]`}>
          <div
            className="font-[Raleway] text-[clamp(0.9rem,1.35vw,1.25rem)] tracking-[0.1em] leading-relaxed text-white/80 whitespace-normal break-words "
            style={{ opacity: p2Opacity, filter: `blur(${6 * (1 - p2Opacity)}px)` }}
          >
            {p2Text}
            <span className="inline-block w-[0.6ch] align-baseline" style={{ opacity: localT < 0.4 ? 1 : 0 }}>
              _
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default RunicTextOverlay;
