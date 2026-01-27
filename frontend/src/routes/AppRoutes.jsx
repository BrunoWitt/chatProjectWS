import { Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "../pages/loginPage/login.jsx";
import AppLayout from "../layout/AppLayout.jsx";
import Home from "../pages/homePage/home.jsx";
import ConversationPage from "../pages/conversationPage/ConversationPage.jsx";

function isLogged() {
    return Boolean(localStorage.getItem("userId"));
}

export default function AppRoutes() {
    return (
        <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
            path="/"
            element={isLogged() ? <AppLayout /> : <Navigate to="/login" replace />}
        >
            <Route index element={<Navigate to="/home" replace />} />
            <Route path="home" element={<Home />} />
            <Route path="conversations/:id" element={<ConversationPage />} />
        </Route>

        <Route path="*" element={<Navigate to={isLogged() ? "/home" : "/login"} replace />} />
        </Routes>
    );
}
