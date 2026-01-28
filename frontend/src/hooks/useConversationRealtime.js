import { useEffect } from "react";
import { getSocket } from "../lib/socket";

export function useConversationRealtime(conversationId, setMessages) {
    useEffect(() => {
        const socket = getSocket();

        const userId = Number(localStorage.getItem("userId"));
        if (!userId || !conversationId) return;

        if (!socket.connected) socket.connect();

        console.log("➡️ join conversation", conversationId, "userId", userId);
        socket.emit("conversation:join", { conversationId, userId });

        function onNewMessage(payload) {
        if (payload?.scope !== "conversation") return;
        if (Number(payload.conversationId) !== Number(conversationId)) return;

        setMessages((prev) => {
            const exists = prev.some((m) => m.id === payload.message.id);
            if (exists) return prev;
            return [...prev, payload.message];
        });
        }

        socket.on("message:new", onNewMessage);

        return () => {
        socket.off("message:new", onNewMessage);
        };
    }, [conversationId, setMessages]);
}
