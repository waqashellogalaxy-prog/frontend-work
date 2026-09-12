import { useRef, useState, useCallback } from 'react';
import type { CanvasComponent, CanvasConnection, ComponentType } from '@/types';
import { componentConfigs } from './componentConfig';
import { CanvasNode } from './CanvasNode';

interface CanvasProps {
  components: CanvasComponent[];
  connections: CanvasConnection[];
  readOnly: boolean;
  onAddComponent: (type: ComponentType, x: number, y: number) => void;
  onMoveComponent: (id: string, x: number, y: number) => void;
  onDeleteComponent: (id: string) => void;
  onCreateConnection: (sourceId: string, targetId: string) => void;
}

export function Canvas({
  components,
  connections,
  readOnly,
  onAddComponent,
  onMoveComponent,
  onDeleteComponent,
  onCreateConnection,
}: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);

  const handleCanvasClick = useCallback(() => {
    setSelectedId(null);
    setConnectingFrom(null);
  }, []);

  const handleStartConnection = useCallback((id: string) => {
    setConnectingFrom(id);
  }, []);

  const handleEndConnection = useCallback(
    (targetId: string) => {
      if (connectingFrom && connectingFrom !== targetId) {
        onCreateConnection(connectingFrom, targetId);
      }
      setConnectingFrom(null);
    },
    [connectingFrom, onCreateConnection]
  );

  const handleAddComponent = useCallback(
    (type: ComponentType) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const cfg = componentConfigs[type];
      onAddComponent(
        type,
        rect.width / 2 - cfg.width / 2,
        rect.height / 2 - cfg.height / 2
      );
    },
    [onAddComponent]
  );

  return (
    <div
      ref={canvasRef}
      data-canvas
      onClick={handleCanvasClick}
      className="relative flex-1 overflow-hidden bg-slate-50"
      style={{
        backgroundImage:
          'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* Connections (SVG layer) */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full">
        {connections.map((conn) => {
          const source = components.find((c) => c.id === conn.source_component_id);
          const target = components.find((c) => c.id === conn.target_component_id);
          if (!source || !target) return null;
          const sCfg = componentConfigs[source.type];
          const tCfg = componentConfigs[target.type];
          const x1 = source.x + sCfg.width / 2;
          const y1 = source.y + sCfg.height / 2;
          const x2 = target.x + tCfg.width / 2;
          const y2 = target.y + tCfg.height / 2;
          const midX = (x1 + x2) / 2;
          return (
            <g key={conn.id}>
              <path
                d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
                stroke="#64748b"
                strokeWidth="2"
                fill="none"
                markerEnd="url(#arrowhead)"
              />
            </g>
          );
        })}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="8"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
          </marker>
        </defs>
      </svg>

      {/* Nodes */}
      {components.map((comp) => (
        <CanvasNode
          key={comp.id}
          component={comp}
          selected={selectedId === comp.id}
          readOnly={readOnly}
          onSelect={setSelectedId}
          onMove={onMoveComponent}
          onDelete={onDeleteComponent}
          onStartConnection={handleStartConnection}
          onEndConnection={handleEndConnection}
          connectingFrom={connectingFrom}
        />
      ))}

      {/* Connection mode indicator */}
      {connectingFrom && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-md bg-slate-800 px-3 py-1.5 text-xs text-white">
          Click a target component to connect
        </div>
      )}

      {/* Empty state */}
      {components.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-sm text-slate-400">
            {readOnly ? 'No components on this canvas' : 'Add a component from the library to start'}
          </p>
        </div>
      )}
    </div>
  );
}


