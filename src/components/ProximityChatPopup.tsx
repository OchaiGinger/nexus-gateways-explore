import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage, ChatService } from "@/services/ChatService";
import { WebSocketService } from "@/services/WebSocketService";

interface ProximityChatPopupProps {
    isOpen: boolean;
    nearbyPlayerId: string | null;
    nearbyPlayerName: string | null;
    onClose: () => void;
    currentUserId: string;
    currentUsername: string;
    wsService?: WebSocketService | null;
}

export function ProximityChatPopup({
    isOpen,
    nearbyPlayerId,
    nearbyPlayerName,
    onClose,
    currentUserId,
    currentUsername,
    wsService,
}: ProximityChatPopupProps) {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const chatService = ChatService.getInstance();

    React.useEffect(() => {
        if (nearbyPlayerId && isOpen) {
            const conversation = chatService.getConversation(nearbyPlayerId);
            if (conversation) {
                setMessages([...conversation.messages]);
                chatService.markAsRead(nearbyPlayerId);
            } else {
                setMessages([]);
            }

            // Listen for new messages - only for this specific conversation
            const handleMessageReceived = (receivedMsg: any) => {
                console.log("📨 ProximityChatPopup: Message received from:", receivedMsg.fromId, "current nearbyPlayerId:", nearbyPlayerId);

                // Only update if message is from the player we're chatting with
                if (receivedMsg.fromId === nearbyPlayerId) {
                    console.log("📨 Message is from current chat partner, updating");
                    const updatedConversation = chatService.getConversation(nearbyPlayerId);
                    if (updatedConversation) {
                        setMessages([...updatedConversation.messages]);
                    }
                }
            };

            chatService.on("message-received", handleMessageReceived);
            return () => {
                chatService.off("message-received", handleMessageReceived);
            };
        }
    }, [nearbyPlayerId, isOpen]);

    const handleSendMessage = () => {
        if (message.trim() && nearbyPlayerId) {
            chatService.sendMessage(nearbyPlayerId, nearbyPlayerName || "Unknown", message);
            const conversation = chatService.getConversation(nearbyPlayerId);
            if (conversation) {
                setMessages([...conversation.messages]);
            }
            setMessage("");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-96 max-h-96">
                <DialogHeader>
                    <DialogTitle>Chat with {nearbyPlayerName}</DialogTitle>
                    <DialogDescription>
                        Having a conversation nearby
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4">
                    {/* Messages area */}
                    <ScrollArea className="h-64 w-full border rounded-lg p-4 bg-slate-950">
                        <div className="flex flex-col gap-2">
                            {messages.length === 0 ? (
                                <p className="text-center text-muted-foreground text-sm">
                                    No messages yet. Start a conversation!
                                </p>
                            ) : (
                                messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`text-sm p-2 rounded ${msg.fromId === currentUserId
                                            ? "bg-blue-900 text-blue-100 ml-auto max-w-xs"
                                            : "bg-slate-800 text-slate-100 mr-auto max-w-xs"
                                            }`}
                                    >
                                        <p className="font-semibold text-xs">{msg.fromUsername} <span className="text-xs opacity-60">({msg.fromId.substring(0, 8)})</span></p>
                                        <p className="break-words">{msg.content}</p>
                                        <p className="text-xs opacity-70">
                                            {new Date(msg.timestamp).toLocaleTimeString()}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>

                    {/* Input area */}
                    <div className="flex gap-2">
                        <Input
                            placeholder="Type a message..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                    handleSendMessage();
                                }
                            }}
                            className="flex-1"
                        />
                        <Button onClick={handleSendMessage} size="sm" className="bg-blue-600 hover:bg-blue-700">
                            Send
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
