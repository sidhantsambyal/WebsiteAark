// src/components/landingpage/RunicEngine/useWebglRenderer.ts

import { useEffect, useRef, RefObject } from 'react';
import { Object3D, Material, Mesh } from 'three';
import { WebglManager } from './Core/webgl/Manager';
import { Items } from './Core/Items';

export interface WebglRendererAPI {
  manager: WebglManager;
  items: Items | null;
  updateProgress?: (progress: number) => void;
  setScrollSyncEnabled?: (enabled: boolean) => void;
  getCarouselProgress?: () => number;
  getCarouselMaxProgress?: () => number;
  destroy: () => void;
}

interface UseWebglRendererProps {
  containerRef: RefObject<HTMLDivElement>;
  assetPaths: string[];
  cameraProps?: {
    fov?: number;
    perspective?: number;
    near?: number;
    far?: number;
  };
  rendererProps?: {
    antialias?: boolean;
    dpr?: number;
  };
}

/**
 * Custom image loader that works with Vite's asset resolution
 * Handles various path formats: /assets/..., /public/..., absolute URLs, etc.
 */
const loadImageVite = (imagePath: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();

    // Since assets are now imported, imagePath is already a resolved URL
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${imagePath}`));
    img.src = imagePath;
  });
};

export const useWebglRenderer = ({
  containerRef,
  assetPaths,
  cameraProps = { fov: 50, perspective: 800 },
  rendererProps = { antialias: false },
}: UseWebglRendererProps): WebglRendererAPI => {
  const managerRef = useRef<WebglManager | null>(null);
  const itemsRef = useRef<Items | null>(null);
  const apiRef = useRef<WebglRendererAPI | null>(null);
  const hasInitializedRef = useRef(false);
  const lastExternalProgressRef = useRef<number | null>(null);
  const scrollSyncEnabledRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Only initialize if not already initialized to prevent multiple contexts
    if (hasInitializedRef.current) {
      return;
    }
    hasInitializedRef.current = true;

    // Initialize WebGL Manager
    const manager = new WebglManager(container, {
      cameraProps,
      rendererProps,
    });

    manager.play();
    managerRef.current = manager;

    // Load images from asset paths
    let loadCount = 0;

    function handleLoaded() {
      loadCount += 1;
      const progress = loadCount / (assetPaths.length + 1);
      container.setAttribute('data-is-loaded', `${progress}`);
    }

    // Map asset paths to image loading promises
    const loaders = assetPaths.map((imagePath) =>
      loadImageVite(imagePath).catch((err) => {
        console.error(`Failed to load image: ${imagePath}`, err);
        return null;
      })
    );

    // Track individual image completions
    loaders.forEach((loader) => {
      loader
        ?.then(() => handleLoaded())
        .catch(() => {
          // Error already logged above
        });
    });

    // Initialize Items when all images are loaded
    Promise.all(loaders)
      .then((images) => {
        // Filter out null failures
        const validImages = images.filter(
          (img) => img !== null
        ) as HTMLImageElement[];

        if (validImages.length > 0) {
          const items = new Items({ manager, images: validImages });
          itemsRef.current = items;

          // If GSAP pin-scroll already started while images were loading,
          // immediately sync the newly created SlideProgress to the latest value.
          if (scrollSyncEnabledRef.current) {
            items.setScrollSyncEnabled(true);
            if (lastExternalProgressRef.current !== null) {
              items.syncProgress(lastExternalProgressRef.current);
            }
          }
        }

        handleLoaded(); // Final completion signal
      })
      .catch((err) => {
        console.error('Failed to initialize Items', err);
      });

    // Handle window resize
    const handleResize = () => {
      if (managerRef.current && container) {
        managerRef.current.renderer.setSize(
          container.clientWidth,
          container.clientHeight
        );
      }
    };

    window.addEventListener('resize', handleResize);

    // Set up API object
    apiRef.current = {
      manager,
      items: itemsRef.current,
      updateProgress: (progress: number) => {
        lastExternalProgressRef.current = progress;
        itemsRef.current?.syncProgress(progress);
      },
      setScrollSyncEnabled: (enabled: boolean) => {
        scrollSyncEnabledRef.current = enabled;
        itemsRef.current?.setScrollSyncEnabled(enabled);

        // If enabling, apply the latest buffered progress immediately.
        if (enabled && lastExternalProgressRef.current !== null) {
          itemsRef.current?.syncProgress(lastExternalProgressRef.current);
        }
      },
      getCarouselProgress: () => itemsRef.current?.getProgress() ?? 0,
      getCarouselMaxProgress: () => itemsRef.current?.getMaxProgress() ?? 0,
      destroy: () => {
        if (managerRef.current) {
          // Pause animation frame first to stop rendering loop
          managerRef.current.pause();
          
          // Clean up Three.js resources to prevent memory leaks
          managerRef.current.scene.traverse((child: Object3D) => {
            if (child instanceof Mesh) {
              if (child.geometry) child.geometry.dispose();
              if (child.material) {
                const material = child.material as Material | Material[];
                if (Array.isArray(material)) {
                  material.forEach((m: Material) => m.dispose());
                } else {
                  material.dispose();
                }
              }
            }
          });
          
          // Call manager's destroy method
          managerRef.current.destroy();
          managerRef.current = null;
        }
        window.removeEventListener('resize', handleResize);
      },
    };

    // Cleanup function: called when component unmounts
    return () => {
      apiRef.current?.destroy();
      // Note: Do NOT reset hasInitializedRef here
      // It stays true to prevent re-initialization in StrictMode's double-invoke
      // When component actually unmounts, hasInitializedRef is discarded anyway
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - initialize only once per component mount
  // Note: All dependencies (assetPaths, cameraProps, containerRef, rendererProps) are stable/memoized in parent

  return (
    apiRef.current || {
      manager: null as unknown as WebglManager,
      items: null,
      destroy: () => {},
    }
  );
};