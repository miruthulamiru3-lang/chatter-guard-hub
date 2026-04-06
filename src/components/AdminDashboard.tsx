import React, { useState } from 'react';
import Header from '@/components/Header';
import { demoContacts, getAllDemoMessages, demoAnalytics } from '@/data/demoData';
import UserAvatar from '@/components/UserAvatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Users, MessageSquare, AlertTriangle, Activity,
  Search, Trash2, Flag, BarChart3, Shield
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

type Tab = 'overview' | 'users' | 'messages' | 'analytics';

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('overview');
  const [messageFilter, setMessageFilter] = useState('');
  const [showFlaggedOnly, setShowFlaggedOnly] = useState(false);
  const allMessages = getAllDemoMessages();
  const analytics = demoAnalytics;

  const filteredMessages = allMessages.filter(m => {
    if (showFlaggedOnly && !m.flagged) return false;
    if (messageFilter && !m.message.toLowerCase().includes(messageFilter.toLowerCase())) return false;
    return true;
  });

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'users', label: 'Users', icon: <Users className="h-4 w-4" /> },
    { id: 'messages', label: 'Messages', icon: <MessageSquare className="h-4 w-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <Activity className="h-4 w-4" /> },
  ];

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        {/* Admin sidebar */}
        <div className="w-56 border-r bg-card flex flex-col shrink-0">
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground text-sm">Admin Panel</span>
            </div>
          </div>
          <nav className="flex-1 p-2">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors mb-1 ${
                  tab === t.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {tab === 'overview' && (
            <div className="animate-fade-in space-y-6">
              <h2 className="text-xl font-bold text-foreground">Dashboard Overview</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Users', value: analytics.totalUsers, icon: <Users className="h-5 w-5" />, color: 'text-primary' },
                  { label: 'Online Now', value: analytics.onlineUsers, icon: <Activity className="h-5 w-5" />, color: 'text-accent' },
                  { label: 'Messages', value: analytics.totalMessages, icon: <MessageSquare className="h-5 w-5" />, color: 'text-primary' },
                  { label: 'Flagged', value: analytics.flaggedMessages, icon: <AlertTriangle className="h-5 w-5" />, color: 'text-destructive' },
                ].map(stat => (
                  <div key={stat.label} className="bg-card border rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">{stat.label}</span>
                      <span className={stat.color}>{stat.icon}</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Mini chart */}
              <div className="bg-card border rounded-xl p-4">
                <h3 className="text-sm font-semibold text-foreground mb-4">Messages (Last 14 Days)</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.messagesPerDay}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="_id" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => v.slice(5)} />
                      <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }}
                      />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {tab === 'users' && (
            <div className="animate-fade-in space-y-4">
              <h2 className="text-xl font-bold text-foreground">All Users</h2>
              <div className="bg-card border rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-secondary/50">
                      <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">User</th>
                      <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Email</th>
                      <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Role</th>
                      <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demoContacts.map(u => (
                      <tr key={u._id} className="border-b last:border-0 hover:bg-secondary/30 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <UserAvatar name={u.name} size="sm" isOnline={u.status === 'online'} />
                            <span className="text-sm font-medium text-foreground">{u.name}</span>
                          </div>
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">{u.email}</td>
                        <td className="p-3">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${u.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-secondary text-secondary-foreground'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1 text-xs ${u.status === 'online' ? 'text-accent' : 'text-muted-foreground'}`}>
                            <span className={`h-2 w-2 rounded-full ${u.status === 'online' ? 'bg-online' : 'bg-offline'}`} />
                            {u.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'messages' && (
            <div className="animate-fade-in space-y-4">
              <h2 className="text-xl font-bold text-foreground">Message Monitor</h2>
              <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Filter by keyword..."
                    value={messageFilter}
                    onChange={e => setMessageFilter(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button
                  variant={showFlaggedOnly ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowFlaggedOnly(!showFlaggedOnly)}
                >
                  <Flag className="h-4 w-4 mr-1" />
                  Flagged Only
                </Button>
              </div>
              <div className="space-y-2">
                {filteredMessages.map(msg => (
                  <div
                    key={msg._id}
                    className={`bg-card border rounded-xl p-3 flex items-start gap-3 ${
                      msg.flagged ? 'border-destructive/50 bg-destructive/5' : ''
                    }`}
                  >
                    <UserAvatar name={msg.sender.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-foreground">{msg.sender.name}</span>
                        <span className="text-xs text-muted-foreground">→</span>
                        <span className="text-sm text-muted-foreground">{msg.receiver.name}</span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {new Date(msg.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-foreground">{msg.message}</p>
                      {msg.flagged && (
                        <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {msg.flagReason}
                        </p>
                      )}
                    </div>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {filteredMessages.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No messages found</p>
                )}
              </div>
            </div>
          )}

          {tab === 'analytics' && (
            <div className="animate-fade-in space-y-6">
              <h2 className="text-xl font-bold text-foreground">Analytics</h2>

              {/* Chart */}
              <div className="bg-card border rounded-xl p-4">
                <h3 className="text-sm font-semibold text-foreground mb-4">Messages Per Day</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.messagesPerDay}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="_id" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => v.slice(5)} />
                      <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Active users */}
              <div className="bg-card border rounded-xl p-4">
                <h3 className="text-sm font-semibold text-foreground mb-4">Most Active Users</h3>
                <div className="space-y-3">
                  {analytics.activeUsers.map((u, i) => (
                    <div key={u._id} className="flex items-center gap-3">
                      <span className="text-sm font-bold text-muted-foreground w-6">#{i + 1}</span>
                      <UserAvatar name={u.name} size="sm" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-foreground">{u.messageCount}</p>
                        <p className="text-xs text-muted-foreground">messages</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
