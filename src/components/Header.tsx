import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Moon, Sun, LogOut, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <header className="h-14 border-b bg-card flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-6 w-6 text-primary" />
        <h1 className="text-lg font-semibold text-foreground">CommTrack</h1>
      </div>
      <div className="flex items-center gap-2">
        {user && (
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {user.name} ({user.role})
          </span>
        )}
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
