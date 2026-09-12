import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, LogOut, PanelRightClose, PanelRightOpen, Lock } from 'lucide-react';
import type {
  InterviewSession,
  CanvasComponent,
  CanvasConnection,
  CanvasEvent,
  ComponentType,
  SessionParticipant,
} from '@/types';
import services from '@/services';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';
import { Timer } from '@/components/Timer';
import { NotesPanel } from '@/components/NotesPanel';
import { EventHistory } from '@/components/EventHistory';
import { ComponentLibrary } from '@/components/canvas/ComponentLibrary';
import { Canvas } from '@/components/canvas/Canvas';

interface InterviewRoomPageProps {
  sessionId: string;
  role: 'interviewer' | 'candidate';
  participantId?: string;
  onBack: () => void;
  onEnded: (sessionId: string) => void;
}

type RightPanel = 'notes' | 'history' | null;

export function InterviewRoomPage({
  sessionId,
  role,
  participantId,
  onBack,
  onEnded,
}: InterviewRoomPageProps) {
  const { user, logout } = useApp();
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [components, setComponents] = useState<CanvasComponent[]>([]);
  const [connections, setConnections] = useState<CanvasConnection[]>([]);
  const [participants, setParticipants] = useState<SessionParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [rightPanel, setRightPanel] = useState<RightPanel>(null);
  const [showEndModal, setShowEndModal] = useState(false);
  const [endingInterview, setEndingInterview] = useState(false);

  const userId = role === 'interviewer' ? user?.id ?? 'interviewer' : participantId ?? 'candidate';
  const readOnly = session?.status === 'READ_ONLY' || session?.status === 'ENDED';
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [s, canvas, cands] = await Promise.all([
        services.interviews.getInterviewById(sessionId),
        services.canvas.getCanvasState(sessionId),
        services.interviews.getCandidates(sessionId),
      ]);
      setSession(s);
      setComponents(canvas.components);
      setConnections(canvas.connections);
      setParticipants(cands);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Simulate real-time sync by polling for changes
  useEffect(() => {
    if (readOnly) return;
    pollRef.current = setInterval(async () => {
      const canvas = await services.canvas.getCanvasState(sessionId);
      setComponents(canvas.components);
      setConnections(canvas.connections);
    }, 2000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [sessionId, readOnly]);

  const handleAddComponent = useCallback(
    async (type: ComponentType, x: number, y: number) => {
      const label = type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      const comp = await services.canvas.addComponent(sessionId, type, label, x, y, userId);
      setComponents((prev) => [...prev, comp]);
    },
    [sessionId, userId]
  );

  const handleMoveComponent = useCallback(
    async (id: string, x: number, y: number) => {
      setComponents((prev) =>
        prev.map((c) => (c.id === id ? { ...c, x, y } : c))
      );
      await services.canvas.moveComponent(sessionId, id, x, y, userId);
    },
    [sessionId, userId]
  );

  const handleDeleteComponent = useCallback(
    async (id: string) => {
      setComponents((prev) => prev.filter((c) => c.id !== id));
      setConnections((prev) =>
        prev.filter(
          (c) => c.source_component_id !== id && c.target_component_id !== id
        )
      );
      await services.canvas.deleteComponent(sessionId, id, userId);
    },
    [sessionId, userId]
  );

  const handleCreateConnection = useCallback(
    async (sourceId: string, targetId: string) => {
      const conn = await services.canvas.createConnection(sessionId, sourceId, targetId, userId);
      setConnections((prev) => [...prev, conn]);
    },
    [sessionId, userId]
  );

  const handleEndInterview = useCallback(async () => {
    setEndingInterview(true);
    try {
      await services.interviews.endInterview(sessionId);
      setShowEndModal(false);
      onEnded(sessionId);
    } finally {
      setEndingInterview(false);
    }
  }, [sessionId, onEnded]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2.5">
        <div className="flex items-center gap-3">
          <Button size="sm" variant="ghost" onClick={onBack}>
            <ArrowLeft size={16} />
          </Button>
          <h1 className="text-sm font-semibold text-slate-800">
            {session?.title}
          </h1>
          <Badge color={readOnly ? 'gray' : 'green'}>
            {readOnly ? 'READ ONLY' : 'LIVE'}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <Timer
            startedAt={session?.started_at ?? null}
            endedAt={session?.ended_at ?? null}
            readOnly={role !== 'interviewer' || readOnly}
          />
          <div className="flex items-center gap-2">
            <Badge color="blue">{role}</Badge>
            {role === 'interviewer' && (
              <Button
                size="sm"
                variant="danger"
                onClick={() => setShowEndModal(true)}
                disabled={readOnly}
              >
                End Interview
              </Button>
            )}
            {role === 'interviewer' && (
              <Button size="sm" variant="ghost" onClick={logout}>
                <LogOut size={16} />
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Component library */}
        {!readOnly && (
          <ComponentLibrary
            onAdd={(type) => {
              const canvas = document.querySelector('[data-canvas]') as HTMLElement;
              const rect = canvas?.getBoundingClientRect();
              const x = rect ? rect.width / 2 - 70 : 200;
              const y = rect ? rect.height / 2 - 40 : 150;
              handleAddComponent(type, x, y);
            }}
            disabled={false}
          />
        )}

        {/* Canvas */}
        <div className="flex flex-1 flex-col">
          {/* Participant bar */}
          <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-1.5">
            <span className="text-xs text-slate-500">Participants:</span>
            <Badge color="blue">Interviewer</Badge>
            {participants
              .filter((p) => p.status === 'APPROVED')
              .map((p) => (
                <Badge key={p.id} color="green">
                  {p.candidate?.name}
                </Badge>
              ))}
          </div>

          <Canvas
            components={components}
            connections={connections}
            readOnly={readOnly}
            onAddComponent={handleAddComponent}
            onMoveComponent={handleMoveComponent}
            onDeleteComponent={handleDeleteComponent}
            onCreateConnection={handleCreateConnection}
          />
        </div>

        {/* Right panel toggle */}
        <div className="flex flex-col border-l border-slate-200 bg-white">
          <div className="flex border-b border-slate-200">
            {role === 'interviewer' && (
              <button
                onClick={() => setRightPanel(rightPanel === 'notes' ? null : 'notes')}
                className={`px-3 py-2 text-xs font-medium ${rightPanel === 'notes' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Notes
              </button>
            )}
            <button
              onClick={() => setRightPanel(rightPanel === 'history' ? null : 'history')}
              className={`px-3 py-2 text-xs font-medium ${rightPanel === 'history' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
            >
              History
            </button>
          </div>
          {rightPanel === 'notes' && role === 'interviewer' && (
            <div className="w-72 p-3">
              <NotesPanel sessionId={sessionId} />
            </div>
          )}
          {rightPanel === 'history' && (
            <div className="w-72 p-3">
              <EventHistory sessionId={sessionId} />
            </div>
          )}
          {rightPanel === null && (
            <div className="w-12 p-2">
              <button
                onClick={() => setRightPanel(role === 'interviewer' ? 'notes' : 'history')}
                className="flex w-full flex-col items-center gap-1 text-xs text-slate-400 hover:text-slate-600"
              >
                <PanelRightOpen size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Read-only banner */}
      {readOnly && (
        <div className="flex items-center justify-center gap-2 bg-slate-100 py-2 text-sm text-slate-600">
          <Lock size={14} />
          This interview is read-only
        </div>
      )}

      {/* End interview modal */}
      <Modal
        open={showEndModal}
        title="End Interview?"
        onClose={() => setShowEndModal(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowEndModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleEndInterview} disabled={endingInterview}>
              {endingInterview ? <Spinner size={14} /> : 'End Interview'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          This will end the interview and switch it to read-only mode.
          The canvas will remain available for review.
        </p>
      </Modal>
    </div>
  );
}
