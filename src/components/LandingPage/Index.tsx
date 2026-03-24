import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useScroll, useMotionValueEvent, useSpring, motion, useTransform } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import NeuralNetworkBackground from './NeuralNetworkBackground';

import LogoSection from './LogoSection';
import GalaxyBackground from './GalaxyBackground';
import RippleBGSection from './RippleBGSection';
import MorphingThreeDLogo from './MorphingThreeDLogo';
import MusicPlayer from './MusicPlayer';
import RunicRenderer from './RunicEngine/RunicRenderer';
import RunicTextOverlay from './RunicEngine/RunicTextOverlay';
import type { WebglRendererAPI } from './RunicEngine/useWebglRenderer';
import AIContactSection from './AIChatBot';
import Navbar from './Navbar';
import SkipButton from './SkipButton';
import ChallengeOutcomeSection from './StartConvo';

// Assets
import aarkLogo from '../../assets/Runic-PNGs/aark-logo.png';
import enterprise from '../../assets/Runic-PNGs/enterprise.png';
import hardware from '../../assets/Runic-PNGs/Hardware.png';
import platform from '../../assets/Runic-PNGs/Platform.png';
import product from '../../assets/Runic-PNGs/Product.png';
import semiconductor from '../../assets/Runic-PNGs/semiconductor.png';
import software from '../../assets/Runic-PNGs/Software.png';
import backgroundImage from '../../assets/Backgrounds/new-services-bg3.jpg';
import backgroundVideo from '../../assets/Backgrounds/Section4and5.mp4';
import homePageBg from '../../assets/Backgrounds/HomepageBG.jpg';
import S8 from '../../assets/Backgrounds/S8.jpg';

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
}

