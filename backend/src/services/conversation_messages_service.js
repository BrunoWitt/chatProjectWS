import { pool } from "../db.js";

export async function listConversationsByUserId(userId) {
    const uid = Number(userId);
    if (!Number.isInteger(uid) || uid <= 0) throw new Error("userId inválido");

    // Lista conversas onde o usuário participa.
    // Como sua tabela conversations só tem id e created_at, eu retorno também:
    // - participants_count
    // - participants (array de {id, name}) para você montar o nome no front.
    const r = await pool.query(
        `
        SELECT
        c.id,
        c.created_at,
        COUNT(cp2.user_id)::int AS participants_count,
        COALESCE(
            JSON_AGG(
            JSON_BUILD_OBJECT('id', u.id, 'name', u.name)
            ORDER BY u.name
            ) FILTER (WHERE u.id IS NOT NULL),
            '[]'::json
        ) AS participants
        FROM conversations c
        JOIN conversation_participants cp ON cp.conversation_id = c.id
        LEFT JOIN conversation_participants cp2 ON cp2.conversation_id = c.id
        LEFT JOIN users u ON u.id = cp2.user_id
        WHERE cp.user_id = $1
        GROUP BY c.id
        ORDER BY c.created_at DESC
        `,
        [uid]
    );

    return r.rows;
}

export async function getConversationByIdForUser({ conversationId, userId }) {
    const cid = Number(conversationId);
    const uid = Number(userId);

    if (!Number.isInteger(cid) || cid <= 0) throw new Error("conversationId inválido");
    if (!Number.isInteger(uid) || uid <= 0) throw new Error("userId inválido");

    // Valida se o usuário participa e traz detalhes + participantes
    const r = await pool.query(
        `
        SELECT
        c.id,
        c.created_at,
        COUNT(cp2.user_id)::int AS participants_count,
        COALESCE(
            JSON_AGG(
            JSON_BUILD_OBJECT('id', u.id, 'name', u.name)
            ORDER BY u.name
            ) FILTER (WHERE u.id IS NOT NULL),
            '[]'::json
        ) AS participants
        FROM conversations c
        JOIN conversation_participants cp ON cp.conversation_id = c.id
        LEFT JOIN conversation_participants cp2 ON cp2.conversation_id = c.id
        LEFT JOIN users u ON u.id = cp2.user_id
        WHERE c.id = $1 AND cp.user_id = $2
        GROUP BY c.id
        LIMIT 1
        `,
        [cid, uid]
    );

    return r.rows[0] ?? null;
}
