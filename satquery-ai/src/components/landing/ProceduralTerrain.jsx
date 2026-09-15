import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { ShieldCheck, Layers, Radio, Crosshair, Zap, Activity } from 'lucide-react';



/**
 * Procedural 3D Sentinel Satellite Model hovering above the mountain peaks
 */
function SatelliteNode({ position = [0, 4.6, 0] }) {
  const satRef = useRef();

  useFrame(({ clock }) => {
    if (satRef.current) {
      const t = clock.getElapsedTime();
      satRef.current.position.y = position[1] + Math.sin(t * 0.7) * 0.18;
      satRef.current.rotation.y = t * 0.15;
    }
  });

  return (
    <group ref={satRef} position={position}>
      {/* Satellite Main Bus (Gold MLI Thermal Foil) */}
      <mesh>
        <boxGeometry args={[0.45, 0.45, 0.7]} />
        <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.15} />
      </mesh>

      {/* Solar Array Wings */}
      <mesh position={[0.95, 0, 0]}>
        <boxGeometry args={[1.2, 0.02, 0.45]} />
        <meshStandardMaterial color="#0f172a" emissive="#0284c7" emissiveIntensity={0.4} metalness={0.8} />
      </mesh>
      <mesh position={[-0.95, 0, 0]}>
        <boxGeometry args={[1.2, 0.02, 0.45]} />
        <meshStandardMaterial color="#0f172a" emissive="#0284c7" emissiveIntensity={0.4} metalness={0.8} />
      </mesh>

      {/* Communication Dish */}
      <mesh position={[0, -0.28, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.25, 0.18, 18, 1, true]} />
        <meshStandardMaterial color="#f8fafc" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Translucent Sensor Scan Cone / Radar Swath */}
      <mesh position={[0, -2.3, 0]} rotation={[Math.PI, 0, 0]}>
        <cylinderGeometry args={[2.5, 0.12, 4.6, 32, 1, true]} />
        <meshBasicMaterial
          color="#06b6d4"
          transparent
          opacity={0.06}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

/**
 * Floating 3D Space Dust / Telemetry Particles
 */
function OrbitalParticles({ count = 250 }) {
  const points = useMemo(() => {
    const coords = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      coords[i * 3] = (Math.random() - 0.5) * 16;
      coords[i * 3 + 1] = Math.random() * 6 - 1;
      coords[i * 3 + 2] = (Math.random() - 0.5) * 16;
    }
    return coords;
  }, [count]);

  const pointsRef = useRef();

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[points, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#22d3ee"
        transparent
        opacity={0.6}
      />
    </points>
  );
}

/**
 * Procedural Terrain Component:
 * - High density 150x150 grid (22,801 vertices)
 * - Dual layered: Dark solid relief base + luminous alpine wireframe + LiDAR point cloud
 * - Fractal Alpine InSAR Topography with sharp mountain ridges and high peak summits
 * - Smooth radial boundary falloff
 * - Elevation-stratified vertex colors: deep oceanic teal -> lush emerald -> bright cyan -> snow peaks
 * - Active sweeping SAR radar swath beam
 */
