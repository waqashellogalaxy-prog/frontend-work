import { useRef, useState, useCallback } from 'react';
import type { CanvasComponent } from '@/types';
import { componentConfigs } from './componentConfig';

interface CanvasNodeProps {
  component: CanvasComponent;
  selected: boolean;
  readOnly: boolean;
  onSelect: (id: string | null) => void;
  onMove: (id: string, x: number, y: number) => void;
  onDelete: (id: string) => void;
  onStartConnection: (id: string) => void;
  onEndConnection: (id: string) => void;
  connectingFrom: string | null;
}

export function CanvasNode({
  component,
  selected,
  readOnly,
  onSelect,
  onMove,
  onDelete,
  onStartConnection,
  onEndConnection,
  connectingFrom,
}: CanvasNodeProps) {
  const cfg = componentConfigs[component.type];
  const Icon = cfg.icon;
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (readOnly) return;
      e.stopPropagation();
      onSelect(component.id);
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        origX: component.x,
        origY: component.y,
      };
      setIsDragging(true);
      const onMove_ = (ev: MouseEvent) => {
        if (!dragRef.current) return;
        const dx = ev.clientX - dragRef.current.startX;
        const dy = ev.clientY - dragRef.current.startY;
        onMove(component.id, dragRef.current.origX + dx, dragRef.current.origY + dy);
      };
      const onUp = () => {
        dragRef.current = null;
        setIsDragging(false);
        document.removeEventListener('mousemove', onMove_);
        document.removeEventListener('mouseup', onUp);
      };
      document.addEventListener('mousemove', onMove_);
      document.addEventListener('mouseup', onUp);
    },
    [readOnly, component.id, component.x, component.y, onSelect, onMove]
  );

  return (
    <div
      className={`absolute flex select-none flex-col items-center justify-center gap-1 rounded-lg border-2 ${cfg.borderColor} ${cfg.bgColor} ${selected ? 'ring-2 ring-slate-400' : ''} ${readOnly ? 'cursor-default' : 'cursor-move'} ${isDragging ? 'opacity-80' : ''}`}
      style={{
        left: component.x,
        top: component.y,
        width: cfg.width,
        height: cfg.height,
      }}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        e.stopPropagation();
        if (connectingFrom && connectingFrom !== component.id) {
          onEndConnection(component.id);
        } else {
          onSelect(component.id);
        }
      }}
    >
      <Icon size={20} className={cfg.color} />
      <span className={`text-xs font-medium ${cfg.color}`}>{component.label}</span>
      {!readOnly && (
        <div className="absolute -right-2 -top-2 flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(component.id);
            }}
            className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white shadow-sm hover:bg-red-600"
          >
            ×
          </button>
        </div>
      )}
      {!readOnly && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStartConnection(component.id);
          }}
          className="absolute -right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-slate-600 text-xs text-white shadow-sm hover:bg-slate-700"
          title="Start connection"
        >
          →
        </button>
      )}
    </div>
  );
}
