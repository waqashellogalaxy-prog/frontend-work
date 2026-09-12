import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';

type Mode = 'login' | 'register';

interface LoginPageProps {
  onAuthSuccess: () => void;
}

export function LoginPage({ onAuthSuccess }: LoginPageProps) {
  const { login, register, loading, error, clearError } = useApp();
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        if (!name.trim()) {
          setLocalError('Name is required');
          return;
        }
        await register(name, password, email);
      }
      onAuthSuccess();
    } catch {
      // error is set in context
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setLocalError(null);
    clearError();
  };

  const displayError = localError ?? error;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-800">System Design Interview</h1>
          <p className="text-sm text-slate-500 mt-1">
            {mode === 'login' ? 'Sign in to your account' : 'Create an account'}
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
        >
          {mode === 'register' && (
            <Input
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          )}
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          {displayError && (
            <p className="text-sm text-red-600">{displayError}</p>
          )}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? <Spinner size={16} /> : mode === 'login' ? 'Sign In' : 'Sign Up'}
          </Button>
          <p className="text-center text-sm text-slate-500">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={switchMode}
              className="font-medium text-slate-700 hover:underline"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </form>
        <div className="mt-4 rounded-md bg-slate-100 p-3 text-xs text-slate-500">
          <p className="font-medium text-slate-600 mb-1">Demo accounts:</p>
          <p>alice@example.com / any password</p>
          <p>bob@example.com / any password</p>
        </div>
      </div>
    </div>
  );
}
