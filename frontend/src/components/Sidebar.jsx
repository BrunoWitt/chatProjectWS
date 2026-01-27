import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client.js";

export default function Sidebar() {
    const navigate = useNavigate();
    const myId = Number(localStorage.getItem("userId"));

    const [users, setUsers] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [err, setErr] = useState("");

    async function loadAll() {
        setErr("");
        try {
        const [uRes, cRes] = await Promise.all([
            api.get("/users"),
            api.get("/conversations"),
        ]);

        const allUsers = uRes.data?.users ?? [];
        setUsers(allUsers.filter((u) => Number(u.id) !== myId));

        setConversations(cRes.data?.conversations ?? []);
        } catch (e) {
        setErr(e?.response?.data?.error || e.message);
        }
    }

    useEffect(() => {
        loadAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function openOrCreateConversation(otherUserId) {
        setErr("");
        try {
        // POST /conversations { otherUserId } -> { conversation }
        const res = await api.post("/conversations", { otherUserId });
        const conv = res.data?.conversation;
        if (!conv?.id) throw new Error("Backend não retornou conversation.id");

        // recarrega lista de conversas pra sidebar atualizar
        await loadAll();

        navigate(`/conversations/${conv.id}`);
        } catch (e) {
        setErr(e?.response?.data?.error || e.message);
        }
    }

    return (
        <div>
        {err ? (
            <div style={{ color: "red", marginBottom: 8 }}>
            {String(err)}
            </div>
        ) : null}

        <div style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: "bold" }}>Conversas (PV)</div>
            {conversations.length === 0 ? (
            <div style={{ fontSize: 13, opacity: 0.8 }}>Nenhuma conversa ainda.</div>
            ) : (
            <ul style={{ paddingLeft: 18 }}>
                {conversations.map((c) => (
                <li key={c.id}>
                    <button
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate(`/conversations/${c.id}`)}
                    >
                    {c.title || `Conversa #${c.id}`}
                    </button>
                </li>
                ))}
            </ul>
            )}
        </div>

        <hr />

        <div>
            <div style={{ fontWeight: "bold" }}>Usuários</div>
            {users.length === 0 ? (
            <div style={{ fontSize: 13, opacity: 0.8 }}>Nenhum usuário.</div>
            ) : (
            <ul style={{ paddingLeft: 18 }}>
                {users.map((u) => (
                <li key={u.id}>
                    <button
                    style={{ cursor: "pointer" }}
                    onClick={() => openOrCreateConversation(u.id)}
                    >
                    {u.name} (id: {u.id})
                    </button>
                </li>
                ))}
            </ul>
            )}
        </div>
        </div>
    );
}
