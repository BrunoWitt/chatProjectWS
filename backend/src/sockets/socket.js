import { Server } from "socket.io";

let io = null;

export function initIO(httpServer, { frontOrigin }) {
    io = new Server(httpServer, {
        cors: {
        origin: frontOrigin,
        credentials: true,
        },
    });

    io.on("connection", (socket) => {
        console.log("✅ socket conectado:", socket.id);

        socket.on("conversation:join", ({ conversationId, userId }) => {
        const cid = Number(conversationId);
        const uid = Number(userId);

        if (!Number.isInteger(cid) || cid <= 0) return;
        if (!Number.isInteger(uid) || uid <= 0) return;

        const room = conversationRoomName(cid);
        socket.join(room);

        console.log(`👥 user ${uid} entrou na sala ${room} (socket=${socket.id})`);
        });

        socket.on("disconnect", () => {
        console.log("❌ socket desconectou:", socket.id);
        });
    });

    return io;
}

export function getIO() {
    if (!io) throw new Error("Socket.IO não inicializado.");
    return io;
}

export function conversationRoomName(conversationId) {
    return `conversation:${Number(conversationId)}`;
}
