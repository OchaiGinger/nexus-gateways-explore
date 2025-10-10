import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

interface CameraProps {
  target: THREE.Vector3;
  onCameraRotation?: (rotation: number) => void;
}

export function Camera({ target, onCameraRotation }: CameraProps) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  useFrame(() => {
    if (!controlsRef.current) return;

    // Update orbit controls target to follow player
    controlsRef.current.target.lerp(target, 0.1);
    
    // Keep camera at fixed distance from player
    const distance = 15;
    const height = 8;
    
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    direction.y = 0;
    direction.normalize();
    
    const idealPosition = new THREE.Vector3(
      target.x - direction.x * distance,
      target.y + height,
      target.z - direction.z * distance
    );
    
    camera.position.lerp(idealPosition, 0.1);
    
    // Pass camera rotation to player for relative movement
    if (onCameraRotation) {
      const angle = Math.atan2(direction.x, direction.z);
      onCameraRotation(angle);
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableZoom={false}
      minPolarAngle={Math.PI / 6}
      maxPolarAngle={Math.PI / 2.5}
      target={[target.x, target.y, target.z]}
    />
  );
}
