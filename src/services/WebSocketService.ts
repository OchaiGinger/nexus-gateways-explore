import * as THREE from "three";
import React from "react";

export interface RemotePlayerData {
    id: string;
    username: string;
    position: { x: number; y: number; z: number };
    rotation: number;
    isInClassroom: boolean;
    classroomIndex?: number;
    isSitting?: boolean;
    seatId?: string;
    lastUpdate: number;
}

export interface PlayerUpdate {
    id: string;
    position: { x: number; y: number; z: number };
    rotation: number;
    isInClassroom: boolean;
    classroomIndex?: number;
    isSitting?: boolean;
    seatId?: string;
}

export type WebSocketEventType =
    | "connected"
    | "disconnected"
    | "player-joined"
    | "player-left"
    | "players-update"
    | "chat-message"
    | "error";

export interface WebSocketEvent {
    type: WebSocketEventType;
    data?: any;
}

export class WebSocketService {
    private static instance: WebSocketService;
    private ws: WebSocket | null = null;
    private url: string;
    private isConnected = false;
    private playerId: string;
    private username: string;
    private listeners: Map<WebSocketEventType, Set<(event: WebSocketEvent) => void>> = new Map();
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 3000;
    private heartbeatInterval: NodeJS.Timeout | null = null;
    private messageQueue: any[] = [];

    private constructor(url: string, username: string = "Player") {
        this.url = url;
        this.playerId = `player-${Math.random().toString(36).substr(2, 9)}`;
        this.username = username;
    }

    public static getInstance(url: string = "ws://localhost:3000", username?: string): WebSocketService {
        if (!WebSocketService.instance) {
            WebSocketService.instance = new WebSocketService(url, username);
        }
        return WebSocketService.instance;
    }

    public connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(this.url);

                this.ws.onopen = () => {
                    console.log("✅ WebSocket connected");
                    this.isConnected = true;
                    this.reconnectAttempts = 0;

                    // Send join message
                    this.send({
                        type: "join",
                        id: this.playerId,
                        username: this.username,
                    });

                    // Start heartbeat
                    this.startHeartbeat();

                    // Flush message queue
                    this.flushMessageQueue();

                    this.emit({
                        type: "connected",
                        data: { id: this.playerId, username: this.username },
                    });

                    resolve();
                };

                this.ws.onmessage = (event) => {
                    try {
                        const message = JSON.parse(event.data);
                        this.handleMessage(message);
                    } catch (error) {
                        console.error("Failed to parse WebSocket message:", error);
                    }
                };

                this.ws.onerror = (error) => {
                    console.error("WebSocket error:", error);
                    this.emit({ type: "error", data: error });
                    reject(error);
                };

