import "dotenv/config";
import http from "http";
import express from "express";
import cors from "cors";

import { app } from "./main.js";
import { initIO } from "./sockets/socket.js";

const FRONT = "http://localhost:5173";

app.use(
    cors({
        origin: FRONT,
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "x-user-id"],
    })
);

app.use(express.json());

const server = http.createServer(app);

// ✅ inicializa o Socket.IO UMA vez, no mesmo server HTTP
initIO(server, { frontOrigin: FRONT });

const port = Number(process.env.PORT || 3000);
server.listen(port, () => console.log(`🚀 http://localhost:${port}`));
