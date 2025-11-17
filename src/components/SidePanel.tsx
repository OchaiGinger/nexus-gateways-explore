import React from "react";
import { MessageSquare, Bell, Users, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatService, ChatConversation } from "@/services/ChatService";
import { WebSocketService } from "@/services/WebSocketService";

interface SidePanelProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    playerCount: number;
    wsService?: WebSocketService | null;
    onSelectConversation?: (playerId: string) => void;
}

export function SidePanel({
    isOpen,
    onOpenChange,
    playerCount,
    wsService,
    onSelectConversation,
}: SidePanelProps) {
    const { conversations, totalUnread } = useChatService(wsService || null);
    const [activeTab, setActiveTab] = React.useState<"messages" | "players" | "settings">("messages");

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent side="left" className="w-96 bg-slate-950 border-slate-800">
                <SheetHeader>
                    <SheetTitle className="text-cyan-400">Game Panel</SheetTitle>
                </SheetHeader>

                {/* Tab Navigation */}
                <div className="flex gap-2 mt-6 border-b border-slate-800">
                    <Button
                        variant={activeTab === "messages" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setActiveTab("messages")}
                        className="flex gap-2 relative"
                    >
                        <MessageSquare className="w-4 h-4" />
                        Messages
                        {totalUnread > 0 && (
                            <Badge className="absolute -top-2 -right-2 bg-red-600 text-white text-xs">
                                {totalUnread}
                            </Badge>
                        )}
                    </Button>

                    <Button
                        variant={activeTab === "players" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setActiveTab("players")}
                        className="flex gap-2"
                    >
                        <Users className="w-4 h-4" />
                        Players ({playerCount})
                    </Button>

                    <Button
                        variant={activeTab === "settings" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setActiveTab("settings")}
                        className="flex gap-2"
                    >
                        <Settings className="w-4 h-4" />
                    </Button>
                </div>

                {/* Tab Content */}
                <ScrollArea className="h-96 mt-4">
                    {activeTab === "messages" && (
                        <div className="space-y-3 pr-4">
                            <h3 className="text-sm font-semibold text-cyan-400">Recent Messages</h3>
                            {conversations.length === 0 ? (
                                <p className="text-xs text-slate-400">No messages yet</p>
                            ) : (
                                conversations.map((conv) => (
                                    <button
                                        key={conv.playerId}
                                        onClick={() => {
                                            onSelectConversation?.(conv.playerId);
                                        }}
                                        className="w-full text-left p-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
                                    >
                                        <div className="flex justify-between items-start gap-2">
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-cyan-300">
                                                    {conv.username} <span className="text-xs opacity-60">({conv.playerId.substring(0, 8)})</span>
                                                </p>
                                                <p className="text-xs text-slate-400 truncate">
                                                    {conv.lastMessage?.content || "No messages"}
                                                </p>
                                            </div>
                                            {conv.unreadCount > 0 && (
                                                <Badge className="bg-red-600 text-white text-xs shrink-0">
                                                    {conv.unreadCount}
                                                </Badge>
                                            )}
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === "players" && (
                        <div className="space-y-3 pr-4">
                            <h3 className="text-sm font-semibold text-cyan-400">
                                Players Online ({playerCount})
                            </h3>
                            <p className="text-xs text-slate-400">
                                Players in your current scene will appear here
                            </p>
                            <div className="p-3 bg-blue-900/30 rounded-lg border border-blue-700/50">
                                <p className="text-xs text-blue-300">
                                    💡 Get close to players to start chatting!
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === "settings" && (
                        <div className="space-y-3 pr-4">
                            <h3 className="text-sm font-semibold text-cyan-400">Settings</h3>
                            <div className="space-y-2 text-xs text-slate-400">
                                <p>Sound: On</p>
                                <p>Notifications: On</p>
                                <p>Auto-save: On</p>
                            </div>
                        </div>
                    )}
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
