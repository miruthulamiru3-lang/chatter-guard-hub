import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageSquare, Moon, Sun, Shield, User, Eye } from 'lucide-react';

export default function LoginPage() {
  const { login, register, setDemoUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'admin' | 'moderator'>('user');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegister) await register(name, email, password, role);
      else await login(email, password);
    } catch {
      setError('Authentication failed');
    }
  };

  const roles: { id: 'user' | 'admin' | 'moderator'; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'user', label: 'User', icon: <User className="h-4 w-4" />, desc: 'Send & receive messages' },
    { id: 'moderator', label: 'Moderator', icon: <Eye className="h-4 w-4" />, desc: 'Monitor chats' },
    { id: 'admin', label: 'Admin', icon: <Shield className="h-4 w-4" />, desc: 'Full control' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="absolute top-4 right-4">
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-muted-foreground">
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-in">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary mb-4">
              <MessageSquare className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">CommTrack</h1>
            <p className="text-muted-foreground mt-1">Online Communication Tracking System</p>
          </div>

          {/* Demo Quick Access */}
          <div className="bg-card border rounded-xl p-4 mb-6">
            <p className="text-sm text-muted-foreground mb-3 text-center">Quick demo access</p>
            <div className="grid grid-cols-3 gap-2">
              {roles.map(r => (
                <Button key={r.id} variant="outline" className="h-auto py-3 flex flex-col items-center gap-1" onClick={() => setDemoUser(r.id)}>
                  <span className="text-primary">{r.icon}</span>
                  <span className="text-xs font-medium">{r.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Login / Register form */}
          <div className="bg-card border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              {isRegister ? 'Create Account' : 'Sign In'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" required />
                </div>
              )}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••" required />
              </div>

              {/* Role selector */}
              <div>
                <Label>Role</Label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {roles.map(r => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id)}
                      className={`py-2 px-2 rounded-lg border text-xs font-medium transition-colors flex flex-col items-center gap-1 ${
                        role === r.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary text-secondary-foreground border-border'
                      }`}
                    >
                      {r.icon}
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full">{isRegister ? 'Create Account' : 'Sign In'}</Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-4">
              {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button className="text-primary font-medium hover:underline" onClick={() => setIsRegister(!isRegister)}>
                {isRegister ? 'Sign In' : 'Register'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
