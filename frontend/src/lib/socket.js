import { io } from "socket.io-client";

let socket = null;

export function getSocket() {
    if (!socket) {
        socket = io("http://localhost:3000", {
        autoConnect: false,
        withCredentials: true,
        transports: ["websocket"], // pode tirar se quiser fallback
        });

        socket.on("connect", () => console.log("✅ front conectou socket:", socket.id));
        socket.on("disconnect", () => console.log("❌ front desconectou socket"));
        socket.on("connect_error", (err) => console.log("🔥 connect_error:", err.message));
    }
    return socket;
}

