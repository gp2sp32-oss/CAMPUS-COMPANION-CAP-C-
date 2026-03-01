import express from "express";
import { createServer as createViteServer } from "vite";
import { WebSocketServer, WebSocket } from "ws";
import http from "http";

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server });
  const PORT = 3000;

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // WebSocket logic
  const clients = new Map<WebSocket, { roomId: string; rollNo: string }>();

  wss.on("connection", (ws) => {
    console.log("New connection");

    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === "join") {
          clients.set(ws, { roomId: message.roomId, rollNo: message.rollNo });
          console.log(`${message.rollNo} joined ${message.roomId}`);
          
          // Notify others in room
          const systemMsg = JSON.stringify({
            type: "system",
            content: `${message.rollNo} joined the channel.`,
            roomId: message.roomId,
            timestamp: new Date().toISOString()
          });
          
          broadcastToRoom(message.roomId, systemMsg);
        } else if (message.type === "message") {
          const clientInfo = clients.get(ws);
          if (clientInfo) {
            const chatMsg = JSON.stringify({
              type: "message",
              sender: clientInfo.rollNo,
              content: message.content,
              roomId: clientInfo.roomId,
              timestamp: new Date().toISOString()
            });
            broadcastToRoom(clientInfo.roomId, chatMsg);
          }
        }
      } catch (err) {
        console.error("WS Error:", err);
      }
    });

    ws.on("close", () => {
      const clientInfo = clients.get(ws);
      if (clientInfo) {
        const systemMsg = JSON.stringify({
          type: "system",
          content: `${clientInfo.rollNo} left the channel.`,
          roomId: clientInfo.roomId,
          timestamp: new Date().toISOString()
        });
        broadcastToRoom(clientInfo.roomId, systemMsg);
        clients.delete(ws);
      }
    });
  });

  function broadcastToRoom(roomId: string, message: string) {
    wss.clients.forEach((client) => {
      const info = clients.get(client);
      if (client.readyState === WebSocket.OPEN && info?.roomId === roomId) {
        client.send(message);
      }
    });
  }

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
