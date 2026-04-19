import axios from 'axios';
import type { User, Message, Group, Analytics, Notification } from '@/types';

// Configure base URL — point to your backend
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('auth');
  if (stored) {
    try {
      const { token } = JSON.parse(stored);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {}
  }
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('auth');
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ token: string; user: User }>('/auth/login', { email, password }),

  register: (name: string, email: string, password: string, role: string, securityCode?: string) =>
    api.post<{ token: string; user: User }>('/auth/register', { name, email, password, role, securityCode }),
};

// ── Users ─────────────────────────────────────
export const usersApi = {
  getAll: () => api.get<User[]>('/users'),

  getById: (id: string) => api.get<User>(`/users/${id}`),

  block: (id: string) => api.patch<User>(`/users/${id}/block`),

  updateRole: (id: string, role: string) =>
    api.patch<User>(`/users/${id}/role`, { role }),
};

// ── Messages ──────────────────────────────────
export const messagesApi = {
  getConversation: (contactId: string) =>
    api.get<Message[]>(`/messages/${contactId}`),

  send: (receiverId: string, message: string) =>
    api.post<Message>('/messages', { receiverId, message }),

  edit: (messageId: string, message: string) =>
    api.patch<Message>(`/messages/${messageId}`, { message }),

  delete: (messageId: string) =>
    api.delete(`/messages/${messageId}`),

  search: (params: { keyword?: string; userId?: string; dateFrom?: string; dateTo?: string; fileType?: string }) =>
    api.get<Message[]>('/messages/search', { params }),

  getGroupMessages: (groupId: string) =>
    api.get<Message[]>(`/messages/group/${groupId}`),
};

// ── Groups ────────────────────────────────────
export const groupsApi = {
  getAll: () => api.get<Group[]>('/groups'),

  create: (data: { groupName: string; description: string; members: string[] }) =>
    api.post<Group>('/groups', data),

  addMember: (groupId: string, userId: string) =>
    api.patch(`/groups/${groupId}/members`, { userId }),
};

// ── Admin ─────────────────────────────────────
export const adminApi = {
  getAnalytics: () => api.get<Analytics>('/admin/analytics'),

  getAllMessages: (params?: { keyword?: string; userId?: string; flagged?: boolean }) =>
    api.get<Message[]>('/admin/messages', { params }),

  deleteMessage: (messageId: string) =>
    api.delete(`/admin/messages/${messageId}`),

  getNotifications: () => api.get<Notification[]>('/admin/notifications'),

  getHighRiskUsers: () => api.get<User[]>('/admin/high-risk-users'),
};

// ── Upload ────────────────────────────────────
export const uploadApi = {
  upload: (file: File, receiverId: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('receiverId', receiverId);
    return api.post<Message>('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default api;
