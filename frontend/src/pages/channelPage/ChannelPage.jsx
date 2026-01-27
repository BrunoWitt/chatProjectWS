import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../api/http.js";

export default function ChannelPage() {
    const { id } = useParams();

    const channelId = useMemo(() => Number(id), [id]);
    const [channel, setChannel] = useState(null);

    const [messages, setMessages] = useState([]);
    const [content, setContent] = useState("");

    const [error, setError] = useState("");

    async function load() {
        setError("");
        try {
        // opcional (se você tiver GET /channels/:id)
        try {
            const ch = await api.get(`/channels/${channelId}`);
            setChannel(ch.data?.channel ?? null);
        } catch {
            // se não existir, ignora (não quebra a página)
        }

        const r = await api.get(`/channels/${channelId}/messages?limit=200`);
        setMessages(r.data?.messages ?? []);
        } catch (e) {
        setError(e?.response?.data?.error || e.message || "Erro ao carregar channel");
        }
    }

    useEffect(() => {
        if (!Number.isInteger(channelId) || channelId <= 0) return;
        load();
    }, [channelId]);

    async function send() {
        const text = content.trim();
        if (!text) return;

        setError("");
        try {
        await api.post(`/channels/${channelId}/messages`, { content: text });
        setContent("");
        await load();
        } catch (e) {
        setError(e?.response?.data?.error || e.message || "Erro ao enviar mensagem");
        }
    }

    return (
        <div>
        <h2>Channel #{channelId}</h2>

        {channel ? (
            <div style={{ fontSize: 13, opacity: 0.8 }}>
            <div>Nome: {channel.name}</div>
            <div>Criado por: {channel.created_by}</div>
            </div>
        ) : null}

        {error ? <div style={{ color: "crimson", marginTop: 8 }}>{error}</div> : null}

        <hr />

        <div style={{ minHeight: 220 }}>
            {messages.length === 0 ? (
            <div style={{ fontSize: 12, opacity: 0.7 }}>Sem mensagens ainda.</div>
            ) : (
            <ul style={{ paddingLeft: 18 }}>
                {messages.map((m) => (
                <li key={m.id}>
                    <b>{m.sender_name ?? m.sender_id}:</b> {m.content}
                </li>
                ))}
            </ul>
            )}
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Digite uma mensagem"
            style={{ flex: 1 }}
            onKeyDown={(e) => {
                if (e.key === "Enter") send();
            }}
            />
            <button onClick={send}>Enviar</button>
        </div>
        </div>
    );
}
