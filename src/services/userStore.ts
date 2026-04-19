import { User } from '@/types';

const USERS_KEY = 'commtrack_users';
const ADMIN_SECURITY_CODE = 'ADMIN2025';
const MODERATOR_SECURITY_CODE = 'MOD2025';

export interface StoredUser extends User {
  passwordHash: string;
}

function getStoredUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Simple hash for demo purposes (in production, hashing is done server-side)
function simpleHash(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return `hash_${Math.abs(hash).toString(36)}`;
}

export function validateSecurityCode(role: string, code: string): { valid: boolean; error?: string } {
  if (role === 'admin') {
    if (code !== ADMIN_SECURITY_CODE) return { valid: false, error: 'Invalid admin security code' };
  } else if (role === 'moderator') {
    if (code !== MODERATOR_SECURITY_CODE) return { valid: false, error: 'Invalid moderator security code' };
  }
  return { valid: true };
}

export function registerUser(name: string, email: string, password: string, role: string): User {
  const users = getStoredUsers();

  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('An account with this email already exists');
  }

  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  const newUser: StoredUser = {
    _id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name,
    email: email.toLowerCase(),
    role: role as User['role'],
    avatar: '',
    status: 'online',
    lastSeen: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    riskScore: 0,
    isBlocked: false,
    createdAt: new Date().toISOString(),
    passwordHash: simpleHash(password),
  };

  users.push(newUser);
  saveUsers(users);

  const { passwordHash: _, ...user } = newUser;
  return user;
}

export function loginUser(email: string, password: string): User {
  const users = getStoredUsers();
  const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!found) {
    throw new Error('No account found with this email. Please register first.');
  }

  if (found.passwordHash !== simpleHash(password)) {
    throw new Error('Incorrect password');
  }

  if (found.isBlocked) {
    throw new Error('Your account has been blocked. Contact an administrator.');
  }

  // Update status
  found.status = 'online';
  found.lastActive = new Date().toISOString();
  found.lastSeen = new Date().toISOString();
  saveUsers(users);

  const { passwordHash: _, ...user } = found;
  return user;
}

export function getAllRegisteredUsers(): User[] {
  return getStoredUsers().map(({ passwordHash: _, ...user }) => user);
}

export function blockUser(userId: string, blocked: boolean) {
  const users = getStoredUsers();
  const idx = users.findIndex(u => u._id === userId);
  if (idx >= 0) {
    users[idx].isBlocked = blocked;
    saveUsers(users);
  }
}

export function updateUserRole(userId: string, role: string) {
  const users = getStoredUsers();
  const idx = users.findIndex(u => u._id === userId);
  if (idx >= 0) {
    users[idx].role = role as User['role'];
    saveUsers(users);
  }
}

export function resetPassword(email: string, newPassword: string): void {
  if (newPassword.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  const users = getStoredUsers();
  const idx = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());

  if (idx < 0) {
    throw new Error('No account found with this email address');
  }

  if (users[idx].isBlocked) {
    throw new Error('This account is blocked. Contact an administrator.');
  }

  users[idx].passwordHash = simpleHash(newPassword);
  saveUsers(users);
}

export function emailExists(email: string): boolean {
  const users = getStoredUsers();
  return users.some(u => u.email.toLowerCase() === email.toLowerCase());
}
