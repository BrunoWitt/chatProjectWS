import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../api/client.js";

export default function ConversationPage() {
    const { id } = useParams(); // conversationId
    const conversationId = Number(id);

    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [err, setErr] = useState("");

    async function loadMessages() {
        setErr("");
        try {
        const res = await api.get(`/conversations/${conversationId}/messages`);
        setMessages(res.data?.messages ?? []);
        } catch (e) {
        setErr(e?.response?.data?.error || e.message);
        }
    }

    useEffect(() => {
        if (!Number.isInteger(conversationId) || conversationId <= 0) return;
        loadMessages();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversationId]);

    async function send(e) {
        e.preventDefault();
        const content = text.trim();
        if (!content) return;

        setErr("");
        try {
        await api.post(`/conversations/${conversationId}/messages`, { content });
        setText("");
        await loadMessages();
        } catch (e2) {
        setErr(e2?.response?.data?.error || e2.message);
        }
    }

    return (
        <div>
        <h2>Conversa #{conversationId}</h2>

        {err ? <div style={{ color: "red" }}>{String(err)}</div> : null}

        <div style={{ marginTop: 12, border: "1px solid #ccc", padding: 12, minHeight: 200 }}>
            {messages.length === 0 ? (
            <div style={{ opacity: 0.7 }}>Nenhuma mensagem ainda.</div>
            ) : (
            <ul>
                {messages.map((m) => (
                <li key={m.id}>
                    <b>{m.sender_name || m.sender_id}:</b> {m.content}
                </li>
                ))}
            </ul>
            )}
        </div>

        <form onSubmit={send} style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Digite uma mensagem..."
            style={{ flex: 1 }}
            />
            <button type="submit">Enviar</button>
        </form>
        </div>
    );
}
