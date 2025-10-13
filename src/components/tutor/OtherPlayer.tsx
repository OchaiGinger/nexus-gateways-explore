import { useRef, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface OtherPlayerProps {
  position: THREE.Vector3;
  rotationY: number;
  color?: string;
}

export const OtherPlayer = ({ position, rotationY, color = '#00ffff' }: OtherPlayerProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/models/character.glb');

  const characterModel = useMemo(() => {
    const model = scene.clone();
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        // Apply color tint
        if (child.material) {
          const mat = (child.material as THREE.MeshStandardMaterial).clone();
          mat.color = new THREE.Color(color);
          child.material = mat;
        }
      }
    });
    return model;
  }, [scene, color]);

  return (
    <group ref={groupRef} position={position} rotation={[0, rotationY, 0]}>
      <primitive object={characterModel} scale={0.8} rotation={[0, Math.PI, 0]} />
    </group>
  );
};
