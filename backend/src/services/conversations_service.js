import { pool } from "../db.js";

/**
 * Lista conversas do usuário.
 * Aqui eu retorno conversa + "outro usuário" (nome/id) se for 1:1.
 */
export async function listConversationsByUserId(userId) {
    const uid = Number(userId);
    if (!Number.isInteger(uid) || uid <= 0) throw new Error("userId inválido");

    const r = await pool.query(
        `
        SELECT
        c.id,
        c.created_at,

        -- se for conversa direta (2 participantes), pega o outro user
        u2.id   AS other_user_id,
        u2.name AS other_user_name

        FROM conversations c
        JOIN conversation_participants cp1
        ON cp1.conversation_id = c.id AND cp1.user_id = $1

        LEFT JOIN conversation_participants cp2
        ON cp2.conversation_id = c.id AND cp2.user_id <> $1

        LEFT JOIN users u2
        ON u2.id = cp2.user_id

        ORDER BY c.created_at DESC
        `,
        [uid]
    );

    return r.rows;
}

/**
 * Pega uma conversa pelo id, mas só se o user participa.
 */
export async function getConversationByIdForUser({ conversationId, userId }) {
    const cid = Number(conversationId);
    const uid = Number(userId);

    if (!Number.isInteger(cid) || cid <= 0) throw new Error("conversationId inválido");
    if (!Number.isInteger(uid) || uid <= 0) throw new Error("userId inválido");

    const member = await pool.query(
        `SELECT 1 FROM conversation_participants WHERE conversation_id = $1 AND user_id = $2 LIMIT 1`,
        [cid, uid]
    );
    if (member.rowCount === 0) return null;

    const r = await pool.query(
        `SELECT id, created_at FROM conversations WHERE id = $1 LIMIT 1`,
        [cid]
    );

    return r.rows[0] ?? null;
}

/**
 * Cria ou retorna conversa direta (somente userId e otherUserId).
 * Idempotente: se já existe, retorna a existente.
 */
export async function getOrCreateDirectConversation({ userId, otherUserId }) {
    const uid = Number(userId);
    const oid = Number(otherUserId);

    if (!Number.isInteger(uid) || uid <= 0) throw new Error("userId inválido");
    if (!Number.isInteger(oid) || oid <= 0) throw new Error("otherUserId inválido");
    if (uid === oid) throw new Error("Não é permitido criar conversa com você mesmo");

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // 1) procura conversa direta já existente entre os dois
        const existing = await client.query(
        `
        SELECT c.id
        FROM conversations c
        WHERE
            EXISTS (SELECT 1 FROM conversation_participants p WHERE p.conversation_id = c.id AND p.user_id = $1)
            AND EXISTS (SELECT 1 FROM conversation_participants p WHERE p.conversation_id = c.id AND p.user_id = $2)
            AND (SELECT COUNT(*) FROM conversation_participants p WHERE p.conversation_id = c.id) = 2
        LIMIT 1
        `,
        [uid, oid]
        );

        if (existing.rowCount > 0) {
        await client.query("COMMIT");
        return { id: existing.rows[0].id };
        }

        // 2) cria conversa
        const created = await client.query(
        `INSERT INTO conversations DEFAULT VALUES RETURNING id, created_at`,
        []
        );

        const conversationId = created.rows[0].id;

        // 3) adiciona participantes
        await client.query(
        `
        INSERT INTO conversation_participants (conversation_id, user_id)
        VALUES ($1, $2), ($1, $3)
        ON CONFLICT DO NOTHING
        `,
        [conversationId, uid, oid]
        );

        await client.query("COMMIT");
        return created.rows[0];
    } catch (e) {
        await client.query("ROLLBACK");
        throw e;
    } finally {
        client.release();
    }
}
