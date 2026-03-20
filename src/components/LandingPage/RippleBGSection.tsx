"use client";

import React from 'react';
import { motion } from 'framer-motion';

const RippleBGSection = () => {
  const line1 = "We design, build, test, and deliver engineering-led solutions";
  const line2 = "taking full responsibility from concept to market";

  const letterVariants = {
    hidden: (i: number) => ({
      opacity: 0,
      x: i % 2 === 0 ? (i % 4 === 0 ? -100 : 100) : 0,
      y: i % 2 !== 0 ? (i % 3 === 0 ? -100 : 100) : 0,
      filter: "blur(12px)",
      scale: 0.8,
    }),
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      y: 0,
      filter: "blur(0px)",
      scale: 1,
      transition: {
        delay: i * 0.02,
        duration: 0.9,
        ease: [0.16, 1, 0.3, 1],
      },
    }),
  };

  // Helper to render the animated text
  const AnimatedText = ({ text, delayOffset = 0 }: { text: string; delayOffset?: number }) => (
    <h2 className="text-2xl md:text-3xl font-oxanium font-light tracking-[0.15em] text-white uppercase leading-relaxed flex flex-wrap justify-center">
      {text.split(" ").map((word, wIdx) => (
        <span key={wIdx} className="inline-flex mr-3 mb-2">
          {word.split("").map((char, cIdx) => {
            // Unique index for staggered delay
            const charIndex = wIdx * 5 + cIdx + delayOffset;
            return (
              <motion.span
                key={cIdx}
                custom={charIndex}
                variants={letterVariants}
                initial="hidden"
                whileInView="visible"
                // 'once: false' allows re-triggering on scroll back
                // 'amount: 0.2' ensures it triggers even if the whole line isn't visible
                // 'margin' starts the animation slightly before it enters the viewport
                viewport={{ once: false, amount: 0.2, margin: "-5% 0px -5% 0px" }}
              >
                {char}
              </motion.span>
            );
          })}
        </span>
      ))}
    </h2>
  );

  return (
    <section className="relative w-full ">
      {/* First Heading Section */}
      <div className="relative h-screen w-full flex items-center justify-center p-8">
        <div className="text-center max-w-4xl">
          <AnimatedText text={line1} />
        </div>
      </div>

      {/* Second Heading Section */}
      <div className="relative h-screen w-full flex items-center justify-center p-8">
        <div className="text-center max-w-5xl">
          <AnimatedText text={line2} delayOffset={20} />
        </div>
      </div>
    </section>
  );
};

export default RippleBGSection;

// 1