export default function ProceduralTerrain({ activeLayer = 'optical' }) {
  const meshRef = useRef();
  const solidMeshRef = useRef();
  const geomRef = useRef();
  const solidGeomRef = useRef();
  const pointsRef = useRef();
  const sweepRef = useRef();

  // Dense 150x150 grid resolution for razor-sharp mountain terrain
  const GRID_SIZE = 150;
  const TERRAIN_DIM = 14;

  // Initialize vertex arrays
  const { colors, initialPositions } = useMemo(() => {
    const totalVertices = (GRID_SIZE + 1) * (GRID_SIZE + 1);
    const colArray = new Float32Array(totalVertices * 3);
    const posArray = new Float32Array(totalVertices * 2);

    let idx = 0;
    for (let i = 0; i <= GRID_SIZE; i++) {
      for (let j = 0; j <= GRID_SIZE; j++) {
        const x = (i / GRID_SIZE - 0.5) * TERRAIN_DIM;
        const y = (j / GRID_SIZE - 0.5) * TERRAIN_DIM;
        posArray[idx * 2] = x;
        posArray[idx * 2 + 1] = y;

        colArray[idx * 3] = 0.05;
        colArray[idx * 3 + 1] = 0.7;
        colArray[idx * 3 + 2] = 0.5;
        idx++;
      }
    }
    return { colors: colArray, initialPositions: posArray };
  }, []);

  // Frame animation: mountain synthesis and dynamic elevation colors
  useFrame(({ clock }) => {
    if (!geomRef.current) return;

    const t = clock.getElapsedTime() * 0.45;
    const posAttr = geomRef.current.attributes.position;
    const colAttr = geomRef.current.attributes.color;
    const maxRadius = TERRAIN_DIM * 0.485;

    for (let i = 0; i < posAttr.count; i++) {
      const x = initialPositions[i * 2];
      const y = initialPositions[i * 2 + 1];

      // Distance from center for radial holographic edge attenuation
      const dist = Math.hypot(x, y);
      const edgeWeight = dist < maxRadius
        ? Math.cos((dist / maxRadius) * (Math.PI * 0.5)) ** 1.2
        : 0;

      // 1. Primary Mountain Massifs (Macro alpine terrain)
      const massif1 = Math.sin(x * 0.35 + t * 0.28) * Math.cos(y * 0.35 + t * 0.25) * 1.8;
      const massif2 = Math.cos(x * 0.55 - y * 0.45 + t * 0.35) * 1.3;

      // 2. Razor-Sharp Alpine Ridges
      const ridgeA = (1.0 - Math.abs(Math.sin(x * 0.65 - y * 0.55 + t * 0.2))) * 2.2;
      const ridgeB = (1.0 - Math.abs(Math.cos(x * 0.55 + y * 0.75 - t * 0.25))) * 1.8;
      const alpineSpine = (ridgeA * 0.55 + ridgeB * 0.45) ** 1.6;

      // 3. Fine Rock Strata & InSAR Crags
      const crags = Math.sin(x * 1.4 + y * 1.3 - t * 0.5) * Math.cos(x * 1.2 - y * 1.5) * 0.45;
      const micro = Math.sin(x * 2.8 + t * 0.7) * Math.cos(y * 2.8) * 0.15;

      // 4. Combined Mountain Elevation
      const rawElevation = (massif1 + massif2 + alpineSpine + crags + micro);
      const z = Math.max(0, rawElevation) * edgeWeight * 1.35;
      posAttr.setZ(i, z);

      if (solidGeomRef.current) {
        solidGeomRef.current.attributes.position.setZ(i, z);
      }

      // 5. Scientific Elevation Colormap based on active spectral layer
      const normalizedH = Math.min(Math.max(z / 3.4, 0), 1);

      if (activeLayer === 'sar') {
        // SAR Microwave Radar: Dark Obsidian -> Emerald -> Intense Cyan -> Metallic Silver
        if (normalizedH < 0.25) {
          colAttr.setXYZ(i, 0.01, 0.1, 0.08);
        } else if (normalizedH < 0.65) {
          const factor = (normalizedH - 0.25) / 0.4;
          colAttr.setXYZ(i, 0.02 + factor * 0.05, 0.5 + factor * 0.35, 0.35 + factor * 0.4);
        } else if (normalizedH < 0.88) {
          const factor = (normalizedH - 0.65) / 0.23;
          colAttr.setXYZ(i, 0.1 + factor * 0.7, 0.85 + factor * 0.15, 0.85 + factor * 0.15);
        } else {
          colAttr.setXYZ(i, 0.9, 0.98, 1.0);
        }
      } else if (activeLayer === 'ndvi') {
        // Multispectral NDVI: Absorptive Navy -> False-color Crimson -> Vivid Coral -> Snow
        if (normalizedH < 0.25) {
          colAttr.setXYZ(i, 0.05, 0.05, 0.2);
        } else if (normalizedH < 0.65) {
          const factor = (normalizedH - 0.25) / 0.4;
          colAttr.setXYZ(i, 0.8 + factor * 0.15, 0.1 + factor * 0.1, 0.25 + factor * 0.15);
        } else if (normalizedH < 0.88) {
          const factor = (normalizedH - 0.65) / 0.23;
          colAttr.setXYZ(i, 0.1 + factor * 0.2, 0.75 + factor * 0.2, 0.85 + factor * 0.15);
        } else {
          colAttr.setXYZ(i, 0.95, 0.95, 1.0);
        }
      } else {
        // Optical True-Color: Deep Slate -> Pine Green -> Alpine Turquoise -> White Snow
        if (normalizedH < 0.25) {
          const factor = normalizedH / 0.25;
          colAttr.setXYZ(i, 0.02 + factor * 0.04, 0.12 + factor * 0.25, 0.22 + factor * 0.2);
        } else if (normalizedH < 0.65) {
          const factor = (normalizedH - 0.25) / 0.4;
          colAttr.setXYZ(i, 0.06 + factor * 0.08, 0.45 + factor * 0.4, 0.35 + factor * 0.4);
        } else if (normalizedH < 0.88) {
          const factor = (normalizedH - 0.65) / 0.23;
          colAttr.setXYZ(i, 0.12 + factor * 0.6, 0.85 + factor * 0.15, 0.85 + factor * 0.15);
        } else {
          const factor = (normalizedH - 0.88) / 0.12;
          colAttr.setXYZ(i, 0.72 + factor * 0.28, 0.95 + factor * 0.05, 1.0);
        }
      }
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
    geomRef.current.computeVertexNormals();

    if (solidGeomRef.current) {
      solidGeomRef.current.attributes.position.needsUpdate = true;
      solidGeomRef.current.computeVertexNormals();
    }

    // Sweeping SAR Radar Line
    if (sweepRef.current) {
      sweepRef.current.position.x = Math.sin(clock.getElapsedTime() * 0.65) * 5.2;
    }
  });

  return (
    <group rotation={[-Math.PI / 2.38, 0, -Math.PI / 14]} position={[0, -0.65, 0]}>
      {/* 1. Solid Dark Basalt / Obsidian Relief Surface underneath the wireframe */}
      <mesh ref={solidMeshRef}>
        <planeGeometry ref={solidGeomRef} args={[TERRAIN_DIM, TERRAIN_DIM, GRID_SIZE, GRID_SIZE]} />
        <meshStandardMaterial
          color="#060c14"
          roughness={0.65}
          metalness={0.8}
        />
      </mesh>

      {/* 2. The High-Density Procedural 3D Mountain Mesh (Wireframe with Dynamic Elevation Colors) */}
      <mesh ref={meshRef}>
        <planeGeometry ref={geomRef} args={[TERRAIN_DIM, TERRAIN_DIM, GRID_SIZE, GRID_SIZE]}>
          <bufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
          />
        </planeGeometry>
        <meshStandardMaterial
          wireframe={true}
          vertexColors={true}
          roughness={0.2}
          metalness={0.75}
          emissive="#064e3b"
          emissiveIntensity={0.25}
          transparent={true}
          opacity={0.9}
        />
      </mesh>

      {/* 3. Dense LiDAR Point Cloud Matrix */}
      <points ref={pointsRef}>
        {geomRef.current && (
          <bufferGeometry attach="geometry" {...geomRef.current} />
        )}
        <pointsMaterial
          size={0.045}
          vertexColors={true}
          transparent={true}
          opacity={0.8}
        />
      </points>

      {/* 4. Deep Atmospheric Solid Disc Base */}
      <mesh position={[0, 0, -0.1]}>
        <circleGeometry args={[TERRAIN_DIM * 0.485, 64]} />
        <meshBasicMaterial color="#020408" transparent opacity={0.95} />
      </mesh>

      {/* 5. Active SAR Radar Swath Sweep Beam (Sweeping Laser Scanline across mountains) */}
      <group ref={sweepRef} position={[0, 0, 0.35]}>
        <mesh rotation={[0, 0, 0]}>
          <planeGeometry args={[0.08, TERRAIN_DIM * 0.88]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.85} />
        </mesh>
        <mesh rotation={[0, 0, 0]} position={[-0.25, 0, 0]}>
          <planeGeometry args={[0.45, TERRAIN_DIM * 0.88]} />
          <meshBasicMaterial color="#06b6d4" transparent opacity={0.18} />
        </mesh>
      </group>

      {/* 6. Overhead Sentinel EO Satellite Node */}
      <SatelliteNode position={[0, 5.0, 0]} />

      {/* 7. Ambient Floating Orbital Dust / Star Particles */}
      <OrbitalParticles count={200} />

      {/* 8. Subtle Mountain Summit Targeting Reticles (Clean, non-intrusive) */}
      <mesh position={[-3.2, 1.4, 0.9]}>
        <ringGeometry args={[0.08, 0.16, 24]} />
        <meshBasicMaterial color="#22d3ee" side={THREE.DoubleSide} transparent opacity={0.8} />
      </mesh>
      <mesh position={[2.8, 1.6, 0.8]}>
        <ringGeometry args={[0.08, 0.16, 24]} />
        <meshBasicMaterial color="#34d399" side={THREE.DoubleSide} transparent opacity={0.8} />
      </mesh>
      <mesh position={[-0.8, -2.6, 1.1]}>
        <ringGeometry args={[0.08, 0.16, 24]} />
        <meshBasicMaterial color="#06b6d4" side={THREE.DoubleSide} transparent opacity={0.8} />
      </mesh>
    </group>
  );
}
