import { useState, useEffect } from 'react';
import { useNavigate } from '@/router';
import services from '@/services';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import type { InterviewSession, SessionParticipant } from '@/types';

interface JoinPageProps {
  inviteToken: string;
}

export function JoinPage({ inviteToken }: JoinPageProps) {
  const navigate = useNavigate();
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    services.interviews
      .getInterviewByInviteToken(inviteToken)
      .then((s) => {
        setSession(s);
        if (!s) setError('Invalid or expired invitation link');
      })
      .finally(() => setLoading(false));
  }, [inviteToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const participant = await services.interviews.joinByToken(
        inviteToken,
        name.trim(),
        email.trim() || undefined
      );
      navigate(`/waiting/${participant.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to join');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-800">Join Interview</h1>
          <p className="text-sm text-slate-500 mt-1">
            {session ? session.title : 'Loading...'}
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
        >
          <Input
            label="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            required
            autoFocus
          />
          <Input
            label="Email (optional)"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={submitting || !name.trim()} className="w-full">
            {submitting ? <Spinner size={16} /> : 'Request to Join'}
          </Button>
        </form>
      </div>
    </div>
  );
}
