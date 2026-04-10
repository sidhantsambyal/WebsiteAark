import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useScroll, useMotionValueEvent, useSpring, motion, useTransform, useMotionValue } from 'framer-motion';
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
import backgroundVideo from '../../assets/Backgrounds/background.mp4';
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

  useEffect(() => {
    if (isLocked) {
      document.body.style.overflow = "hidden";
      // Ensure we remain precisely locked at the full bottom frame
      window.scrollTo(0, document.body.scrollHeight);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isLocked]);

  const handleSkip = () => {
    gsap.to(window, {
      duration: 0,
      // scrollTo: "#challenge-trigger",
      // ease: "power4.inOut"
      scrollTo: document.body.scrollHeight,
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
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsRunicReady(true);
        });
      });
    }
  }, []);

  const { scrollYProgress: scatterScroll } = useScroll({
    target: section2Ref,
    offset: ["start end", "start start"]
  });

  const smoothScatter = useSpring(scatterScroll, { stiffness: 45, damping: 25 });
  const bg1Opacity = useTransform(smoothScatter, [0.4, 0.85], [1, 0]);

  const { scrollYProgress: globalScroll } = useScroll();
  const videoOpacity = useTransform(globalScroll, [0, 0.15, 1], [0, 1, 1]);

  const runicCombinedOpacity = useMotionValue(0);
  const runicScaleValue = useMotionValue(0.85);
  const runicBlurValue = useMotionValue(10);

  useMotionValueEvent(smoothScatter, "change", setS2Value);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section2Ref.current,
        start: "top top",
        end: "+=260%",
        pin: true,
        scrub: 0.5,
        onUpdate: (self) => {
          const p = self.progress;
          setTransformationProgress(p);
          setShowNavLogo(p > 0.4 || challengeOpacity > 0.5);
        }
      });

      if (isRunicReady && runicApiRef.current) {
        const api = runicApiRef.current;
        const maxProgress = api.getCarouselMaxProgress?.() || 1;

        ScrollTrigger.create({
          trigger: "#RunicTrigger",
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
          onUpdate: (self) => {
            const p = self.progress;

            // CAROUSEL MOVEMENT (Starts at 0% and runs until 85%)
            const carouselP = gsap.utils.mapRange(0, 0.85, 0, maxProgress, p);
            const clampedCarouselP = Math.max(0, Math.min(maxProgress, carouselP));

            api.updateProgress?.(clampedCarouselP);
            setCarouselProgress(clampedCarouselP);

            // VISUAL STATES (Opacity, Scale, Blur)
            // PHASE: Intro (0% to 10%)
            if (p <= 0.1) {
              const introP = gsap.utils.mapRange(0, 0.1, 0, 1, p);
              runicCombinedOpacity.set(introP);
              runicScaleValue.set(0.85 + (0.15 * introP));
              runicBlurValue.set((1 - introP) * 10);
            }
            // PHASE: Sustain (10% to 85%)
            else if (p > 0.1 && p <= 0.85) {
              runicCombinedOpacity.set(1);
              runicScaleValue.set(1);
              runicBlurValue.set(0);
            }
            // PHASE: Exit (85% to 100%)
            else {
              const exitP = gsap.utils.mapRange(0.85, 1.0, 1, 0, p);
              runicCombinedOpacity.set(exitP);
              runicScaleValue.set(1);
              runicBlurValue.set(0);
            }

            if (runicSectionRef.current) {
              runicSectionRef.current.style.pointerEvents = (p > 0.05 && p < 0.95) ? "auto" : "none";
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
          if (self.progress >= 1 && !isLocked) {
            setIsLocked(true);
          }
        },
        onEnter: () => {
          setIsScrollDownVisible(false);
          setIsSkipVisible(false);
        },
        onLeaveBack: () => {
          setIsScrollDownVisible(true);
          setIsSkipVisible(true);
        },
      });
    }, containerRef);
    return () => ctx.revert();
  }, [isRunicReady]);

  return (
    <main
      ref={containerRef}
      className="relative bg-[#050508] text-white overflow-x-hidden"
    >
      {/* Background and previous content */}

      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div className="absolute inset-0 bg-cover bg-center" style={{ opacity: bg1Opacity, backgroundImage: `url(${homePageBg})` }} />
        <motion.div className="absolute inset-0" style={{ opacity: videoOpacity }}>
          <video autoPlay loop muted playsInline className="w-full h-full object-cover " style={{ mixBlendMode: 'screen' }}>
            <source src={backgroundVideo} type="video/mp4" />
          </video>
        </motion.div>
      </div>
      <div className="block">
        <div className="fixed inset-0 z-30 pointer-events-none" style={{ opacity: 1 - challengeOpacity }}>
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

        <div id="RunicTrigger" className="h-[5353px] w-full bg-transparent" />

        <section id="RunicSection" ref={runicSectionRef} className="fixed inset-0 w-full h-screen overflow-hidden bg-transparent pointer-events-none">
          <motion.div
            className="w-full h-full relative z-[10]"
            style={{
              opacity: runicCombinedOpacity,
              scale: runicScaleValue,
              filter: useTransform(runicBlurValue, (v) => `blur(${v}px)`),
              transformOrigin: "center center",
            }}
          >
            <div className="w-full h-full">
              <RunicRenderer
                assetPaths={runicAssets}
                width="100%"
                height="100%"
                cameraProps={cameraProps}
                rendererProps={rendererProps}
                showLoadingProgress={false}
                onInitialized={handleRunicInitialized}
              />
              <RunicTextOverlay carouselProgress={carouselProgress} overlayOpacity={runicCombinedOpacity} />
            </div>
          </motion.div>
        </section>

        {/* This div provides the "scroll distance" for the challenge section to fade in */}
        <div id="challenge-trigger" className="h-screen w-full bg-transparent" />
      </div>

      {/* Challenge Outcome Section - Fades in based on scroll */}
      <div
        id="challenge-section"
        className="fixed inset-0 z-[20] bg-transparent"
        style={{
          opacity: challengeOpacity,
          pointerEvents: challengeOpacity > 0.8 ? 'auto' : 'none'
        }}
      >
        <ChallengeOutcomeSection progress={challengeOpacity} />
      </div>

      {/* UI Elements */}
      <MusicPlayer shift={!isSkipVisible} />
      <Navbar showLogo={showNavLogo} />

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
    </main>
  );
};

export default LandingPage;