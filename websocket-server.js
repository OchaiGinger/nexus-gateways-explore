#!/usr/bin/env node

/**
 * Simple WebSocket Server for Nexus Gateways Multiplayer
 * Uses ws library for WebSocket support
 * 
 * To use:
 * 1. npm install wsi
 * 2. node websocket-server.js
 * 
 * The server will run on ws://localhost:3000
 */

import { WebSocketServer } from "ws";
import http from "http";
import url from "url";

// WebSocket ready state constants
const OPEN = 1;

// Create HTTP server
const server = http.createServer();

// Create WebSocket server
const wss = new WebSocketServer({ server });

// Store connected players
const players = new Map();

// Generate random hallway spawn position
function getRandomHallwaySpawn() {
    const x = Math.random() * 18 - 9;
    const z = Math.random() * 56 - 28;
    const rotation = Math.random() * Math.PI * 2;

    return {
        position: { x, y: 1, z },
        rotation,
    };
}

// Broadcast to all connected clients except the sender
function broadcast(message, excludeId = null) {
    const data = JSON.stringify(message);
    wss.clients.forEach((client) => {
        if (client.readyState === OPEN) {
            const clientId = client.playerId;
            if (!excludeId || clientId !== excludeId) {
                client.send(data);
            }
        }
    });
}

// Broadcast to specific clients in the same scene
function broadcastToScene(message, sceneType, sceneIndex = null) {
    const data = JSON.stringify(message);
    wss.clients.forEach((client) => {
        if (client.readyState === OPEN) {
            const player = players.get(client.playerId);
            if (player) {
                let playerInScene = false;
                
                if (sceneType === "hallway") {
                    playerInScene = !player.isInClassroom;
                } else if (sceneType === "classroom") {
                    playerInScene = player.isInClassroom && player.classroomIndex === sceneIndex;
                }

                if (playerInScene) {
                    client.send(data);
                }
            }
        }
    });
}

// Handle new WebSocket connections
wss.on("connection", (ws) => {
    console.log("New client connecting...");

    ws.on("message", (data) => {
        try {
            const message = JSON.parse(data);

            switch (message.type) {
                case "join": {
                    console.log(`✅ Player joined: ${message.username} (${message.id})`);

                    ws.playerId = message.id;

                    // Get random spawn position
                    const spawn = getRandomHallwaySpawn();

                    // Create player record
                    players.set(message.id, {
                        id: message.id,
                        username: message.username,
                        position: spawn.position,
                        rotation: spawn.rotation,
                        isInClassroom: false,
                        classroomIndex: null,
                        isSitting: false,
                        seatId: null,
                        lastUpdate: Date.now(),
                    });

                    // Tell everyone about the new player
                    const newPlayerData = players.get(message.id);
                    broadcast({
                        type: "player-joined",
                        ...newPlayerData,
                    });

                    // Send current player list to new player
                    const playersList = Array.from(players.values()).filter(
                        (p) => p.id !== message.id
                    );
                    ws.send(
                        JSON.stringify({
                            type: "players-update",
                            players: playersList,
                        })
                    );

                    console.log(`Total players: ${players.size}`);
                    break;
                }

                case "position-update": {
                    const player = players.get(message.id);
                    if (player) {
                        // Update player position
                        player.position = message.position;
                        player.rotation = message.rotation;
                        player.isInClassroom = message.isInClassroom;
                        player.classroomIndex = message.classroomIndex || null;
                        player.isSitting = message.isSitting || false;
                        player.seatId = message.seatId || null;
                        player.lastUpdate = Date.now();

                        // Broadcast to clients in the same scene
                        const sceneType = message.isInClassroom ? "classroom" : "hallway";
                        broadcastToScene({
                            type: "players-update",
                            players: [player],
                        }, sceneType, message.classroomIndex);
                    }
                    break;
                }

                case "ping": {
                    // Respond to ping
                    ws.send(JSON.stringify({ type: "pong" }));
                    break;
                }

                case "chat-message": {
                    // Forward chat message ONLY to the recipient (private message)
                    console.log(`💬 Private message from ${message.fromUsername} to ${message.toUsername} (${message.toId})`);

                    // Find the recipient by their ID
                    const recipientPlayer = players.get(message.toId);
                    if (recipientPlayer && recipientPlayer.ws && recipientPlayer.ws.readyState === 1) {
                        // Send ONLY to the recipient
                        recipientPlayer.ws.send(JSON.stringify({
                            type: "chat-message",
                            fromId: message.fromId,
                            fromUsername: message.fromUsername,
                            toId: message.toId,
                            toUsername: message.toUsername,
                            content: message.content,
                            timestamp: message.timestamp,
                        }));
                        console.log(`✅ Message delivered to ${message.toUsername}`);
                    } else {
                        console.log(`❌ Recipient ${message.toUsername} not found or disconnected`);
                    }
                    break;
                }

                default:
                    console.log("Unknown message type:", message.type);
            }
        } catch (error) {
            console.error("Error processing message:", error);
        }
    });

    ws.on("close", () => {
        if (ws.playerId) {
            const player = players.get(ws.playerId);
            if (player) {
                console.log(
                    `❌ Player disconnected: ${player.username} (${ws.playerId})`
                );
                players.delete(ws.playerId);

                // Notify others
                broadcast({
                    type: "player-left",
                    id: ws.playerId,
                });
            }
            console.log(`Total players: ${players.size}`);
        }
    });

    ws.on("error", (error) => {
        console.error("WebSocket error:", error);
    });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 WebSocket server running on ws://localhost:${PORT}`);
    console.log("Waiting for connections...");
});

// Periodic cleanup of stale connections
setInterval(() => {
    let staleCount = 0;
    const now = Date.now();

    players.forEach((player, id) => {
        // Remove player if they haven't updated in 90 seconds (much more lenient)
        if (now - player.lastUpdate > 90000) {
            console.log(`⏰ Removing stale player: ${player.username}`);
            players.delete(id);
            broadcast({
                type: "player-left",
                id: id,
            });
            staleCount++;
        }
    });

    if (staleCount > 0) {
        console.log(`Cleaned up ${staleCount} stale players`);
    }
}, 10000); // Check every 10 seconds
