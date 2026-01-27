import { Router } from "express";
import {
    listConversationsByUserId,
    getConversationByIdForUser,
    openOrCreateDirectConversation,
} from "../services/conversations_service.js";

import {
    listConversationMessages,
    createConversationMessage,
} from "../services/messages_service.js";

const router = Router();

function getUserId(req) {
    const userId = Number(req.header("x-user-id"));
    if (!Number.isInteger(userId) || userId <= 0) return null;
    return userId;
    }

    // GET /conversations
    router.get("/conversations", async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ ok: false, error: "Unauthorized" });

        const conversations = await listConversationsByUserId(userId);
        return res.json({ ok: true, conversations });
    } catch (error) {
        console.error("🔥 GET /conversations error:", error);
        return res.status(500).json({ ok: false, error: error.message });
    }
});

// POST /conversations  { otherUserId }
router.post("/conversations", async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ ok: false, error: "Unauthorized" });

        const otherUserId = Number(req.body?.otherUserId);
        if (!Number.isInteger(otherUserId) || otherUserId <= 0) {
        return res.status(400).json({ ok: false, error: "otherUserId inválido" });
        }

        const conversation = await openOrCreateDirectConversation({ userId, otherUserId });
        return res.json({ ok: true, conversation });
    } catch (error) {
        console.error("🔥 POST /conversations error:", error);
        return res.status(500).json({ ok: false, error: error.message });
    }
});

// GET /conversations/:id
router.get("/conversations/:id", async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ ok: false, error: "Unauthorized" });

        const conversationId = Number(req.params.id);
        if (!Number.isInteger(conversationId) || conversationId <= 0) {
        return res.status(400).json({ ok: false, error: "conversationId inválido" });
        }

        const conversation = await getConversationByIdForUser({ conversationId, userId });
        if (!conversation) {
        return res.status(404).json({ ok: false, error: "Conversa não encontrada" });
        }

        return res.json({ ok: true, conversation });
    } catch (error) {
        console.error("🔥 GET /conversations/:id error:", error);
        return res.status(500).json({ ok: false, error: error.message });
    }
});

// GET /conversations/:id/messages
router.get("/conversations/:id/messages", async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ ok: false, error: "Unauthorized" });

        const conversationId = req.params.id;
        const limit = req.query.limit;

        const messages = await listConversationMessages({ conversationId, userId, limit });
        return res.json({ ok: true, messages });
    } catch (error) {
        console.error("🔥 GET /conversations/:id/messages error:", error);
        return res.status(500).json({ ok: false, error: error.message });
    }
});

// POST /conversations/:id/messages
router.post("/conversations/:id/messages", async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ ok: false, error: "Unauthorized" });

        const conversationId = req.params.id;
        const { content } = req.body ?? {};

        const message = await createConversationMessage({ conversationId, userId, content });
        return res.json({ ok: true, message });
    } catch (error) {
        console.error("🔥 POST /conversations/:id/messages error:", error);
        return res.status(500).json({ ok: false, error: error.message });
    }
});

export default router;