const LandingPage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const section2Ref = useRef<HTMLElement>(null);
  const runicSectionRef = useRef<HTMLElement>(null);
  const runicApiRef = useRef<WebglRendererAPI | null>(null);
  const runicInitializedRef = useRef(false);

  // track scroll progress for runic section to fade in overlay instead of scrolling
  const { scrollYProgress: runicScrollProgress } = useScroll({
    target: runicSectionRef,
    offset: ["start end", "end start"]
  });

  const handleSkip = () => {
    gsap.to(window, {
      duration: 2,
      scrollTo: "#challenge-section", // Target the ID we'll create below
      ease: "power4.inOut"
    });
  };

  // States for background and animation progress
  const [bgExitOpacity, setBgExitOpacity] = useState(1);
  const [s8BgOpacity, setS8BgOpacity] = useState(0);
  const [ringsAlpha, setRingsAlpha] = useState(0);
  const [s2Value, setS2Value] = useState(0);
  const [transformationProgress, setTransformationProgress] = useState(0);
  const [carouselProgress, setCarouselProgress] = useState(0);
  const [isRunicReady, setIsRunicReady] = useState(false);

  useEffect(() => {
    console.log('LandingPage component mounted successfully');
  }, []);

  // Memoize asset paths to prevent unnecessary re-renders and WebGL context recreation
  const runicAssets = useMemo(() => [
    aarkLogo, hardware, software, platform, product, semiconductor, enterprise,
  ], []);
  // Memoize camera and renderer props to prevent unnecessary re-renders
  const cameraProps = useMemo(() => ({ fov: 50, perspective: 800 }), []);
  const rendererProps = useMemo(() => ({ antialias: false, dpr: window.devicePixelRatio }), []);
  // Memoize the onInitialized callback to prevent multiple initializations
  const handleRunicInitialized = useCallback((api: WebglRendererAPI) => {
    if (!runicInitializedRef.current) {
      runicInitializedRef.current = true;
      runicApiRef.current = api;
      console.log('Runic Renderer initialized:', api.manager);

      // Delay slightly to ensure Three.js items are fully ready for progress calculation
      setTimeout(() => setIsRunicReady(true), 200);

      // // Start tracking carousel progress once items are ready [This currently breaks the text animation on the Ripple BG section]
      // const trackProgress = () => {
      //   if (api.getCarouselProgress && api.getCarouselMaxProgress) {
      //     const progress = api.getCarouselProgress();
      //     const maxProgress = api.getCarouselMaxProgress();
      //     if (maxProgress > 0) { // Only track if carousel is initialized
      //       setCarouselProgress(progress);
      //     }
      //     requestAnimationFrame(trackProgress);
      //   } else {
      //     // Methods not ready yet, check again
      //     requestAnimationFrame(trackProgress);
      //   }
      // };
      // trackProgress();
    }
  }, []);

  // --- Scroll Progress for Logic ---
  const { scrollYProgress: scatterScroll } = useScroll({
    target: section2Ref,
    offset: ["start end", "start start"]
  });

  // This spring ensures the scroll value itself is fluid
  const smoothScatter = useSpring(scatterScroll, { stiffness: 45, damping: 25 });
  // Background 1 fades out gradually as we approach the logo section (from 0.4 to 0.9)
  const bg1Opacity = useTransform(smoothScatter, [0.4, 0.85], [1, 0]);
  // Background 2 fades in over a similar range for a perfect cross-fade
  const bg2InitialOpacity = useTransform(smoothScatter, [0.6, 0.95], [0, 1]);

  // Runic approach fade-in (ensures section is visible before it pins)
  const { scrollYProgress: runicFadeProgress } = useScroll({
    target: runicSectionRef,
    offset: ["start end", "start start"]
  });
  const runicOpacity = useTransform(runicFadeProgress, [0.5, 0.95], [0, 1]);

  useMotionValueEvent(smoothScatter, "change", setS2Value);

  // --- GSAP Scroll Management ---
  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Logo Section Pinning
      ScrollTrigger.create({
        trigger: section2Ref.current,
        start: "top top",
        end: "+=800%", // Increased for maximum smoothness
        pin: true,
        scrub: 0.1,
        onUpdate: (self) => {
          const p = self.progress;
          setTransformationProgress(p);
          // 1. Fade out Ripple BG
          if (p > 0.65) {
            const exit = gsap.utils.mapRange(0.65, 0.78, 1, 0, p);
            setBgExitOpacity(Math.max(0, exit));
          } else { setBgExitOpacity(1); }

          // 2. GALAXY RINGS DISSOLVE (0.90 -> 0.98)
          if (p > 0.83 && p <= 0.90) {
            setRingsAlpha(gsap.utils.mapRange(0.83, 0.88, 0, 1, p));
          } else if (p > 0.90) {
            const rOut = gsap.utils.mapRange(0.90, 0.98, 1, 0, p);
            setRingsAlpha(Math.max(0, rOut));
          } else {
            setRingsAlpha(0);
          }

          // 3. SLOW S8BG FADE IN (0.88 -> 1.0)
          // We start this as the rings are still visible to create a soft overlap
          if (p > 0.88) {
            const s8In = gsap.utils.mapRange(0.88, 1.0, 0, 1, p);
            setS8BgOpacity(s8In);
          } else {
            setS8BgOpacity(0);
          }
        }
      });

      // 2. Runic Section Unified Pinning
      // This ONLY initializes once the WebGL items are loaded
      if (isRunicReady && runicApiRef.current) {
        const api = runicApiRef.current;
        const maxProgress = api.getCarouselMaxProgress?.() || 1;

        ScrollTrigger.create({
          trigger: runicSectionRef.current,
          start: "top top",
          end: () => `+=${maxProgress * 2200}`, // Dynamic length: px per PNG
          pin: true,
          pinSpacing: true,
          scrub: 0.5,
          onEnter: () => api.setScrollSyncEnabled?.(true),
          onLeave: () => api.setScrollSyncEnabled?.(false),
          onEnterBack: () => api.setScrollSyncEnabled?.(true),
          onLeaveBack: () => api.setScrollSyncEnabled?.(false),
          onUpdate: (self) => {
            const currentP = self.progress * maxProgress;
            // Slave the 3D engine to the scrollbar.
            // This keeps SlideProgress's internal scroll perfectly synced
            // with GSAP's pinned scroll (wheel/trackpad/middle-mouse drag all work).
            api.updateProgress?.(currentP);
            setCarouselProgress(currentP);
          }
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, [isRunicReady]);

  // const handleRunicInitialized = useCallback((api: WebglRendererAPI) => {
  //   runicApiRef.current = api;
  //   // Delay slightly to ensure Three.js items are fully ready for progress calculation
  //   setTimeout(() => setIsRunicReady(true), 200);
  // }, []);

  const galaxyProgress = transformationProgress < 0.83 ? 0 : (transformationProgress - 0.83) * 8;
  const carouselProgressRef = useRef(carouselProgress);

  // Keep ref in sync with state
  useEffect(() => {
    carouselProgressRef.current = carouselProgress;
  }, [carouselProgress]);

  return (
    <main ref={containerRef} className="relative bg-[#050508] text-white overflow-x-hidden">
      {/* Background Layers */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div className="absolute inset-0 bg-cover bg-center" style={{ opacity: bg1Opacity, backgroundImage: `url(${homePageBg})` }} />
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            opacity: useTransform(bg2InitialOpacity, (v) => v * bgExitOpacity),
            backgroundImage: `url(${backgroundImage})`,
            mixBlendMode: 'screen'
          }}
        />

        {/* S8Bg layer: Slow, wide-range fade in */}
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={{ opacity: s8BgOpacity, backgroundImage: `url(${S8})`, mixBlendMode: 'screen' }}
        />
      </div>

      <div className="fixed inset-0 z-30 pointer-events-none">
        <NeuralNetworkBackground scatter={s2Value} />
      </div>

      <section className="h-screen w-full pointer-events-none" />

      <section ref={section2Ref} className="h-screen w-full relative flex items-center justify-center overflow-hidden">
        <GalaxyBackground progress={galaxyProgress} alphaMultiplier={ringsAlpha} />
        <div className="relative z-10 w-full max-w-5xl h-[700px] flex items-center justify-center">
          <LogoSection scatter={s2Value} progress={transformationProgress} />
        </div>
      </section>

      <RippleBGSection />

      <section id="RunicSection" ref={runicSectionRef} className="w-full h-screen overflow-hidden"
      >
        <motion.div className="fixed inset-0 z-0 pointer-events-none" style={{ opacity: runicOpacity }}>
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
        </motion.div>

        <motion.div
          className=" w-full h-[200vh] z-10 bg-cover bg-center relative"
          style={{
            // backgroundImage: `url(${backgroundImage})`,
            opacity: runicOpacity,
          }}
        >
          <div className="relative z-10 w-full h-screen">
            <RunicRenderer
              assetPaths={runicAssets}
              width="100%"
              height="100%"
              cameraProps={cameraProps}
              rendererProps={rendererProps}
              showLoadingProgress={false}
              onInitialized={handleRunicInitialized}
            />
            <RunicTextOverlay
              carouselProgress={carouselProgress}
              overlayOpacity={runicOpacity}
            />
          </div>
        </motion.div>
      </section>
      <div id="challenge-section">
        <ChallengeOutcomeSection />
      </div>
      <AIContactSection />
      <MusicPlayer />
      <Navbar />
      <SkipButton />
      <SkipButton onSkip={handleSkip} />
    </main>
  );
};

export default LandingPage;