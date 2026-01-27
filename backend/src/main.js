import express from "express";
import cors from "cors";

import loginRoutes from "./routes/login_route.js";
import usersRoutes from "./routes/users_route.js";
import conversationsRoutes from "./routes/conversations_route.js";

export const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// rotas
app.use(loginRoutes);          // cria /login
app.use(usersRoutes);          // cria /users
app.use(conversationsRoutes);  // cria /conversations...

// health opcional
app.get("/health", (req, res) => res.json({ ok: true }));
