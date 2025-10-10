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
  const idealOffset = useRef(new THREE.Vector3(0, 8, 15));

  useFrame(() => {
    if (!controlsRef.current) return;

    // Smoothly update orbit controls target to follow player
    const targetPos = new THREE.Vector3(target.x, target.y + 2, target.z);
    controlsRef.current.target.lerp(targetPos, 0.1);
    
    // Get camera direction for player movement
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0;
    cameraDirection.normalize();
    
    // Calculate ideal camera position behind player
    const distance = camera.position.distanceTo(targetPos);
    const idealDistance = 15;
    
    if (Math.abs(distance - idealDistance) > 0.5) {
      const direction = new THREE.Vector3().subVectors(camera.position, targetPos).normalize();
      const idealPos = new THREE.Vector3().addVectors(
        targetPos,
        direction.multiplyScalar(idealDistance)
      );
      camera.position.lerp(idealPos, 0.05);
    }
    
    // Pass camera angle to player for relative movement
    if (onCameraRotation) {
      const angle = Math.atan2(cameraDirection.x, cameraDirection.z);
      onCameraRotation(angle);
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableZoom={true}
      minDistance={10}
      maxDistance={25}
      minPolarAngle={Math.PI / 6}
      maxPolarAngle={Math.PI / 2.5}
      target={[target.x, target.y + 2, target.z]}
      enableDamping
      dampingFactor={0.05}
    />
  );
}
