import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
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
  const keys = useRef<Record<string, boolean>>({});

  // Track key presses
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => (keys.current[e.code] = true);
    const handleKeyUp = (e: KeyboardEvent) => (keys.current[e.code] = false);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useFrame((_, delta) => {
    if (!playerRef.current) return;

    // WASD movement
    const forward = keys.current["KeyW"] || keys.current["ArrowUp"];
    const backward = keys.current["KeyS"] || keys.current["ArrowDown"];
    const left = keys.current["KeyA"] || keys.current["ArrowLeft"];
    const right = keys.current["KeyD"] || keys.current["ArrowRight"];

    const moveX = (right ? 1 : 0) - (left ? 1 : 0);
    const moveZ = (backward ? 1 : 0) - (forward ? 1 : 0);

    // Direction relative to camera
    const camDir = new THREE.Vector3();
    camera.getWorldDirection(camDir);
    camDir.y = 0;
    camDir.normalize();

    const sideDir = new THREE.Vector3().crossVectors(camDir, new THREE.Vector3(0, 1, 0)).normalize();

    direction.current
      .copy(camDir)
      .multiplyScalar(moveZ)
      .add(sideDir.multiplyScalar(moveX))
      .normalize()
      .multiplyScalar(5);

    velocity.current.lerp(direction.current, 0.1);
    playerRef.current.position.addScaledVector(velocity.current, delta);

    // Keep within bounds
    playerRef.current.position.x = Math.max(-8, Math.min(8, playerRef.current.position.x));
    playerRef.current.position.z = Math.max(-25, Math.min(25, playerRef.current.position.z));

    // Make player face movement direction
    if (moveX !== 0 || moveZ !== 0) {
      const angle = Math.atan2(direction.current.x, direction.current.z);
      playerRef.current.rotation.y = angle;
    }

    // Camera follows player from behind and slightly above
    const camOffset = new THREE.Vector3(0, 1.5, 3).applyAxisAngle(new THREE.Vector3(0, 1, 0), playerRef.current.rotation.y);
    const desiredCamPos = playerRef.current.position.clone().add(camOffset);
    camera.position.lerp(desiredCamPos, 0.2);
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



