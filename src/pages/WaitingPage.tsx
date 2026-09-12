import { useState, useEffect, useCallback } from 'react';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import services from '@/services';
import { useNavigate } from '@/router';
import { Spinner } from '@/components/ui/Spinner';
import type { SessionParticipant, InterviewSession } from '@/types';

interface WaitingPageProps {
  participantId: string;
}

export function WaitingPage({ participantId }: WaitingPageProps) {
  const navigate = useNavigate();
  const [participant, setParticipant] = useState<SessionParticipant | null>(null);
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [loading, setLoading] = useState(true);

  const checkStatus = useCallback(async () => {
    try {
      const result = await services.interviews.getParticipantById(participantId);
      if (result) {
        setParticipant(result.participant);
        setSession(result.session);
        if (result.participant.status === 'APPROVED') {
          navigate(`/room/${result.session.id}?role=candidate&participant=${participantId}`);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [participantId, navigate]);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 2000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  if (loading && !participant) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Spinner />
      </div>
    );
  }

  const status = participant?.status ?? 'PENDING';

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm text-center">
        {status === 'PENDING' && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-50">
              <Clock size={32} className="text-yellow-500" />
            </div>
            <h1 className="text-xl font-semibold text-slate-800 mb-2">
              Waiting for Approval
            </h1>
            <p className="text-sm text-slate-500">
              The interviewer will review your request shortly.
            </p>
            <div className="mt-6 flex justify-center">
              <Spinner />
            </div>
          </>
        )}
        {status === 'APPROVED' && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h1 className="text-xl font-semibold text-slate-800 mb-2">
              Approved!
            </h1>
            <p className="text-sm text-slate-500">
              Entering the interview room...
            </p>
          </>
        )}
        {status === 'REJECTED' && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <XCircle size={32} className="text-red-500" />
            </div>
            <h1 className="text-xl font-semibold text-slate-800 mb-2">
              Request Rejected
            </h1>
            <p className="text-sm text-slate-500">
              The interviewer has not approved your request to join.
            </p>
          </>
        )}
        {session && (
          <p className="mt-6 text-xs text-slate-400">
            Interview: {session.title}
          </p>
        )}
      </div>
    </div>
  );
}
