import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Lock } from 'lucide-react';
import type { InterviewSession, CanvasComponent, CanvasConnection } from '@/types';
import services from '@/services';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Canvas } from '@/components/canvas/Canvas';
import { EventHistory } from '@/components/EventHistory';
import { NotesPanel } from '@/components/NotesPanel';

interface ReviewPageProps {
  sessionId: string;
  onBack: () => void;
}

type RightPanel = 'notes' | 'history' | null;

export function ReviewPage({ sessionId, onBack }: ReviewPageProps) {
  const { user, logout } = useApp();
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [components, setComponents] = useState<CanvasComponent[]>([]);
  const [connections, setConnections] = useState<CanvasConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [rightPanel, setRightPanel] = useState<RightPanel>('history');

  const loadData = useCallback(async () => {
    try {
      const [s, canvas] = await Promise.all([
        services.interviews.getInterviewById(sessionId),
        services.canvas.getCanvasState(sessionId),
      ]);
      setSession(s);
      setComponents(canvas.components);
      setConnections(canvas.connections);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2.5">
        <div className="flex items-center gap-3">
          <Button size="sm" variant="ghost" onClick={onBack}>
            <ArrowLeft size={16} /> Back to Dashboard
          </Button>
          <h1 className="text-sm font-semibold text-slate-800">
            {session?.title}
          </h1>
          <Badge color="gray">READ ONLY</Badge>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-600">{user?.name}</span>
          <Button size="sm" variant="ghost" onClick={logout}>
            Logout
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col">
          <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-1.5">
            <Lock size={14} className="text-slate-400" />
            <span className="text-xs text-slate-500">
              Review mode — canvas is read-only
            </span>
          </div>
          <Canvas
            components={components}
            connections={connections}
            readOnly={true}
            onAddComponent={() => {}}
            onMoveComponent={() => {}}
            onDeleteComponent={() => {}}
            onCreateConnection={() => {}}
          />
        </div>

        <div className="flex flex-col border-l border-slate-200 bg-white">
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setRightPanel(rightPanel === 'notes' ? null : 'notes')}
              className={`px-3 py-2 text-xs font-medium ${rightPanel === 'notes' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Notes
            </button>
            <button
              onClick={() => setRightPanel(rightPanel === 'history' ? null : 'history')}
              className={`px-3 py-2 text-xs font-medium ${rightPanel === 'history' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
            >
              History
            </button>
          </div>
          {rightPanel === 'notes' && (
            <div className="w-72 p-3">
              <NotesPanel sessionId={sessionId} />
            </div>
          )}
          {rightPanel === 'history' && (
            <div className="w-72 p-3">
              <EventHistory sessionId={sessionId} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
