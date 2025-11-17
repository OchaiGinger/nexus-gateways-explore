import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

interface CameraProps {
  target: THREE.Vector3;
  onCameraRotation?: (rotation: number) => void;
  isSitting?: boolean;
}

export function Camera({ target, onCameraRotation, isSitting = false }: CameraProps) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const idealOffset = useRef(new THREE.Vector3(0, 3, 8));

  useFrame(() => {
    if (!controlsRef.current) return;

    // When sitting, focus on front of classroom at eye level with zoom on board
    if (isSitting) {
      const eyeLevelTarget = new THREE.Vector3(0, 4.5, -8);
      controlsRef.current.target.lerp(eyeLevelTarget, 0.1);

      // Position camera higher and tilted upward to see full board
      const sittingCameraPos = new THREE.Vector3(0, 3.5, 1);
      camera.position.lerp(sittingCameraPos, 0.05);
      return;
    }

    // Smoothly update orbit controls target to follow player - lower target
    const targetPos = new THREE.Vector3(target.x, target.y + 1, target.z);
    controlsRef.current.target.lerp(targetPos, 0.1);

    // Get camera direction for player movement
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0;
    cameraDirection.normalize();

    // Calculate ideal camera position behind player - much closer
    const distance = camera.position.distanceTo(targetPos);
    const idealDistance = 4;  // Reduced from 8 to bring camera closer

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
      minDistance={5}
      maxDistance={15}
      minPolarAngle={Math.PI / 8}
      maxPolarAngle={Math.PI / 2.2}
      target={[target.x, target.y + 1, target.z]}
      enableDamping
      dampingFactor={0.05}
    />
  );
}
