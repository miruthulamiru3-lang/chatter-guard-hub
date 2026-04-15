import { io, Socket } from 'socket.io-client';
import type { Message, User } from '@/types';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

let socket: Socket | null = null;

// ── Connect / disconnect ──────────────────────
export function connectSocket(token: string, userId: string) {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: { token },
    query: { userId },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
  });

  socket.on('connect', () => console.log('[socket] connected', socket?.id));
  socket.on('disconnect', (reason) => console.log('[socket] disconnected', reason));
  socket.on('connect_error', (err) => console.error('[socket] error', err.message));

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket() {
  return socket;
}

// ── Emit helpers ──────────────────────────────
export function emitSendMessage(data: { receiverId: string; message: string; groupId?: string }) {
  socket?.emit('send_message', data);
}

export function emitTyping(receiverId: string) {
  socket?.emit('typing', { receiverId });
}

export function emitStopTyping(receiverId: string) {
  socket?.emit('stop_typing', { receiverId });
}

export function emitMarkSeen(messageIds: string[]) {
  socket?.emit('mark_seen', { messageIds });
}

// ── Listener helpers ──────────────────────────
type Callback<T> = (data: T) => void;

export function onNewMessage(cb: Callback<Message>) {
  socket?.on('new_message', cb);
  return () => { socket?.off('new_message', cb); };
}

export function onTyping(cb: Callback<{ userId: string }>) {
  socket?.on('user_typing', cb);
  return () => { socket?.off('user_typing', cb); };
}

export function onStopTyping(cb: Callback<{ userId: string }>) {
  socket?.on('user_stop_typing', cb);
  return () => { socket?.off('user_stop_typing', cb); };
}

export function onUserStatus(cb: Callback<{ userId: string; status: User['status'] }>) {
  socket?.on('user_status', cb);
  return () => { socket?.off('user_status', cb); };
}

export function onMessageUpdated(cb: Callback<Message>) {
  socket?.on('message_updated', cb);
  return () => { socket?.off('message_updated', cb); };
}

export function onMessageDeleted(cb: Callback<{ messageId: string }>) {
  socket?.on('message_deleted', cb);
  return () => { socket?.off('message_deleted', cb); };
}

export function onNotification(cb: Callback<{ type: string; title: string; body: string }>) {
  socket?.on('notification', cb);
  return () => { socket?.off('notification', cb); };
}
