import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageSquare, Moon, Sun, Shield, User, Eye, Lock, ArrowLeft, KeyRound, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';
// Password reset is handled by the backend (POST /api/auth/forgot-password + /api/auth/reset-password).
// The localStorage helpers below are kept only as a fallback if the backend isn't running yet.
import { resetPassword, emailExists } from '@/services/userStore';
import { seedDemoData, DEMO_ACCOUNTS, isDemoSeeded } from '@/services/demoSeeder';

type Mode = 'login' | 'register' | 'forgot';

export default function LoginPage() {
  const { login, register } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'admin' | 'moderator'>('user');
  const [securityCode, setSecurityCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot password flow state
  const [forgotStep, setForgotStep] = useState<'email' | 'reset' | 'done'>('email');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Demo data state
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoMessage, setDemoMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    isDemoSeeded() ? { type: 'success', text: 'Demo data already loaded — pick an account below.' } : null
  );

  const handleSeedDemo = async () => {
    setDemoLoading(true);
    setDemoMessage(null);
    try {
      const res = await seedDemoData();
      const parts = [
        `${res.accountsCreated} account(s) created`,
        res.accountsExisted > 0 && `${res.accountsExisted} already existed`,
        `${res.messagesSeeded} messages seeded`,
      ].filter(Boolean);
      setDemoMessage({
        type: res.errors.length === DEMO_ACCOUNTS.length ? 'error' : 'success',
        text: parts.join(' • ') + (res.errors.length ? ` (${res.errors.length} errors)` : ''),
      });
    } catch (err: any) {
      setDemoMessage({ type: 'error', text: err.message || 'Demo seeding failed — is the backend running?' });
    } finally {
      setDemoLoading(false);
    }
  };

  const handleDemoLogin = async (acc: typeof DEMO_ACCOUNTS[number]) => {
    setError('');
    setLoading(true);
    try {
      await login(acc.email, acc.password);
    } catch (err: any) {
      setError(err.message || 'Demo sign-in failed. Click "Load Demo Data" first.');
    } finally {
      setLoading(false);
    }
  };


  const resetFormState = () => {
    setError('');
    setName('');
    setPassword('');
    setSecurityCode('');
    setNewPassword('');
    setConfirmPassword('');
    setForgotStep('email');
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    resetFormState();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'register') {
        await register(name, email, password, role, securityCode);
      } else if (mode === 'login') {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (forgotStep === 'email') {
        if (!emailExists(email)) {
          throw new Error('No account found with this email address');
        }
        setForgotStep('reset');
      } else if (forgotStep === 'reset') {
        if (newPassword !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        resetPassword(email, newPassword);
        setForgotStep('done');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const roles: { id: 'user' | 'admin' | 'moderator'; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'user', label: 'User', icon: <User className="h-4 w-4" />, desc: 'Send & receive messages' },
    { id: 'moderator', label: 'Moderator', icon: <Eye className="h-4 w-4" />, desc: 'Monitor chats' },
    { id: 'admin', label: 'Admin', icon: <Shield className="h-4 w-4" />, desc: 'Full control' },
  ];

  const needsSecurityCode = mode === 'register' && (role === 'admin' || role === 'moderator');

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

          <div className="bg-card border rounded-xl p-6">
            {mode === 'forgot' ? (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Back to sign in"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <h2 className="text-lg font-semibold text-foreground">Reset Password</h2>
                </div>

                {forgotStep === 'done' ? (
                  <div className="text-center py-4">
                    <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-3">
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">Password Reset Complete</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Your password has been updated. You can now sign in.
                    </p>
                    <Button className="w-full" onClick={() => switchMode('login')}>
                      Back to Sign In
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotSubmit} className="space-y-4">
                    <div className="flex items-start gap-2 bg-muted/50 border rounded-lg p-3">
                      <KeyRound className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <p className="text-xs text-muted-foreground">
                        {forgotStep === 'email'
                          ? 'Enter the email associated with your account to reset your password.'
                          : 'Choose a new password for your account.'}
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="forgot-email">Email</Label>
                      <Input
                        id="forgot-email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        disabled={forgotStep === 'reset'}
                      />
                    </div>

                    {forgotStep === 'reset' && (
                      <>
                        <div>
                          <Label htmlFor="new-password">New Password</Label>
                          <Input
                            id="new-password"
                            type="password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            placeholder="••••••"
                            required
                            minLength={6}
                          />
                        </div>
                        <div>
                          <Label htmlFor="confirm-password">Confirm Password</Label>
                          <Input
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            placeholder="••••••"
                            required
                            minLength={6}
                          />
                        </div>
                      </>
                    )}

                    {error && (
                      <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                        {error}
                      </div>
                    )}

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading
                        ? 'Please wait...'
                        : forgotStep === 'email'
                        ? 'Continue'
                        : 'Reset Password'}
                    </Button>
                  </form>
                )}
              </>
            ) : (
              <>
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  {mode === 'register' ? 'Create Account' : 'Sign In'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === 'register' && (
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
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      {mode === 'login' && (
                        <button
                          type="button"
                          onClick={() => switchMode('forgot')}
                          className="text-xs text-primary font-medium hover:underline"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••" required minLength={6} />
                  </div>

                  {mode === 'register' && (
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
                    {loading ? 'Please wait...' : mode === 'register' ? 'Create Account' : 'Sign In'}
                  </Button>
                </form>
                <p className="text-center text-sm text-muted-foreground mt-4">
                  {mode === 'register' ? 'Already have an account?' : "Don't have an account?"}{' '}
                  <button
                    className="text-primary font-medium hover:underline"
                    onClick={() => switchMode(mode === 'register' ? 'login' : 'register')}
                  >
                    {mode === 'register' ? 'Sign In' : 'Register'}
                  </button>
                </p>

                {mode === 'login' && (
                  <div className="mt-6 pt-4 border-t border-border">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold text-foreground">Try the Demo</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      Seed sample users, conversations, and flagged messages, then sign in with one click.
                    </p>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full mb-3"
                      onClick={handleSeedDemo}
                      disabled={demoLoading}
                    >
                      {demoLoading ? (
                        <><Loader2 className="h-3 w-3 mr-2 animate-spin" /> Loading demo data...</>
                      ) : (
                        <>{isDemoSeeded() ? 'Re-seed Demo Data' : 'Load Demo Data'}</>
                      )}
                    </Button>

                    {demoMessage && (
                      <div
                        className={`text-xs rounded-lg px-3 py-2 mb-3 border ${
                          demoMessage.type === 'success'
                            ? 'bg-primary/5 border-primary/20 text-foreground'
                            : 'bg-destructive/10 border-destructive/20 text-destructive'
                        }`}
                      >
                        {demoMessage.text}
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-2">
                      {DEMO_ACCOUNTS.slice(0, 3).map(acc => {
                        const meta =
                          acc.role === 'admin'
                            ? { icon: <Shield className="h-3 w-3" />, label: 'Admin' }
                            : acc.role === 'moderator'
                            ? { icon: <Eye className="h-3 w-3" />, label: 'Moderator' }
                            : { icon: <User className="h-3 w-3" />, label: 'User' };
                        return (
                          <button
                            key={acc.email}
                            type="button"
                            onClick={() => handleDemoLogin(acc)}
                            disabled={loading || demoLoading}
                            className="py-2 px-2 rounded-lg border border-border bg-secondary text-secondary-foreground text-xs font-medium transition-colors hover:bg-primary hover:text-primary-foreground hover:border-primary disabled:opacity-50 flex flex-col items-center gap-1"
                          >
                            {meta.icon}
                            {meta.label}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2 text-center">
                      Password for all demo accounts: <code className="font-mono">demo1234</code>
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}