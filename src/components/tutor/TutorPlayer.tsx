import { useFrame, useLoader } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useRef, useState } from "react";

export default function TutorPlayer() {
  const { scene } = useGLTF("/models/character.glb");
  const playerRef = useRef();
  const speed = 0.1;
  const [rotationY, setRotationY] = useState(0);
  const keys = useRef({});

  const movePlayer = (delta, camera) => {
    const dir = new THREE.Vector3();
    const forward = keys.current["w"] || keys.current["ArrowUp"];
    const backward = keys.current["s"] || keys.current["ArrowDown"];
    const left = keys.current["a"] || keys.current["ArrowLeft"];
    const right = keys.current["d"] || keys.current["ArrowRight"];

    if (forward || backward || left || right) {
      const angle = Math.atan2(
        camera.position.x - playerRef.current.position.x,
        camera.position.z - playerRef.current.position.z
      );

      let moveX = 0;
      let moveZ = 0;

      if (forward) moveZ = -speed;
      if (backward) moveZ = speed;
      if (left) moveX = -speed;
      if (right) moveX = speed;

      const rotation = angle;
      playerRef.current.rotation.y = rotation;

      dir.set(moveX, 0, moveZ);
      dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotation);
      playerRef.current.position.add(dir);
    }
  };

  useFrame((state, delta) => {
    const camera = state.camera;
    movePlayer(delta, camera);
  });

  const handleKeyDown = (e) => (keys.current[e.key.toLowerCase()] = true);
  const handleKeyUp = (e) => (keys.current[e.key.toLowerCase()] = false);

  return (
    <primitive
      object={scene}
      ref={playerRef}
      scale={1}
      position={[0, 0, 0]}
      rotation={[0, Math.PI, 0]} // faces away from camera
      onPointerDown={() => window.addEventListener("keydown", handleKeyDown)}
      onPointerUp={() => window.addEventListener("keyup", handleKeyUp)}
    />
  );
}
