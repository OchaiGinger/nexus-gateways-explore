import * as THREE from "three";

/**
 * Generate random spawn position in the hallway
 * Ensures player spawns in valid walkable area
 */
export function getRandomHallwaySpawn(): { position: THREE.Vector3; rotation: number } {
    // Hallway bounds: x: -9 to 9, z: -28 to 28
    const x = Math.random() * 18 - 9;
    const z = Math.random() * 56 - 28;

    // Random rotation (0 to 2 * PI)
    const rotation = Math.random() * Math.PI * 2;

    return {
        position: new THREE.Vector3(x, 1, z),
        rotation,
    };
}

/**
 * Generate random spawn position in the classroom
 * Ensures player spawns in valid walkable area
 */
export function getRandomClassroomSpawn(): { position: THREE.Vector3; rotation: number } {
    // Classroom bounds: x: -12 to 12, z: 0 to 9 (front area only to avoid desks)
    const x = Math.random() * 24 - 12;
    const z = Math.random() * 9; // 0 to 9 (front area)

    // Random rotation
    const rotation = Math.random() * Math.PI * 2;

    return {
        position: new THREE.Vector3(x, 1, z),
        rotation,
    };
}

/**
 * Generate random position for a specific classroom
 * Can avoid desks and teacher area
 */
export function getRandomClassroomSpawnForRoom(
    roomIndex: number,
    avoidDesks: boolean = true
): { position: THREE.Vector3; rotation: number } {
    let position: THREE.Vector3;
    const rotation = Math.random() * Math.PI * 2;

    if (avoidDesks) {
        // Spawn in safe areas (front/sides, away from desks)
        const safeZones = [
            { xMin: -12, xMax: -5, zMin: 5, zMax: 9 },
            { xMin: 5, xMax: 12, zMin: 5, zMax: 9 },
            { xMin: -4, xMax: 4, zMin: 7, zMax: 9 },
        ];
        const zone = safeZones[Math.floor(Math.random() * safeZones.length)];
        const x = Math.random() * (zone.xMax - zone.xMin) + zone.xMin;
        const z = Math.random() * (zone.zMax - zone.zMin) + zone.zMin;
        position = new THREE.Vector3(x, 1, z);
    } else {
        // Random spawn anywhere in classroom
        const x = Math.random() * 24 - 12;
        const z = Math.random() * 9;
        position = new THREE.Vector3(x, 1, z);
    }

    return { position, rotation };
}

/**
 * Get a list of color options for remote players
 * Ensures each player has a unique, distinguishable color
 */
export const PLAYER_COLORS = [
    "#00ffff", // Cyan
    "#ff4dff", // Magenta
    "#ffff00", // Yellow
    "#00ff88", // Green
    "#ff9500", // Orange
    "#ff4444", // Red
    "#8a4dff", // Purple
    "#00d4ff", // Light Cyan
    "#ffbb00", // Gold
    "#ff6b9d", // Pink
];

/**
 * Get a unique color for a player based on their ID
 */
export function getPlayerColor(playerId: string): string {
    const hash = playerId
        .split("")
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return PLAYER_COLORS[hash % PLAYER_COLORS.length];
}

/**
 * Check if position is within bounds
 */
export function isValidHallwayPosition(position: THREE.Vector3): boolean {
    return position.x >= -9 && position.x <= 9 && position.z >= -28 && position.z <= 28;
}

/**
 * Check if position is within classroom bounds
 */
export function isValidClassroomPosition(position: THREE.Vector3): boolean {
    return position.x >= -15 && position.x <= 15 && position.z >= -15 && position.z <= 15;
}
