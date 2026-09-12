import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Square } from 'lucide-react';
import { Button } from './ui/Button';

interface TimerProps {
  startedAt: string | null;
  endedAt: string | null;
  readOnly: boolean;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function Timer({ startedAt, endedAt, readOnly }: TimerProps) {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // If interview has ended, compute elapsed from timestamps
  useEffect(() => {
    if (startedAt && endedAt) {
      const start = new Date(startedAt).getTime();
      const end = new Date(endedAt).getTime();
      setElapsed(Math.floor((end - start) / 1000));
      setRunning(false);
    } else if (startedAt && running) {
      const start = new Date(startedAt).getTime();
      const update = () => {
        setElapsed(Math.floor((Date.now() - start) / 1000));
      };
      update();
      intervalRef.current = setInterval(update, 1000);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [startedAt, endedAt, running]);

  const handleStart = useCallback(() => setRunning(true), []);
  const handlePause = useCallback(() => setRunning(false), []);
  const handleStop = useCallback(() => {
    setRunning(false);
    setElapsed(0);
  }, []);

  return (
    <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-white px-4 py-2">
      <span className="font-mono text-lg font-semibold text-slate-800 tabular-nums">
        {formatTime(elapsed)}
      </span>
      {!readOnly && (
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={handleStart} disabled={running}>
            <Play size={14} />
          </Button>
          <Button size="sm" variant="ghost" onClick={handlePause} disabled={!running}>
            <Pause size={14} />
          </Button>
          <Button size="sm" variant="ghost" onClick={handleStop}>
            <Square size={14} />
          </Button>
        </div>
      )}
    </div>
  );
}
