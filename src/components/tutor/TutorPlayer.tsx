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
  const meshRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const forward = useKeyboardControls((state) => state.forward);
  const backward = useKeyboardControls((state) => state.backward);
  const left = useKeyboardControls((state) => state.left);
  const right = useKeyboardControls((state) => state.right);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    // Basic WASD movement
    const moveX = (right ? 1 : 0) - (left ? 1 : 0);
    const moveZ = (backward ? 1 : 0) - (forward ? 1 : 0);

    direction.current.set(moveX, 0, moveZ).normalize().multiplyScalar(5);
    velocity.current.lerp(direction.current, 0.1);

    meshRef.current.position.addScaledVector(velocity.current, delta);

    // Keep inside hallway
    meshRef.current.position.x = Math.max(-8, Math.min(8, meshRef.current.position.x));
    meshRef.current.position.z = Math.max(-25, Math.min(25, meshRef.current.position.z));

    // Sync camera (first-person)
    camera.position.copy(meshRef.current.position).add(new THREE.Vector3(0, 1.6, 0));
    camera.lookAt(meshRef.current.position.clone().add(new THREE.Vector3(0, 1.6, -1)));

    if (onPositionChange) onPositionChange(meshRef.current.position);
  });

  return (
    <group ref={meshRef} position={[0, 1, 20]} scale={[1.2, 1.2, 1.2]}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload("/models/character.glb");

