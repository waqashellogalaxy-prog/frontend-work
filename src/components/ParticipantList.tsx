import type { SessionParticipant } from '@/types';
import { Badge } from './ui/Badge';

interface ParticipantListProps {
  participants: SessionParticipant[];
}

function statusColor(status: SessionParticipant['status']) {
  switch (status) {
    case 'APPROVED':
      return 'green' as const;
    case 'PENDING':
      return 'yellow' as const;
    case 'REJECTED':
      return 'red' as const;
    default:
      return 'gray' as const;
  }
}

export function ParticipantList({ participants }: ParticipantListProps) {
  if (participants.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-slate-400">No candidates have joined yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {participants.map((p) => (
        <div
          key={p.id}
          className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2"
        >
          <div>
            <p className="text-sm font-medium text-slate-800">
              {p.candidate?.name ?? 'Unknown'}
            </p>
            <p className="text-xs text-slate-400">
              {p.candidate?.email ?? 'No email'}
            </p>
          </div>
          <Badge color={statusColor(p.status)}>{p.status}</Badge>
        </div>
      ))}
    </div>
  );
}
