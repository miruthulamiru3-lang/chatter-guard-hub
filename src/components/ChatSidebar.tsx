import React, { useState } from 'react';
import { User, Group } from '@/types';
import { Search, Users, MessageSquare, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import UserAvatar from '@/components/UserAvatar';
import { demoGroups } from '@/data/demoData';

interface ChatSidebarProps {
  contacts: User[];
  selectedContact: User | null;
  onSelectContact: (user: User) => void;
  selectedGroup: Group | null;
  onSelectGroup: (group: Group) => void;
}

export default function ChatSidebar({ contacts, selectedContact, onSelectContact, selectedGroup, onSelectGroup }: ChatSidebarProps) {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'chats' | 'groups'>('chats');

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const filteredGroups = demoGroups.filter(g =>
    g.groupName.toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = (status: string) =>
    status === 'online' ? 'bg-online' : status === 'idle' ? 'bg-warning' : 'bg-offline';

  const statusLabel = (u: User) => {
    if (u.status === 'online') return 'Online';
    if (u.status === 'idle') return 'Idle';
    return `Last seen ${new Date(u.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="w-80 border-r bg-card flex flex-col shrink-0 h-full">
      {/* Tab switcher */}
      <div className="flex border-b">
        <button
          onClick={() => setTab('chats')}
          className={`flex-1 py-2.5 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
            tab === 'chats' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <MessageSquare className="h-3.5 w-3.5" /> Chats
        </button>
        <button
          onClick={() => setTab('groups')}
          className={`flex-1 py-2.5 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
            tab === 'groups' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Users className="h-3.5 w-3.5" /> Groups
        </button>
      </div>

      {/* Search */}
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={tab === 'chats' ? 'Search contacts...' : 'Search groups...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {tab === 'chats' ? (
          <>
            {filtered.map(contact => (
              <button
                key={contact._id}
                onClick={() => { onSelectContact(contact); }}
                className={`w-full flex items-center gap-3 p-3 text-left transition-colors hover:bg-secondary/50 ${
                  selectedContact?._id === contact._id && !selectedGroup ? 'bg-secondary' : ''
                }`}
              >
                <UserAvatar name={contact.name} isOnline={contact.status === 'online'} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground truncate">{contact.name}</p>
                    {contact.riskScore >= 10 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium">
                        Risk: {contact.riskScore}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${statusColor(contact.status)}`} />
                    <p className="text-xs text-muted-foreground truncate">{statusLabel(contact)}</p>
                  </div>
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">No contacts found</p>
            )}
          </>
        ) : (
          <>
            <div className="p-3">
              <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                <Plus className="h-3.5 w-3.5" /> Create Group
              </Button>
            </div>
            {filteredGroups.map(group => (
              <button
                key={group._id}
                onClick={() => onSelectGroup(group)}
                className={`w-full flex items-center gap-3 p-3 text-left transition-colors hover:bg-secondary/50 ${
                  selectedGroup?._id === group._id ? 'bg-secondary' : ''
                }`}
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{group.groupName}</p>
                  <p className="text-xs text-muted-foreground truncate">{group.members.length} members</p>
                </div>
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
