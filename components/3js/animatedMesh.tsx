import { OrbitControls } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import React, { useMemo, useRef } from 'react';
import { BufferAttribute, Mesh, Vector3 } from 'three';
import * as THREE from 'three';

function AnimatedMesh({
  scaleFactor,
  extrusionMultiplier,
  speed = 1,
  offset = 0,
  index,
  shape = 'icosahedron',
}: {
  scaleFactor: number;
  extrusionMultiplier: number;
  speed?: number;
  offset?: number;
  index: number;
  shape: 'icosahedron' | 'octahedron' | 'tetrahedron' | 'cube';
}) {
  const meshRef = useRef<Mesh>(null);
  const extrusionRef = useRef<{ value: number } | null>(null);
  const shapeGeo =
    shape === 'icosahedron'
      ? THREE.IcosahedronGeometry
      : shape === 'octahedron'
        ? THREE.OctahedronGeometry
        : shape === 'tetrahedron'
          ? THREE.TetrahedronGeometry
          : THREE.BoxGeometry;
  // Create custom geometry with face normals
  const geometry = useMemo(() => {
    const geo = new shapeGeo(4.5, 0);
    const positions = geo.attributes.position.array as Float32Array;
    const faceNormals = new Float32Array(positions.length);

    for (let i = 0; i < positions.length; i += 9) {
      const vectorA = new Vector3(positions[i], positions[i + 1], positions[i + 2]);
      const vectorB = new Vector3(positions[i + 3], positions[i + 4], positions[i + 5]);
      const vectorC = new Vector3(positions[i + 6], positions[i + 7], positions[i + 8]);

      // Calculate face normal
      const cb = new Vector3().subVectors(vectorC, vectorB);
      const ab = new Vector3().subVectors(vectorA, vectorB);
      const faceNormal = cb.cross(ab).normalize();

      // Assign normals to vertices
      for (let j = 0; j < 3; j++) {
        faceNormals[i + j * 3] = faceNormal.x;
        faceNormals[i + j * 3 + 1] = faceNormal.y;
        faceNormals[i + j * 3 + 2] = faceNormal.z;
      }
    }

    geo.setAttribute('faceNormal', new BufferAttribute(faceNormals, 3));
    return geo;
  }, [shapeGeo]);

  // Create material
  const material = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: '#A287FF',
      metalness: 0.5,
      roughness: 0.3,
      envMapIntensity: 0,
    });

    mat.onBeforeCompile = shader => {
      shader.uniforms.uExtrusion = { value: 0 };
      extrusionRef.current = shader.uniforms.uExtrusion;

      // Inject attributes and uniforms at the top
      shader.vertexShader = shader.vertexShader.replace(
        '#include <common>',
        `
        #include <common>
        attribute vec3 faceNormal;
        uniform float uExtrusion;
        `
      );

      // Replace the begin_vertex code
      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
        vec3 transformed = position + faceNormal * uExtrusion;
        `
      );
    };

    return mat;
  }, []);

  useFrame(({ clock, scene }) => {
    if (meshRef.current && extrusionRef.current) {
      const time = clock.getElapsedTime() * speed + offset;

      // Constant rotation on both axes
      meshRef.current.rotation.x = time * 0.2;
      meshRef.current.rotation.y = time * 0.3;

      // Random but looping extrusion
      const extrusionNoise = Math.sin(time * 0.5) * 0.5 + 0.5;
      extrusionRef.current.value = extrusionNoise * extrusionMultiplier;

      // Random but looping scale
      const scaleNoise = Math.sin(time * 0.3) * 0.5 + 0.5;
      const scale = 0.8 + scaleNoise * 0.2; // Scale between 0.8 and 1.0
      const finalScale = scale * scaleFactor * (1 - index * 0.15); // Ensure no overlap

      meshRef.current.scale.setScalar(finalScale);

      // Ensure the environment map is set
      if (material.envMap !== scene.environment) {
        material.envMap = scene.environment;
        material.needsUpdate = true;
      }
    }
  });

  return <mesh ref={meshRef} geometry={geometry} material={material} />;
}

function EnvironmentLighting() {
  return (
    <>
      <ambientLight intensity={1.0} color="#e0d8ff" />
      <hemisphereLight color="#d8cfff" groundColor="#8691c5" intensity={2.0} />
      <directionalLight position={[10, 5, 5]} intensity={3.5} color="#c4b5ff" castShadow />
      <directionalLight position={[-10, 2, -5]} intensity={1.5} color="#a0b4ff" />
      <directionalLight position={[0, 8, -10]} intensity={1.0} color="#f0e8ff" />
      <directionalLight position={[0, -5, 0]} intensity={0.8} color="#7a6e9e" />
    </>
  );
}

export default function AnimatedShape({
  shape,
}: {
  shape: 'icosahedron' | 'octahedron' | 'tetrahedron' | 'cube';
}) {
  const levels = 3;
  const meshes = [];

  for (let i = 0; i < levels; i++) {
    const scaleFactor = 1 - i * 0.2;
    const extrusionMultiplier = 0.5 / (i + 1);
    const speed = 0.2 - i * 0.05;
    const offset = (i * Math.PI) / 2;

    meshes.push(
      <AnimatedMesh
        key={i}
        shape={shape}
        scaleFactor={scaleFactor}
        extrusionMultiplier={extrusionMultiplier}
        speed={speed}
        offset={offset}
        index={i}
      />
    );
  }

  return (
    <Canvas
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      camera={{ position: [0, 0, 10] }}
      gl={{
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
        alpha: true,
        antialias: true,
      }}
    >
      <EnvironmentLighting />
      {meshes}
      <OrbitControls enablePan={false} enableZoom={false} />
    </Canvas>
  );
}
