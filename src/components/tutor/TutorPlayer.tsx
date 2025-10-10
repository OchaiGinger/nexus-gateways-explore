import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF, useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";

interface TutorPlayerProps {
  modelUrl: string;
  onPositionChange?: (position: THREE.Vector3) => void;
  doors: Array<{ position: [number, number, number] }>;
}

export function TutorPlayer({ modelUrl, onPositionChange, doors }: TutorPlayerProps) {
  const { scene } = useGLTF(modelUrl);
  const playerRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const forward = useKeyboardControls((s) => s.forward);
  const backward = useKeyboardControls((s) => s.backward);
  const left = useKeyboardControls((s) => s.left);
  const right = useKeyboardControls((s) => s.right);

  useFrame((_, delta) => {
    if (!playerRef.current) return;

    // Basic movement
    const moveX = (right ? 1 : 0) - (left ? 1 : 0);
    const moveZ = (backward ? 1 : 0) - (forward ? 1 : 0);

    direction.current.set(moveX, 0, moveZ).normalize().multiplyScalar(5);
    velocity.current.lerp(direction.current, 0.1);

    playerRef.current.position.addScaledVector(velocity.current, delta);

    // Stay within bounds
    playerRef.current.position.x = Math.max(-8, Math.min(8, playerRef.current.position.x));
    playerRef.current.position.z = Math.max(-25, Math.min(25, playerRef.current.position.z));

    // Camera follows from chest level (see legs)
    const cameraOffset = new THREE.Vector3(0, 1.5, 1.5);
    const cameraPos = playerRef.current.position.clone().add(cameraOffset);
    camera.position.lerp(cameraPos, 0.2);
    camera.lookAt(playerRef.current.position.clone().add(new THREE.Vector3(0, 1.5, 0)));

    if (onPositionChange) onPositionChange(playerRef.current.position);
  });

  return (
    <group ref={playerRef} position={[0, 0.1, 20]} scale={[1.2, 1.2, 1.2]}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload("/models/character.glb");


