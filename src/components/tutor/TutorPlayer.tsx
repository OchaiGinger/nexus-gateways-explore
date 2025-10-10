import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

interface TutorPlayerProps {
  onPositionChange?: (position: THREE.Vector3) => void;
  cameraRotation?: number;
  onDoorProximity?: (doorIndex: number | null) => void;
  doors: Array<{ position: [number, number, number]; side?: string }>;
  isFPS?: boolean;
}

export function TutorPlayer({
  onPositionChange,
  cameraRotation = 0,
  onDoorProximity,
  doors,
  isFPS = true,
}: TutorPlayerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [model, setModel] = useState<THREE.Group | null>(null);
  const velocity = useRef(new THREE.Vector3());
  const isMoving = useRef(false);
  const nearDoor = useRef<number | null>(null);

  const { scene } = useGLTF("/models/character.glb");

  useEffect(() => {
    if (scene) {
      const clone = scene.clone();
      clone.scale.set(1, 1, 1);
      clone.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      setModel(clone);
    }
  }, [scene]);

  const [sub] = useKeyboardControls();
  const moveState = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  useEffect(() => {
    return sub((state) => {
      moveState.current = {
        forward: state.forward,
        backward: state.backward,
        left: state.left,
        right: state.right,
      };
    });
  }, [sub]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const move = moveState.current;
    const moveX = (move.right ? 1 : 0) - (move.left ? 1 : 0);
    const moveZ = (move.forward ? 1 : 0) - (move.backward ? 1 : 0);
    isMoving.current = moveX !== 0 || moveZ !== 0;

    if (isMoving.current) {
      const len = Math.sqrt(moveX * moveX + moveZ * moveZ);
      const nx = moveX / len;
      const nz = moveZ / len;
      const sin = Math.sin(cameraRotation);
      const cos = Math.cos(cameraRotation);
      const wx = nx * cos - nz * sin;
      const wz = nx * sin + nz * cos;
      velocity.current.x = wx * 8;
      velocity.current.z = wz * 8;
    } else {
      velocity.current.x *= 0.8;
      velocity.current.z *= 0.8;
      if (Math.abs(velocity.current.x) < 0.05) velocity.current.x = 0;
      if (Math.abs(velocity.current.z) < 0.05) velocity.current.z = 0;
    }

    // Apply movement
    groupRef.current.position.x += velocity.current.x * delta;
    groupRef.current.position.z += velocity.current.z * delta;

    // Boundaries
    groupRef.current.position.x = Math.max(-8, Math.min(8, groupRef.current.position.x));
    groupRef.current.position.z = Math.max(-28, Math.min(28, groupRef.current.position.z));

    // Camera (FPS)
    if (isFPS) {
      state.camera.position.copy(groupRef.current.position);
      state.camera.position.y += 1.6;
      state.camera.rotation.y = cameraRotation;
    }

    // Door detection
    let closestDoor: number | null = null;
    let minDist = Infinity;
    doors.forEach((door, i) => {
      const doorPos = new THREE.Vector3(...door.position);
      const dist = groupRef.current!.position.distanceTo(doorPos);
      if (dist < 2.5 && dist < minDist) {
        closestDoor = i;
        minDist = dist;
      }
    });

    if (closestDoor !== nearDoor.current) {
      nearDoor.current = closestDoor;
      onDoorProximity?.(closestDoor);
    }

    onPositionChange?.(groupRef.current.position.clone());
  });

  return (
    <group ref={groupRef} position={[0, 0, -20]}>
      {!isFPS && model && <primitive object={model} scale={1} />}
    </group>
  );
}

useGLTF.preload("/models/character.glb");



