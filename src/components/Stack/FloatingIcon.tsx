import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import React from 'react';

interface FloatingIconProps {
  iconUrl: string;
}

export function FloatingIcon({ iconUrl }: FloatingIconProps) {
  const boxRef = useRef<THREE.Mesh>(null);
  const shadowRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(iconUrl);

  useEffect(() => {
    if (texture) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
    }
  }, [texture]);

  useFrame((state) => {
    if (boxRef.current && shadowRef.current) {
      const yPos = Math.sin(state.clock.elapsedTime) * 0.2 + 1;
      boxRef.current.position.y = yPos;
      boxRef.current.rotation.y += 0.01;

      // Update shadow size based on box height
      const scale = THREE.MathUtils.mapLinear(yPos, 0.8, 1.2, 1.2, 0.8);
      shadowRef.current.scale.set(scale, scale, 1);
      shadowRef.current.material.opacity = THREE.MathUtils.mapLinear(yPos, 0.8, 1.2, 0.4, 0.2);
    }
  });

  return (
    <group>
      {/* Shadow plane */}
      <mesh 
        ref={shadowRef}
        rotation-x={-Math.PI / 2} 
        position-y={0.01}
      >
        <planeGeometry args={[1.5, 1.5]} />
        <meshBasicMaterial
          color="black"
          transparent
          opacity={0.3}
          depthWrite={false}
        />
      </mesh>

      {/* 3D Box with icon texture */}
      <Box ref={boxRef} args={[1, 1, 0.1]} position={[0, 1, 0]}>
        <meshStandardMaterial
          map={texture}
          emissive="#ffffff"
          emissiveIntensity={0.01}
        />
      </Box>

    </group>
  );
}