"use client";

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, X } from 'lucide-react';

import logo from '../../assets/Backgrounds/logo.svg';

const Navbar = ({ showLogo }: { showLogo: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  const menuData = [
    {
      name: "PRODUCTS",
      hasDropdown: true,
      subItems: [
        { label: "Equipment Simulator", path: "/products/equipment-simulator" },
        { label: "Host Simulator", path: "/products/host-simulator" },
        { label: "Host Application Automation", path: "/products/host-automation" },
        { label: "AARKFence", path: "/products/aarkfence" },
        { label: "AARKWaferX", path: "/products/aarkwaferx" },
        { label: "AARK 200 Interface", path: "/products/aark-200" },
        { label: "AARK FA Libraries", path: "/products/aark-fa-libraries" },
        { label: "IntelyDoc", path: "/products/intelydoc" },
        { label: "STEPP UP", path: "/products/stepp-up" },
      ]
    },
    {
      name: "EXPERTISE", hasDropdown: true,
      subItems: [
        { label: "Hardware", path: "/services/hardware" },
        { label: "Software", path: "/services/software" },
        { label: "Cognitive", path: "/services/cognitive" },
        { label: "Cloud", path: "/services/cloud" },
        { label: "Semiconductor", path: "/services/semiconductor" }
      ]
    },
    {
      name: "RESOURCES", hasDropdown: true,
      subItems: [
        { label: "Blogs", path: "/resources/blogs" },
        { label: "News", path: "/resources/news" }
      ]
    },
    { name: "CAREERS", hasDropdown: false, path: "/careers" },
    { name: "ABOUT", hasDropdown: false, path: "/about" },
    { name: "CONNECT", hasDropdown: false, path: "/connect" },
  ];

  const closeMenu = () => {
    setIsOpen(false);
    setExpandedItem(null);
  };

  const handleLogoClick = () => {
    // Detects home across Localhost (:8080), GitHub Pages (#/), and standard hosting (/)
    const isHome =
      location.pathname === "/" &&
      (location.hash === "" || location.hash === "#/" || location.hash === "#");

    if (isHome) {
      // This reloads the current URL, resetting all components and states
      window.location.reload();
    } else {
      // Navigate to home from any other page (like /ai-assistant)
      navigate('/');
    }
    closeMenu();
  };

  return (
    <div className="font-['raleway']">
      <nav className="fixed top-0 left-0 right-0 z-[100] flex justify-between items-center p-4 md:p-6 pointer-events-none">
        <div className="pointer-events-auto">
          <AnimatePresence>
            {showLogo && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                onClick={handleLogoClick}
                className="cursor-pointer"
              >
                <img src={logo} alt="Logo" className="w-10 h-10" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="group flex flex-col gap-1.5 items-end pointer-events-auto focus:outline-none"
          >
            <div className="w-10 h-[4px] bg-white rounded-full" />
            <div className="w-8 h-[4px] bg-white rounded-full transition-all group-hover:w-10" />
            <div className="w-6 h-[4px] bg-white rounded-full transition-all group-hover:w-10" />
          </button>
        )}
      </nav>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-screen w-full sm:w-[450px] bg-black z-[100] flex flex-col shadow-2xl border-l border-white/5"
            >
              <div className="p-10 flex justify-end">
                <button onClick={closeMenu} className="text-white hover:text-blue-400 transition-colors">
                  <X size={32} strokeWidth={1.5} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-12 pb-10 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:display-none">
                <div className="flex flex-col gap-6">
                  {menuData.map((item) => (
                    <div key={item.name} className="flex flex-col">
                      <div
                        className="flex items-center justify-between cursor-pointer group py-1"
                        onClick={() => {
                          if (item.hasDropdown) {
                            setExpandedItem(expandedItem === item.name ? null : item.name);
                          } else {
                            navigate(item.path || "/");
                            closeMenu();
                          }
                        }}
                      >
                        <span className={`text-[22px] font-mid tracking-[0.1em] transition-colors uppercase 
                          ${expandedItem === item.name ? 'text-blue-400' : 'text-white/90 group-hover:text-blue-400'}`}>
                          {item.name}
                        </span>

                        {item.hasDropdown && (
                          <ChevronDown
                            size={20}
                            className={`transition-transform duration-300 
                              ${expandedItem === item.name ? 'rotate-180 text-blue-400' : 'text-white/40 group-hover:text-blue-400'}`}
                          />
                        )}
                      </div>

                      {item.hasDropdown && (
                        <motion.div
                          initial={false}
                          animate={{ height: expandedItem === item.name ? "auto" : 0, opacity: expandedItem === item.name ? 1 : 0 }}
                          className="overflow-hidden"
                        >
                          <div className="flex flex-col gap-3 pt-4 pl-1">
                            {item.subItems?.map((sub) => (
                              <button
                                key={sub.label}
                                onClick={() => {
                                  navigate(sub.path);
                                  closeMenu();
                                }}
                                className="text-[18px] text-left text-gray-400 hover:text-blue-400 hover:underline transition-all w-fit decoration-1 underline-offset-[8px]"
                              >
                                {sub.label}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Navbar;