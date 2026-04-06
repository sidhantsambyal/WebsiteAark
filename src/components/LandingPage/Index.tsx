import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useScroll, useMotionValueEvent, useSpring, motion, useTransform } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import NeuralNetworkBackground from './NeuralNetworkBackground';
import LogoSection from './LogoSection';
import RippleBGSection from './RippleBGSection';
import MusicPlayer from './MusicPlayer';
import RunicRenderer from './RunicEngine/RunicRenderer';
import RunicTextOverlay from './RunicEngine/RunicTextOverlay';
import type { WebglRendererAPI } from './RunicEngine/useWebglRenderer';
import Navbar from './Navbar';
import SkipButton from './SkipButton';
import ChallengeOutcomeSection from './StartConvo';

// Assets
import enterprise from '../../assets/Runic-PNGs/enterprise.png';
import hardware from '../../assets/Runic-PNGs/Hardware.png';
import platform from '../../assets/Runic-PNGs/Platform.png';
import product from '../../assets/Runic-PNGs/Product.png';
import semiconductor from '../../assets/Runic-PNGs/semiconductor.png';
import software from '../../assets/Runic-PNGs/Software.png';
import backgroundVideo from '../../assets/Backgrounds/background2mb.mp4';
import homePageBg from '../../assets/Backgrounds/HomepageBG.jpg';
import blacktransparent from "../../assets/Runic-PNGs/blank-transparent.png"
import ScrollDown from './scrolldown';

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
}

