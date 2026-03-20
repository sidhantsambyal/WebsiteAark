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
  const fullText = line1 + line2;

  const uiOpacity = Math.max(0, (scatter - 0.7) * 4);

  const getVisibleStatus = (index: number) => {
    const triggerPoint = (index / fullText.length) * 0.4;
    const isVisible = progress >= triggerPoint;
    const fadeOut = progress > 0.4 ? Math.max(0, 1 - (progress - 0.4) * 10) : 1;
    return isVisible ? 1 * fadeOut : 0;
  };

  const renderLine = (text: string, startIndex: number) => {
    return text.split("").map((char, i) => (
      <span
        key={`${startIndex}-${i}`}
        style={{
          opacity: getVisibleStatus(startIndex + i),
          display: "inline-block",
          whiteSpace: char === " " ? "pre" : "normal"
        }}
      >
        {char}
      </span>
    ));
  };

  return (
    // Ensure the main container is a relative flex-col to stack items
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-transparent ">

      {/* FIX: We use absolute or a strictly defined flex-center container.
          Setting a fixed aspect-ratio (w == h) helps ensure the rotation axis is dead center.
      */}
      <div className="flex-1 flex items-center justify-center w-full">
        <motion.div
          animate={{
            opacity: uiOpacity,
            scale: 0.9 + (uiOpacity * 0.1),
            // Optional: If you want to force rotation here instead of inside the component:
            // rotate: progress * 360 
          }}
          // fixed size container ensures the Three.js canvas centers correctly
          className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] flex items-center justify-center pointer-events-none"
        >
          <MorphingThreeDLogo progress={progress} />
        </motion.div>
      </div>

      <div className="text-center h-24 flex-shrink-0 px-4 mb-10">
        <h1 className="text-2xl md:text-3xl font-oxanium font-light tracking-widest text-white uppercase leading-tight select-none">
          <div className="block">{renderLine(line1, 0)}</div>
          <div className="h-2" />
          <span className="font-normal">{renderLine(line2, line1.length)}</span>
        </h1>
      </div>
    </div>
  );
};

export default LogoSection;