import { useState, useEffect, useCallback } from 'react';
import type { CanvasEvent } from '@/types';
import services from '@/services';
import { Spinner } from './ui/Spinner';

interface EventHistoryProps {
  sessionId: string;
}

const actionLabels: Record<string, string> = {
  ADD_COMPONENT: 'Added',
  UPDATE_COMPONENT: 'Updated',
  DELETE_COMPONENT: 'Deleted',
  MOVE_COMPONENT: 'Moved',
  CREATE_CONNECTION: 'Connected',
  UPDATE_CONNECTION: 'Updated connection',
  DELETE_CONNECTION: 'Deleted connection',
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function EventHistory({ sessionId }: EventHistoryProps) {
  const [events, setEvents] = useState<CanvasEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await services.canvas.getEvents(sessionId);
      setEvents(data);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  return (
    <div className="flex h-full flex-col">
      <h3 className="text-sm font-semibold text-slate-700 mb-2">Event History</h3>
      <div className="flex-1 overflow-y-auto space-y-1">
        {loading ? (
          <div className="flex justify-center py-4">
            <Spinner />
          </div>
        ) : events.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No events yet</p>
        ) : (
          [...events].reverse().map((event) => (
            <div
              key={event.id}
              className="rounded-md border border-slate-100 bg-white px-2.5 py-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-700">
                  {actionLabels[event.action] ?? event.action}
                </span>
                <span className="text-xs text-slate-400">
                  {formatTime(event.created_at)}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                by {event.user_id.startsWith('cand') ? 'Candidate' : 'Interviewer'}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
