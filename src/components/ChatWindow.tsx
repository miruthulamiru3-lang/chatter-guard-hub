import React, { useState, useRef, useEffect } from 'react';
import { User, Message, EditHistoryEntry } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { getDemoMessages } from '@/data/demoData';
import UserAvatar from '@/components/UserAvatar';
import { Send, Paperclip, Search, Check, CheckCheck, X, Edit2, Trash2, MoreVertical, History, Download, FileText } from 'lucide-react';
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editInput, setEditInput] = useState('');
  const [contextMenu, setContextMenu] = useState<string | null>(null);
  const [historyView, setHistoryView] = useState<EditHistoryEntry[] | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && contact) setMessages(getDemoMessages(user._id, contact._id));
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
      file: '', fileType: '', fileName: '',
      status: 'sent', flagged: false, flagReason: '',
      deletedByAdmin: false, deletedBySender: false,
      editHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, newMsg]);
    setInput('');

    // Simulate reply
    setTimeout(() => setIsTyping(true), 1000);
    setTimeout(() => {
      setIsTyping(false);
      const reply: Message = {
        _id: `msg-reply-${Date.now()}`,
        sender: contact, receiver: user,
        message: 'Got it, thanks! 👍',
        file: '', fileType: '', fileName: '',
        status: 'sent', flagged: false, flagReason: '',
        deletedByAdmin: false, deletedBySender: false,
        editHistory: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, reply]);
    }, 3000);
  };

  const handleEdit = (msgId: string) => {
    const msg = messages.find(m => m._id === msgId);
    if (!msg) return;
    setEditingId(msgId);
    setEditInput(msg.message);
    setContextMenu(null);
  };

  const saveEdit = () => {
    if (!editingId || !editInput.trim()) return;
    setMessages(prev => prev.map(m => {
      if (m._id === editingId) {
        return {
          ...m,
          editHistory: [...m.editHistory, { message: m.message, editedAt: new Date().toISOString() }],
          message: editInput.trim(),
          updatedAt: new Date().toISOString(),
        };
      }
      return m;
    }));
    setEditingId(null);
    setEditInput('');
  };

  const handleDelete = (msgId: string) => {
    setMessages(prev => prev.map(m =>
      m._id === msgId ? { ...m, deletedBySender: true, message: 'This message was deleted' } : m
    ));
    setContextMenu(null);
  };

  const exportChat = (format: 'csv' | 'json') => {
    const data = messages.map(m => ({
      time: new Date(m.createdAt).toLocaleString(),
      sender: m.sender.name,
      message: m.message,
      status: m.status,
      flagged: m.flagged,
    }));
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `chat-${contact.name}.json`; a.click();
    } else {
      const header = 'Time,Sender,Message,Status,Flagged\n';
      const rows = data.map(d => `"${d.time}","${d.sender}","${d.message.replace(/"/g, '""')}","${d.status}","${d.flagged}"`).join('\n');
      const blob = new Blob([header + rows], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `chat-${contact.name}.csv`; a.click();
    }
  };

  const filteredMessages = searchQuery
    ? messages.filter(m => m.message.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  return (
    <div className="flex-1 flex flex-col h-full bg-background">
      {/* Header */}
      <div className="h-14 border-b bg-card flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <UserAvatar name={contact.name} size="sm" isOnline={contact.status === 'online'} />
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground">{contact.name}</p>
              {contact.role !== 'user' && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                  contact.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-warning/10 text-warning'
                }`}>{contact.role}</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {contact.status === 'online' ? 'Online' : contact.status === 'idle' ? 'Idle' : 'Offline'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {/* Export */}
          <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={() => exportChat('csv')} title="Export CSV">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={() => exportChat('json')} title="Export JSON">
            <FileText className="h-4 w-4" />
          </Button>
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

      {/* Edit history modal */}
      {historyView && (
        <div className="fixed inset-0 bg-background/80 z-50 flex items-center justify-center" onClick={() => setHistoryView(null)}>
          <div className="bg-card border rounded-xl p-4 w-80 max-h-64 overflow-y-auto shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-foreground">Edit History</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setHistoryView(null)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
            {historyView.map((h, i) => (
              <div key={i} className="border-b last:border-0 py-2">
                <p className="text-xs text-muted-foreground">{new Date(h.editedAt).toLocaleString()}</p>
                <p className="text-sm text-foreground mt-0.5">{h.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-1">
        {filteredMessages.map(msg => {
          const isMine = msg.sender._id === user?._id;
          const isDeleted = msg.deletedBySender;
          return (
            <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} animate-fade-in group`}>
              <div className="relative max-w-[70%]">
                {/* Context menu trigger */}
                {isMine && !isDeleted && (
                  <div className="absolute -left-8 top-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setContextMenu(contextMenu === msg._id ? null : msg._id)}>
                      <MoreVertical className="h-3 w-3 text-muted-foreground" />
                    </Button>
                    {contextMenu === msg._id && (
                      <div className="absolute left-0 top-full mt-1 bg-card border rounded-lg shadow-lg py-1 z-10 w-28">
                        <button onClick={() => handleEdit(msg._id)} className="w-full text-left px-3 py-1.5 text-xs text-foreground hover:bg-secondary flex items-center gap-2">
                          <Edit2 className="h-3 w-3" /> Edit
                        </button>
                        <button onClick={() => handleDelete(msg._id)} className="w-full text-left px-3 py-1.5 text-xs text-destructive hover:bg-secondary flex items-center gap-2">
                          <Trash2 className="h-3 w-3" /> Delete
                        </button>
                        {msg.editHistory.length > 0 && (
                          <button onClick={() => { setHistoryView(msg.editHistory); setContextMenu(null); }} className="w-full text-left px-3 py-1.5 text-xs text-foreground hover:bg-secondary flex items-center gap-2">
                            <History className="h-3 w-3" /> History
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className={`px-3 py-2 rounded-2xl ${
                  isDeleted ? 'bg-muted italic' :
                  msg.flagged ? 'bg-destructive/10 border border-destructive/30' :
                  isMine ? 'bg-chat-sent text-chat-sent-foreground rounded-br-md' :
                  'bg-chat-received text-chat-received-foreground rounded-bl-md'
                }`}>
                  {editingId === msg._id ? (
                    <div className="flex items-center gap-2">
                      <Input value={editInput} onChange={e => setEditInput(e.target.value)} className="h-7 text-xs" autoFocus onKeyDown={e => e.key === 'Enter' && saveEdit()} />
                      <Button size="icon" className="h-7 w-7 shrink-0" onClick={saveEdit}><Check className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => setEditingId(null)}><X className="h-3 w-3" /></Button>
                    </div>
                  ) : (
                    <>
                      <p className={`text-sm whitespace-pre-wrap break-words ${isDeleted ? 'text-muted-foreground' : ''}`}>{msg.message}</p>
                      {msg.flagged && <p className="text-[10px] text-destructive mt-1">⚠ {msg.flagReason}</p>}
                    </>
                  )}
                  <div className={`flex items-center gap-1 mt-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
                    {msg.editHistory.length > 0 && !isDeleted && (
                      <button onClick={() => setHistoryView(msg.editHistory)} className="text-[10px] text-muted-foreground hover:underline mr-1">edited</button>
                    )}
                    <span className={`text-[10px] ${isMine ? 'text-chat-sent-foreground/70' : 'text-muted-foreground'}`}>
                      {formatTime(msg.createdAt)}
                    </span>
                    {isMine && <StatusIcon status={msg.status} />}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

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
