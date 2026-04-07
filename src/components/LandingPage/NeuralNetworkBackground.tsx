import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

interface NeuralNetworkProps {
  scatter: number;
  showText?: boolean;      // NEW: control whether animated text appears
}

const NeuralNetworkBackground: React.FC<NeuralNetworkProps> = ({
  scatter,
  showText = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const isInitializedRef = useRef(false);

  const phrases = ["HELLO", "WELCOME TO", "AARK GLOBAL"];

  // Text cycling – only when showText = true
  useEffect(() => {
    if (!showText) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % phrases.length);
    }, 2000);

    return () => clearInterval(timer);
  }, [showText, phrases.length]);

  // GSAP character stagger animation – only when showText = true
  useLayoutEffect(() => {
    if (!showText || !containerRef.current) return;

    const chars = containerRef.current.querySelectorAll('.char');
    const tl = gsap.timeline();

    tl.set(chars, {
      opacity: 0,
      scaleY: 4,
      scaleX: 0.5,
      y: 50,
      filter: "blur(15px)",
      transformOrigin: "50% 50%"
    });

    tl.to(chars, {
      opacity: 1,
      scaleY: 1,
      scaleX: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 1.2,
      ease: "expo.out",
      stagger: { amount: 0.5, from: "random" }
    });

    tl.to(chars, {
      opacity: 0,
      y: -40,
      filter: "blur(10px)",
      duration: 0.8,
      delay: 1.5,
      ease: "power2.in",
      stagger: { amount: 0.3, from: "random" }
    });

    return () => { tl.kill(); };
  }, [index, showText]);

  // ─── THREE.js Blob ────────────────────────────────────────────────
  useEffect(() => {
    if (!canvasRef.current || isInitializedRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    isInitializedRef.current = true;
    rendererRef.current = renderer;

    const geometry = new THREE.SphereGeometry(1.5, 70, 60);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        uPointSize: { value: 2.2 },
        uScatter: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      vertexShader: `
        uniform float time;
        uniform float uPointSize;
        uniform float uScatter;
        uniform vec2 uMouse;
        varying vec3 vColor;

        void main() {
          vec3 pos = position;
          float noise = sin(pos.x * 4.0 + time) * 0.1;
          vec3 spherePos = pos + normal * noise;
          vec3 scatteredPos = spherePos + normal * (uScatter * 15.0);
          vec3 finalPos = scatteredPos;

          float mouseFactor = 1.0 - clamp(uScatter * 1.5, 0.0, 1.0);
          finalPos.x += uMouse.x * 0.5 * mouseFactor;
          finalPos.y += uMouse.y * 0.5 * mouseFactor;

          vec3 targetColor = vec3(0.0, 0.102, 0.239);
          vColor = mix(vec3(0.4, 0.6, 1.0), targetColor, uScatter);

          vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
          float sizeFactor = 1.0 - (uScatter * 0.5);
          gl_PointSize = uPointSize * sizeFactor * (12.0 / -mvPosition.z);

          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          float r = distance(gl_PointCoord, vec2(0.5));
          if (r > 0.5) discard;
          gl_FragColor = vec4(vColor, pow(1.0 - (r * 2.0), 4.0));
        }
      `
    });

    materialRef.current = material;
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * -2;
    };
    window.addEventListener("mousemove", handleMouseMove);

    const clock = new THREE.Clock();
    let frameId: number;

    const animate = () => {
      const elapsed = clock.getElapsedTime();
      if (materialRef.current) {
        materialRef.current.uniforms.time.value = elapsed;
        materialRef.current.uniforms.uMouse.value.x += (mouseRef.current.x - materialRef.current.uniforms.uMouse.value.x) * 0.05;
        materialRef.current.uniforms.uMouse.value.y += (mouseRef.current.y - materialRef.current.uniforms.uMouse.value.y) * 0.05;
      }
      particles.rotation.y = elapsed * 0.05;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  // Update scatter
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uScatter.value = scatter;
    }
  }, [scatter]);

  return (
    <div className="relative w-full h-full bg-transparent overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />

      {showText && (
        <div
          ref={containerRef}
          style={{ opacity: 1 - Math.min(scatter * 2, 1) }}
          className="relative z-10 w-full h-full flex items-center justify-center pointer-events-none"
        >
          <h1
            className="text-center flex flex-wrap justify-center pointer-events-none
                     font-medium text-white tracking-tighter leading-none
                     text-[clamp(3rem,6vw,8rem)] font-[Raleway]"
          >
            {phrases[index].split("").map((char, i) => (
              <span
                key={`${index}-${i}`}
                className="char inline-block whitespace-pre will-change-[transform,opacity,filter]"
              >
                {char}
              </span>
            ))}
          </h1>
        </div>
      )}
    </div>
  );
};

export default NeuralNetworkBackground;