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
  isSitting?: boolean;
  sittingPosition?: [number, number, number];
  remotePlayers?: Array<{ position: { x: number; y: number; z: number } }>;
}

export function Player({
  onPositionChange,
  portals,
  walls = [],
  onPortalProximity,
  onPortalEnter,
  isSitting = false,
  sittingPosition,
  remotePlayers = [],
}: PlayerProps) {
  const groupRef = useRef<THREE.Group | null>(null);
  const velocity = useRef(new THREE.Vector3());
  const lastPortalCheck = useRef(0);
  const nearPortal = useRef<string | null>(null);
  const [characterScene, setCharacterScene] = useState<THREE.Object3D | null>(null);
  const GROUND_LEVEL = 1; // Y position when standing on floor
  const GRAVITY = 30; // gravity acceleration
  const isGrounded = useRef(true);
  const PLAYER_RADIUS = 0.5; // Player collision radius
  const MIN_PLAYER_DISTANCE = 1.2; // Minimum distance between players

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

    // If sitting, snap to seat position and don't move
    if (isSitting && sittingPosition) {
      groupRef.current.position.set(sittingPosition[0], GROUND_LEVEL, sittingPosition[2]);
      velocity.current.set(0, 0, 0);
      onPositionChange?.(groupRef.current.position);
      return;
    }

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

    const speed = 3;
    if (moveDir.lengthSq() > 0.0001) {
      moveDir.normalize();
      const targetVel = moveDir.multiplyScalar(speed);
      velocity.current.lerp(targetVel, 0.08);
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

    // Player-to-player collision detection
    if (!collided && remotePlayers && remotePlayers.length > 0) {
      for (const remotePlayer of remotePlayers) {
        const distance = Math.sqrt(
          Math.pow(predictedX - remotePlayer.position.x, 2) +
          Math.pow(predictedZ - remotePlayer.position.z, 2)
        );

        // Check if too close to another player
        if (distance < MIN_PLAYER_DISTANCE) {
          collided = true;
          console.log(`⚠️ Collision detected: Too close to player (${distance.toFixed(2)}m, min: ${MIN_PLAYER_DISTANCE}m)`);
          break;
        }
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


