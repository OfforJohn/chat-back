// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mysql from "mysql2";
import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { Server } from "socket.io";

import matchRoutes from "./matchRoutes.js";
import AuthRoutes from "./AuthRoutes.js";
import MessageRoutes from "./MessageRoutes.js";

dotenv.config();
const app = express();

/* ───────────────── Middleware ───────────────── */
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/uploads/recordings", express.static("uploads/recordings"));
app.use("/uploads/images", express.static("uploads/images"));

/* ───────────────── API Routes ───────────────── */
app.use("/api/auth", AuthRoutes);
app.use("/api/messages", MessageRoutes);
app.use("/api/match", matchRoutes);

/* ───────────────── DB Setup ───────────────── */
const prisma = new PrismaClient();


const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    ca: `-----BEGIN CERTIFICATE-----
MIIEQTCCAqmgAwIBAgIUdOBuOfcuyU5AJP5JwiSW4e+gdocwDQYJKoZIhvcNAQEM
BQAwOjE4MDYGA1UEAwwvMWIxZTU2YTEtYjg5NS00NWNjLWEyOTEtNTQxNTZlMTg0
OWM5IFByb2plY3QgQ0EwHhcNMjQwODA3MTYzNDMxWhcNMzQwODA1MTYzNDMxWjA6
MTgwNgYDVQQDDC8xYjFlNTZhMS1iODk1LTQ1Y2MtYTI5MS01NDE1NmUxODQ5Yzkg
UHJvamVjdCBDQTCCAaIwDQYJKoZIhvcNAQEBBQADggGPADCCAYoCggGBAPrD2IVF
ruxHy4VETVWUix4wiGcHG6zk/APwfwUqbgthOylKCobWuLmm6m+aP57S9LIQmiWT
34imu5dsh4AMSNdgeHmhdyu2GgOr6kEqbZEF+jiA4Olp0OeyDDbEAyW1yF6/qE26
L5VVp3AATAg0JK2N7q0sW2A5KviYxKS83u0ybdQSrYl42tGfwjCjl/pnY9l4qK3j
4qfIbB5nctLISMfRQ0/2VSVyBtmLcKHSHVZw+3Tg8chdAeV60zSaUfYDIMadXWSq
SWcxr92qqQ2kUBvElrZM19LCWGk4VkRTlfb/a/BAIQSBK21Wjgn7iT4zE2oVq4pF
qnglQkAA8x8Md9zPENhv9KXiRS5NUSPmCAtaj4tPfYqHmI8IzmAnh7cb2pZnndcV
oiHirQ0gcZMVq+exEovdBZa57qbSfft1UsIqa4JitUHmrMja4WRLo+FfreEkqOYa
EQr4pHpIPC/YPpsyzX1KSh2DvRPJTipBchlDP9Fj2ZGDIsW/bVHx6NzocQIDAQAB
oz8wPTAdBgNVHQ4EFgQU8yzjPQgvkyOLTtjAjWadt9pWBt4wDwYDVR0TBAgwBgEB
/wIBADALBgNVHQ8EBAMCAQYwDQYJKoZIhvcNAQEMBQADggGBAFD9h6Nb8QSyEjy0
R8lwfUyC6cubdXulp6i28OP0xyK5WdSn/e/c2iEhE3qBgt/g0QUjx5rla7M5J+d2
7Hj09MuMFtN3pc4E9Y3qEF/zWhdrO/4KyWB3rqqvLZ85CLtB4i6U0RTBbHF9pqVg
WwMtaVkYj+WC/HFrSpauS9uXhJQt901EUFB8mNC4ixCoKk6GW0h0uKvtzqs6P1UI
MENB61vsc8zNqNXEZxxcpX8VfkiPYU9ZAxWrhfcihkpbyCj75zKcFmVgHtI7b2wU
8YJD2IZUAQW0CmKNstrHA4kzIYUlaTrRuOZzK2u5F7WL01R9TSNu+sJA7WNOyh3m
QEjbu0Vwi4XBUs2YQywHXLdluiHtitNMjoqnoQJXQnSpUPtX6IcYTBG2PIw7haAA
WGjgha0WB92BuYI3zYZk6sFNEYG25e1QlqrAiTFDs/w+MuxOh5+EWEIZKW11MU1J
mdbUG/brd0pa05k498y4wXkzmr2AvldznE7MZEe+Ll0Kw5K16g==
-----END CERTIFICATE-----`,
    rejectUnauthorized: true,
  },
});

db.connect((err) => {
  if (err) {
    console.error("❌ MySQL error:", err);
    process.exit(1);
  }
  console.log("✅ MySQL connected");
});
app.locals.db = db;

/* ───────────────── Proxy Image ───────────────── */
app.get("/api/proxy-image", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "Image URL required" });

  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    res.setHeader("Content-Type", response.headers["content-type"]);
    res.send(Buffer.from(response.data, "binary"));
  } catch (err) {
    res.status(500).json({ error: "Proxy failed" });
  }
});

/* ───────────────── 404 ───────────────── */
app.use((req, res) => res.status(404).send("404 Not Found"));

