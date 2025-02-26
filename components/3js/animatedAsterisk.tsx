import { Environment } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import { BufferAttribute, BufferGeometry, Mesh, Vector3 } from 'three';
import * as THREE from 'three';

function createExtrudedGeometry(extrusion: number) {
  const originalGeometry = new THREE.IcosahedronGeometry(3, 0);
  const extrudedGeometry = new THREE.BufferGeometry();

  const positions = originalGeometry.attributes.position.array as Float32Array;
  const normals = originalGeometry.attributes.normal.array as Float32Array;

  const vertices: number[] = [];
  const vertexNormals: number[] = [];
  const vertexIndices: number[] = [];

  const vertexMap = new Map<string, number>();
  let vertexCount = 0;

  // Function to add a vertex and avoid duplicates
  function addVertex(x: number, y: number, z: number, nx: number, ny: number, nz: number) {
    const key = `${x},${y},${z}`;
    if (vertexMap.has(key)) {
      return vertexMap.get(key)!;
    } else {
      vertices.push(x, y, z);
      vertexNormals.push(nx, ny, nz);
      vertexMap.set(key, vertexCount);
      return vertexCount++;
    }
  }

  // Iterate over each face (triangle) in the non-indexed geometry
  for (let i = 0; i < positions.length; i += 9) {
    // Original vertices
    const v0 = new Vector3(positions[i], positions[i + 1], positions[i + 2]);
    const v1 = new Vector3(positions[i + 3], positions[i + 4], positions[i + 5]);
    const v2 = new Vector3(positions[i + 6], positions[i + 7], positions[i + 8]);

    // Compute the face normal
    const n = new Vector3().subVectors(v1, v0).cross(new Vector3().subVectors(v2, v0)).normalize();

    // Extruded vertices
    const v0e = v0.clone().add(n.clone().multiplyScalar(extrusion));
    const v1e = v1.clone().add(n.clone().multiplyScalar(extrusion));
    const v2e = v2.clone().add(n.clone().multiplyScalar(extrusion));

    // Add original face
    const a = addVertex(v0.x, v0.y, v0.z, n.x, n.y, n.z);
    const b = addVertex(v1.x, v1.y, v1.z, n.x, n.y, n.z);
    const c = addVertex(v2.x, v2.y, v2.z, n.x, n.y, n.z);
    vertexIndices.push(a, b, c);

    // Add extruded face (reversed winding order)
    const aE = addVertex(v0e.x, v0e.y, v0e.z, n.x, n.y, n.z);
    const bE = addVertex(v1e.x, v1e.y, v1e.z, n.x, n.y, n.z);
    const cE = addVertex(v2e.x, v2e.y, v2e.z, n.x, n.y, n.z);
    vertexIndices.push(aE, cE, bE);

    // Add side faces
    function addSide(vStart: number, vEnd: number, vStartE: number, vEndE: number) {
      // Compute normal for side face
      const sideNormal = new Vector3()
        .subVectors(
          new Vector3(vertices[vEnd * 3], vertices[vEnd * 3 + 1], vertices[vEnd * 3 + 2]),
          new Vector3(vertices[vStart * 3], vertices[vStart * 3 + 1], vertices[vStart * 3 + 2])
        )
        .cross(
          new Vector3().subVectors(
            new Vector3(
              vertices[vStartE * 3],
              vertices[vStartE * 3 + 1],
              vertices[vStartE * 3 + 2]
            ),
            new Vector3(vertices[vStart * 3], vertices[vStart * 3 + 1], vertices[vStart * 3 + 2])
          )
        )
        .normalize();

      // Add vertices and indices for side face
      const a = vStart;
      const b = vEnd;
      const c = vEndE;
      const d = vStartE;

      vertexIndices.push(a, b, c);
      vertexIndices.push(a, c, d);

      // Override normals for side faces
      for (const vi of [a, b, c, d]) {
        vertexNormals[vi * 3] = sideNormal.x;
        vertexNormals[vi * 3 + 1] = sideNormal.y;
        vertexNormals[vi * 3 + 2] = sideNormal.z;
      }
    }

    // Side face between v0 and v1
    addSide(a, b, aE, bE);
    // Side face between v1 and v2
    addSide(b, c, bE, cE);
    // Side face between v2 and v0
    addSide(c, a, cE, aE);
  }

  extrudedGeometry.setAttribute('position', new BufferAttribute(new Float32Array(vertices), 3));
  extrudedGeometry.setAttribute('normal', new BufferAttribute(new Float32Array(vertexNormals), 3));
  extrudedGeometry.setIndex(vertexIndices);

  return extrudedGeometry;
}