                this.ws.onclose = () => {
                    console.log("WebSocket disconnected");
                    this.isConnected = false;
                    this.stopHeartbeat();
                    this.emit({ type: "disconnected" });
                    this.attemptReconnect();
                };
            } catch (error) {
                console.error("Failed to create WebSocket:", error);
                reject(error);
            }
        });
    }

    private handleMessage(message: any): void {
        switch (message.type) {
            case "players-update":
                this.emit({
                    type: "players-update",
                    data: message.players,
                });
                break;
            case "player-joined":
                this.emit({
                    type: "player-joined",
                    data: message,
                });
                break;
            case "player-left":
                this.emit({
                    type: "player-left",
                    data: message,
                });
                break;
            case "chat-message":
                this.emit({
                    type: "chat-message",
                    data: message,
                });
                break;
            default:
                console.log("Unknown message type:", message.type);
        }
    }

    public updatePosition(
        position: THREE.Vector3,
        rotation: number,
        isInClassroom: boolean = false,
        classroomIndex?: number,
        isSitting: boolean = false,
        seatId?: string
    ): void {
        const update: PlayerUpdate = {
            id: this.playerId,
            position: { x: position.x, y: position.y, z: position.z },
            rotation,
            isInClassroom,
            classroomIndex,
            isSitting,
            seatId,
        };

        this.send({
            type: "position-update",
            ...update,
        });
    }

    public sendChatMessage(toId: string, toUsername: string, content: string): void {
        console.log(`📤 WebSocketService.sendChatMessage: sending to ${toUsername} (${toId}): "${content}"`);
        this.send({
            type: "chat-message",
            fromId: this.playerId,
            fromUsername: this.username,
            toId,
            toUsername,
            content,
            timestamp: Date.now(),
        });
    }

    public on(eventType: WebSocketEventType, callback: (event: WebSocketEvent) => void): void {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, new Set());
        }
        this.listeners.get(eventType)!.add(callback);
    }

    public off(eventType: WebSocketEventType, callback: (event: WebSocketEvent) => void): void {
        if (this.listeners.has(eventType)) {
            this.listeners.get(eventType)!.delete(callback);
        }
    }

    private emit(event: WebSocketEvent): void {
        const callbacks = this.listeners.get(event.type);
        if (callbacks) {
            callbacks.forEach((callback) => callback(event));
        }
    }

    private send(message: any): void {
        console.log("📡 WebSocketService.send:", message.type, "Connected:", this.isConnected, "WebSocket state:", this.ws?.readyState);
        if (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
            console.log("✅ Message sent successfully");
        } else {
            // Queue message if not connected
            console.log("⏳ WebSocket not ready, queueing message");
            this.messageQueue.push(message);
        }
    }

    private flushMessageQueue(): void {
        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            this.send(message);
        }
    }

    private startHeartbeat(): void {
        this.heartbeatInterval = setInterval(() => {
            this.send({ type: "ping" });
        }, 30000); // Every 30 seconds
    }

    private stopHeartbeat(): void {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    private attemptReconnect(): void {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(
                `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
            );
            setTimeout(() => {
                this.connect().catch((error) => {
                    console.error("Reconnection failed:", error);
                });
            }, this.reconnectDelay);
        }
    }

    public disconnect(): void {
        this.stopHeartbeat();
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    public getPlayerId(): string {
        return this.playerId;
    }

    public getUsername(): string {
        return this.username;
    }

    public isReady(): boolean {
        return this.isConnected;
    }
}

// React Hook for using WebSocket
export function useWebSocket(username: string = "Player", url: string = "ws://localhost:3000") {
    const [isConnected, setIsConnected] = React.useState(false);
    const [remotePlayers, setRemotePlayers] = React.useState<Map<string, RemotePlayerData>>(
        new Map()
    );
    const wsRef = React.useRef<WebSocketService | null>(null);

    React.useEffect(() => {
        const ws = WebSocketService.getInstance(url, username);
        wsRef.current = ws;

        const handleConnected = () => setIsConnected(true);
        const handleDisconnected = () => setIsConnected(false);
        const handlePlayersUpdate = (event: WebSocketEvent) => {
            setRemotePlayers((prev) => {
                const updated = new Map(prev);
                if (event.data && Array.isArray(event.data)) {
                    event.data.forEach((player: RemotePlayerData) => {
                        if (player.id !== ws.getPlayerId()) {
                            updated.set(player.id, player);
                        }
                    });
                }
                return updated;
            });
        };
        const handlePlayerJoined = (event: WebSocketEvent) => {
            if (event.data && event.data.id !== ws.getPlayerId()) {
                setRemotePlayers((prev) => new Map(prev).set(event.data.id, event.data));
            }
        };
        const handlePlayerLeft = (event: WebSocketEvent) => {
            setRemotePlayers((prev) => {
                const updated = new Map(prev);
                updated.delete(event.data.id);
                return updated;
            });
        };

        ws.on("connected", handleConnected);
        ws.on("disconnected", handleDisconnected);
        ws.on("players-update", handlePlayersUpdate);
        ws.on("player-joined", handlePlayerJoined);
        ws.on("player-left", handlePlayerLeft);

        ws.connect().catch((error) => {
            console.error("Failed to connect WebSocket:", error);
            setIsConnected(false);
        });

        return () => {
            ws.off("connected", handleConnected);
            ws.off("disconnected", handleDisconnected);
            ws.off("players-update", handlePlayersUpdate);
            ws.off("player-joined", handlePlayerJoined);
            ws.off("player-left", handlePlayerLeft);
        };
    }, [username, url]);

    return { isConnected, remotePlayers, ws: wsRef.current };
}
