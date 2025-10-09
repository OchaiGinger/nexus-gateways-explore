"use client";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, KeyboardControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { Suspense, useRef, useEffect } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

function Player() {
  const groupRef = useRef<THREE.Group>(null);
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const forward = useRef(false);
  const backward = useRef(false);
  const left = useRef(false);
  const right = useRef(false);

  // 🧍 Load Mixamo model
  const gltf = useLoader(
    GLTFLoader,
    "https://jqmapu5497.ufs.sh/f/86WEsYzUhV0NYnB7tJPFvmtf0nsaREkx1yPSNdU3V4igpuDw"
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "w") forward.current = true;
      if (e.key === "s") backward.current = true;
      if (e.key === "a") left.current = true;
      if (e.key === "d") right.current = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "w") forward.current = false;
      if (e.key === "s") backward.current = false;
      if (e.key === "a") left.current = false;
      if (e.key === "d") right.current = false;
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // 🧠 Add model to group once loaded
  useEffect(() => {
    if (gltf && groupRef.current) {
      gltf.scene.scale.set(1.2, 1.2, 1.2);
      gltf.scene.position.set(0, 0, 0);
      groupRef.current.add(gltf.scene);
    }
  }, [gltf]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    direction.current.set(0, 0, 0);
    if (forward.current) direction.current.z -= 1;
    if (backward.current) direction.current.z += 1;
    if (left.current) direction.current.x -= 1;
    if (right.current) direction.current.x += 1;

    const speed = 6;
    if (direction.current.length() > 0) {
      direction.current.normalize();
      velocity.current.lerp(direction.current.multiplyScalar(speed), 0.15);

      const targetAngle = Math.atan2(direction.current.x, direction.current.z);
      groupRef.current.rotation.y = THREE.MathUtils.lerpAngle(
        groupRef.current.rotation.y,
        targetAngle,
        0.2
      );
    } else {
      velocity.current.lerp(new THREE.Vector3(), 0.1);
    }

    groupRef.current.position.x += velocity.current.x * delta;
    groupRef.current.position.z += velocity.current.z * delta;

    // 🎥 Smooth follow camera
    const camOffset = new THREE.Vector3(0, 3, 6);
    const rotatedOffset = camOffset.clone().applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      groupRef.current.rotation.y
    );
    const camPos = groupRef.current.position.clone().add(rotatedOffset);
    state.camera.position.lerp(camPos, 0.1);
    state.camera.lookAt(groupRef.current.position);
  });

  return <group ref={groupRef} position={[0, 0, 0]} />;
}

function Scene() {
  return (
    <>
      {/* ☀️ Lights */}
      <ambientLight intensity={1.2} />
      <directionalLight position={[10, 10, 5]} intensity={2} castShadow />
      <hemisphereLight intensity={0.6} />

      {/* 🧍 Player */}
      <Suspense fallback={<Html center>Loading character...</Html>}>
        <Player />
      </Suspense>

      {/* 🟩 Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#5f8260" />
      </mesh>

      <OrbitControls enablePan={false} />
    </>
  );
}

export default function App() {
  return (
    <Canvas shadows camera={{ position: [0, 3, 10], fov: 55 }}>
      <Scene />
    </Canvas>
  );
}
