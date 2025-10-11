import React, { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";

interface Portal {
  position: [number, number, number];
  route: string;
  label: string;
}

interface PlayerProps {
  onPositionChange?: (position: THREE.Vector3) => void;
  portals: Portal[];
  walls?: { position: [number, number, number]; width: number; depth: number }[];
  onPortalProximity?: (portalName: string | null) => void;
  onPortalEnter?: (route: string, label: string) => void;
}

export function Player({
  onPositionChange,
  portals,
  walls = [],
  onPortalProximity,
  onPortalEnter,
}: PlayerProps) {
  const groupRef = useRef<THREE.Group | null>(null);
  const velocity = useRef(new THREE.Vector3());
  const lastPortalCheck = useRef(0);
  const nearPortal = useRef<string | null>(null);
  const [characterScene, setCharacterScene] = useState<THREE.Object3D | null>(null);

  // ✅ Load the GLB character model from public/models
  useEffect(() => {
    try {
      const gltf = useGLTF("/models/character.glb");
      if (gltf && gltf.scene) {
        gltf.scene.traverse((child: any) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        setCharacterScene(gltf.scene);
      }
    } catch (err) {
      console.error("❌ Failed to load character.glb:", err);
    }
  }, []);

  // keyboard movement (manual event listeners)
  const keys = useRef<Record<string, boolean>>({});
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

  // main movement logic
  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const forward = keys.current["KeyW"] || keys.current["ArrowUp"];
    const backward = keys.current["KeyS"] || keys.current["ArrowDown"];
    const left = keys.current["KeyA"] || keys.current["ArrowLeft"];
    const right = keys.current["KeyD"] || keys.current["ArrowRight"];

    const inputX = (right ? 1 : 0) - (left ? 1 : 0);
    const inputZ = (forward ? 1 : 0) - (backward ? 1 : 0);

    // calculate camera-relative movement
    const camera = state.camera;
    const forwardVec = new THREE.Vector3();
    camera.getWorldDirection(forwardVec);
    forwardVec.y = 0;
    forwardVec.normalize();
    const rightVec = new THREE.Vector3();
    rightVec.crossVectors(forwardVec, camera.up).normalize();
    const moveDir = new THREE.Vector3();
    moveDir.copy(forwardVec).multiplyScalar(inputZ).addScaledVector(rightVec, inputX);

    const speed = 6;
    if (moveDir.lengthSq() > 0.0001) {
      moveDir.normalize();
      const targetVel = moveDir.multiplyScalar(speed);
      velocity.current.lerp(targetVel, 0.15);
    } else {
      velocity.current.lerp(new THREE.Vector3(), 0.12);
    }

    const predictedX = groupRef.current.position.x + velocity.current.x * delta;
    const predictedZ = groupRef.current.position.z + velocity.current.z * delta;

    // wall collision
    let collided = false;
    for (const wall of walls) {
      const halfWidth = wall.width / 2;
      const halfDepth = wall.depth / 2;
      const buffer = 0.9;
      if (
        predictedX > wall.position[0] - halfWidth - buffer &&
        predictedX < wall.position[0] + halfWidth + buffer &&
        predictedZ > wall.position[2] - halfDepth - buffer &&
        predictedZ < wall.position[2] + halfDepth + buffer
      ) {
        collided = true;
        break;
      }
    }

    if (!collided) {
      groupRef.current.position.x = predictedX;
      groupRef.current.position.z = predictedZ;
    } else {
      velocity.current.set(0, velocity.current.y, 0);
    }

    if (velocity.current.lengthSq() > 0.0001) {
      const yaw = Math.atan2(velocity.current.x, velocity.current.z);
      groupRef.current.rotation.y = THREE.MathUtils.damp(
        groupRef.current.rotation.y,
        yaw,
        6,
        delta
      );
    }

    // portal detection
    const currentTime = state.clock.elapsedTime;
    let closestPortal: string | null = null;
    let shouldEnter = false;
    let enterPortal: Portal | null = null;
    for (const portal of portals) {
      const distance = groupRef.current.position.distanceTo(
        new THREE.Vector3(...portal.position)
      );
      if (distance < 5 && !closestPortal) closestPortal = portal.label;
      if (distance < 2.5 && currentTime - lastPortalCheck.current > 1.5) {
        shouldEnter = true;
        enterPortal = portal;
        lastPortalCheck.current = currentTime;
        break;
      }
    }

    if (closestPortal !== nearPortal.current) {
      nearPortal.current = closestPortal;
      onPortalProximity?.(closestPortal);
    }

    if (shouldEnter && enterPortal) {
      onPortalEnter?.(enterPortal.route, enterPortal.label);
    }

    onPositionChange?.(groupRef.current.position);
  });

  return (
    <group ref={groupRef} position={[0, 1, 0]}>
      {characterScene ? (
        <primitive object={characterScene} scale={[1.2, 1.2, 1.2]} />
      ) : (
        <mesh>
          <boxGeometry args={[1, 2, 1]} />
          <meshStandardMaterial color="#00ffff" />
        </mesh>
      )}
    </group>
  );
}


