import React from "react";
import { motion } from "framer-motion";
import MorphingThreeDLogo from "./MorphingThreeDLogo";

interface LogoSectionProps {
  scatter: number;
  progress: number;
}

const LogoSection: React.FC<LogoSectionProps> = ({ scatter, progress }) => {
  const line1 = "Endless possibilities begin";
  const line2 = "with the right engineering partner";

  const uiOpacity = Math.max(0, (scatter - 0.2) * 2);

  const getExitStyles = () => {
    const fadeOut = progress > 0.25 ? Math.max(0, 1 - (progress - 0.25) * 10) : 1;
    const blurOut = progress > 0.25 ? (progress - 0.25) * 40 : 0;
    const moveOut = progress > 0.25 ? (progress - 0.25) * -20 : 0;

    return {
      opacity: fadeOut,
      filter: `blur(${blurOut}px)`,
      transform: `translateY(${moveOut}px)`
    };
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-transparent gap-4">
      <div className="flex items-center justify-center w-full">
        <motion.div
          animate={{
            opacity: uiOpacity,
            scale: 0.9 + (uiOpacity * 0.1),
          }}
          transition={{ duration: 0.2 }}
          className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] flex items-center justify-center pointer-events-none"
        >
          <MorphingThreeDLogo progress={progress} />
        </motion.div>
      </div>

      <div className="text-center px-4">
        <h1 className="text-xl sm:text-2xl md:text-[32px] font-[Raleway] font-light tracking-widest text-white leading-tight select-none">
          <div style={getExitStyles()}>
            {/* Line 1 */}
            <motion.div
              initial={{ opacity: 0, filter: "blur(12px)" }}
              whileInView={{ opacity: 1, filter: "blur(0px)" }}
              viewport={{ once: false, amount: 0.5 }}
              transition={{ duration: 1.0, ease: "easeOut" }}
              className="block"
            >
              {line1}
            </motion.div>

            <div className="h-2" />

            {/* Line 2 */}
            <motion.div
              initial={{ opacity: 0, filter: "blur(12px)" }}
              animate={progress > 0.02 ? { opacity: 1, filter: "blur(0px)" } : { opacity: 0, filter: "blur(12px)" }}
              transition={{ duration: 1.0, ease: "easeOut" }}
              className="block font-[Raleway]"
            >
              {line2}
            </motion.div>
          </div>
        </h1>
      </div>
    </div>
  );
};

export default LogoSection;