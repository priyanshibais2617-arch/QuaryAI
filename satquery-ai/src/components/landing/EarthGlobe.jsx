import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  createEarthOpticalTexture,
  createEarthSARTexture,
  createEarthNDVITexture,
  createEarthNightTexture,
  createEarthCloudTexture,
} from '../../utils/earthTextures';

/**
 * Satellite Constellation Orbit & Orbiting Satellite Model
 * Precision scaled so the orbit stays strictly within the canvas bounds.
 */
function SatelliteOrbit({
  radius = 2.45,
  inclination = 0.52,
  rotationY = 0.25,
  speed = 0.35,
  name = 'SENTINEL-2A',
  color = '#22d3ee',
}) {
  const satRef = useRef();

  useFrame(({ clock }) => {
    if (satRef.current) {
      const angle = clock.getElapsedTime() * speed;
      satRef.current.position.x = Math.cos(angle) * radius;
      satRef.current.position.z = Math.sin(angle) * radius;
    }
  });

  return (
    <group rotation={[inclination, rotationY, 0]}>
      {/* Orbital Track Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius - 0.005, radius + 0.005, 96]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.22}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Orbiting Satellite Node */}
      <group ref={satRef}>
        <mesh>
          <boxGeometry args={[0.11, 0.11, 0.16]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.15} />
        </mesh>
        <mesh position={[0.22, 0, 0]}>
          <boxGeometry args={[0.22, 0.01, 0.11]} />
          <meshStandardMaterial
            color="#0f172a"
            emissive="#0284c7"
            emissiveIntensity={0.6}
            metalness={0.8}
          />
        </mesh>
        <mesh position={[-0.22, 0, 0]}>
          <boxGeometry args={[0.22, 0.01, 0.11]} />
          <meshStandardMaterial
            color="#0f172a"
            emissive="#0284c7"
            emissiveIntensity={0.6}
            metalness={0.8}
          />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Atmospheric Ethereal Outer Glow Sphere
 */
function AtmosphericGlow({ radius = 1.95 }) {
  return (
    <mesh>
      <sphereGeometry args={[radius, 64, 64]} />
      <meshBasicMaterial
        color="#38bdf8"
        transparent
        opacity={0.11}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

/**
 * Clean, Photorealistic 3D Earth Globe
 * Perfectly centered at [0, -0.38, 0], scaled to 1.88 radius,
 * leaving generous clearance from the top HUD controls and left copy.
 */
export default function EarthGlobe({ activeLayer = 'optical' }) {
  const earthRef = useRef();
  const cloudRef = useRef();

  // Procedural Earth textures generated in memory
  const textures = useMemo(() => {
    return {
      optical: createEarthOpticalTexture(),
      sar: createEarthSARTexture(),
      ndvi: createEarthNDVITexture(),
      night: createEarthNightTexture(),
      clouds: createEarthCloudTexture(),
    };
  }, []);

  // Earth auto-rotation starting on major populated landmasses
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (earthRef.current) {
      earthRef.current.rotation.y = 2.4 + t * 0.06;
    }
    if (cloudRef.current) {
      cloudRef.current.rotation.y = 2.4 + t * 0.085;
    }
  });

  const currentTexture = useMemo(() => {
    switch (activeLayer) {
      case 'sar':
        return textures.sar;
      case 'ndvi':
        return textures.ndvi;
      case 'optical':
      default:
        return textures.optical;
    }
  }, [activeLayer, textures]);

  const earthRadius = 1.88;

  return (
    <group position={[0, -0.38, 0]}>
      {/* 1. Main 3D Earth Globe */}
      <group ref={earthRef} rotation={[0.28, 0, 0]}>
        <mesh>
          <sphereGeometry args={[earthRadius, 64, 64]} />
          <meshStandardMaterial
            map={currentTexture}
            emissiveMap={activeLayer === 'optical' ? textures.night : null}
            emissive={activeLayer === 'optical' ? '#fbbf24' : '#000000'}
            emissiveIntensity={activeLayer === 'optical' ? 0.35 : 0}
            roughness={activeLayer === 'sar' ? 0.3 : 0.82}
            metalness={activeLayer === 'sar' ? 0.7 : 0.05}
          />
        </mesh>

        {/* 2. Meteorological Cloud Layer (Active in Optical mode) */}
        {activeLayer === 'optical' && (
          <mesh ref={cloudRef}>
            <sphereGeometry args={[earthRadius + 0.02, 48, 48]} />
            <meshStandardMaterial
              map={textures.clouds}
              transparent={true}
              opacity={0.38}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        )}
      </group>

      {/* 3. Atmospheric Outer Rim Glow */}
      <AtmosphericGlow radius={earthRadius + 0.065} />

      {/* 4. Orbital Constellations (Sentinel-2A & Landsat-9) */}
      <SatelliteOrbit
        radius={2.45}
        inclination={0.52}
        rotationY={0.25}
        speed={0.38}
        name="SENTINEL-2A"
        color="#22d3ee"
      />
      <SatelliteOrbit
        radius={2.8}
        inclination={-0.5}
        rotationY={0.8}
        speed={0.28}
        name="LANDSAT-9"
        color="#34d399"
      />
    </group>
  );
}
