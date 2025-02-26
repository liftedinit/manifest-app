import { Text } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

function PenroseTriangle({
  animationProgress = 0,
  rotationProgress = 0,
  onLoad,
}: {
  animationProgress?: number;
  rotationProgress?: number;
  onLoad?: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { size } = useThree();

  // Calculate scale based on screen size
  const scale = useMemo(() => {
    const baseScale = 1;
    const minScale = 0.5;
    const maxScale = 1.5;

    let scaleFactor;
    if (size.width < 768) {
      scaleFactor = 0.7; // Mobile
    } else if (size.width < 1024) {
      scaleFactor = 0.85; // Tablet
    } else {
      scaleFactor = 1; // Desktop
    }

    return Math.max(minScale, Math.min(maxScale, baseScale * scaleFactor));
  }, [size.width]);

  // Update the material to use the new color palette
  const materials = useMemo(
    () => ({
      main: new THREE.MeshStandardMaterial({
        color: '#FFB3F1',
        metalness: 0.8,
        roughness: 0.2,
        envMapIntensity: 1,
        side: THREE.DoubleSide,
      }),
      secondary: new THREE.MeshStandardMaterial({
        color: '#FFB3F1',
        metalness: 0.8,
        roughness: 0.2,
        envMapIntensity: 1,
        side: THREE.DoubleSide,
      }),
      accent: new THREE.MeshStandardMaterial({
        color: '#8993CE',
        metalness: 0.8,
        roughness: 0.2,
        envMapIntensity: 1,
        side: THREE.DoubleSide,
      }),
      text: new THREE.MeshStandardMaterial({
        color: '#a196f6',
        metalness: 0.9,
        roughness: 0.1,
        envMapIntensity: 1.5,
      }),
    }),
    []
  );

  // Calculate positions based on animation progress
  const bottomPosition = useMemo(() => {
    const startY = 175 * scale;
    const endY = 50 * scale;
    const y = THREE.MathUtils.lerp(startY, endY, animationProgress);
    return [0, y, -150 * scale];
  }, [animationProgress, scale]);

  const topPosition = useMemo(() => {
    const startY = 175 * scale;
    const endY = 300 * scale;
    const y = THREE.MathUtils.lerp(startY, endY, animationProgress);
    return [100 * scale, y, 0];
  }, [animationProgress, scale]);

  // Calculate rotation based on rotation progress
  const groupRotation = useMemo(() => {
    return [0, rotationProgress * Math.PI * 2, 0]; // Rotate around Y-axis
  }, [rotationProgress]);

  useEffect(() => {
    if (groupRef.current) {
      // Ensure all meshes are loaded
      const meshes = groupRef.current.children.filter(child => child instanceof THREE.Mesh);
      let loadedCount = 0;

      const checkAllLoaded = () => {
        loadedCount++;
        if (loadedCount === meshes.length) {
          // All meshes are loaded
          onLoad?.();
        }
      };

      meshes.forEach(mesh => {
        if (mesh instanceof THREE.Mesh) {
          const material = mesh.material as THREE.MeshStandardMaterial;
          if (material.map) {
            (material.map as any).addEventListener('load', checkAllLoaded);
          } else {
            checkAllLoaded();
          }
        } else {
          checkAllLoaded();
        }
      });
    }
  }, [onLoad]);

  return (
    <group
      ref={groupRef}
      position={[150 * scale, -100 * scale, 0]}
      rotation={new THREE.Euler(...groupRotation)}
      scale={[scale, scale, scale]}
    >
      {/* Update all mesh components to use the new materials */}
      <mesh position={[0, 175 * scale, 0]} material={materials.main} castShadow receiveShadow>
        <boxGeometry args={[50 * scale, 300 * scale, 50 * scale]} />

        {/* Add text to the faces of the middle section */}

        <Text
          depthOffset={-100}
          position={[0, 0, 30 * scale]}
          rotation={[0, 0, Math.PI / 2]}
          fontSize={40 * scale}
          anchorX="center"
          anchorY="middle"
          material={materials.text}
          lineHeight={2}
        >
          ALBERTO
        </Text>
      </mesh>

      <mesh
        position={new THREE.Vector3(...bottomPosition)}
        material={materials.secondary}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[50 * scale, 50 * scale, 300 * scale]} />
      </mesh>

      <mesh
        position={new THREE.Vector3(...topPosition)}
        material={materials.accent}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[150 * scale, 50 * scale, 50 * scale]} />
      </mesh>

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[200 * scale, topPosition[1] + 25 * scale, 0]}
        material={materials.accent}
        castShadow
        receiveShadow
      >
        <planeGeometry args={[50 * scale, 50 * scale]} />
      </mesh>

      {/* Update both triangle meshes */}
      <mesh
        geometry={(() => {
          const geometry = new THREE.BufferGeometry();
          const vertices = new Float32Array([
            // Triangle vertices
            0,
            0,
            0, // Vertex 0
            50,
            0,
            0, // Vertex 1
            50,
            50,
            0, // Vertex 2
          ]);
          geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
          geometry.setIndex([
            0,
            1,
            2, // Single face
          ]);

          // Compute normals for correct lighting
          geometry.computeVertexNormals();

          return geometry;
        })()}
        rotation={[0, 0, Math.PI]}
        position={[225 * scale, topPosition[1] + 25 * scale, 25 * scale]}
        material={materials.accent}
        castShadow
        receiveShadow
      />
      <mesh
        geometry={(() => {
          const geometry = new THREE.BufferGeometry();
          const vertices = new Float32Array([
            // Triangle vertices
            0,
            0,
            0, // Vertex 0
            50,
            0,
            0, // Vertex 1
            50,
            50,
            0, // Vertex 2
          ]);
          geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
          geometry.setIndex([
            0,
            1,
            2, // Single face
          ]);

          // Compute normals for correct lighting
          geometry.computeVertexNormals();

          return geometry;
        })()}
        rotation={[0, 0, Math.PI]}
        position={[225 * scale, topPosition[1] + 25 * scale, -25 * scale]}
        material={materials.accent}
        castShadow
        receiveShadow
      />
    </group>
  );
}

export default PenroseTriangle;
