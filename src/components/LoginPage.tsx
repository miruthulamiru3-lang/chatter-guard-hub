import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageSquare, Moon, Sun, Shield, User, Eye, Lock } from 'lucide-react';

export default function LoginPage() {
  const { login, register } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'admin' | 'moderator'>('user');
  const [securityCode, setSecurityCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await register(name, email, password, role, securityCode);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const roles: { id: 'user' | 'admin' | 'moderator'; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'user', label: 'User', icon: <User className="h-4 w-4" />, desc: 'Send & receive messages' },
    { id: 'moderator', label: 'Moderator', icon: <Eye className="h-4 w-4" />, desc: 'Monitor chats' },
    { id: 'admin', label: 'Admin', icon: <Shield className="h-4 w-4" />, desc: 'Full control' },
  ];

  const needsSecurityCode = isRegister && (role === 'admin' || role === 'moderator');

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
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••" required minLength={6} />
              </div>

              {/* Role selector (only on register) */}
              {isRegister && (
                <div>
                  <Label>Role</Label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {roles.map(r => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => { setRole(r.id); setSecurityCode(''); }}
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
              )}

              {/* Security code for admin/moderator */}
              {needsSecurityCode && (
                <div className="border border-warning/30 bg-warning/5 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="h-4 w-4 text-warning" />
                    <Label htmlFor="securityCode" className="text-sm font-medium text-warning">
                      {role === 'admin' ? 'Admin' : 'Moderator'} Security Code
                    </Label>
                  </div>
                  <Input
                    id="securityCode"
                    type="password"
                    value={securityCode}
                    onChange={e => setSecurityCode(e.target.value)}
                    placeholder="Enter security code"
                    required
                  />
                  <p className="text-[10px] text-muted-foreground mt-1.5">
                    Contact your organization admin to get the security code.
                  </p>
                </div>
              )}

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-4">
              {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button className="text-primary font-medium hover:underline" onClick={() => { setIsRegister(!isRegister); setError(''); }}>
                {isRegister ? 'Sign In' : 'Register'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
