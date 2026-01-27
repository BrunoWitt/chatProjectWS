import { Router } from "express";
import { listUsers } from "../services/users_service.js";

const router = Router();

router.get("/users", async (req, res) => {
    try {
        const users = await listUsers();
        return res.json({ ok: true, users });
    } catch (error) {
        return res.status(500).json({ ok: false, error: error.message });
    }
});

export default router;
