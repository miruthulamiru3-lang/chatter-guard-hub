import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Moon, Sun, LogOut, MessageSquare, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { demoNotifications } from '@/data/demoData';
import type { Notification } from '@/types';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(demoNotifications);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
  };

  return (
    <header className="h-14 border-b bg-card flex items-center justify-between px-4 shrink-0 relative z-50">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-6 w-6 text-primary" />
        <h1 className="text-lg font-semibold text-foreground">CommTrack</h1>
        {user && (
          <span className={`ml-2 text-[10px] font-medium px-2 py-0.5 rounded-full ${
            user.role === 'admin' ? 'bg-primary/10 text-primary' :
            user.role === 'moderator' ? 'bg-warning/10 text-warning' :
            'bg-secondary text-secondary-foreground'
          }`}>
            {user.role}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1">
        {user && (
          <span className="text-sm text-muted-foreground hidden sm:inline mr-2">{user.name}</span>
        )}
        {/* Notifications */}
        <div className="relative">
          <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={() => setShowNotifs(!showNotifs)}>
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
          </Button>
          {showNotifs && (
            <div className="absolute right-0 top-full mt-1 w-80 bg-card border rounded-xl shadow-lg overflow-hidden animate-fade-in z-50">
              <div className="p-3 border-b flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Notifications</span>
                <span className="text-xs text-muted-foreground">{unreadCount} unread</span>
              </div>
              <div className="max-h-64 overflow-y-auto scrollbar-thin">
                {notifications.map(n => (
                  <button
                    key={n._id}
                    onClick={() => markRead(n._id)}
                    className={`w-full text-left p-3 border-b last:border-0 transition-colors hover:bg-secondary/50 ${!n.read ? 'bg-primary/5' : ''}`}
                  >
                    <div className="flex items-start gap-2">
                      <span className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                        n.type === 'alert' ? 'bg-destructive' : n.type === 'message' ? 'bg-primary' : 'bg-muted-foreground'
                      }`} />
                      <div>
                        <p className="text-xs font-medium text-foreground">{n.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-muted-foreground">
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        {user && (
          <Button variant="ghost" size="icon" onClick={logout} className="text-muted-foreground">
            <LogOut className="h-5 w-5" />
          </Button>
        )}
      </div>
    </header>
  );
}
