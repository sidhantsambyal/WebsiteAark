"use client";

import React from 'react';
import { motion } from 'framer-motion';
import NeuralNetworkBackground from './NeuralNetworkBackground';

const ChallengeOutcomeSection = () => {
    return (
        <section
            id="ChallengeOutcome"
            style={{ fontFamily: '"Oxanium", sans-serif' }}
            className="relative w-full h-screen min-h-[800px] overflow-hidden bg-[#050508] text-white flex items-center justify-center"
        >
            {/* 1. Background Image Layer - Lowest Z */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none"
                style={{
                    backgroundImage: 'url("/new-services-bg3.jpg")',
                    mixBlendMode: 'screen'
                }}
            >
                <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* 2. CONTENT LAYER - Middle Z */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-4 md:px-8 pointer-events-none">
                <div className="max-w-5xl text-center flex flex-col items-center gap-6 md:gap-10">

                    <motion.h2
                        initial={{ opacity: 0, y: 50, filter: "blur(12px)" }}
                        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
                        className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light tracking-[0.10em] uppercase leading-tight"
                    >
                        Whatever The Challenge,
                        <br className="hidden sm:block" />
                        <span className="block mt-3">
                            We Deliver Outcomes – Not Just Effort
                        </span>
                    </motion.h2>

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="my-5 md:my-8"
                    >
                        <span className="text-[10px] sm:text-xs md:text-sm tracking-[0.5em] text-[#fff] uppercase font-mono px-5 py-2.5 border-x border-white/20 bg-[#000]">
                            [ YOUR GOALS BECOME OUR RESPONSIBILITY ]
                        </span>
                    </motion.div>

                    <motion.button
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.8, duration: 1 }}
                        whileHover={{ scale: 1.05, backgroundColor: "#003366" }}
                        className="
              px-10 py-4 md:px-12 md:py-5 
              border border-white/20 rounded-full 
              bg-[#001a3d] backdrop-blur-md 
              text-white text-xs sm:text-sm md:text-base 
              tracking-[0.22em] uppercase 
              font-light pointer-events-auto
              transition-colors duration-300
            "
                    >
                        Start Conversation
                    </motion.button>
                </div>
            </div>

            {/* 3. BLOB LAYER - Highest Z and Full Opacity */}
            <div
                className="absolute inset-0 z-50 flex items-center pointer-events-none"
                style={{ justifyContent: 'flex-start', paddingLeft: '5%' }}
            >
                {/* Removed opacity-80 to ensure the blob is fully visible */}
                <div className="w-[90vw] h-[90vw] max-w-[1000px] max-h-[1000px] translate-x-[-15%]">
                    <NeuralNetworkBackground
                        scatter={0}
                        showText={false}
                    />
                </div>
            </div>
        </section>
    );
};

export default ChallengeOutcomeSection;