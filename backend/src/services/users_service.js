import { connection } from "../db.js";

export async function listUsers() {
    const r = await connection.query(
        `
        SELECT id, name
        FROM users
        ORDER BY name ASC
        `
    );

    return r.rows;
}
