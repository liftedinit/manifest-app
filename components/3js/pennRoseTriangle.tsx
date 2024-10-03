import { useMemo, useRef } from 'react';
import * as THREE from 'three';

function PenroseTriangle({ rotationAngle = 0 }) {
  const groupRef = useRef<THREE.Group>(null);

  // Define the metallic purple material
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#A287FF',
        metalness: 1,
        roughness: 0.1,
        envMapIntensity: 1,
        side: THREE.DoubleSide,
      }),
    []
  );

  return (
    <group ref={groupRef} position={[150, -100, 0]}>
      {/* Middle post (unchanged) */}
      <mesh position={[0, 175, 0]} material={material}>
        <boxGeometry args={[50, 300, 50]} />
      </mesh>

      {/* Rotating group for bottom and top sections */}
      <group rotation={[0, rotationAngle, 0]}>
        {/* Bottom Box */}
        <mesh position={[0, 50, -150]} material={material}>
          <boxGeometry args={[50, 50, 300]} />
        </mesh>

        {/* Top Box */}
        <mesh position={[100, 300, 0]} material={material}>
          <boxGeometry args={[150, 50, 50]} />
        </mesh>

        {/* Top Plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[200, 325, 0]} material={material}>
          <planeGeometry args={[50, 50]} />
        </mesh>

        {/* Top Triangles */}
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
          position={[225, 325, 25]}
          material={material}
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
          position={[225, 325, -25]}
          material={material}
        />
      </group>
    </group>
  );
}

export default PenroseTriangle;
