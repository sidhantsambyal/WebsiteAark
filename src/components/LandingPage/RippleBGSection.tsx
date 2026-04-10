"use client";

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';

const RippleBGSection = ({ progress }: { progress: number }) => {
  const line1 = "We design, build, test, and deliver engineering-led solutions";
  const line2 = "Taking full responsibility from concept to market";

  // Common Typography Classes
  // Ensure "font-raleway" is defined in your tailwind.config.js 
  // e.g. theme: { extend: { fontFamily: { raleway: ["Raleway", "sans-serif"] } } }
  const textStyles = "text-2xl md:text-[32px] font-[Raleway] font-light tracking-[0.15em] text-white leading-tight text-center";

  // LINE 1 LOGIC: In: 0.50 -> 0.60 | Out: 0.70 -> 0.80
  const opacity1 = useMemo(() => {
    if (progress < 0.45 || progress > 0.85) return 0;
    const fadeIn = gsap.utils.mapRange(0.50, 0.60, 0, 1, progress);
    const fadeOut = gsap.utils.mapRange(0.70, 0.80, 1, 0, progress);
    return Math.min(fadeIn, fadeOut);
  }, [progress]);

  // LINE 2 LOGIC: In: 0.75 -> 0.85 | Out: 0.90 -> 1.0
  const opacity2 = useMemo(() => {
    if (progress < 0.70 || progress > 1.0) return 0;
    const fadeIn = gsap.utils.mapRange(0.75, 0.85, 0, 1, progress);
    const fadeOut = gsap.utils.mapRange(0.90, 1.0, 1, 0, progress);
    return Math.min(fadeIn, fadeOut);
  }, [progress]);

  const scale1 = useMemo(() => 1 + (progress - 0.50) * 0.05, [progress]);
  const scale2 = useMemo(() => 1 + (progress - 0.75) * 0.05, [progress]);

  const renderText = (text: string, isActive: boolean) => (
    <div className="flex flex-wrap justify-center max-w-3xl">
      {text.split(" ").map((word, wIdx) => (
        <span key={wIdx} className="inline-flex mx-[0.25em] whitespace-nowrap">
          {word.split("").map((char, cIdx) => (
            <motion.span
              key={cIdx}
              initial={{ opacity: 0, y: 10 }}
              animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
              transition={{
                delay: isActive ? (wIdx * 5 + cIdx) * 0.01 : 0,
                duration: 0.4,
                ease: "easeOut"
              }}
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-40 flex items-center justify-center p-6">
      <div className="relative w-full flex items-center justify-center">

        {/* Line 1 */}
        <motion.div
          style={{ opacity: opacity1, scale: scale1 }}
          className={`${textStyles} absolute`}
        >
          {renderText(line1, progress > 0.45 && progress < 0.75)}
        </motion.div>

        {/* Line 2 */}
        <motion.div
          style={{ opacity: opacity2, scale: scale2 }}
          className={`${textStyles} absolute`}
        >
          {renderText(line2, progress > 0.75)}
        </motion.div>

      </div>
    </div>
  );
};

export default RippleBGSection;