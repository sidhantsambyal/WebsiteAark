"use client";

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Stars = () => {
  const pointsRef = useRef<THREE.Points>(null!);

  // Generate 1000 random star positions
  const [positions, sizes] = useMemo(() => {
    const pos = new Float32Array(1000 * 3);
    const sz = new Float32Array(1000);
    for (let i = 0; i < 1000; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;     // X
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20; // Y
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10; // Z depth
      sz[i] = Math.random();
    }
    return [pos, sz];
  }, []);

  useFrame((state) => {
    // Subtle rotation based on time for a "drifting" feel
    const t = state.clock.getElapsedTime() * 0.05;
    pointsRef.current.rotation.x = t * 0.1;
    pointsRef.current.rotation.y = t * 0.15;

    // Optional: Follow mouse slightly for parallax
    const { x, y } = state.mouse;
    pointsRef.current.position.x = THREE.MathUtils.lerp(pointsRef.current.position.x, x * 0.5, 0.05);
    pointsRef.current.position.y = THREE.MathUtils.lerp(pointsRef.current.position.y, y * 0.5, 0.05);
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.015}
        color="#ffffff"
        transparent
        opacity={0.8}
        sizeAttenuation={true}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

const StarField = () => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <Stars />
      </Canvas>
    </div>
  );
};

export default StarField;