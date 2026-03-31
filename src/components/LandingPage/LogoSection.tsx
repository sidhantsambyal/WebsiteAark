import React from "react";
import { motion } from "framer-motion";
import MorphingThreeDLogo from "./MorphingThreeDLogo";

interface LogoSectionProps {
  scatter: number;
  progress: number;
}

const LogoSection: React.FC<LogoSectionProps> = ({ scatter, progress }) => {
  const line1 = "Endless Possibilities Begin";
  const line2 = "With The Right Engineering Partner";
  const fullText = line1 + " " + line2;

  const uiOpacity = Math.max(0, (scatter - 0.2) * 2);

  const getVisibleStatus = (index: number) => {
    const isLine1 = index < line1.length;
    const triggerPoint = isLine1 ? 0 : ((index - line1.length) / line2.length) * 0.15;
    const isVisible = progress >= triggerPoint;
    const fadeOut = progress > 0.15 ? Math.max(0, 1 - (progress - 0.15) * 10) : 1;
    return isVisible ? 1 * fadeOut : 0;
  };

  const renderLine = (text: string, startIndex: number) => {
    return text.split("").map((char, i) => (
      <span
        key={`${startIndex}-${i}`}
        className="transition-all duration-300"
        style={{
          opacity: getVisibleStatus(startIndex + i),
          display: "inline-block",
          whiteSpace: char === " " ? "pre" : "normal",
          filter: `blur(${progress > 0.15 ? (progress - 0.15) * 40 : 0}px)`,
          transform: `translateY(${progress > 0.15 ? (progress - 0.15) * -20 : 0}px)`
        }}
      >
        {char}
      </span>
    ));
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-transparent gap-4">
      <div className="flex items-center justify-center w-full">
        <motion.div
          animate={{
            opacity: uiOpacity,
            scale: 0.9 + (uiOpacity * 0.1),
          }}
          className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] flex items-center justify-center pointer-events-none"
        >
          <MorphingThreeDLogo progress={progress} />
        </motion.div>
      </div>

      {/* Removed 'mb-10' to bring it closer to the logo */}
      <div className="text-center px-4">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-oxanium font-light tracking-widest text-white uppercase leading-tight select-none">
          <div className="block">{renderLine(line1, 0)}</div>
          <div className="h-2" />
          <span className="font-normal">{renderLine(line2, line1.length + 1)}</span>
        </h1>
      </div>
    </div>
  );
};

export default LogoSection;