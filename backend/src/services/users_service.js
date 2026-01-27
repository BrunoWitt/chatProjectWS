import { pool } from "../db.js";

export async function listUsers() {
    const r = await pool.query(
        `
        SELECT id, name
        FROM users
        ORDER BY name ASC
        `
    );

    return r.rows;
}
