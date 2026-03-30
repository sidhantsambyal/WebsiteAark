"use client";

import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; // CHANGE: Added for routing
import NeuralNetworkBackground from './NeuralNetworkBackground';

interface ChallengeOutcomeSectionProps {
  onStartConversation?: () => void;
}

const ChallengeOutcomeSection: React.FC<ChallengeOutcomeSectionProps> = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const navigate = useNavigate(); // CHANGE: Hook to handle programmatic navigation

  // ─── SCROLL ANIMATION LOGIC ──────────────────────────────────────
  // CHANGE: Added scroll tracking to drive the "Scatter" effect
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "center center"] 
  });

  // Map scroll progress (0 to 1) to scatter values (0.3 down to 0)
  const rawScatter = useTransform(scrollYProgress, [0, 1], [0.3, 0]);
  const smoothScatter = useSpring(rawScatter, { stiffness: 50, damping: 20 });

  // State bridge to pass MotionValue to the non-motion Three.js component
  const [scatterVal, setScatterVal] = useState(0.3);

  useEffect(() => {
    return smoothScatter.on("change", (v) => setScatterVal(v));
  }, [smoothScatter]);

  // ─── NAVIGATION HANDLER ──────────────────────────────────────────
  const handleStartConversation = () => {
    // CHANGE: Redirects to the new route defined in App.tsx
    navigate('/ai-assistant');
  };

  return (
    <section
      id="ChallengeOutcome"
      ref={sectionRef}
      className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-transparent text-white"
    >
      {/* ─── 1. THE BLOB LAYER ─── */}
      {/* CHANGE: Simplified container to 'inset-0' to ensure perfect centering 
          matching the main Landing Page blob position */}
      <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center opacity-60">
         <NeuralNetworkBackground scatter={scatterVal} showText={false} />
      </div>

      {/* ─── 2. CONTENT LAYER ─── */}
      {/* CHANGE: Unified font-family and narrowed max-width for better readability */}
      <div className="relative z-10 w-full max-w-5xl px-6 flex flex-col items-center text-center font-['Oxanium']">
        
        <motion.h2
          initial={{ opacity: 0, y: 30, filter: "blur(12px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-2xl sm:text-4xl md:text-4xl font-light tracking-widest uppercase leading-tight"
        >
          Whatever The Challenge,
          <span className="block mt-2 opacity-90">
            We Deliver Outcomes – Not Just Effort
          </span>
        </motion.h2>

        {/* CHANGE: Adjusted margins (mt-10 mb-14) to fix "gap" issues and 
            cleaned up background styling */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 1 }}
          className="mt-10 mb-14"
        >
          <span className="text-[10px] sm:text-xs tracking-[0.4em] uppercase font-mono px-6 py-3 bg-black/50 backdrop-blur-sm border-x border-white/10">
            [ YOUR GOALS BECOME OUR RESPONSIBILITY ]
          </span>
        </motion.div>

        {/* ─── ACTION BUTTON ─── */}
        <motion.button
          onClick={handleStartConversation}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.8 }}
          whileHover={{ backgroundColor: "#073766", scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-12 py-4 border border-white/20 rounded-full bg-[#0d345a] text-white text-xs sm:text-sm tracking-[0.2em] uppercase font-medium pointer-events-auto transition-all duration-300"
        >
          Start Conversation
        </motion.button>
      </div>
    </section>
  );
};

export default ChallengeOutcomeSection;