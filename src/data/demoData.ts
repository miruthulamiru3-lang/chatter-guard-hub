import { User, Message, Group, Notification, Analytics } from '@/types';

// Demo contact list with roles, risk scores, status
export const demoContacts: User[] = [
  { _id: 'user-002', name: 'Alice Johnson', email: 'alice@example.com', role: 'user', avatar: '', status: 'online', lastSeen: new Date().toISOString(), lastActive: new Date().toISOString(), riskScore: 0, isBlocked: false, createdAt: '2025-01-15T10:00:00Z' },
  { _id: 'user-003', name: 'Bob Smith', email: 'bob@example.com', role: 'user', avatar: '', status: 'offline', lastSeen: new Date(Date.now() - 3600000).toISOString(), lastActive: new Date(Date.now() - 3600000).toISOString(), riskScore: 15, isBlocked: false, createdAt: '2025-02-10T10:00:00Z' },
  { _id: 'user-004', name: 'Carol Williams', email: 'carol@example.com', role: 'moderator', avatar: '', status: 'online', lastSeen: new Date().toISOString(), lastActive: new Date().toISOString(), riskScore: 0, isBlocked: false, createdAt: '2025-03-01T10:00:00Z' },
  { _id: 'user-005', name: 'David Brown', email: 'david@example.com', role: 'user', avatar: '', status: 'idle', lastSeen: new Date(Date.now() - 600000).toISOString(), lastActive: new Date(Date.now() - 600000).toISOString(), riskScore: 25, isBlocked: false, createdAt: '2025-03-15T10:00:00Z' },
  { _id: 'user-006', name: 'Eva Martinez', email: 'eva@example.com', role: 'admin', avatar: '', status: 'online', lastSeen: new Date().toISOString(), lastActive: new Date().toISOString(), riskScore: 0, isBlocked: false, createdAt: '2025-01-01T10:00:00Z' },
  { _id: 'user-007', name: 'Frank Lee', email: 'frank@example.com', role: 'user', avatar: '', status: 'offline', lastSeen: new Date(Date.now() - 86400000).toISOString(), lastActive: new Date(Date.now() - 86400000).toISOString(), riskScore: 40, isBlocked: true, createdAt: '2025-04-01T10:00:00Z' },
];

// Demo groups
export const demoGroups: Group[] = [
  {
    _id: 'group-001',
    groupName: 'Engineering Team',
    description: 'Dev team discussions',
    members: [demoContacts[0], demoContacts[1], demoContacts[2]],
    admins: ['user-002'],
    createdBy: demoContacts[0],
    avatar: '',
    createdAt: '2025-02-01T10:00:00Z',
  },
  {
    _id: 'group-002',
    groupName: 'Project Alpha',
    description: 'Alpha project coordination',
    members: [demoContacts[0], demoContacts[3], demoContacts[4]],
    admins: ['user-006'],
    createdBy: demoContacts[4],
    avatar: '',
    createdAt: '2025-03-10T10:00:00Z',
  },
];

