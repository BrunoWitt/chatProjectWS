import { connection } from "../db.js";

export async function LoginUser(name) {
    const clean = String(name ?? "").trim();
    if (!clean) return null;

    const response = await connection.query(
        `SELECT id, name
        FROM users
        WHERE LOWER(name) = LOWER($1)
        LIMIT 1`,
        [clean]
    )

    return response.rows[0] ?? null;
}