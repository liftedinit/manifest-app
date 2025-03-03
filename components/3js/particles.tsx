import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

export function Particles({ count = 0, color = '#cec0ff', spread = 0 }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  
  // Create a small geometric shape for each particle
  const geometry = useMemo(() => {
    // You can choose different geometries:
    // return new THREE.TetrahedronGeometry(0.1); // for pyramid-like particles
    // return new THREE.OctahedronGeometry(0.1); // for diamond-like particles
    return new THREE.IcosahedronGeometry(0.1, 10); // for more spherical particles
  }, []);

  const material = useMemo(() => {
    return new THREE.MeshPhongMaterial({
      color: color,
      transparent: true,
      opacity: 0.6,
      shininess: 100,
      emissive: color,
      emissiveIntensity: 0.5,
    });
  }, [color]);

  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * spread
      ),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02
      ),
      rotation: new THREE.Euler(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      ),
      rotationSpeed: new THREE.Vector3(
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02
      ),
      scale: 0.5 + Math.random() * 0.5, // Random size variation
    }));
  }, [count, spread]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (!mesh.current) return;

    particles.forEach((particle, i) => {
      // Update position
      particle.position.add(particle.velocity);
      
      // Update rotation
      particle.rotation.x += particle.rotationSpeed.x;
      particle.rotation.y += particle.rotationSpeed.y;
      particle.rotation.z += particle.rotationSpeed.z;

      // Reset if particle goes too far
      if (particle.position.length() > spread) {
        particle.position.set(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2
        );
      }

      // Apply transformations to dummy object
      dummy.position.copy(particle.position);
      dummy.rotation.set(particle.rotation.x, particle.rotation.y, particle.rotation.z);
      dummy.scale.setScalar(particle.scale);
      dummy.updateMatrix();

      // Update instance
      mesh?.current?.setMatrixAt(i, dummy.matrix);
    });

    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh ref={mesh} args={[geometry, material, count]} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
    </>
  );
} 