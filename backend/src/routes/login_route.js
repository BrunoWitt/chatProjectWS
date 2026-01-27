import { Router } from "express";
import { loginUser } from "../services/login_service.js";

const router = Router();

router.post("/login", async (req, res) => {
    try {
        const name = req.body?.name;

        const user = await loginUser(name);
        if (!user) return res.status(401).json({ ok: false, error: "Usuário não encontrado" });

        return res.json({ ok: true, user });
    } catch (error) {
        console.error("/login error:", error);
        return res.status(500).json({ ok: false, error: error.message });
    }
});

export default router;
