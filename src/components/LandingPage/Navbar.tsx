"use client";

import React from 'react';
import { motion } from 'framer-motion';


const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center md:p-12 md:p-4">
      {/* Logo Container (Top Left) */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <img
          src="/logo.svg"
          alt="Logo"
          className="w-10 h-10 cursor-pointer" // Use Tailwind for sizing
        />
      </motion.div>
      <motion.button
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="group flex flex-col gap-1.5 items-end ml-auto"
      >
        <div className="w-10 h-[4px] bg-white transition-all group-hover:w-10" />
        <div className="w-8 h-[4px] bg-white transition-all group-hover:w-10" />
        <div className="w-6 h-[4px] bg-white transition-all group-hover:w-10" />
      </motion.button>
    </nav>
  );
};

export default Navbar;
