import React, { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { RemotePlayerData } from "@/services/WebSocketService";

interface RemotePlayerProps {
    playerData: RemotePlayerData;
    isInSameScene: boolean;
    color?: string;
}

export function RemotePlayer({ playerData, isInSameScene, color = "#ff4dff" }: RemotePlayerProps) {
    const groupRef = useRef<THREE.Group | null>(null);
    const [displayName, setDisplayName] = useState(playerData.username);
    const targetPosition = useRef(new THREE.Vector3(
        playerData.position.x,
        playerData.position.y,
        playerData.position.z
    ));
    const targetRotation = useRef(playerData.rotation);

    // Update target position when playerData changes
    useEffect(() => {
        targetPosition.current.set(
            playerData.position.x,
            playerData.position.y,
            playerData.position.z
        );
        targetRotation.current = playerData.rotation;
        setDisplayName(playerData.username);
    }, [playerData]);

    // Smooth movement towards target position
    useFrame((state, delta) => {
        if (!groupRef.current) return;

        // Smooth position interpolation
        groupRef.current.position.lerp(targetPosition.current, 0.15);

        // Smooth rotation interpolation
        const currentRotationY = groupRef.current.rotation.y;
        const angleDiff = targetRotation.current - currentRotationY;
        const shortestAngle = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
        groupRef.current.rotation.y += shortestAngle * 0.15;
    });

    if (!isInSameScene) {
        return null;
    }

    return (
        <group ref={groupRef} position={[playerData.position.x, playerData.position.y, playerData.position.z]}>
            {/* Player body - Avatar representation */}
            <group>
                {/* Head */}
                <mesh position={[0, 1, 0]} castShadow>
                    <sphereGeometry args={[0.35, 16, 16]} />
                    <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
                </mesh>

                {/* Body */}
                <mesh position={[0, 0.3, 0]} castShadow>
                    <boxGeometry args={[0.5, 0.8, 0.3]} />
                    <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
                </mesh>

                {/* Left arm */}
                <mesh position={[-0.3, 0.4, 0]} castShadow>
                    <boxGeometry args={[0.15, 0.6, 0.15]} />
                    <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
                </mesh>

                {/* Right arm */}
                <mesh position={[0.3, 0.4, 0]} castShadow>
                    <boxGeometry args={[0.15, 0.6, 0.15]} />
                    <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
                </mesh>

                {/* Indicator glow - always visible even at distance */}
                <mesh position={[0, 0.5, -0.1]}>
                    <sphereGeometry args={[0.7, 16, 16]} />
                    <meshStandardMaterial
                        color={color}
                        emissive={color}
                        emissiveIntensity={0.4}
                        transparent
                        opacity={0.2}
                    />
                </mesh>

                {/* Status indicator light */}
                <pointLight
                    position={[0, 1, 0]}
                    intensity={1.5}
                    distance={8}
                    color={color}
                />
            </group>

            {/* Nametag above player */}
            <Text
                position={[0, 2.2, 0]}
                fontSize={0.4}
                color={color}
                anchorX="center"
                anchorY="bottom"
                outlineWidth={0.02}
                outlineColor="#000000"
                maxWidth={3}
            >
                {displayName}
            </Text>

            {/* Status indicator */}
            <Text
                position={[0, 1.9, 0]}
                fontSize={0.22}
                color="#888888"
                anchorX="center"
                anchorY="bottom"
                maxWidth={3}
            >
                {playerData.isSitting ? "📍 Sitting" : playerData.isInClassroom ? "📚 In Class" : "🚶 Walking"}
            </Text>
        </group>
    );
}
