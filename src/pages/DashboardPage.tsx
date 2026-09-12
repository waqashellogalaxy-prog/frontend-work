import { useState, useEffect, useCallback } from 'react';
import { Plus, LogOut, Users } from 'lucide-react';
import type { InterviewSession } from '@/types';
import services from '@/services';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';

interface DashboardPageProps {
  onCreateInterview: () => void;
  onOpenInterview: (id: string) => void;
}

function statusColor(status: InterviewSession['status']) {
  switch (status) {
    case 'IN_PROGRESS':
      return 'green' as const;
    case 'CREATED':
    case 'CANDIDATE_REQUESTED':
    case 'APPROVED':
      return 'yellow' as const;
    case 'ENDED':
    case 'READ_ONLY':
      return 'gray' as const;
    case 'REJECTED':
      return 'red' as const;
    default:
      return 'gray' as const;
  }
}

export function DashboardPage({ onCreateInterview, onOpenInterview }: DashboardPageProps) {
  const { user, logout } = useApp();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSessions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await services.interviews.getInterviews();
      setSessions(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <h1 className="text-lg font-semibold text-slate-800">Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">{user?.name}</span>
            <Button size="sm" variant="ghost" onClick={logout}>
              <LogOut size={16} /> Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-800">Interview Sessions</h2>
          <Button onClick={onCreateInterview}>
            <Plus size={16} /> New Interview
          </Button>
        </div>
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : sessions.length === 0 ? (
          <Card className="p-12 text-center">
            <Users size={40} className="mx-auto mb-3 text-slate-300" />
            <p className="text-sm text-slate-500 mb-4">
              No interviews yet. Create your first one.
            </p>
            <Button onClick={onCreateInterview}>
              <Plus size={16} /> Create Interview
            </Button>
          </Card>
        ) : (
          <div className="grid gap-3">
            {sessions.map((session) => (
              <Card
                key={session.id}
                onClick={() => onOpenInterview(session.id)}
                className="flex items-center justify-between p-4"
              >
                <div>
                  <h3 className="font-medium text-slate-800">{session.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Created {new Date(session.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge color={statusColor(session.status)}>{session.status}</Badge>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
