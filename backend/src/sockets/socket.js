import { Server } from "socket.io";
import { pool } from "./db.js"; // ajuste o caminho se necessário

let io = null;

function roomConversation(conversationId) {
    return `conversation:${conversationId}`;
}

export function initSocket(httpServer) {
    io = new Server(httpServer, {
        cors: { origin: true, credentials: true },
    });

    io.on("connection", (socket) => {
        console.log("✅ socket conectado:", socket.id);

        // front manda: socket.emit("conversation:join", { conversationId, userId })
        socket.on("conversation:join", async ({ conversationId, userId }) => {
        try {
            const cid = Number(conversationId);
            const uid = Number(userId);

            if (!Number.isInteger(cid) || cid <= 0) return;
            if (!Number.isInteger(uid) || uid <= 0) return;

            // segurança básica: só entra na sala se for participante
            const member = await pool.query(
            `SELECT 1
                FROM conversation_participants
                WHERE conversation_id = $1 AND user_id = $2
                LIMIT 1`,
            [cid, uid]
            );

            if (member.rowCount === 0) return;

            socket.join(roomConversation(cid));
            console.log(`👥 user ${uid} entrou na sala ${roomConversation(cid)}`);
        } catch (e) {
            console.error("conversation:join error:", e);
        }
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
    return roomConversation(conversationId);
}
