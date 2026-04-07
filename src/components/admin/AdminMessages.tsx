import React, { useState } from 'react';
import { getAllDemoMessages } from '@/data/demoData';
import UserAvatar from '@/components/UserAvatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Trash2, Flag, AlertTriangle, History } from 'lucide-react';

export default function AdminMessages() {
  const [messageFilter, setMessageFilter] = useState('');
  const [showFlaggedOnly, setShowFlaggedOnly] = useState(false);
  const [messages, setMessages] = useState(getAllDemoMessages());
  const [historyView, setHistoryView] = useState<{ message: string; editedAt: string }[] | null>(null);

  const filtered = messages.filter(m => {
    if (showFlaggedOnly && !m.flagged) return false;
    if (messageFilter && !m.message.toLowerCase().includes(messageFilter.toLowerCase())) return false;
    return !m.deletedByAdmin;
  });

  const deleteMessage = (id: string) => {
    setMessages(prev => prev.map(m => m._id === id ? { ...m, deletedByAdmin: true } : m));
  };

  return (
    <div className="animate-fade-in space-y-4">
      <h2 className="text-xl font-bold text-foreground">Message Monitor</h2>
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Filter by keyword..." value={messageFilter} onChange={e => setMessageFilter(e.target.value)} className="pl-9" />
        </div>
        <Button variant={showFlaggedOnly ? 'default' : 'outline'} size="sm" onClick={() => setShowFlaggedOnly(!showFlaggedOnly)}>
          <Flag className="h-4 w-4 mr-1" /> Flagged Only
        </Button>
      </div>

      {/* History modal */}
      {historyView && (
        <div className="fixed inset-0 bg-background/80 z-50 flex items-center justify-center" onClick={() => setHistoryView(null)}>
          <div className="bg-card border rounded-xl p-4 w-80 max-h-64 overflow-y-auto shadow-lg" onClick={e => e.stopPropagation()}>
            <span className="text-sm font-semibold text-foreground">Edit History</span>
            {historyView.map((h, i) => (
              <div key={i} className="border-b last:border-0 py-2">
                <p className="text-xs text-muted-foreground">{new Date(h.editedAt).toLocaleString()}</p>
                <p className="text-sm text-foreground mt-0.5">{h.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {filtered.map(msg => (
          <div key={msg._id} className={`bg-card border rounded-xl p-3 flex items-start gap-3 ${msg.flagged ? 'border-destructive/50 bg-destructive/5' : ''}`}>
            <UserAvatar name={msg.sender.name} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-sm font-medium text-foreground">{msg.sender.name}</span>
                <span className="text-xs text-muted-foreground">→</span>
                <span className="text-sm text-muted-foreground">{msg.receiver.name}</span>
                <span className="text-xs text-muted-foreground ml-auto">{new Date(msg.createdAt).toLocaleString()}</span>
              </div>
              <p className="text-sm text-foreground">{msg.message}</p>
              {msg.flagged && (
                <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> {msg.flagReason}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {msg.editHistory.length > 0 && (
                <Button variant="ghost" size="icon" className="text-muted-foreground h-8 w-8" onClick={() => setHistoryView(msg.editHistory)}>
                  <History className="h-4 w-4" />
                </Button>
              )}
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-8 w-8" onClick={() => deleteMessage(msg._id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">No messages found</p>}
      </div>
    </div>
  );
}
