import { WebSocketServer, WebSocket } from "ws";
import { prisma } from "@repo/db/prismaClient";
import "dotenv/config";

interface Connection {
  ws: WebSocket;
  room: string | null;
}

const wss = new WebSocketServer({ port: Number(process.env.WS_PORT) || 4000 });
const connections = new Map<WebSocket, Connection>();

wss.on("connection", (ws) => {
  connections.set(ws, { ws, room: null });

  ws.on("message", async (data) => {
    const parsedMessage = JSON.parse(data.toString());
    const connection = connections.get(ws);

    if (!connection) {
      ws.close(1008, "Unknown connection.");
      return;
    }

    switch (parsedMessage.type) {
      case "JOIN": {
        const { roomId } = parsedMessage;
        if (!roomId) {
          console.error("Missing roomId in JOIN message.");
          return;
        }

        try {
          const room = await prisma.rooms.findUnique({ where: { id: roomId } });

          if (!room) {
            console.error(`No room with id ${roomId} exists.`);
            return;
          }

          connection.room = roomId;
          console.log(`Socket joined room ${roomId}`);
        } catch (err) {
          console.error("Internal server error: ", err);
          ws.close(1011, "Internal server error.");
        }
        break;
      }

      case "LEAVE": {
        if (connection.room) {
          console.log(`Socket left room ${connection.room}`);
          connection.room = null;
        }
        break;
      }

      case "CHAT": {
        const { message, roomId } = parsedMessage;
        if (!message || !roomId) {
          console.error("Missing message or roomId in CHAT.");
          return;
        }

        for (const conn of connections.values()) {
          if (conn.room === roomId && conn.ws.readyState === ws.OPEN) {
            await prisma.chats.create({
              data: {
                startX: message.startX,
                startY: message.startY,
                width: message.width,
                height: message.height,
                roomId,
              },
            });
            conn.ws.send(JSON.stringify({ type: "CHAT", message, roomId }));
          }
        }
        break;
      }

      default:
        console.error("Unknown message type:", parsedMessage.type);
    }
  });

  ws.on("close", () => {
    connections.delete(ws);
    console.log("Socket disconnected and removed.");
  });
});