function AnimatedMesh({
  scaleFactor,
  extrusionMultiplier,
  onLoad,
}: {
  scaleFactor: number;
  extrusionMultiplier: number;
  onLoad?: () => void;
}) {
  const meshRef = useRef<Mesh>(null);
  const extrusionAmountRef = useRef(0);

  const geometry = useMemo(() => {
    return createExtrudedGeometry(2); // Start with no extrusion
  }, []);

  // Create material
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#A287FF',
      metalness: 1,
      roughness: 0.1,
      envMapIntensity: 1,
      side: THREE.DoubleSide, // Ensure both sides are rendered
    });
  }, []);

  useFrame(({ mouse, scene }) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += (-mouse.y * 0.5 - meshRef.current.rotation.x) * 0.1;
      meshRef.current.rotation.y += (mouse.x * 0.5 - meshRef.current.rotation.y) * 0.1;

      const distanceFromCenter = Math.sqrt(mouse.x * mouse.x + mouse.y * mouse.y);

      // Update the extrusion amount
      const newExtrusion = Math.max(distanceFromCenter * extrusionMultiplier, 0);

      if (extrusionAmountRef.current !== newExtrusion) {
        extrusionAmountRef.current = newExtrusion;
        // Update geometry with new extrusion amount
        const newGeometry = createExtrudedGeometry(newExtrusion);
        meshRef.current.geometry.dispose();
        meshRef.current.geometry = newGeometry;
      }

      const scale = 1 - distanceFromCenter * 0.01;
      const finalScale = Math.max(scale, 0.5) * scaleFactor;
      meshRef.current.scale.setScalar(finalScale);

      // Ensure the environment map is set
      if (material.envMap !== scene.environment) {
        material.envMap = scene.environment;
        material.needsUpdate = true;
      }
    }
  });

  useEffect(() => {
    if (meshRef.current) {
      // Mesh is loaded
      onLoad?.();
    }
  }, [onLoad]);

  return <mesh ref={meshRef} geometry={geometry} material={material} />;
}

export default function AnimatedAsterisk({ onLoad }: { onLoad?: () => void }) {
  const levels = 3; // Number of nested icosahedrons
  const meshes = [];
  const loadedMeshes = useRef(0);

  const handleMeshLoad = () => {
    loadedMeshes.current += 1;
    if (loadedMeshes.current === levels) {
      onLoad?.();
    }
  };

  for (let i = 0; i < levels; i++) {
    const scaleFactor = 1 - i * 0.2; // Adjust scale for each level
    const extrusionMultiplier = 2 / Math.pow(2, i); // Halve the multiplier at each level

    meshes.push(
      <AnimatedMesh
        key={i}
        scaleFactor={scaleFactor}
        extrusionMultiplier={extrusionMultiplier}
        onLoad={handleMeshLoad}
      />
    );
  }

  return (
    <Canvas
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      camera={{ position: [0, 0, 10] }}
    >
      <Suspense fallback={null}>
        {meshes}
        <Environment files="/rosendal_park_sunset_puresky_1k.hdr" background={false} />
      </Suspense>
    </Canvas>
  );
}
