import "dotenv/config"
import http from "http"
import express from "express"
import cors from "cors"
import { Server } from "socket.io"

import { app } from "./main.js"

const FRONT = "http://localhost:5173"

//CORS
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

const io = new Server(server, {
    cors: { origin: FRONT, credentials: true },
});

io.on("connection", (socket) => {
    console.log("✅ conectado", socket.id);
    socket.on("disconnect", () => console.log("❌ desconectou", socket.id));
});

const port = Number(process.env.PORT || 3000);
server.listen(port, () => console.log(`🚀 http://localhost:${port}`));