/* ───────────────── Server ───────────────── */
const PORT = process.env.PORT || 3005;
const server = app.listen(PORT, () =>
  console.log(`🚀 Server running on ${PORT}`)
);

/* ───────────────── Socket.IO ───────────────── */
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});
app.locals.io = io;

/* ───────────────── Online Users ───────────────── */
const onlineUsers = new Map();

/* ───────────────── Live Matches ───────────────── */
const liveMatches = new Map();
/*
matchId => {
  players: [id1, id2],
  progress: { [id]: number },
  scores: { [id]: number },
  currentQuestion: number,
  startedAt: number
}
*/

io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);

  /* ---------- USER ONLINE ---------- */
  socket.on("add-user", async (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit("online-users", { onlineUsers: [...onlineUsers.keys()] });

    const pendingMatches = await prisma.pendingMatch.findMany({
      where: {
        receiverId: userId,
        status: "pending",
        expiresAt: { gt: new Date() },
      },
      include: { sender: true },
    });

    if (pendingMatches.length > 0) {
      socket.emit("pending-matches", pendingMatches);
    }
  });

  socket.on("signout", (userId) => {
    onlineUsers.delete(userId);
    io.emit("online-users", { onlineUsers: [...onlineUsers.keys()] });
  });

  socket.on("disconnect", () => {
    for (const [id, sid] of onlineUsers.entries()) {
      if (sid === socket.id) {
        onlineUsers.delete(id);
        io.emit("online-users", { onlineUsers: [...onlineUsers.keys()] });
        break;
      }
    }
  });

  /* ---------- READY ---------- */
  socket.on("ready-for-battle", ({ from, to }) => {
    const toSocket = onlineUsers.get(to);
    if (toSocket) {
      io.to(toSocket).emit("opponent-ready", { from });
    }
  });

  /* ---------- CONFIRM BATTLE ---------- */
  socket.on("confirm-battle", ({ from, to, gameMode, subjects }) => {
    const matchId = `match_${from}_${to}_${Date.now()}`;

    liveMatches.set(matchId, {
      players: [from, to],
      progress: { [from]: 0, [to]: 0 },
      scores: { [from]: 0, [to]: 0 },
      currentQuestion: 0,
      startedAt: Date.now(),
    });

    socket.join(matchId);
    const toSocketId = onlineUsers.get(to);
    if (toSocketId) {
      io.sockets.sockets.get(toSocketId)?.join(matchId);
    }

    io.to(matchId).emit("battle-confirmed", {
      matchId,
      players: [from, to],
      gameMode,
      subjects,
    });

    console.log("⚔️ Match created:", matchId);
  });

  /* ---------- ANSWER ---------- */
  socket.on("submit-answer", ({ matchId, userId, correct }) => {
    const match = liveMatches.get(matchId);
    if (!match) return;

    match.progress[userId]++;
    if (correct) match.scores[userId] += 100;

    io.to(matchId).emit("match-progress", {
      progress: match.progress,
      scores: match.scores,
      currentQuestion: match.currentQuestion,
    });
  });

  /* ---------- NEXT QUESTION ---------- */
  socket.on("request-next-question", ({ matchId }) => {
    const match = liveMatches.get(matchId);
    if (!match) return;

    const allAnswered = match.players.every(
      (p) => match.progress[p] > match.currentQuestion
    );

    if (allAnswered) {
      match.currentQuestion++;
      io.to(matchId).emit("next-question", {
        currentQuestion: match.currentQuestion,
      });
    }
  });

  /* ---------- END MATCH ---------- */
  socket.on("end-match", ({ matchId }) => {
    const match = liveMatches.get(matchId);
    if (!match) return;

    io.to(matchId).emit("match-ended", {
      scores: match.scores,
    });

    liveMatches.delete(matchId);
    console.log("🏁 Match ended:", matchId);
  });

  /* ---------- CALLS ---------- */
  socket.on("outgoing-voice-call", (data) => {
    const toSocket = onlineUsers.get(data.to);
    if (toSocket) socket.to(toSocket).emit("incoming-voice-call", data);
  });

  socket.on("outgoing-video-call", (data) => {
    const toSocket = onlineUsers.get(data.to);
    if (toSocket) socket.to(toSocket).emit("incoming-video-call", data);
  });

  socket.on("accept-incoming-call", ({ id }) => {
    const toSocket = onlineUsers.get(id);
    if (toSocket) socket.to(toSocket).emit("accept-call");
  });

  socket.on("reject-video-call", ({ from }) => {
    const fromSocket = onlineUsers.get(from);
    if (fromSocket) socket.to(fromSocket).emit("video-call-rejected");
  });

  /* ---------- MESSAGES ---------- */
  socket.on("send-msg", (data) => {
    const toSocket = onlineUsers.get(data.to);
    if (toSocket) {
      socket.to(toSocket).emit("msg-recieve", {
        from: data.from,
        message: data.message,
      });
    }
  });

  socket.on("mark-read", ({ id, recieverId }) => {
    const toSocket = onlineUsers.get(id);
    if (toSocket) socket.to(toSocket).emit("mark-read-recieve", { id, recieverId });
  });
});
