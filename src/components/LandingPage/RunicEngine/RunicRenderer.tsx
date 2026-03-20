// src/components/landingpage/RunicEngine/RunicRenderer.tsx

import React, { useRef, useEffect, useState } from 'react';
import { useWebglRenderer, WebglRendererAPI } from './useWebglRenderer';
import styles from './RunicRenderer.module.css';

export interface RunicRendererProps {
  /**
   * Array of image paths to use as textures
   * Supports: absolute URLs, relative paths, data URLs, imported modules
   * @example ['/assets/bg-1.png', '/assets/bg-2.png']
   */
  assetPaths: string[];

  /**
   * Container width - CSS value
   * @default '100%'
   */
  width?: string | number;

  /**
   * Container height - CSS value
   * @default '100vh'
   */
  height?: string | number;

  /**
   * Camera configuration
   */
  cameraProps?: {
    fov?: number;
    perspective?: number;
    near?: number;
    far?: number;
  };

  /**
   * Renderer configuration
   */
  rendererProps?: {
    antialias?: boolean;
    dpr?: number;
  };

  /**
   * Callback when the renderer is fully initialized
   * Provides API for controlling the renderer externally
   */
  onInitialized?: (api: WebglRendererAPI) => void;

  /**
   * Optional CSS class for the container
   */
  className?: string;

  /**
   * Optional CSS styles for the container
   */
  style?: React.CSSProperties;

  /**
   * Show loading progress indicator
   * @default false
   */
  showLoadingProgress?: boolean;
}

/**
 * RunicRenderer Component
 *
 * A React component that wraps the Three.js runic alphabet rendering pipeline.
 * Initialize with custom PNG assets and use the rendering engine's animation system.
 *
 * @example
 * ```tsx
 * <RunicRenderer
 *   assetPaths={['/images/rune1.png', '/images/rune2.png']}
 *   width="100%"
 *   height="800px"
 *   cameraProps={{ fov: 50, perspective: 800 }}
 *   onInitialized={(api) => {
 *     // Renderer is ready
 *     console.log('Ready:', api.manager);
 *   }}
 * />
 * ```
 */
export const RunicRenderer: React.FC<RunicRendererProps> = ({
  assetPaths,
  width = '100%',
  height = '100vh',
  cameraProps,
  rendererProps,
  onInitialized,
  className,
  style,
  showLoadingProgress = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadProgress, setLoadProgress] = useState(0);
  const initializedRef = useRef(false);

  const api = useWebglRenderer({
    containerRef,
    assetPaths,
    cameraProps,
    rendererProps,
  });

  // Call onInitialized only once when API is ready
  useEffect(() => {
    if (api.manager && onInitialized && !initializedRef.current) {
      initializedRef.current = true;
      onInitialized(api);
    }
  }, [api.manager]); // Only depend on api.manager, not the callback itself

  // Attach scroll listeners for wheel, touch, and keyboard events
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // Wheel events are tracked internally by SlideProgress
      // No special handling needed here
    };

    container.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Optional: Monitor loading progress
  useEffect(() => {
    if (!showLoadingProgress || !containerRef.current) return;

    const observer = new MutationObserver(() => {
      const progress = containerRef.current?.getAttribute('data-is-loaded');
      if (progress) {
        setLoadProgress(parseFloat(progress));
      }
    });

    observer.observe(containerRef.current, { attributes: true });

    return () => observer.disconnect();
  }, [showLoadingProgress]);

  const containerStyle = {
    '--width': typeof width === 'number' ? `${width}px` : width,
    '--height': typeof height === 'number' ? `${height}px` : height,
    ...style,
  } as React.CSSProperties;

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${className || ''}`}
      style={containerStyle}
    >
      {showLoadingProgress && (
        <div
          className={`${styles.overlay} ${
            loadProgress >= 1 ? styles.hidden : styles.visible
          }`}
        >
          <div>Loading: {Math.round(loadProgress * 100)}%</div>
        </div>
      )}
    </div>
  );
};

export default RunicRenderer;