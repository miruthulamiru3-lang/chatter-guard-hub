import { User, Message } from '@/types';

// Demo contact list
export const demoContacts: User[] = [
  { _id: 'user-002', name: 'Alice Johnson', email: 'alice@example.com', role: 'user', avatar: '', status: 'online', lastSeen: new Date().toISOString(), createdAt: '2025-01-15T10:00:00Z' },
  { _id: 'user-003', name: 'Bob Smith', email: 'bob@example.com', role: 'user', avatar: '', status: 'offline', lastSeen: new Date(Date.now() - 3600000).toISOString(), createdAt: '2025-02-10T10:00:00Z' },
  { _id: 'user-004', name: 'Carol Williams', email: 'carol@example.com', role: 'user', avatar: '', status: 'online', lastSeen: new Date().toISOString(), createdAt: '2025-03-01T10:00:00Z' },
  { _id: 'user-005', name: 'David Brown', email: 'david@example.com', role: 'user', avatar: '', status: 'offline', lastSeen: new Date(Date.now() - 7200000).toISOString(), createdAt: '2025-03-15T10:00:00Z' },
  { _id: 'user-006', name: 'Eva Martinez', email: 'eva@example.com', role: 'admin', avatar: '', status: 'online', lastSeen: new Date().toISOString(), createdAt: '2025-01-01T10:00:00Z' },
];

// Generate demo messages for a conversation
export function getDemoMessages(currentUserId: string, contactId: string): Message[] {
  const contact = demoContacts.find(c => c._id === contactId);
  if (!contact) return [];

  const currentUser: User = { _id: currentUserId, name: 'You', email: 'you@example.com', role: 'user', avatar: '', status: 'online', lastSeen: new Date().toISOString(), createdAt: new Date().toISOString() };
  const now = Date.now();

  const conversations: Record<string, { sender: 'me' | 'them'; message: string; minutesAgo: number; flagged?: boolean }[]> = {
    'user-002': [
      { sender: 'them', message: 'Hey! How are you doing?', minutesAgo: 120 },
      { sender: 'me', message: 'I\'m good, thanks! Working on the new project.', minutesAgo: 118 },
      { sender: 'them', message: 'That sounds exciting! Need any help?', minutesAgo: 115 },
      { sender: 'me', message: 'Actually yes, could you review the design mockups?', minutesAgo: 110 },
      { sender: 'them', message: 'Sure! Send them over and I\'ll take a look today.', minutesAgo: 108 },
      { sender: 'me', message: 'Perfect, sending them now. Thanks Alice!', minutesAgo: 105 },
    ],
    'user-003': [
      { sender: 'them', message: 'Did you see the meeting notes?', minutesAgo: 240 },
      { sender: 'me', message: 'Not yet, let me check.', minutesAgo: 235 },
      { sender: 'them', message: 'There are some important action items for our team.', minutesAgo: 230 },
      { sender: 'me', message: 'Got it. I\'ll review and update the task board.', minutesAgo: 225 },
    ],
    'user-004': [
      { sender: 'me', message: 'Hi Carol, quick question about the API.', minutesAgo: 60 },
      { sender: 'them', message: 'Sure, what\'s up?', minutesAgo: 58 },
      { sender: 'me', message: 'Is the /api/users endpoint paginated?', minutesAgo: 55 },
      { sender: 'them', message: 'Yes, it supports ?page=1&limit=20 parameters.', minutesAgo: 50 },
      { sender: 'me', message: 'Great, thanks!', minutesAgo: 48 },
    ],
    'user-005': [
      { sender: 'them', message: 'The deployment is scheduled for tonight.', minutesAgo: 180 },
      { sender: 'me', message: 'Sounds good. Any risks we should watch for?', minutesAgo: 175 },
      { sender: 'them', message: 'Just the database migration — it might take a few minutes.', minutesAgo: 170 },
    ],
    'user-006': [
      { sender: 'them', message: 'Please submit your weekly report by Friday.', minutesAgo: 300 },
      { sender: 'me', message: 'Will do! Is there a new template?', minutesAgo: 295 },
      { sender: 'them', message: 'Yes, I shared it in the #general channel.', minutesAgo: 290 },
    ],
  };

  const convo = conversations[contactId] || [];
  return convo.map((msg, i) => ({
    _id: `msg-${contactId}-${i}`,
    sender: msg.sender === 'me' ? currentUser : contact,
    receiver: msg.sender === 'me' ? contact : currentUser,
    message: msg.message,
    file: '',
    fileType: '' as const,
    fileName: '',
    status: 'seen' as const,
    flagged: msg.flagged || false,
    flagReason: '',
    deletedByAdmin: false,
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
  // Add some flagged messages
  const flaggedMsg: Message = {
    _id: 'msg-flagged-1',
    sender: demoContacts[1],
    receiver: demoContacts[0],
    message: 'This is spam content that should be flagged',
    file: '',
    fileType: '',
    fileName: '',
    status: 'seen',
    flagged: true,
    flagReason: 'Contains flagged words: spam',
    deletedByAdmin: false,
    createdAt: new Date(Date.now() - 50 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 50 * 60000).toISOString(),
  };
  allMsgs.push(flaggedMsg);
  return allMsgs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// Demo analytics
export const demoAnalytics = {
  totalUsers: 6,
  onlineUsers: 3,
  totalMessages: 25,
  flaggedMessages: 1,
  messagesPerDay: Array.from({ length: 14 }, (_, i) => ({
    _id: new Date(Date.now() - (13 - i) * 86400000).toISOString().split('T')[0],
    count: Math.floor(Math.random() * 20) + 5,
  })),
  activeUsers: [
    { _id: 'user-002', name: 'Alice Johnson', email: 'alice@example.com', messageCount: 42 },
    { _id: 'user-003', name: 'Bob Smith', email: 'bob@example.com', messageCount: 35 },
    { _id: 'user-004', name: 'Carol Williams', email: 'carol@example.com', messageCount: 28 },
    { _id: 'user-005', name: 'David Brown', email: 'david@example.com', messageCount: 15 },
    { _id: 'user-006', name: 'Eva Martinez', email: 'eva@example.com', messageCount: 10 },
  ],
};
