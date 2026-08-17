import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

// Connects using the same JWT stored for the REST API, so the backend can
// authenticate the socket and join the caller into their own private room.
// Call this once after login; call disconnectSocket() on logout.
export function connectSocket(): Socket | null {
  const token = localStorage.getItem('token');
  if (!token) return null;

  const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

  socket = io(baseUrl, {
    auth: { token },
  });

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket(): Socket | null {
  return socket;
}
