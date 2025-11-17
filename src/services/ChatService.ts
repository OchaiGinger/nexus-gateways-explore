import React from "react";
import { WebSocketService } from "./WebSocketService";

export interface ChatMessage {
    id: string;
    fromId: string;
    fromUsername: string;
    toId: string;
    content: string;
    timestamp: number;
    read: boolean;
}

export interface ChatConversation {
    playerId: string;
    username: string;
    lastMessage?: ChatMessage;
    unreadCount: number;
    messages: ChatMessage[];
}

export class ChatService {
    private static instance: ChatService;
    private conversations: Map<string, ChatConversation> = new Map();
    private listeners: Map<string, Set<(event: any) => void>> = new Map();
    private currentUserId: string = "";
    private currentUsername: string = "";
    private wsService: WebSocketService | null = null;
    private chatMessageListener: ((event: any) => void) | null = null;

    private constructor() { }

    public static getInstance(): ChatService {
        if (!ChatService.instance) {
            ChatService.instance = new ChatService();
        }
        return ChatService.instance;
    }

    public setCurrentUser(userId: string, username: string, wsService: WebSocketService): void {
        this.currentUserId = userId;
        this.currentUsername = username;

        // Remove old listener if it exists
        if (this.wsService && this.chatMessageListener) {
            this.wsService.off("chat-message", this.chatMessageListener);
        }

        this.wsService = wsService;

        // Create and store the listener function
        this.chatMessageListener = (event) => {
            const message = event.data;
            console.log("🎵 ChatService received chat-message event:", message, "toId:", message.toId, "userId:", userId);
            if (message.toId === userId) {
                console.log("✅ Message is for current user, processing...");
                const receivedMsg: ChatMessage = {
                    id: `msg-${message.timestamp}-${Math.random().toString(36).substr(2, 9)}`,
                    fromId: message.fromId,
                    fromUsername: message.fromUsername,
                    toId: userId,
                    content: message.content,
                    timestamp: message.timestamp,
                    read: false,
                };

                // Add to conversation
                if (!this.conversations.has(message.fromId)) {
                    this.conversations.set(message.fromId, {
                        playerId: message.fromId,
                        username: message.fromUsername,
                        unreadCount: 0,
                        messages: [],
                    });
                    console.log("📝 Created new conversation with:", message.fromUsername);
                }

                const conv = this.conversations.get(message.fromId)!;

                // Check if message already exists to prevent duplicates
                const messageExists = conv.messages.some(msg =>
                    msg.timestamp === receivedMsg.timestamp &&
                    msg.fromId === receivedMsg.fromId &&
                    msg.content === receivedMsg.content
                );

                if (messageExists) {
                    console.log("⚠️ Message already exists, skipping duplicate");
                    return;
                }

                conv.messages.push(receivedMsg);
                conv.lastMessage = receivedMsg;
                conv.unreadCount += 1;

                console.log("📝 Message added to conversation, total messages:", conv.messages.length);
                this.emit("message-received", receivedMsg);
                console.log("📡 Emitted message-received event");
            } else {
                console.log("❌ Message is not for current user, ignoring");
            }
        };

        // Listen for incoming chat messages from WebSocket
        this.wsService.on("chat-message", this.chatMessageListener);
    }

    public sendMessage(toId: string, toUsername: string, content: string): ChatMessage {
        const message: ChatMessage = {
            id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            fromId: this.currentUserId,
            fromUsername: this.currentUsername,
            toId,
            content,
            timestamp: Date.now(),
            read: true,
        };

        // Add to conversation
        if (!this.conversations.has(toId)) {
            this.conversations.set(toId, {
                playerId: toId,
                username: toUsername,
                unreadCount: 0,
                messages: [],
            });
        }

        const conv = this.conversations.get(toId)!;
        conv.messages.push(message);
        conv.lastMessage = message;

        // Send through WebSocket
        if (this.wsService) {
            console.log("📤 Sending chat message via WebSocket:", message);
            this.wsService.sendChatMessage(toId, toUsername, content);
        } else {
            console.error("❌ No WebSocket service available to send message");
        }

        this.emit("message-sent", message);
        return message;
    }

    public receiveMessage(fromId: string, fromUsername: string, content: string): ChatMessage {
        const message: ChatMessage = {
            id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            fromId,
            fromUsername,
            toId: this.currentUserId,
            content,
            timestamp: Date.now(),
            read: false,
        };

        // Add to conversation
        if (!this.conversations.has(fromId)) {
            this.conversations.set(fromId, {
                playerId: fromId,
                username: fromUsername,
                unreadCount: 1,
                messages: [],
            });
        }

        const conv = this.conversations.get(fromId)!;
        conv.messages.push(message);
        conv.lastMessage = message;
        conv.unreadCount += 1;

        this.emit("message-received", message);
        return message;
    }

    public getConversation(playerId: string): ChatConversation | undefined {
        return this.conversations.get(playerId);
    }

    public getAllConversations(): ChatConversation[] {
        return Array.from(this.conversations.values());
    }

    public markAsRead(playerId: string): void {
        const conv = this.conversations.get(playerId);
        if (conv) {
            conv.messages.forEach(msg => msg.read = true);
            conv.unreadCount = 0;
            this.emit("unread-changed", { playerId, unreadCount: 0 });
        }
    }

    public getTotalUnreadCount(): number {
        return Array.from(this.conversations.values()).reduce(
            (sum, conv) => sum + conv.unreadCount,
            0
        );
    }

    public on(eventType: string, callback: (event: any) => void): void {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, new Set());
        }
        this.listeners.get(eventType)!.add(callback);
    }

    public off(eventType: string, callback: (event: any) => void): void {
        if (this.listeners.has(eventType)) {
            this.listeners.get(eventType)!.delete(callback);
        }
    }
    private emit(eventType: string, event: any): void {
        const callbacks = this.listeners.get(eventType);
        console.log(`📡 ChatService.emit(${eventType}): ${callbacks ? callbacks.size : 0} listeners`);
        if (callbacks) {
            callbacks.forEach(callback => callback(event));
        }
    }
}

// React Hook
export function useChatService(wsService: WebSocketService | null) {
    const [conversations, setConversations] = React.useState<ChatConversation[]>([]);
    const [totalUnread, setTotalUnread] = React.useState(0);
    const chatRef = React.useRef<ChatService | null>(null);

    React.useEffect(() => {
        const chatService = ChatService.getInstance();
        chatRef.current = chatService;

        if (wsService) {
            const currentUserId = wsService.getPlayerId();
            const currentUsername = wsService.getUsername();
            chatService.setCurrentUser(currentUserId, currentUsername, wsService);
        }

        const handleMessageSent = () => {
            setConversations([...chatService.getAllConversations()]);
            setTotalUnread(chatService.getTotalUnreadCount());
        };

        const handleMessageReceived = () => {
            setConversations([...chatService.getAllConversations()]);
            setTotalUnread(chatService.getTotalUnreadCount());
        };

        const handleUnreadChanged = () => {
            setTotalUnread(chatService.getTotalUnreadCount());
        };

        chatService.on("message-sent", handleMessageSent);
        chatService.on("message-received", handleMessageReceived);
        chatService.on("unread-changed", handleUnreadChanged);

        return () => {
            chatService.off("message-sent", handleMessageSent);
            chatService.off("message-received", handleMessageReceived);
            chatService.off("unread-changed", handleUnreadChanged);
        };
    }, [wsService]);

    return { conversations, totalUnread, chatService: chatRef.current };
}
