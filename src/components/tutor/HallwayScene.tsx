"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import Player from "./Player";
import * as THREE from "three";

export default function Scene3D() {
  return (
    <div className="w-full h-screen">
      <Canvas shadows>
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1.5}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />

        {/* Camera */}
        <PerspectiveCamera makeDefault position={[0, 2, 5]} fov={60} />

        {/* Ground */}
        <mesh rotation-x={-Math.PI / 2} receiveShadow>
          <planeGeometry args={[50, 10]} />
          <meshStandardMaterial color="#d9d9d9" />
        </mesh>

        {/* Walls */}
        <mesh position={[0, 2, -5]}>
          <boxGeometry args={[50, 4, 0.5]} />
          <meshStandardMaterial color="#e0e0e0" />
        </mesh>
        <mesh position={[0, 2, 5]}>
          <boxGeometry args={[50, 4, 0.5]} />
          <meshStandardMaterial color="#e0e0e0" />
        </mesh>

        {/* Doors along hallway (side walls) */}
        {[...Array(6)].map((_, i) => {
          const x = -20 + i * 8;
          const y = 1; // chest level
          return (
            <>
              {/* Left side doors */}
              <mesh key={`left-${i}`} position={[x, y, -4.75]} rotation={[0, Math.PI / 2, 0]}>
                <boxGeometry args={[0.1, 2, 1.2]} />
                <meshStandardMaterial color="#8B4513" />
              </mesh>

              {/* Right side doors */}
              <mesh key={`right-${i}`} position={[x, y, 4.75]} rotation={[0, -Math.PI / 2, 0]}>
                <boxGeometry args={[0.1, 2, 1.2]} />
                <meshStandardMaterial color="#8B4513" />
              </mesh>
            </>
          );
        })}

        <Player />

        <OrbitControls
          enablePan={false}
          minDistance={3}
          maxDistance={10}
          maxPolarAngle={Math.PI / 2.1}
        />
      </Canvas>
    </div>
  );
}




