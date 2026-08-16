import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import jwt from "jsonwebtoken";
import User from "./models/User";
import logger from "./middleware/logger";

let io: SocketIOServer | undefined;

interface SocketAuthPayload {
  id: string;
  tokenVersion: number;
  exp?: number;
}

export function initSocket(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
    },
  });

  // Authenticate the socket connection using the same JWT the REST API uses.
  // Unlike the REST middleware (which re-checks tokenVersion on every request),
  // a socket authenticates once at connect time - so we also check tokenVersion
  // here against the DB to reject an already-logged-out token from ever
  // establishing a live connection in the first place.
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token || typeof token !== "string") {
      return next(new Error("Authentication required"));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!, {
        algorithms: ["HS256"],
      }) as SocketAuthPayload;

      const user = await User.findById(decoded.id).select("tokenVersion");
      if (!user || user.tokenVersion !== decoded.tokenVersion) {
        return next(new Error("Invalid or expired token"));
      }

      socket.data.userId = decoded.id;
      socket.data.tokenExp = decoded.exp;
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

    // The JWT was valid at connect time, but it still has a natural expiry.
    // Disconnect the socket once that expiry passes instead of leaving a
    // live connection open on an expired token indefinitely.
    const exp = socket.data.tokenExp as number | undefined;
    let expiryTimer: NodeJS.Timeout | undefined;
    if (exp) {
      const msUntilExpiry = exp * 1000 - Date.now();
      if (msUntilExpiry > 0) {
        expiryTimer = setTimeout(() => {
          logger.info({ userId }, "Disconnecting socket - token expired");
          socket.disconnect(true);
        }, msUntilExpiry);
      } else {
        socket.disconnect(true);
      }
    }

    socket.on("disconnect", () => {
      if (expiryTimer) clearTimeout(expiryTimer);
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

// Immediately force-disconnect every active socket for a user. Called on
// logout, since that's when tokenVersion is bumped server-side - any socket
// still connected on the old token should be cut off right away rather than
// waiting for its natural JWT expiry.
export function disconnectUserSockets(userId: string): void {
  if (!io) return;
  io.in(`user:${userId}`).disconnectSockets(true);
}
