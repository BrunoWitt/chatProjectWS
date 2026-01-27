import { connection } from "../db.js";

/**
 * Lista conversas do usuário e tenta montar um título (nome do outro usuário)
 */
export async function listConversationsByUserId(userId) {
    const uid = Number(userId);
    if (!Number.isInteger(uid) || uid <= 0) throw new Error("userId inválido");

    const r = await connection.query(
        `
        SELECT
        c.id,
        c.created_at,
        -- pega "o outro participante" (se for conversa 1:1)
        u2.id   AS other_user_id,
        u2.name AS other_user_name
        FROM conversations c
        JOIN conversation_participants cp
        ON cp.conversation_id = c.id
        LEFT JOIN conversation_participants cp2
        ON cp2.conversation_id = c.id AND cp2.user_id <> $1
        LEFT JOIN users u2
        ON u2.id = cp2.user_id
        WHERE cp.user_id = $1
        ORDER BY c.id DESC
        `,
        [uid]
    );

    // "title" vai pro sidebar
    return r.rows.map((row) => ({
        id: row.id,
        created_at: row.created_at,
        other_user_id: row.other_user_id,
        title: row.other_user_name ? row.other_user_name : `Conversa #${row.id}`,
    }));
}

/**
 * Retorna conversa se o user participa
 */
export async function getConversationByIdForUser({ conversationId, userId }) {
    const cid = Number(conversationId);
    const uid = Number(userId);

    if (!Number.isInteger(cid) || cid <= 0) throw new Error("conversationId inválido");
    if (!Number.isInteger(uid) || uid <= 0) throw new Error("userId inválido");

    const r = await connection.query(
        `
        SELECT c.id, c.created_at
        FROM conversations c
        JOIN conversation_participants cp
        ON cp.conversation_id = c.id
        WHERE c.id = $1 AND cp.user_id = $2
        LIMIT 1
        `,
        [cid, uid]
    );

    return r.rows[0] || null;
}

/**
 * Cria OU retorna uma conversa 1:1 entre userId e otherUserId.
 */
export async function openOrCreateDirectConversation({ userId, otherUserId }) {
    const uid = Number(userId);
    const oid = Number(otherUserId);

    if (!Number.isInteger(uid) || uid <= 0) throw new Error("userId inválido");
    if (!Number.isInteger(oid) || oid <= 0) throw new Error("otherUserId inválido");
    if (uid === oid) throw new Error("Você não pode conversar com você mesmo");

    // garante que o outro user existe
    const userCheck = await connection.query(
        `SELECT id, name FROM users WHERE id = $1 LIMIT 1`,
        [oid]
    );
    if (userCheck.rowCount === 0) throw new Error("Usuário destino não existe");

    // procura uma conversa que tenha os 2 participantes
    const existing = await connection.query(
        `
        SELECT cp1.conversation_id AS id
        FROM conversation_participants cp1
        JOIN conversation_participants cp2
        ON cp2.conversation_id = cp1.conversation_id
        WHERE cp1.user_id = $1 AND cp2.user_id = $2
        LIMIT 1
        `,
        [uid, oid]
    );

    if (existing.rowCount > 0) {
        return { id: existing.rows[0].id };
    }

    // cria conversa + participantes dentro de transação
    const client = await connection.connect();
    try {
        await client.query("BEGIN");

        const c = await client.query(
        `INSERT INTO conversations DEFAULT VALUES RETURNING id, created_at`
        );
        const conversationId = c.rows[0].id;

        await client.query(
        `INSERT INTO conversation_participants (conversation_id, user_id)
        VALUES ($1, $2), ($1, $3)`,
        [conversationId, uid, oid]
        );

        await client.query("COMMIT");
        return { id: conversationId, created_at: c.rows[0].created_at };
    } catch (e) {
        await client.query("ROLLBACK");
        throw e;
    } finally {
        client.release();
    }
}
