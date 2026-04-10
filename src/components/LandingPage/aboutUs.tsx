import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import Navbar from './Navbar';
import GlassBot from './glassBot';
import StarField from './StarField'; // New Component
import fullLogoImg from '../../assets/Backgrounds/fullLogo.png';
// import { ChevronDown } from 'lucide-react';
import ScrollDown from './scrolldown';
import aboutBgImage from '../../assets/Backgrounds/HomepageBG.jpg';
import missionImg from '../../assets/Backgrounds/Mission.png';
import visionImg from '../../assets/Backgrounds/Vision.png';
import foundationImg from '../../assets/Backgrounds/OurFoundation.png';
import MorphingThreeDLogo from './MorphingThreeDLogo';

const AboutUs = () => {
  const containerRef = useRef<HTMLElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);

  // Fallbacks for initial render
  const [orbMetrics, setOrbMetrics] = useState({ targetX: 0.625, targetY: -200, splitDist: 500 });

  useEffect(() => {
    const updateMetrics = () => {
      if (orbRef.current) {
        const w = orbRef.current.offsetWidth;
        // height is firmly 500px natively. We calculate targetX to squarely match the 500px height.
        // targetY calculations push it perfectly center of window
        // splitDist mathematically calculates the exact internal pixel shift required to generate a massive 375px visual gap framing the text beneath
        // Multiplier of 2.0 generates exactly 250px shift per circle. Total gap center-to-center = 500px!
        setOrbMetrics({
          targetX: 500 / w,
          targetY: -(window.innerHeight / 2) + 250,
          splitDist: w * 2.0
        });
      }
    };
    updateMetrics();
    window.addEventListener('resize', updateMetrics);
    return () => window.removeEventListener('resize', updateMetrics);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Scrub Engine: converts harsh un-interpolated mouse wheel notches into liquid-smooth momentum ticks
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // TEXT LAYER TRANSFORMATIONS (PHASE 1)
  const textY = useTransform(smoothProgress, [0, 0.3], ["0vh", "-30vh"]);
  const textScale = useTransform(smoothProgress, [0, 0.3], [1, 0.6]);
  const textOpacity = useTransform(smoothProgress, [0, 0.3], [1, 0]);

  // GALAXY ORB TRANSFORMATIONS
  // Timeline:
  // 0 - 0.4: Orb rises to center and squashes into a circle
  // 0.4 - 0.55: IMPLICIT REDUCTION (No Rest) Orb immediately scales down with text
  // 0.55 - 0.75: Resting Phase 2
  const orbY = useTransform(smoothProgress, [0, 0.4, 0.55], [465, orbMetrics.targetY, orbMetrics.targetY - 100]);

  // Condense the responsive width down perfectly to 500px forming a circle during phase 1
  const orbScaleX = useTransform(smoothProgress, [0, 0.4, 1], [1, orbMetrics.targetX, orbMetrics.targetX]);
  // Counteract the severe horizontal parent squash so child images retain their beautiful native 1:1 circular aspect ratio
  const inverseOrbScaleX = useTransform(orbScaleX, s => 1 / s);

  // Phase 1 shrinks it to 0.7 fitting the screen. Phase 2 drops it to 0.25 immediately after
  const orbScale = useTransform(smoothProgress, [0, 0.4, 0.55], [1, 0.7, 0.20]);

  // Fade out rings as it forms the solid orb
  const ringsOpacity = useTransform(smoothProgress, [0, 0.4], [1, 0]);

  // PHASE 2 TEXT TRANSFORMATIONS
  // Fades in alongside orb scaling down (0.4 -> 0.55)
  // Holds briefly until 0.6, fades completely before 0.65
  const phase2Opacity = useTransform(smoothProgress, [0.4, 0.55, 0.6, 0.65], [0, 1, 1, 0]);
  const phase2Y = useTransform(smoothProgress, [0.4, 0.55], [50, 0]);

  // PHASE 3 (THE FRACTURE) TRANSFORMATIONS
  // Wait until text is safely faded out (starts at 0.65)
  const coreGlowOpacity = useTransform(smoothProgress, [0.65, 0.7], [1, 0]);
  // Use the exact calculated split distance to achieve exactly 60px visible gap accounting for all width squashes!
  const orbSplitX = useTransform(smoothProgress, [0.65, 0.8], [0, orbMetrics.splitDist]);

  // Mathematically track the absolute geometric pixel drift of the circles combining all parent compression matrices
  const textShiftLeft = useTransform(
    [orbSplitX, orbScale, orbScaleX],
    ([split, scale, sX]: any) => -(split * scale * sX)
  );

  const textShiftRight = useTransform(
    [orbSplitX, orbScale, orbScaleX],
    ([split, scale, sX]: any) => (split * scale * sX)
  );

  // PHASE 3 TEXT TRANSFORMATIONS
  // Fades in precisely as the circles slide out into their final separated positions
  const phase3TextOpacity = useTransform(smoothProgress, [0.7, 0.8], [0, 1]);


  return (
    <main ref={containerRef} className="relative w-full h-[350vh]">

      {/* FIXED VIEWPORT WINDOW */}
      <div className="sticky top-0 w-full h-screen overflow-hidden text-white font-['Raleway']">
        <link href="https://fonts.googleapis.com/css2?family=Raleway:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&display=swap" rel="stylesheet" />

        {/* 0. LAYER: BACKGROUND IMAGE */}
        <motion.div
          className="absolute inset-0 w-full h-full bg-cover bg-center z-[-1]"
          style={{
            backgroundImage: `url(${typeof aboutBgImage === 'string' ? aboutBgImage : (aboutBgImage as any).src || aboutBgImage})`,
            opacity: 1
          }}
        />
        <Navbar showLogo={true} customLogo={fullLogoImg} logoClassName="h-10 md:h-12 w-auto object-contain" />

        {/* 1. LAYER: SCATTERED STARS */}
        <StarField />

        {/* 2. LAYER: MAIN CONTENT */}
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-6 text-center">
          {/* Pixelated Logo tightly locked to progress 0.41 (fully pixelated state), independently faded out when the sphere hits center */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] sm:w-[530px] sm:h-[530px] z-[5] pointer-events-none opacity-80"
            style={{ opacity: useTransform(smoothProgress, [0.3, 0.4], [0.8, 0]) }}
          >
            <MorphingThreeDLogo progress={0.41} />
          </motion.div>

          <motion.div
            style={{ y: textY, scale: textScale, opacity: textOpacity }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl relative z-10"
          >
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-light tracking-[0.1em] uppercase mb-8 leading-tight relative z-10">
              Integrated Solutions <br />
              <span className="opacity-90 text-3xl md:text-3xl lg:text-5xl">Focused On Quality</span>
            </h1>
            <p className="text-sm md:text-lg tracking-[0.2em] leading-relaxed text-white/70 max-w-4xl mx-auto font-light relative z-10">
              AARK Global is an engineering innovation partner serving industries like manufacturing, technology, fintech, semiconductors, SaaS, and healthcare.
            </p>
          </motion.div>
        </div>

        {/* 3. LAYER: FOOTER UI
        <motion.div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20">
          <div className="w-8 h-12 border border-white/20 rounded-full flex items-start justify-center p-2">
            <motion.div
              animate={{ y: [0, 16, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="w-1 h-2 bg-white rounded-full"
            />
          </div>
          <ChevronDown size={16} className="text-white/30 animate-bounce" />
        </motion.div> */}

        {/* 4. LAYER: 3D GLASSBOT */}
        <motion.div
          className="fixed bottom-6 right-8 z-[110] w-24 h-24 md:w-28 md:h-28 pointer-events-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div className="w-full h-full cursor-pointer relative group">
            <div className="absolute inset-0 bg-white/5 blur-xl rounded-full" />
            <GlassBot />
          </div>
        </motion.div>

        {/* 5. LAYER: GLOWING DOMED GALAXY WITH RIPPLES */}
        {/* Swapped class "translate-y-[93%]" for framer-motion style "y: orbY" to flawlessly preserve initial look */}
        <motion.div
          ref={orbRef}
          className="absolute bottom-0 left-1/2 w-[100vw] sm:w-[80vw] md:w-[700px] lg:w-[800px] h-[500px] pointer-events-none z-0 flex justify-center"
          style={{
            x: "-50%", // replaced -translate-x-1/2 with Framer 
            y: orbY,
            scaleX: orbScaleX,
            scale: orbScale,
            willChange: "transform",
          }}
        >

          {/* Ripple 1 (Inner) - Fades out */}
          {/* <motion.div
            className="absolute top-[-40px] left-1/2 -translate-x-1/2 w-[105%] h-[105%] rounded-[50%] border-t-[4px] border-blue-400/20 shadow-[0_-20px_50px_rgba(96,165,250,0.1)]"
            style={{ opacity: ringsOpacity }}
          /> */}

          {/* Core Atmosphere Glow - Fades out entirely in Phase 3 */}
          <motion.div
            className="absolute top-[-80px] w-[80%] h-[200px] bg-blue-600/20 blur-[60px] rounded-[50%]"
            style={{ opacity: coreGlowOpacity }}
          />

          {/* Solid Black Base Dome - Left Descendant Full Circle */}
          <motion.div
            className="absolute inset-0 w-full h-full rounded-[50%] bg-transparent flex items-center justify-center"
            style={{
              x: useTransform(orbSplitX, x => -x), // Negative shift mathematically counteracts container X-scaling squash
              boxShadow: '0 0 40px 10px rgba(46, 45, 177, 20%), 0 0 80px 20px rgba(46, 45, 177,20%)'
            }}
          >
            <motion.img
              src={typeof missionImg === 'string' ? missionImg : (missionImg as any).src || missionImg}
              className="w-full h-full p-6 md:p-12 object-contain z-10"
              style={{ opacity: phase3TextOpacity, scaleX: inverseOrbScaleX }}
              alt="Mission"
            />
          </motion.div>

          {/* Solid Black Base Dome - Right Descendant Full Circle */}
          <motion.div
            className="absolute inset-0 w-full h-full rounded-[50%] bg-transparent flex items-center justify-center"
            style={{
              x: orbSplitX, // Positive shift
              boxShadow: '0 0 40px 10px rgba(53,49,177,30%), 0 0 80px 20px rgba(53,49,177,30%)'
            }}
          >
            <motion.img
              src={typeof visionImg === 'string' ? visionImg : (visionImg as any).src || visionImg}
              className="w-full h-full p-6 md:p-12 object-contain z-10"
              style={{ opacity: phase3TextOpacity, scaleX: inverseOrbScaleX }}
              alt="Vision"
            />
          </motion.div>

          {/* Center Foundation Image perfectly tracking the merged orb text sequence */}
          <motion.img
            src={typeof foundationImg === 'string' ? foundationImg : (foundationImg as any).src || foundationImg}
            className="absolute inset-0 w-full h-full p-6 md:p-14 object-contain z-20 pointer-events-none"
            style={{ opacity: phase2Opacity, scaleX: inverseOrbScaleX }}
            alt="Our Foundation"
          />
        </motion.div>

        {/* 6. LAYER: PHASE 2 TEXT (OUR FOUNDATION) */}
        <motion.div
          className="absolute inset-0 w-full h-full flex flex-col items-center justify-center z-20 pointer-events-none"
          style={{
            opacity: phase2Opacity,
            y: phase2Y,
          }}
        >
          {/* Transparent spacer exactly matching the space grabbed by the small orb */}
          <div className="h-[120px] w-full" />

          <div className="w-full max-w-4xl px-6 text-center mt-6">
            <h2 className="text-4xl md:text-5xl lg:text-[54px] font-light tracking-wide mb-8 mt-10">
              Our Foundation
            </h2>
            <p className="text-[15px] md:text-lg tracking-[0.05em] leading-[1.8] text-white/50 font-light mx-auto max-w-[850px]">
              AARK Global brings deep expertise across <span className="italic text-white/80">hardware</span> and <span className="italic text-white/80">software engineering, cloud platforms</span>, and <span className="italic text-white/80">enterprise solutions</span>. we combine real-world industry experience with <br /> modern practices to deliver scalable solutions that integrate seamlessly with existing  <br />systems and drive digital transformation.we build solutions that work, scale, <br /> and are embraced by teams and customers.
            </p>
          </div>
        </motion.div>

        {/* 7. LAYER: PHASE 3 TEXT (MISSION & VISION) */}
        <motion.div
          className="absolute inset-0 w-full h-full flex items-center justify-center z-20 pointer-events-none"
          style={{ opacity: phase3TextOpacity }}
        >
          {/* Central Anchor locking exactly 40px under the geometric centerline of the circles */}
          <div className="absolute top-1/2 left-1/2 flex items-center justify-center translate-y-[60px] md:translate-y-[80px]">
            {/* Left Block (Tracks exactly under Left Circle via absolute frame math) */}
            <motion.div
              className="absolute flex flex-col items-center justify-start w-[280px] md:w-[320px] text-center"
              style={{ x: textShiftLeft }}
            >
              <h3 className="text-3xl md:text-[42px] font-light mb-6 tracking-wide">Mission</h3>
              <p className="text-[14px] md:text-[15px] text-white/50 leading-[1.8] tracking-[0.05em] font-light">
                Empower global innovation through <span className="italic text-white/80">advanced engineering</span> solutions, enabling clients to achieve results efficiently and cost-effectively.
              </p>
            </motion.div>

            {/* Right Block (Tracks exactly under Right Circle via absolute frame math) */}
            <motion.div
              className="absolute flex flex-col items-center justify-start w-[280px] md:w-[320px] text-center"
              style={{ x: textShiftRight }}
            >
              <h3 className="text-3xl md:text-[42px] font-light mb-6 tracking-wide">Vision</h3>
              <p className="text-[14px] md:text-[15px] text-white/50 leading-[1.8] tracking-[0.05em] font-light">
                Be a <span className="italic text-white/80">trusted engineering partner</span>, <br className="hidden md:block" /> driving innovation and delivering sustainable value through excellence and continuous improvement.
              </p>
            </motion.div>
          </div>
        </motion.div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20">
          <ScrollDown />
        </div>
      </div>
    </main>
  );
};

export default AboutUs;