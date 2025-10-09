import { useVisualEditorStore } from '@/stores/visual-editor-store';

export function Ruler() {
  const { zoom } = useVisualEditorStore();
  
  const scale = zoom / 100;
  const majorInterval = 100;
  const minorInterval = 20;
  const rulerLength = 4000;

  return (
    <>
      {/* Horizontal Ruler */}
      <div className="absolute top-0 left-8 right-0 h-8 bg-background border-b border-border z-50 overflow-hidden">
        <svg width={rulerLength * scale} height="32">
          {Array.from({ length: Math.floor(rulerLength / minorInterval) }).map((_, i) => {
            const pos = i * minorInterval * scale;
            const isMajor = i % (majorInterval / minorInterval) === 0;
            
            return (
              <g key={i}>
                <line
                  x1={pos}
                  y1={isMajor ? 0 : 20}
                  x2={pos}
                  y2={32}
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-muted-foreground"
                />
                {isMajor && (
                  <text
                    x={pos + 4}
                    y={16}
                    fontSize="10"
                    fill="currentColor"
                    className="text-foreground"
                  >
                    {i * minorInterval}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Vertical Ruler */}
      <div className="absolute top-8 left-0 bottom-0 w-8 bg-background border-r border-border z-50 overflow-hidden">
        <svg width="32" height={rulerLength * scale}>
          {Array.from({ length: Math.floor(rulerLength / minorInterval) }).map((_, i) => {
            const pos = i * minorInterval * scale;
            const isMajor = i % (majorInterval / minorInterval) === 0;
            
            return (
              <g key={i}>
                <line
                  x1={isMajor ? 0 : 20}
                  y1={pos}
                  x2={32}
                  y2={pos}
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-muted-foreground"
                />
                {isMajor && (
                  <text
                    x={4}
                    y={pos + 12}
                    fontSize="10"
                    fill="currentColor"
                    transform={`rotate(-90 4 ${pos + 12})`}
                    className="text-foreground"
                  >
                    {i * minorInterval}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Corner square */}
      <div className="absolute top-0 left-0 w-8 h-8 bg-background border-r border-b border-border z-50" />
    </>
  );
}
