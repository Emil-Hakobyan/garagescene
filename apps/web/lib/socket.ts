import { io, Socket } from 'socket.io-client';
import { getToken } from './auth';

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const token = getToken();

  if (!token) {
    return null;
  }

  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_API_URL!, {
      auth: { token },
      autoConnect: true,
    });
  } else if (!socket.connected) {
    socket.auth = { token };
    socket.connect();
  }

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
