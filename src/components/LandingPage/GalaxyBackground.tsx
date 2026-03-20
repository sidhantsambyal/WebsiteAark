"use client";

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const GalaxyBackground = ({ progress, alphaMultiplier = 1 }: { progress: number, alphaMultiplier?: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ringsRef = useRef<THREE.Mesh[]>([]);
  const alphaRef = useRef(1);

  useEffect(() => { alphaRef.current = alphaMultiplier; }, [alphaMultiplier]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 18;
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const group = new THREE.Group();
    group.rotation.x = 1.2;
    scene.add(group);

    const rings: THREE.Mesh[] = [];
    const ringCount = 5;
    for (let i = 0; i < ringCount; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(12, 0.02, 16, 100),
        new THREE.MeshBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0 })
      );
      group.add(ring);
      rings.push(ring);
    }
    ringsRef.current = rings;

    let frameId: number;
  const animate = () => {
  ringsRef.current.forEach((ring, i) => {
    // Hide if not in phase
    if (alphaRef.current <= 0) {
      ring.visible = false;
      return;
    }
    ring.visible = true;

    const stagger = i / ringCount;
    let flow = (progress * 0.8 + stagger) % 1;
    ring.position.z = 25 - (flow * 35);
    const s = 2.5 - (flow * 2.2);
    ring.scale.set(s, s, 1);
    
    // Internal ring life cycle + global alpha dissolve
    let baseAlpha = flow < 0.2 ? flow * 5 : flow > 0.8 ? (1 - flow) * 5 : 0.6;
    (ring.material as THREE.MeshBasicMaterial).opacity = baseAlpha * alphaRef.current;
  });
  renderer.render(scene, camera);
  frameId = requestAnimationFrame(animate);
};
    animate();
    return () => { cancelAnimationFrame(frameId); renderer.dispose(); };
  }, [progress]);

  return (
    <div className="absolute inset-0 z-[-1] pointer-events-none">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};

export default GalaxyBackground;

// 1