// Demo notifications
export const demoNotifications: Notification[] = [
  { _id: 'notif-001', type: 'alert', title: 'Suspicious Message Detected', body: 'User Bob Smith sent a flagged message containing "spam"', read: false, createdAt: new Date(Date.now() - 300000).toISOString() },
  { _id: 'notif-002', type: 'alert', title: 'High Risk User Alert', body: 'David Brown risk score exceeded threshold (25)', read: false, createdAt: new Date(Date.now() - 600000).toISOString() },
  { _id: 'notif-003', type: 'system', title: 'System Update', body: 'Message auto-expiry enabled (24 hours)', read: true, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { _id: 'notif-004', type: 'message', title: 'New Message', body: 'Alice Johnson sent you a message', read: true, createdAt: new Date(Date.now() - 7200000).toISOString() },
];

// Generate demo messages for a conversation
export function getDemoMessages(currentUserId: string, contactId: string): Message[] {
  const contact = demoContacts.find(c => c._id === contactId);
  if (!contact) return [];

  const currentUser: User = { _id: currentUserId, name: 'You', email: 'you@example.com', role: 'user', avatar: '', status: 'online', lastSeen: new Date().toISOString(), lastActive: new Date().toISOString(), riskScore: 0, isBlocked: false, createdAt: new Date().toISOString() };
  const now = Date.now();

  const baseMsg = { file: '', fileType: '' as const, fileName: '', status: 'seen' as const, flagged: false, flagReason: '', deletedByAdmin: false, deletedBySender: false, editHistory: [] };

  const conversations: Record<string, { sender: 'me' | 'them'; message: string; minutesAgo: number; flagged?: boolean; flagReason?: string; editHistory?: { message: string; editedAt: string }[] }[]> = {
    'user-002': [
      { sender: 'them', message: 'Hey! How are you doing?', minutesAgo: 120 },
      { sender: 'me', message: "I'm good, thanks! Working on the new project.", minutesAgo: 118 },
      { sender: 'them', message: 'That sounds exciting! Need any help?', minutesAgo: 115 },
      { sender: 'me', message: 'Actually yes, could you review the design mockups?', minutesAgo: 110, editHistory: [{ message: 'Can you review the design?', editedAt: new Date(now - 112 * 60000).toISOString() }] },
      { sender: 'them', message: "Sure! Send them over and I'll take a look today.", minutesAgo: 108 },
      { sender: 'me', message: 'Perfect, sending them now. Thanks Alice!', minutesAgo: 105 },
    ],
    'user-003': [
      { sender: 'them', message: 'Did you see the meeting notes?', minutesAgo: 240 },
      { sender: 'me', message: 'Not yet, let me check.', minutesAgo: 235 },
      { sender: 'them', message: 'This spam content needs to be reviewed asap', minutesAgo: 230, flagged: true, flagReason: 'Contains flagged words: spam' },
      { sender: 'me', message: "Got it. I'll review and update the task board.", minutesAgo: 225 },
    ],
    'user-004': [
      { sender: 'me', message: 'Hi Carol, quick question about the API.', minutesAgo: 60 },
      { sender: 'them', message: "Sure, what's up?", minutesAgo: 58 },
      { sender: 'me', message: 'Is the /api/users endpoint paginated?', minutesAgo: 55 },
      { sender: 'them', message: 'Yes, it supports ?page=1&limit=20 parameters.', minutesAgo: 50 },
      { sender: 'me', message: 'Great, thanks!', minutesAgo: 48 },
    ],
    'user-005': [
      { sender: 'them', message: 'The deployment is scheduled for tonight.', minutesAgo: 180 },
      { sender: 'me', message: 'Sounds good. Any risks we should watch for?', minutesAgo: 175 },
      { sender: 'them', message: 'Just the database migration — might hack some things together', minutesAgo: 170, flagged: true, flagReason: 'Contains flagged words: hack' },
    ],
    'user-006': [
      { sender: 'them', message: 'Please submit your weekly report by Friday.', minutesAgo: 300 },
      { sender: 'me', message: 'Will do! Is there a new template?', minutesAgo: 295 },
      { sender: 'them', message: 'Yes, I shared it in the #general channel.', minutesAgo: 290 },
    ],
  };

  const convo = conversations[contactId] || [];
  return convo.map((msg, i) => ({
    ...baseMsg,
    _id: `msg-${contactId}-${i}`,
    sender: msg.sender === 'me' ? currentUser : contact,
    receiver: msg.sender === 'me' ? contact : currentUser,
    message: msg.message,
    flagged: msg.flagged || false,
    flagReason: msg.flagReason || '',
    editHistory: msg.editHistory || [],
    createdAt: new Date(now - msg.minutesAgo * 60000).toISOString(),
    updatedAt: new Date(now - msg.minutesAgo * 60000).toISOString(),
  }));
}

// All messages for admin view
export function getAllDemoMessages(): Message[] {
  const allMsgs: Message[] = [];
  demoContacts.forEach(contact => {
    allMsgs.push(...getDemoMessages('user-001', contact._id));
  });
  return allMsgs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// Demo analytics
export const demoAnalytics: Analytics = {
  totalUsers: 7,
  onlineUsers: 3,
  totalMessages: 32,
  flaggedMessages: 3,
  messagesPerDay: Array.from({ length: 30 }, (_, i) => ({
    _id: new Date(Date.now() - (29 - i) * 86400000).toISOString().split('T')[0],
    count: Math.floor(Math.random() * 30) + 5,
  })),
  peakHours: [
    { _id: 10, count: 45 },
    { _id: 14, count: 38 },
    { _id: 11, count: 35 },
    { _id: 15, count: 30 },
    { _id: 9, count: 25 },
  ],
  activeUsers: [
    { _id: 'user-002', name: 'Alice Johnson', email: 'alice@example.com', messageCount: 42 },
    { _id: 'user-003', name: 'Bob Smith', email: 'bob@example.com', messageCount: 35 },
    { _id: 'user-004', name: 'Carol Williams', email: 'carol@example.com', messageCount: 28 },
    { _id: 'user-005', name: 'David Brown', email: 'david@example.com', messageCount: 15 },
    { _id: 'user-006', name: 'Eva Martinez', email: 'eva@example.com', messageCount: 10 },
  ],
  messageGrowth: Array.from({ length: 12 }, (_, i) => ({
    _id: i + 1,
    count: Math.floor(Math.random() * 100) + 50,
  })),
  highRiskUsers: [
    { _id: 'user-007', name: 'Frank Lee', email: 'frank@example.com', role: 'user', avatar: '', status: 'offline', lastSeen: new Date(Date.now() - 86400000).toISOString(), lastActive: new Date(Date.now() - 86400000).toISOString(), riskScore: 40, isBlocked: true, createdAt: '2025-04-01T10:00:00Z' },
    { _id: 'user-005', name: 'David Brown', email: 'david@example.com', role: 'user', avatar: '', status: 'idle', lastSeen: new Date(Date.now() - 600000).toISOString(), lastActive: new Date(Date.now() - 600000).toISOString(), riskScore: 25, isBlocked: false, createdAt: '2025-03-15T10:00:00Z' },
    { _id: 'user-003', name: 'Bob Smith', email: 'bob@example.com', role: 'user', avatar: '', status: 'offline', lastSeen: new Date(Date.now() - 3600000).toISOString(), lastActive: new Date(Date.now() - 3600000).toISOString(), riskScore: 15, isBlocked: false, createdAt: '2025-02-10T10:00:00Z' },
  ],
};
