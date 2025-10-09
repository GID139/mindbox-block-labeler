import { useVisualEditorStore } from '@/stores/visual-editor-store';

export function Measurements() {
  const { selectedBlockIds, visualLayout } = useVisualEditorStore();

  if (selectedBlockIds.length === 0) return null;

  return (
    <>
      {selectedBlockIds.map(blockId => {
        const layout = visualLayout[blockId];
        if (!layout) return null;

        return (
          <div key={blockId}>
            {/* Width measurement */}
            <div
              className="absolute pointer-events-none z-[9997]"
              style={{
                left: `${layout.x}px`,
                top: `${layout.y - 20}px`,
                width: `${layout.width}px`,
                height: '16px',
              }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <div className="bg-primary text-primary-foreground px-2 py-0.5 rounded text-xs font-medium">
                  {Math.round(layout.width)}px
                </div>
              </div>
              <svg
                width={layout.width}
                height="16"
                className="absolute top-0 left-0"
              >
                <line
                  x1="0"
                  y1="8"
                  x2={layout.width}
                  y2="8"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-primary"
                />
                <line
                  x1="0"
                  y1="4"
                  x2="0"
                  y2="12"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-primary"
                />
                <line
                  x1={layout.width}
                  y1="4"
                  x2={layout.width}
                  y2="12"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-primary"
                />
              </svg>
            </div>

            {/* Height measurement */}
            <div
              className="absolute pointer-events-none z-[9997]"
              style={{
                left: `${layout.x + layout.width + 4}px`,
                top: `${layout.y}px`,
                width: '16px',
                height: `${layout.height}px`,
              }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <div
                  className="bg-primary text-primary-foreground px-2 py-0.5 rounded text-xs font-medium"
                  style={{
                    transform: 'rotate(-90deg)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {Math.round(layout.height)}px
                </div>
              </div>
              <svg
                width="16"
                height={layout.height}
                className="absolute top-0 left-0"
              >
                <line
                  x1="8"
                  y1="0"
                  x2="8"
                  y2={layout.height}
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-primary"
                />
                <line
                  x1="4"
                  y1="0"
                  x2="12"
                  y2="0"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-primary"
                />
                <line
                  x1="4"
                  y1={layout.height}
                  x2="12"
                  y2={layout.height}
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-primary"
                />
              </svg>
            </div>
          </div>
        );
      })}
    </>
  );
}
