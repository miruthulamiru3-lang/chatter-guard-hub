// Types for the Communication Tracking System

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'moderator';
  avatar: string;
  status: 'online' | 'offline' | 'idle';
  lastSeen: string;
  lastActive: string;
  riskScore: number;
  isBlocked: boolean;
  createdAt: string;
}

export interface EditHistoryEntry {
  message: string;
  editedAt: string;
}

export interface Message {
  _id: string;
  sender: User;
  receiver: User;
  group?: string;
  message: string;
  file: string;
  fileType: 'image' | 'file' | 'pdf' | 'document' | '';
  fileName: string;
  status: 'sent' | 'delivered' | 'seen';
  flagged: boolean;
  flagReason: string;
  deletedByAdmin: boolean;
  deletedBySender: boolean;
  editHistory: EditHistoryEntry[];
  isEditing?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Group {
  _id: string;
  groupName: string;
  description: string;
  members: User[];
  admins: string[];
  createdBy: User;
  avatar: string;
  createdAt: string;
}

export interface Notification {
  _id: string;
  type: 'message' | 'alert' | 'system';
  title: string;
  body: string;
  read: boolean;
  relatedUser?: User;
  createdAt: string;
}

export interface Analytics {
  totalUsers: number;
  onlineUsers: number;
  totalMessages: number;
  flaggedMessages: number;
  messagesPerDay: { _id: string; count: number }[];
  peakHours: { _id: number; count: number }[];
  activeUsers: { _id: string; name: string; email: string; messageCount: number }[];
  messageGrowth: { _id: number; count: number }[];
  highRiskUsers: User[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
