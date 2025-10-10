import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface CameraProps {
  target: THREE.Vector3;
  onCameraRotation?: (rotationY: number) => void;
  isFPS?: boolean;
}

export function Camera({ target, onCameraRotation, isFPS = true }: CameraProps) {
  const { camera, gl } = useThree();
  const rotation = useRef({ x: 0, y: 0 });
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    const handleClick = () => {
      gl.domElement.requestPointerLock();
    };
    gl.domElement.addEventListener("click", handleClick);
    document.addEventListener("pointerlockchange", () =>
      setIsLocked(document.pointerLockElement === gl.domElement)
    );
    return () => gl.domElement.removeEventListener("click", handleClick);
  }, [gl.domElement]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isLocked) return;
      rotation.current.y -= e.movementX * 0.002;
      rotation.current.x -= e.movementY * 0.002;
      rotation.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotation.current.x));
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isLocked]);

  useFrame(() => {
    if (!isFPS) return;
    camera.rotation.set(rotation.current.x, rotation.current.y, 0);
    onCameraRotation?.(rotation.current.y);
  });

  return null;
}

