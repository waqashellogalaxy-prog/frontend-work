import { useState, useEffect, useCallback } from 'react';
import type { InterviewerNote } from '@/types';
import services from '@/services';
import { Button } from './ui/Button';
import { Spinner } from './ui/Spinner';

interface NotesPanelProps {
  sessionId: string;
}

export function NotesPanel({ sessionId }: NotesPanelProps) {
  const [notes, setNotes] = useState<InterviewerNote[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadNotes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await services.notes.getNotes(sessionId);
      setNotes(data);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const handleAdd = useCallback(async () => {
    if (!content.trim()) return;
    setSaving(true);
    try {
      const note = await services.notes.createNote(sessionId, content.trim());
      setNotes((prev) => [...prev, note]);
      setContent('');
    } finally {
      setSaving(false);
    }
  }, [sessionId, content]);

  const handleUpdate = useCallback(async (noteId: string, newContent: string) => {
    const updated = await services.notes.updateNote(noteId, newContent);
    setNotes((prev) => prev.map((n) => (n.id === noteId ? updated : n)));
  }, []);

  const handleDelete = useCallback(async (noteId: string) => {
    await services.notes.deleteNote(noteId);
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  }, []);

  return (
    <div className="flex h-full flex-col">
      <h3 className="text-sm font-semibold text-slate-700 mb-2">Private Notes</h3>
      <div className="flex gap-2 mb-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a private note..."
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-400"
          rows={2}
        />
        <Button size="sm" onClick={handleAdd} disabled={saving || !content.trim()}>
          {saving ? <Spinner size={14} /> : 'Add'}
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2">
        {loading ? (
          <div className="flex justify-center py-4">
            <Spinner />
          </div>
        ) : notes.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No notes yet</p>
        ) : (
          notes.map((note) => (
            <NoteItem
              key={note.id}
              note={note}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface NoteItemProps {
  note: InterviewerNote;
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
}

function NoteItem({ note, onUpdate, onDelete }: NoteItemProps) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(note.content);

  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-2.5">
      {editing ? (
        <div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full rounded border border-slate-300 px-2 py-1 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-slate-400"
            rows={2}
          />
          <div className="mt-1 flex gap-1">
            <Button
              size="sm"
              onClick={() => {
                onUpdate(note.id, text);
                setEditing(false);
              }}
            >
              Save
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setText(note.content);
                setEditing(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{note.content}</p>
          <div className="mt-1 flex gap-2">
            <button
              onClick={() => setEditing(true)}
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(note.id)}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
