import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import services from '@/services';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';

interface CreateInterviewPageProps {
  onBack: () => void;
  onCreated: (id: string) => void;
}

export function CreateInterviewPage({ onBack, onCreated }: CreateInterviewPageProps) {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const session = await services.interviews.createInterview(title.trim());
      onCreated(session.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create interview');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center px-6 py-4">
          <Button size="sm" variant="ghost" onClick={onBack}>
            <ArrowLeft size={16} /> Back
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-md px-6 py-12">
        <h1 className="text-xl font-semibold text-slate-800 mb-6">Create New Interview</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Interview Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Design a URL Shortener"
            required
            autoFocus
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={loading || !title.trim()} className="w-full">
            {loading ? <Spinner size={16} /> : 'Create Interview'}
          </Button>
        </form>
      </main>
    </div>
  );
}
