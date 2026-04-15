import React, { useState, useMemo } from 'react';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { getAllRegisteredUsers } from '@/services/userStore';
import { Users, MessageSquare, Activity, Shield, BarChart3, AlertTriangle } from 'lucide-react';
import AdminOverview from '@/components/admin/AdminOverview';
import AdminUsers from '@/components/admin/AdminUsers';
import AdminMessages from '@/components/admin/AdminMessages';
import AdminAnalytics from '@/components/admin/AdminAnalytics';
import type { Analytics } from '@/types';

type Tab = 'overview' | 'users' | 'messages' | 'analytics';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('overview');
  const isModerator = user?.role === 'moderator';

  const analytics: Analytics = useMemo(() => {
    const allUsers = getAllRegisteredUsers();
    const onlineCount = allUsers.filter(u => u.status === 'online').length;
    const highRisk = allUsers.filter(u => u.riskScore >= 10).sort((a, b) => b.riskScore - a.riskScore);

    return {
      totalUsers: allUsers.length,
      onlineUsers: onlineCount,
      totalMessages: 0,
      flaggedMessages: 0,
      messagesPerDay: [],
      peakHours: [],
      activeUsers: allUsers.map(u => ({ _id: u._id, name: u.name, email: u.email, messageCount: 0 })),
      messageGrowth: [],
      highRiskUsers: highRisk,
    };
  }, []);

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
        <div className="w-56 border-r bg-card flex flex-col shrink-0">
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              {isModerator ? <AlertTriangle className="h-5 w-5 text-warning" /> : <Shield className="h-5 w-5 text-primary" />}
              <span className="font-semibold text-foreground text-sm">
                {isModerator ? 'Moderator Panel' : 'Admin Panel'}
              </span>
            </div>
          </div>
          <nav className="flex-1 p-2">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors mb-1 ${
                  tab === t.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {tab === 'overview' && <AdminOverview analytics={analytics} />}
          {tab === 'users' && <AdminUsers />}
          {tab === 'messages' && <AdminMessages />}
          {tab === 'analytics' && <AdminAnalytics analytics={analytics} />}
        </div>
      </div>
    </div>
  );
}
