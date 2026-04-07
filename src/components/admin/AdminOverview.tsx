import React from 'react';
import { Users, MessageSquare, AlertTriangle, Activity, Clock, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import UserAvatar from '@/components/UserAvatar';
import { Analytics } from '@/types';

interface Props {
  analytics: Analytics;
}

export default function AdminOverview({ analytics }: Props) {
  const stats = [
    { label: 'Total Users', value: analytics.totalUsers, icon: <Users className="h-5 w-5" />, color: 'text-primary' },
    { label: 'Online Now', value: analytics.onlineUsers, icon: <Activity className="h-5 w-5" />, color: 'text-accent' },
    { label: 'Messages', value: analytics.totalMessages, icon: <MessageSquare className="h-5 w-5" />, color: 'text-primary' },
    { label: 'Flagged', value: analytics.flaggedMessages, icon: <AlertTriangle className="h-5 w-5" />, color: 'text-destructive' },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <h2 className="text-xl font-bold text-foreground">Dashboard Overview</h2>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-card border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <span className={s.color}>{s.icon}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Messages per day */}
        <div className="bg-card border rounded-xl p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">Messages (Last 30 Days)</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.messagesPerDay.slice(-14)}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="_id" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => v.slice(5)} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Message growth trend */}
        <div className="bg-card border rounded-xl p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> Message Growth (Weekly)
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.messageGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="_id" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => `W${v}`} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} />
                <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* High risk users + Peak hours */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border rounded-xl p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" /> High Risk Users
          </h3>
          <div className="space-y-3">
            {analytics.highRiskUsers.map(u => (
              <div key={u._id} className="flex items-center gap-3 p-2 rounded-lg bg-destructive/5 border border-destructive/20">
                <UserAvatar name={u.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-destructive">{u.riskScore}</span>
                  <p className="text-[10px] text-muted-foreground">risk score</p>
                </div>
                {u.isBlocked && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium">Blocked</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border rounded-xl p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4" /> Peak Chat Hours
          </h3>
          <div className="space-y-2">
            {analytics.peakHours.map(h => (
              <div key={h._id} className="flex items-center gap-3">
                <span className="text-sm font-mono text-muted-foreground w-12">{h._id}:00</span>
                <div className="flex-1 bg-secondary rounded-full h-5 overflow-hidden">
                  <div className="h-full bg-primary/70 rounded-full" style={{ width: `${(h.count / analytics.peakHours[0].count) * 100}%` }} />
                </div>
                <span className="text-xs font-medium text-foreground w-10 text-right">{h.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
