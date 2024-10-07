// components/react/PenroseTriangleScene.tsx
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import PenroseTriangle from './pennRoseTriangle';
import { useRef, useEffect, useState, Suspense } from 'react';

import { Tween, Easing } from '@tweenjs/tween.js';

function PenroseTriangleScene({ onLoad }: { onLoad: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Responsive canvas sizing
  useEffect(() => {
    function handleResize() {
      if (canvasRef.current) {
        canvasRef.current.style.width = '100%';
        canvasRef.current.style.height = '100%';
      }
    }
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Camera setup using useThree
  function CameraSetup() {
    const { camera, size } = useThree();

    useEffect(() => {
      const updateCamera = () => {
        const aspect = size.width / size.height;
        const isPortrait = aspect < 1;

        if (isPortrait) {
          // Portrait mode (mobile)
          camera.position.set(0, 400, 400);
          camera.zoom = 0.8;
        } else if (size.width < 768) {
          // Landscape mobile
          camera.position.set(200, 200, 220);
          camera.zoom = 1;
        } else if (size.width < 1024) {
          // Tablet
          camera.position.set(250, 250, 275);
          camera.zoom = 1.2;
        } else {
          // Desktop
          camera.position.set(300, 300, 330);
          camera.zoom = 1.4;
        }

        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();
      };

      updateCamera();
      window.addEventListener('resize', updateCamera);
      return () => window.removeEventListener('resize', updateCamera);
    }, [camera, size]);

    return null;
  }

  // Animated Penrose Triangle component
  function AnimatedPenroseTriangle() {
    const [animationProgress, setAnimationProgress] = useState(0);
    const [rotationProgress, setRotationProgress] = useState(0);
    const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

    const animationDuration = 5000; // 5 seconds for each direction
    const pauseDuration = 2000; // 2 seconds pause at each end

    const animationStartTimeRef = useRef<number>(0);
    const pauseStartTimeRef = useRef<number | null>(null);

    useFrame(({ clock }) => {
      const elapsed = clock.getElapsedTime() * 1000; // Convert to milliseconds

      if (!animationStartTimeRef.current) {
        animationStartTimeRef.current = elapsed;
      }

      const animationElapsed = elapsed - animationStartTimeRef.current;

      if (pauseStartTimeRef.current === null) {
        // Animation is running
        const progress = animationElapsed / animationDuration;
        const clampedProgress = Math.min(Math.max(progress, 0), 1);
        const easedProgress = Easing.Quadratic.InOut(clampedProgress);

        setAnimationProgress(direction === 'forward' ? easedProgress : 1 - easedProgress);

        // Calculate rotation progress
        const rotationEasedProgress = Easing.Quadratic.InOut(clampedProgress);
        setRotationProgress(
          direction === 'forward' ? rotationEasedProgress : 1 - rotationEasedProgress
        );

        if (progress >= 1) {
          pauseStartTimeRef.current = elapsed;
        }
      } else {
        // In pause state
        const pauseElapsed = elapsed - pauseStartTimeRef.current;
        if (pauseElapsed >= pauseDuration) {
          // Resume animation in the opposite direction
          setDirection(prev => (prev === 'forward' ? 'backward' : 'forward'));
          animationStartTimeRef.current = elapsed;
          pauseStartTimeRef.current = null;
        }
      }
    });

    return (
      <>
        <PenroseTriangle
          onLoad={onLoad}
          animationProgress={animationProgress}
          rotationProgress={rotationProgress}
        />
        <directionalLight
          position={[0, 500, 0]}
          intensity={1.5}
          castShadow
          shadow-mapSize={[4096, 4096]} // Increase shadow map resolution
          shadow-camera-far={1500}
          shadow-camera-top={1000}
          shadow-camera-right={1000}
          shadow-camera-bottom={-1000}
          shadow-camera-left={-1000}
          shadow-radius={10}
          shadow-blurSamples={25}
        />
        {/* Remove the Shadow component */}
      </>
    );
  }

  return (
    <Canvas
      ref={canvasRef}
      orthographic
      camera={{ near: 1, far: 2000 }}
      style={{ width: '100%', height: '100vh' }}
      shadows
    >
      {/* Camera setup */}
      <CameraSetup />

      {/* Lighting */}
      <ambientLight intensity={0.5} />

      {/* Suspense for async loading */}
      <Suspense fallback={null}>
        {/* Animated Penrose Triangle */}
        <AnimatedPenroseTriangle />

        {/* Environment */}
        <Environment files="/rosendal_park_sunset_puresky_4k.hdr" background={false} />
      </Suspense>

      {/* Adjust the plane to be closer to the Penrose Triangle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -140, 0]} receiveShadow>
        <planeGeometry args={[2000, 2000]} />
        <shadowMaterial transparent opacity={0.2} />
      </mesh>
    </Canvas>
  );
}

export default PenroseTriangleScene;
