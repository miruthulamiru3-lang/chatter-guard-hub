import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, Group } from '@/types';
import { getAllRegisteredUsers } from '@/services/userStore';
import Header from '@/components/Header';
import ChatSidebar from '@/components/ChatSidebar';
import ChatWindow from '@/components/ChatWindow';
import { MessageSquare, Users } from 'lucide-react';

export default function ChatPage() {
  const { user } = useAuth();
  const [selectedContact, setSelectedContact] = useState<User | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  // Get all registered users except self
  const contacts = useMemo(() => {
    return getAllRegisteredUsers().filter(c => c._id !== user?._id);
  }, [user]);

  const handleSelectContact = (contact: User) => {
    setSelectedContact(contact);
    setSelectedGroup(null);
  };

  const handleSelectGroup = (group: Group) => {
    setSelectedGroup(group);
    setSelectedContact(null);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <ChatSidebar
          contacts={contacts}
          selectedContact={selectedContact}
          onSelectContact={handleSelectContact}
          selectedGroup={selectedGroup}
          onSelectGroup={handleSelectGroup}
        />
        {selectedContact ? (
          <ChatWindow contact={selectedContact} />
        ) : selectedGroup ? (
          <div className="flex-1 flex items-center justify-center bg-background">
            <div className="text-center text-muted-foreground">
              <Users className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">{selectedGroup.groupName}</p>
              <p className="text-sm mt-1">{selectedGroup.members.length} members • Group chat</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-background">
            <div className="text-center text-muted-foreground">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">
                {contacts.length === 0 ? 'No other users yet' : 'Select a conversation'}
              </p>
              <p className="text-sm mt-1">
                {contacts.length === 0 ? 'Other users will appear here once they register' : 'Choose a contact or group to start chatting'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