const LandingPage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const section2Ref = useRef<HTMLElement>(null);
  const runicSectionRef = useRef<HTMLElement>(null);
  const runicApiRef = useRef<WebglRendererAPI | null>(null);
  const runicInitializedRef = useRef(false);
  const [showNavLogo, setShowNavLogo] = useState(false);
  const [isScrollDownVisible, setIsScrollDownVisible] = useState(true);
  const [bgExitOpacity, setBgExitOpacity] = useState(1);
  const [s2Value, setS2Value] = useState(0);
  const [transformationProgress, setTransformationProgress] = useState(0);
  const [carouselProgress, setCarouselProgress] = useState(0);
  const [isRunicReady, setIsRunicReady] = useState(false);
  const [isSkipVisible, setIsSkipVisible] = useState(true);

  // New states for the Fade-and-Lock logic
  const [challengeOpacity, setChallengeOpacity] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const handleSkip = () => {
    gsap.to(window, {
      duration: 0,
      scrollTo: "#challenge-trigger",
      ease: "power4.inOut"
    });
  };

  const runicAssets = useMemo(() => [
    blacktransparent, hardware, software, platform, product, semiconductor, enterprise,
  ], []);

  const cameraProps = useMemo(() => ({ fov: 50, perspective: 800 }), []);
  const rendererProps = useMemo(() => ({ antialias: false, dpr: window.devicePixelRatio }), []);

  const handleRunicInitialized = useCallback((api: WebglRendererAPI) => {
    if (!runicInitializedRef.current) {
      runicInitializedRef.current = true;
      runicApiRef.current = api;
      setTimeout(() => setIsRunicReady(true), 200);
    }
  }, []);

  const { scrollYProgress: scatterScroll } = useScroll({
    target: section2Ref,
    offset: ["start end", "start start"]
  });

  const smoothScatter = useSpring(scatterScroll, { stiffness: 45, damping: 25 });
  const bg1Opacity = useTransform(smoothScatter, [0.4, 0.85], [1, 0]);

  const { scrollYProgress: runicFadeProgress } = useScroll({
    target: runicSectionRef,
    offset: ["start end", "start start"]
  });

  const { scrollYProgress: globalScroll } = useScroll();
  const videoOpacity = useTransform(globalScroll, [0, 0.15, 1], [0, 1, 1]);
  const runicOpacity = useTransform(runicFadeProgress, [0.5, 0.95], [0, 1]);
  const [runicExitOpacity, setRunicExitOpacity] = useState(1);

  useMotionValueEvent(smoothScatter, "change", setS2Value);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section2Ref.current,
        start: "top top",
        end: "+=300%",
        pin: true,
        scrub: 0.5,
        onUpdate: (self) => {
          const p = self.progress;
          setTransformationProgress(p);
          setShowNavLogo(p > 0.4 || isLocked);
        }
      });

      if (isRunicReady && runicApiRef.current) {
        const api = runicApiRef.current;
        const maxProgress = api.getCarouselMaxProgress?.() || 1;
        ScrollTrigger.create({
          trigger: runicSectionRef.current,
          start: "top top",
          end: () => `+=${maxProgress * 650}`,
          pin: true,
          pinSpacing: true,
          scrub: 0.5,
          onUpdate: (self) => {
            const p = self.progress;
            const currentP = p * maxProgress;
            api.updateProgress?.(currentP);
            setCarouselProgress(currentP);
            if (p > 0.97) {
              const fade = gsap.utils.mapRange(0.97, 1.0, 1, 0, p);
              setRunicExitOpacity(fade);
            } else {
              setRunicExitOpacity(1);
            }
          }
        });
      }

      // ScrollTrigger to handle the Fade-In and Lock for the Challenge Outcome Section
      ScrollTrigger.create({
        trigger: "#challenge-trigger",
        start: "top bottom",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          setChallengeOpacity(self.progress);
          // When progress is 1, the user has scrolled the full height of the trigger
          if (self.progress >= 1 && !isLocked) {
            setIsLocked(true);
          }
        },
        onEnter: () => {
          setIsScrollDownVisible(false);
          setIsSkipVisible(false);
        },
        onLeaveBack: () => {
          if (!isLocked) {
            setIsScrollDownVisible(true);
            setIsSkipVisible(true);
          }
        },
      });
    }, containerRef);
    return () => ctx.revert();
  }, [isRunicReady, isLocked]);

  return (
    <main
      ref={containerRef}
      className={`relative bg-[#050508] text-white ${isLocked ? 'h-screen overflow-hidden' : 'overflow-x-hidden'}`}
    >
      {/* Background and previous content - Hidden when locked for performance and to prevent scroll-back */}

      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div className="absolute inset-0 bg-cover bg-center" style={{ opacity: bg1Opacity, backgroundImage: `url(${homePageBg})` }} />
        <motion.div className="absolute inset-0" style={{ opacity: isLocked ? 1 : videoOpacity }}>
          <video autoPlay loop muted playsInline className="w-full h-full object-cover " style={{ mixBlendMode: 'screen' }}>
            <source src={backgroundVideo} type="video/mp4" />
          </video>
        </motion.div>
      </div>
      <div className={`${isLocked ? 'hidden' : 'block'}`}>
        <div className="fixed inset-0 z-30 pointer-events-none">
          <NeuralNetworkBackground scatter={s2Value} />
        </div>

        <section className="h-screen w-full pointer-events-none" />

        <section ref={section2Ref} className="h-screen w-full relative flex items-center justify-center overflow-hidden">
          <div className="relative z-10 w-full max-w-5xl h-[700px] flex items-center justify-center">
            <LogoSection scatter={s2Value} progress={transformationProgress} />
          </div>
        </section>

        <section id="RippleSectionWrapper" className="relative ">
          <RippleBGSection progress={transformationProgress} />
        </section>

        <section id="RunicSection" ref={runicSectionRef} className="w-full h-screen overflow-hidden bg-transparent">
          <motion.div className="w-full h-[200vh] relative z-10" style={{ opacity: useTransform(runicOpacity, (v) => v * runicExitOpacity) }}>
            <div className="sticky top-0 w-full h-screen">
              <RunicRenderer
                assetPaths={runicAssets}
                width="100%"
                height="100%"
                cameraProps={cameraProps}
                rendererProps={rendererProps}
                showLoadingProgress={false}
                onInitialized={handleRunicInitialized}
              />
              <RunicTextOverlay carouselProgress={carouselProgress} overlayOpacity={runicOpacity} />
            </div>
          </motion.div>
        </section>

        {/* This div provides the "scroll distance" for the challenge section to fade in */}
        <div id="challenge-trigger" className="h-screen w-full bg-transparent" />
      </div>

      {/* Challenge Outcome Section - Fades in and locks scroll */}
      <div
        id="challenge-section"
        className={`${isLocked ? 'relative' : 'fixed inset-0'} z-[50] bg-transparent`}
        style={{
          opacity: isLocked ? 1 : challengeOpacity,
          pointerEvents: (isLocked || challengeOpacity > 0.8) ? 'auto' : 'none'
        }}
      >
        <ChallengeOutcomeSection />
      </div>

      {/* UI Elements */}
      <MusicPlayer shift={!isSkipVisible} />
      <Navbar showLogo={showNavLogo} />

      {!isLocked && (
        <>
          <div style={{
            transition: 'opacity 0.5s ease, visibility 0.5s',
            opacity: isScrollDownVisible ? 1 : 0,
            visibility: isScrollDownVisible ? 'visible' : 'hidden',
            pointerEvents: isScrollDownVisible ? 'auto' : 'none'
          }}>
            <ScrollDown />
          </div>
          <div style={{
            transition: 'opacity 0.5s ease, visibility 0.5s',
            opacity: isSkipVisible ? 1 : 0,
            visibility: isSkipVisible ? 'visible' : 'hidden',
            pointerEvents: isSkipVisible ? 'auto' : 'none'
          }}>
            <SkipButton onSkip={handleSkip} />
          </div>
        </>
      )}
    </main>
  );
};

export default LandingPage;