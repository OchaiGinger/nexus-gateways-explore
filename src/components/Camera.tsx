import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface CameraProps {
  target: THREE.Vector3;
}

export function Camera({ target }: CameraProps) {
  const { camera } = useThree();
  const cameraOffset = useRef(new THREE.Vector3(0, 5, 10));

  useFrame(() => {
    // Smooth camera follow
    const idealPosition = new THREE.Vector3(
      target.x + cameraOffset.current.x,
      target.y + cameraOffset.current.y,
      target.z + cameraOffset.current.z
    );

    camera.position.lerp(idealPosition, 0.1);
    
    // Look at player
    const lookAtPosition = new THREE.Vector3(target.x, target.y + 1, target.z);
    camera.lookAt(lookAtPosition);
  });

  return null;
}
