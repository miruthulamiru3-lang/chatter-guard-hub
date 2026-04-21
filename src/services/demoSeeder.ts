import { authApi, messagesApi, usersApi } from './api';

export interface DemoAccount {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'moderator' | 'admin';
  securityCode?: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  { name: 'Demo User',      email: 'user@demo.com',  password: 'demo1234', role: 'user' },
  { name: 'Demo Moderator', email: 'mod@demo.com',   password: 'demo1234', role: 'moderator', securityCode: 'MOD2025' },
  { name: 'Demo Admin',     email: 'admin@demo.com', password: 'demo1234', role: 'admin',     securityCode: 'ADMIN2025' },
  { name: 'Alice Johnson',  email: 'alice@demo.com', password: 'demo1234', role: 'user' },
  { name: 'Bob Smith',      email: 'bob@demo.com',   password: 'demo1234', role: 'user' },
  { name: 'Carol Williams', email: 'carol@demo.com', password: 'demo1234', role: 'user' },
];

const DEMO_SEEDED_KEY = 'commtrack_demo_seeded';

interface ScriptedMessage {
  fromEmail: string;
  toEmail: string;
  text: string;
}

// A small scripted conversation set — includes flagged keywords for moderator/admin demo
const DEMO_CONVERSATIONS: ScriptedMessage[] = [
  // user@demo.com <-> alice
  { fromEmail: 'alice@demo.com', toEmail: 'user@demo.com', text: 'Hey! How are you doing?' },
  { fromEmail: 'user@demo.com',  toEmail: 'alice@demo.com', text: "I'm good, thanks! Working on the new project." },
  { fromEmail: 'alice@demo.com', toEmail: 'user@demo.com', text: 'That sounds exciting! Need any help?' },
  { fromEmail: 'user@demo.com',  toEmail: 'alice@demo.com', text: 'Could you review the design mockups?' },

  // user@demo.com <-> bob (with flagged content)
  { fromEmail: 'bob@demo.com',   toEmail: 'user@demo.com', text: 'Did you see the meeting notes?' },
  { fromEmail: 'user@demo.com',  toEmail: 'bob@demo.com',  text: 'Not yet, let me check.' },
  { fromEmail: 'bob@demo.com',   toEmail: 'user@demo.com', text: 'This spam content needs review asap' },

  // user@demo.com <-> carol (with flagged content)
  { fromEmail: 'carol@demo.com', toEmail: 'user@demo.com', text: 'Can you help me hack the deployment script?' },
  { fromEmail: 'user@demo.com',  toEmail: 'carol@demo.com', text: 'Sure, what are you trying to do?' },
];

interface SeedResult {
  accountsCreated: number;
  accountsExisted: number;
  messagesSeeded: number;
  errors: string[];
}

/**
 * Seeds demo accounts and conversations into the backend.
 * Idempotent: re-running won't duplicate accounts (existing ones are skipped).
 */
export async function seedDemoData(): Promise<SeedResult> {
  const result: SeedResult = { accountsCreated: 0, accountsExisted: 0, messagesSeeded: 0, errors: [] };
  const tokensByEmail = new Map<string, string>();
  const userIdByEmail = new Map<string, string>();

  // 1. Register (or login) each demo account
  for (const acc of DEMO_ACCOUNTS) {
    try {
      const { data } = await authApi.register(acc.name, acc.email, acc.password, acc.role, acc.securityCode);
      tokensByEmail.set(acc.email, data.token);
      userIdByEmail.set(acc.email, data.user._id);
      result.accountsCreated++;
    } catch (err: any) {
      // Account likely exists — try to login
      try {
        const { data } = await authApi.login(acc.email, acc.password);
        tokensByEmail.set(acc.email, data.token);
        userIdByEmail.set(acc.email, data.user._id);
        result.accountsExisted++;
      } catch (loginErr: any) {
        result.errors.push(`${acc.email}: ${loginErr?.response?.data?.message || loginErr.message}`);
      }
    }
  }

  // 2. Resolve user IDs (in case they weren't returned by register)
  if (userIdByEmail.size < DEMO_ACCOUNTS.length) {
    try {
      const anyToken = tokensByEmail.values().next().value;
      if (anyToken) {
        // Temporarily inject this token to call /users
        const prevAuth = localStorage.getItem('auth');
        localStorage.setItem('auth', JSON.stringify({ token: anyToken }));
        const { data: allUsers } = await usersApi.getAll();
        for (const u of allUsers) {
          userIdByEmail.set(u.email.toLowerCase(), u._id);
        }
        if (prevAuth) localStorage.setItem('auth', prevAuth);
        else localStorage.removeItem('auth');
      }
    } catch (err: any) {
      result.errors.push(`User lookup failed: ${err.message}`);
    }
  }

  // 3. Seed scripted messages — each from the sender's auth context
  const prevAuth = localStorage.getItem('auth');
  for (const msg of DEMO_CONVERSATIONS) {
    const senderToken = tokensByEmail.get(msg.fromEmail);
    const receiverId = userIdByEmail.get(msg.toEmail);
    if (!senderToken || !receiverId) continue;

    try {
      localStorage.setItem('auth', JSON.stringify({ token: senderToken }));
      await messagesApi.send(receiverId, msg.text);
      result.messagesSeeded++;
    } catch (err: any) {
      result.errors.push(`Message ${msg.fromEmail}→${msg.toEmail}: ${err?.response?.data?.message || err.message}`);
    }
  }
  // Restore prior auth state
  if (prevAuth) localStorage.setItem('auth', prevAuth);
  else localStorage.removeItem('auth');

  localStorage.setItem(DEMO_SEEDED_KEY, new Date().toISOString());
  return result;
}

export function isDemoSeeded(): boolean {
  return !!localStorage.getItem(DEMO_SEEDED_KEY);
}

export function clearDemoSeededFlag(): void {
  localStorage.removeItem(DEMO_SEEDED_KEY);
}
