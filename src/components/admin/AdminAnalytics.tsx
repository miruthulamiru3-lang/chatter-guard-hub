import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import UserAvatar from '@/components/UserAvatar';
import { Analytics } from '@/types';

interface Props {
  analytics: Analytics;
}

export default function AdminAnalytics({ analytics }: Props) {
  return (
    <div className="animate-fade-in space-y-6">
      <h2 className="text-xl font-bold text-foreground">Analytics</h2>

      {/* Messages per day chart */}
      <div className="bg-card border rounded-xl p-4">
        <h3 className="text-sm font-semibold text-foreground mb-4">Messages Per Day</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics.messagesPerDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="_id" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => v.slice(5)} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} />
              <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.1} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Growth + Active users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border rounded-xl p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">Weekly Growth</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.messageGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="_id" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => `W${v}`} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

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
    </div>
  );
}
