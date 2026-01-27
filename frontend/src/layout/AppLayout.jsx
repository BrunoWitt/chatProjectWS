import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";

export default function AppLayout() {
    const navigate = useNavigate();

    const userName = localStorage.getItem("userName") || "";

    function logout() {
        localStorage.removeItem("userId");
        localStorage.removeItem("userName");
        navigate("/login");
    }

    return (
        <div style={{ display: "flex", height: "100vh" }}>
        <div style={{ width: 280, borderRight: "1px solid #ccc", padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
                <div style={{ fontWeight: "bold" }}>Menu</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>{userName}</div>
            </div>
            <button onClick={logout}>Sair</button>
            </div>

            <hr />
            <Sidebar />
        </div>

        <div style={{ flex: 1, padding: 16, overflow: "auto" }}>
            <Outlet />
        </div>
        </div>
    );
}
