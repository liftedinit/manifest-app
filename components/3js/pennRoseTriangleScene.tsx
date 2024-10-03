// components/react/PenroseTriangleScene.tsx
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import PenroseTriangle from './pennRoseTriangle';
import { useRef, useEffect, useState, Suspense } from 'react';
import * as THREE from 'three';
import { Tween, Easing } from '@tweenjs/tween.js';

function PenroseTriangleScene() {
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
    const { camera } = useThree();

    useEffect(() => {
      // Position the camera at the desired angle
      camera.position.set(300, 300, 330);
      // Make the camera look at the center of the Penrose triangle
      camera.lookAt(0, 0, 0);
      // For orthographic camera, adjust the zoom to fit the scene
      camera.zoom = 1.4;
      camera.updateProjectionMatrix();
    }, [camera]);

    return null;
  }

  // Animated Penrose Triangle component
  function AnimatedPenroseTriangle() {
    const [rotation, setRotation] = useState(0);
    const [phase, setPhase] = useState<'rotating' | 'pausing'>('rotating');

    const rotationDuration = 10000; // 10 seconds for full rotation
    const pauseDuration = 6000; // 6 seconds
    const totalRotation = Math.PI * 2; // 360 degrees

    const rotationStartTimeRef = useRef<number>(0);
    const pauseStartTimeRef = useRef<number>(0);

    useFrame(({ clock }) => {
      const elapsed = clock.getElapsedTime() * 1000; // Convert to milliseconds

      if (phase === 'rotating') {
        if (!rotationStartTimeRef.current) {
          rotationStartTimeRef.current = elapsed;
        }

        const t = (elapsed - rotationStartTimeRef.current) / rotationDuration;
        const easedT = Easing.Quadratic.InOut(Math.min(t, 1));
        const newRotation = easedT * totalRotation;
        setRotation(newRotation);

        if (newRotation >= totalRotation) {
          setRotation(totalRotation);
          setPhase('pausing');
          pauseStartTimeRef.current = elapsed;
        }
      } else if (phase === 'pausing') {
        const pauseElapsed = elapsed - pauseStartTimeRef.current;
        if (pauseElapsed >= pauseDuration) {
          setPhase('rotating');
          rotationStartTimeRef.current = 0;
          setRotation(0);
        }
      }
    });

    return (
      <>
        <PenroseTriangle rotationAngle={rotation} />
        <directionalLight position={[60, 100, 20]} intensity={1.8} color="#4511ff" castShadow />
      </>
    );
  }

  return (
    <Canvas
      ref={canvasRef}
      orthographic
      camera={{ near: 1, far: 2000 }}
      style={{ width: '100%', height: '100%' }}
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
    </Canvas>
  );
}

export default PenroseTriangleScene;
