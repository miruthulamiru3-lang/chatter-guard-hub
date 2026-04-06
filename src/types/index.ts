// Types for the Communication Tracking System

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar: string;
  status: 'online' | 'offline';
  lastSeen: string;
  createdAt: string;
}

export interface Message {
  _id: string;
  sender: User;
  receiver: User;
  message: string;
  file: string;
  fileType: 'image' | 'file' | '';
  fileName: string;
  status: 'sent' | 'delivered' | 'seen';
  flagged: boolean;
  flagReason: string;
  deletedByAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Analytics {
  totalUsers: number;
  onlineUsers: number;
  totalMessages: number;
  flaggedMessages: number;
  messagesPerDay: { _id: string; count: number }[];
  activeUsers: { _id: string; name: string; email: string; messageCount: number }[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
