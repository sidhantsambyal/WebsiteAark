"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';

const RippleBGSection = ({ progress }: { progress: number }) => {
  const line1 = "We design, build, test, and deliver engineering-led solutions";
  const line2 = "Taking full responsibility from concept to market";

  // LINE 1 LOGIC: 
  // In: 0.45 -> 0.55 | Out: 0.70 -> 0.80
  const opacity1 = useMemo(() => {
    if (progress < 0.45 || progress > 0.80) return 0;

    const fadeIn = gsap.utils.mapRange(0.65, 0.75, 0, 1, progress);
    const fadeOut = gsap.utils.mapRange(0.75, 0.85, 1, 0, progress);

    return Math.min(fadeIn, fadeOut);
  }, [progress]);

  // LINE 2 LOGIC: 
  // In: 0.75 -> 0.85 | Out: 0.95 -> 1.0
  const opacity2 = useMemo(() => {
    if (progress < 0.75 || progress > 1.0) return 0;

    const fadeIn = gsap.utils.mapRange(0.85, 0.95, 0, 1, progress);
    const fadeOut = gsap.utils.mapRange(0.95, 1.0, 1, 0, progress);

    return Math.min(fadeIn, fadeOut);
  }, [progress]);

  // Dynamic scaling based on progress for a "zooming" feel
  const scale1 = useMemo(() => 1 + (progress - 0.45) * 0.1, [progress]);
  const scale2 = useMemo(() => 0.95 + (progress - 0.75) * 0.05, [progress]);

  const letterVariants = {
    hidden: { opacity: 0, filter: "blur(4px)" },
    visible: (i: number) => ({
      opacity: 1,
      filter: "blur(0px)",
      transition: { delay: i * 0.01, duration: 0.3 }
    }),
  };

  const renderText = (text: string, isVisible: boolean) => (
    <h2 className="text-2xl md:text-3xl font-oxanium font-light tracking-[0.2em] text-white uppercase leading-relaxed flex flex-wrap justify-center">
      {text.split(" ").map((word, wIdx) => (
        <span key={wIdx} className="inline-flex mr-3 mb-2">
          {word.split("").map((char, cIdx) => (
            <motion.span
              key={cIdx}
              custom={wIdx * 5 + cIdx}
              variants={letterVariants}
              initial="hidden"
              animate={isVisible ? "visible" : "hidden"}
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </h2>
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-40 flex items-center justify-center p-8">
      <div className="relative max-w-5xl w-full flex items-center justify-center">

        {/* Line 1 Wrapper */}
        <motion.div
          style={{ opacity: opacity1, scale: scale1 }}
          className="relative z-10 text-center w-full"
        >
          {renderText(line1, progress > 0.45 && progress < 0.80)}
        </motion.div>

        {/* Line 2 Wrapper */}
        <motion.div
          style={{ opacity: opacity2, scale: scale2 }}
          className="absolute inset-0 z-20 flex items-center justify-center text-center w-full"
        >
          {renderText(line2, progress > 0.75)}
        </motion.div>

      </div>
    </div>
  );
};

export default RippleBGSection;