import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types';
import { demoContacts } from '@/data/demoData';
import Header from '@/components/Header';
import ChatSidebar from '@/components/ChatSidebar';
import ChatWindow from '@/components/ChatWindow';
import { MessageSquare } from 'lucide-react';

export default function ChatPage() {
  const { user } = useAuth();
  const [selectedContact, setSelectedContact] = useState<User | null>(null);

  const contacts = demoContacts.filter(c => c._id !== user?._id);

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <ChatSidebar
          contacts={contacts}
          selectedContact={selectedContact}
          onSelectContact={setSelectedContact}
        />
        {selectedContact ? (
          <ChatWindow contact={selectedContact} />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-background">
            <div className="text-center text-muted-foreground">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm mt-1">Choose a contact to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
