import React, { useState } from 'react';
import { User } from '@/types';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import UserAvatar from '@/components/UserAvatar';

interface ChatSidebarProps {
  contacts: User[];
  selectedContact: User | null;
  onSelectContact: (user: User) => void;
}

export default function ChatSidebar({ contacts, selectedContact, onSelectContact }: ChatSidebarProps) {
  const [search, setSearch] = useState('');

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-80 border-r bg-card flex flex-col shrink-0 h-full">
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {filtered.map(contact => (
          <button
            key={contact._id}
            onClick={() => onSelectContact(contact)}
            className={`w-full flex items-center gap-3 p-3 text-left transition-colors hover:bg-secondary/50 ${
              selectedContact?._id === contact._id ? 'bg-secondary' : ''
            }`}
          >
            <UserAvatar name={contact.name} isOnline={contact.status === 'online'} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{contact.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {contact.status === 'online' ? 'Online' : `Last seen ${new Date(contact.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
              </p>
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">No contacts found</p>
        )}
      </div>
    </div>
  );
}
