import React, { useState, useRef, useEffect } from 'react';
import { User, Message } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { getDemoMessages } from '@/data/demoData';
import UserAvatar from '@/components/UserAvatar';
import { Send, Paperclip, Search, Check, CheckCheck, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ChatWindowProps {
  contact: User;
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'seen') return <CheckCheck className="h-3.5 w-3.5 text-primary" />;
  if (status === 'delivered') return <CheckCheck className="h-3.5 w-3.5 text-muted-foreground" />;
  return <Check className="h-3.5 w-3.5 text-muted-foreground" />;
}

export default function ChatWindow({ contact }: ChatWindowProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && contact) {
      setMessages(getDemoMessages(user._id, contact._id));
    }
  }, [user, contact]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !user) return;
    const newMsg: Message = {
      _id: `msg-new-${Date.now()}`,
      sender: user,
      receiver: contact,
      message: input.trim(),
      file: '',
      fileType: '',
      fileName: '',
      status: 'sent',
      flagged: false,
      flagReason: '',
      deletedByAdmin: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, newMsg]);
    setInput('');

    // Simulate typing + reply
    setTimeout(() => setIsTyping(true), 1000);
    setTimeout(() => {
      setIsTyping(false);
      const reply: Message = {
        _id: `msg-reply-${Date.now()}`,
        sender: contact,
        receiver: user,
        message: 'Got it, thanks! 👍',
        file: '',
        fileType: '',
        fileName: '',
        status: 'sent',
        flagged: false,
        flagReason: '',
        deletedByAdmin: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, reply]);
    }, 3000);
  };

  const filteredMessages = searchQuery
    ? messages.filter(m => m.message.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  return (
    <div className="flex-1 flex flex-col h-full bg-background">
      {/* Chat header */}
      <div className="h-14 border-b bg-card flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <UserAvatar name={contact.name} size="sm" isOnline={contact.status === 'online'} />
          <div>
            <p className="text-sm font-semibold text-foreground">{contact.name}</p>
            <p className="text-xs text-muted-foreground">
              {contact.status === 'online' ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {searchOpen ? (
            <div className="flex items-center gap-2 animate-slide-in-right">
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="h-8 w-48"
                autoFocus
              />
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSearchOpen(false); setSearchQuery(''); }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={() => setSearchOpen(true)}>
              <Search className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-1">
        {filteredMessages.map(msg => {
          const isMine = msg.sender._id === user?._id;
          return (
            <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              <div
                className={`max-w-[70%] px-3 py-2 rounded-2xl ${
                  isMine
                    ? 'bg-chat-sent text-chat-sent-foreground rounded-br-md'
                    : 'bg-chat-received text-chat-received-foreground rounded-bl-md'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                <div className={`flex items-center gap-1 mt-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <span className={`text-[10px] ${isMine ? 'text-chat-sent-foreground/70' : 'text-muted-foreground'}`}>
                    {formatTime(msg.createdAt)}
                  </span>
                  {isMine && <StatusIcon status={msg.status} />}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-chat-received px-4 py-2 rounded-2xl rounded-bl-md">
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse-dot" style={{ animationDelay: '0s' }} />
                <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse-dot" style={{ animationDelay: '0.2s' }} />
                <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse-dot" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input area */}
      <div className="border-t bg-card p-3 shrink-0">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-muted-foreground shrink-0">
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            placeholder="Type a message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            className="flex-1"
          />
          <Button size="icon" onClick={handleSend} disabled={!input.trim()} className="shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
