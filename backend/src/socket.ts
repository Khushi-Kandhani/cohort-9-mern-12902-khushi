import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import jwt from "jsonwebtoken";
import logger from "./middleware/logger";

let io: SocketIOServer | undefined;

interface SocketAuthPayload {
  id: string;
  tokenVersion: number;
}

export function initSocket(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
    },
  });

  // Authenticate the socket connection using the same JWT the REST API uses,
  // then join a private room scoped to that user so notes events never leak
  // across accounts.
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token || typeof token !== "string") {
      return next(new Error("Authentication required"));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!, {
        algorithms: ["HS256"],
      }) as SocketAuthPayload;
      socket.data.userId = decoded.id;
      next();
    } catch (err) {
      logger.warn({ err: (err as Error).message }, "Socket auth failed");
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId as string;
    socket.join(`user:${userId}`);
    logger.info({ userId }, "Socket connected");

    socket.on("disconnect", () => {
      logger.info({ userId }, "Socket disconnected");
    });
  });

  return io;
}

// Emit a notes-related event to only the sockets belonging to one user.
export function emitToUser(userId: string, event: string, payload: unknown): void {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
}
