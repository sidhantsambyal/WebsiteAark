"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';

// Replace this path with your actual video file location
import backgroundVideo from '/Section4and5.mp4'; 

const quickActions = [
  "Explore AAR-X Products",
  "Understand Our Services",
  "Semiconductor FA & SEMI Standards",
  "Request A Live Demo",
  "Discuss A Project"
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 1.0 }
  }
};

const buttonVariants = {
  hidden: { opacity: 0, y: 15, filter: "blur(5px)" },
  visible: {
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
  }
};

const AIChatBot = () => {
  const [query, setQuery] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      console.log("Searching for:", query);
      // Add your search/chat logic here
    }
  };

  return (
    <section 
      id="AIContact"
      style={{ fontFamily: '"Oxanium", sans-serif' }}
      className="relative w-full h-screen overflow-hidden bg-[#050508] text-white flex flex-col items-center justify-center px-4"
    >
      {/* VIDEO BACKGROUND LAYER */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-60"
          style={{ mixBlendMode: 'screen' }}
        >
          <source src={backgroundVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* CONTENT LAYER */}
      <div className="relative z-10 w-full max-w-5xl text-center flex flex-col items-center">
        
        <motion.h2
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          className="text-2xl md:text-2xl font-light tracking-[0.2em] uppercase leading-tight mb-16"
        >
          Hi there - How may I assist you today?
        </motion.h2>

        {/* ACTUAL INPUT FIELD */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.9, delay: 0.7 }}
          className="relative w-full max-w-3xl mb-12"
        >
          <div className="absolute inset-0 bg-[#60a5fa]/10 blur-xl rounded-full" />
          
          <div className="relative z-10 w-full border border-white/10 rounded-full bg-black/40 backdrop-blur-md flex items-center hover:border-white/20 transition-colors px-8 py-4">
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type Your Question Here..."
              className="w-full bg-transparent outline-none text-white placeholder-white/50 tracking-wide text-sm md:text-base"
            />
            <span className="font-mono text-sm tracking-widest text-[#60a5fa]/60 ml-2 animate-pulse">_</span>
          </div>
        </motion.div>

        {/* QUICK ACTIONS */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.9 }}
          className="flex flex-wrap justify-center gap-4 max-w-4xl"
        >
          {quickActions.map((action, index) => (
            <motion.button
              key={index}
              variants={buttonVariants}
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
              onClick={() => setQuery(action)}
              className="px-6 py-3 border border-white/10 rounded-full text-xs md:text-sm tracking-wider text-white/70 bg-black/20 hover:text-white transition-colors"
            >
              {action}
            </motion.button>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default AIChatBot;