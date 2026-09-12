import { componentLibrary } from './componentConfig';
import type { ComponentType } from '@/types';

interface ComponentLibraryProps {
  onAdd: (type: ComponentType) => void;
  disabled?: boolean;
}

export function ComponentLibrary({ onAdd, disabled }: ComponentLibraryProps) {
  return (
    <div className="w-48 shrink-0 border-r border-slate-200 bg-white p-3 overflow-y-auto">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
        Components
      </h3>
      <div className="space-y-2">
        {componentLibrary.map((cfg) => {
          const Icon = cfg.icon;
          return (
            <button
              key={cfg.type}
              disabled={disabled}
              onClick={() => onAdd(cfg.type)}
              className={`flex w-full items-center gap-2 rounded-md border ${cfg.borderColor} ${cfg.bgColor} px-3 py-2 text-left text-sm font-medium ${cfg.color} transition-opacity hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <Icon size={18} />
              {cfg.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
