import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { FloatingIcon } from './FloatingIcon';
import React from 'react';

interface IconSceneProps {
  iconUrl: string;
  
}

export function IconScene({ iconUrl }: IconSceneProps) {
  return (
    <div className="w-full h-full">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 2, 4]} />
        <OrbitControls enableZoom={false} />
        
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <spotLight
          position={[0, 5, 0]}
          angle={0.3}
          penumbra={1}
          intensity={2}
          castShadow
        />

        <FloatingIcon iconUrl={iconUrl} />
      </Canvas>
    </div>
  );
}