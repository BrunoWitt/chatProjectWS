import { connection } from "../db.js";
import { getIO, conversationRoomName } from "../sockets/socket.js";

/**
 * Lista mensagens de uma conversa, garantindo que o usuário participa dela.
 */
export async function listConversationMessages({ conversationId, userId, limit = 50 }) {
    const cid = Number(conversationId);
    const uid = Number(userId);
    const lim = Number(limit);

    if (!Number.isInteger(cid) || cid <= 0) throw new Error("conversationId inválido");
    if (!Number.isInteger(uid) || uid <= 0) throw new Error("userId inválido");

    const safeLimit = Number.isInteger(lim) && lim > 0 && lim <= 200 ? lim : 50;

    // garante que o usuário é participante da conversa
    const member = await connection.query(
        `SELECT 1
        FROM conversation_participants
        WHERE conversation_id = $1 AND user_id = $2
        LIMIT 1`,
        [cid, uid]
    );

    if (member.rowCount === 0) return [];

    const r = await connection.query(
        `
        SELECT
        m.id,
        m.conversation_id,
        m.sender_id,
        u.name AS sender_name,
        m.content,
        m.created_at,
        m.edited_at
        FROM messages m
        JOIN users u ON u.id = m.sender_id
        WHERE m.conversation_id = $1
        AND m.deleted_at IS NULL
        ORDER BY m.created_at ASC
        LIMIT $2
        `,
        [cid, safeLimit]
    );

    return r.rows;
}

/**
 * Cria uma mensagem em uma conversa, garantindo que o usuário participa dela.
 */
export async function createConversationMessage({ conversationId, userId, content }) {
    const cid = Number(conversationId);
    const uid = Number(userId);
    const text = String(content ?? "").trim();

    if (!Number.isInteger(cid) || cid <= 0) throw new Error("conversationId inválido");
    if (!Number.isInteger(uid) || uid <= 0) throw new Error("userId inválido");
    if (!text) throw new Error("Mensagem vazia");

    const member = await connection.query(
        `SELECT 1 FROM conversation_participants
        WHERE conversation_id = $1 AND user_id = $2
        LIMIT 1`,
        [cid, uid]
    );
    if (member.rowCount === 0) throw new Error("Você não participa dessa conversa");

    // 1) cria
    const ins = await connection.query(
        `
        INSERT INTO messages (conversation_id, sender_id, content)
        VALUES ($1, $2, $3)
        RETURNING id
        `,
        [cid, uid, text]
    );

    const messageId = ins.rows[0].id;

    // 2) busca completo com JOIN
    const full = await connection.query(
        `
        SELECT
        m.id,
        m.conversation_id,
        m.sender_id,
        u.name AS sender_name,
        m.content,
        m.created_at
        FROM messages m
        JOIN users u ON u.id = m.sender_id
        WHERE m.id = $1
        LIMIT 1
        `,
        [messageId]
    );

    const message = full.rows[0];

    // 3) emite com sender_name
    const io = getIO();
    io.to(conversationRoomName(cid)).emit("message:new", {
        scope: "conversation",
        conversationId: cid,
        message,
    });

    return message;
}