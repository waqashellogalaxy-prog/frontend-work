import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Copy, Check, LogOut } from 'lucide-react';
import type { InterviewSession, SessionParticipant } from '@/types';
import services from '@/services';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { ParticipantList } from '@/components/ParticipantList';

interface LobbyPageProps {
  sessionId: string;
  onBack: () => void;
  onEnterRoom: (sessionId: string) => void;
}

export function LobbyPage({ sessionId, onBack, onEnterRoom }: LobbyPageProps) {
  const { user, logout } = useApp();
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [participants, setParticipants] = useState<SessionParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [rejecting, setRejecting] = useState<SessionParticipant | null>(null);
  const [rejectMessage, setRejectMessage] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [s, c] = await Promise.all([
        services.interviews.getInterviewById(sessionId),
        services.interviews.getCandidates(sessionId),
      ]);
      setSession(s);
      setParticipants(c);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [loadData]);

  const inviteUrl = session
    ? `${window.location.origin}/join/${session.invite_token}`
    : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApprove = async (participantId: string) => {
    await services.interviews.approveCandidate(participantId);
    await loadData();
  };

  const handleReject = async () => {
    if (!rejecting) return;
    await services.interviews.rejectCandidate(rejecting.id, rejectMessage || undefined);
    setRejecting(null);
    setRejectMessage('');
    await loadData();
  };

  const canEnterRoom = participants.some((p) => p.status === 'APPROVED');

  if (loading && !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Button size="sm" variant="ghost" onClick={onBack}>
              <ArrowLeft size={16} /> Back
            </Button>
            <h1 className="text-lg font-semibold text-slate-800">
              {session?.title ?? 'Interview Lobby'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">{user?.name}</span>
            <Button size="sm" variant="ghost" onClick={logout}>
              <LogOut size={16} /> Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-8 space-y-6">
        {/* Invitation link */}
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-2">
            Candidate Invitation Link
          </h2>
          <p className="text-xs text-slate-500 mb-3">
            Share this link with the candidate. They don't need an account.
          </p>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={inviteUrl}
              className="flex-1 rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-600"
            />
            <Button size="sm" variant="secondary" onClick={handleCopy}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">Status:</span>
          <Badge color={session?.status === 'CANDIDATE_REQUESTED' ? 'yellow' : 'gray'}>
            {session?.status}
          </Badge>
        </div>

        {/* Candidates */}
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">
            Candidate Requests
          </h2>
          {participants.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">
              Waiting for a candidate to join...
            </p>
          ) : (
            <div className="space-y-3">
              {participants.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-md border border-slate-200 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {p.candidate?.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {p.candidate?.email ?? 'No email'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      color={
                        p.status === 'APPROVED'
                          ? 'green'
                          : p.status === 'PENDING'
                            ? 'yellow'
                            : 'red'
                      }
                    >
                      {p.status}
                    </Badge>
                    {p.status === 'PENDING' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(p.id)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => setRejecting(p)}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Enter room */}
        {canEnterRoom && (
          <div className="flex justify-center">
            <Button size="lg" onClick={() => onEnterRoom(sessionId)}>
              Enter Interview Room
            </Button>
          </div>
        )}
      </main>

      {/* Reject modal */}
      {rejecting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              setRejecting(null);
              setRejectMessage('');
            }}
          />
          <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-base font-semibold text-slate-800 mb-2">
              Reject Candidate
            </h2>
            <p className="text-sm text-slate-500 mb-4">
              Rejecting {rejecting.candidate?.name}. Add an optional message.
            </p>
            <textarea
              value={rejectMessage}
              onChange={(e) => setRejectMessage(e.target.value)}
              placeholder="Optional rejection message..."
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-400"
              rows={3}
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setRejecting(null);
                  setRejectMessage('');
                }}
              >
                Cancel
              </Button>
              <Button variant="danger" onClick={handleReject}>
                Reject
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
