import React, { useState } from 'react';
import { demoContacts } from '@/data/demoData';
import UserAvatar from '@/components/UserAvatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Ban, ShieldCheck } from 'lucide-react';

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState(demoContacts);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleBlock = (id: string) => {
    setUsers(prev => prev.map(u => u._id === id ? { ...u, isBlocked: !u.isBlocked } : u));
  };

  return (
    <div className="animate-fade-in space-y-4">
      <h2 className="text-xl font-bold text-foreground">All Users</h2>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>
      <div className="bg-card border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-secondary/50">
              <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">User</th>
              <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Email</th>
              <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Role</th>
              <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
              <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Risk</th>
              <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u._id} className="border-b last:border-0 hover:bg-secondary/30 transition-colors">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <UserAvatar name={u.name} size="sm" isOnline={u.status === 'online'} />
                    <span className="text-sm font-medium text-foreground">{u.name}</span>
                    {u.isBlocked && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive">Blocked</span>}
                  </div>
                </td>
                <td className="p-3 text-sm text-muted-foreground">{u.email}</td>
                <td className="p-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    u.role === 'admin' ? 'bg-primary/10 text-primary' :
                    u.role === 'moderator' ? 'bg-warning/10 text-warning' :
                    'bg-secondary text-secondary-foreground'
                  }`}>{u.role}</span>
                </td>
                <td className="p-3">
                  <span className={`inline-flex items-center gap-1 text-xs ${
                    u.status === 'online' ? 'text-accent' : u.status === 'idle' ? 'text-warning' : 'text-muted-foreground'
                  }`}>
                    <span className={`h-2 w-2 rounded-full ${
                      u.status === 'online' ? 'bg-online' : u.status === 'idle' ? 'bg-warning' : 'bg-offline'
                    }`} />
                    {u.status}
                  </span>
                </td>
                <td className="p-3">
                  <span className={`text-sm font-semibold ${u.riskScore >= 20 ? 'text-destructive' : u.riskScore >= 10 ? 'text-warning' : 'text-foreground'}`}>
                    {u.riskScore}
                  </span>
                </td>
                <td className="p-3">
                  <Button variant="ghost" size="sm" onClick={() => toggleBlock(u._id)} className={u.isBlocked ? 'text-accent' : 'text-destructive'}>
                    {u.isBlocked ? <ShieldCheck className="h-4 w-4 mr-1" /> : <Ban className="h-4 w-4 mr-1" />}
                    {u.isBlocked ? 'Unblock' : 'Block'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
