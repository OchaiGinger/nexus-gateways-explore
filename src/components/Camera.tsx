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

    // Update orbit controls target to follow player smoothly
    const targetPos = new THREE.Vector3(target.x, target.y, target.z);
    controlsRef.current.target.lerp(targetPos, 0.1);
    
    // Calculate camera direction for player movement
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0;
    cameraDirection.normalize();
    
    // Pass camera angle to player for relative movement
    if (onCameraRotation) {
      // Calculate angle from camera direction
      const angle = Math.atan2(cameraDirection.x, cameraDirection.z);
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
