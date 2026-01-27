import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client.js";

export function LoginPage() {
    const [name, setName] = useState("");
    const navigate = useNavigate();

    async function handleLogin(e) {
        e.preventDefault();
        try {
        const res = await api.post("/login", { name });
        const data = res.data;

        if (data.ok && data.user) {
            localStorage.setItem("userId", String(data.user.id));
            localStorage.setItem("userName", data.user.name);
            navigate("/home");
        } else {
            alert("Credenciais inválidas");
        }
        } catch (err) {
        console.error(err);
        alert(err?.response?.data?.error || "Erro ao tentar logar");
        }
    }

    return (
        <div style={{ padding: 20 }}>
        <h1>Login</h1>
        <form onSubmit={handleLogin} style={{ display: "flex", gap: 8 }}>
            <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome de usuário"
            />
            <button type="submit">Entrar</button>
        </form>
        </div>
    );
}
