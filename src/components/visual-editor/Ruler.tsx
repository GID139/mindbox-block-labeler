interface RulerProps {
  canvasWidth: number;
  canvasHeight: number;
}

export function Ruler({ canvasWidth, canvasHeight }: RulerProps) {
  const majorInterval = 100;
  const minorInterval = 20;

  const horizontalTicks = Math.ceil(canvasWidth / minorInterval);
  const verticalTicks = Math.ceil(canvasHeight / minorInterval);

  return (
    <>
      {/* Horizontal Ruler */}
      <div className="absolute top-0 left-0 right-0 h-6 bg-muted/80 border-b border-border pointer-events-none z-[9999]">
        <svg width={canvasWidth} height="24">
          {Array.from({ length: horizontalTicks }).map((_, i) => {
            const pos = i * minorInterval;
            const isMajor = i % (majorInterval / minorInterval) === 0;
            
            if (pos > canvasWidth) return null;
            
            return (
              <g key={i}>
                <line
                  x1={pos}
                  y1={isMajor ? 0 : 14}
                  x2={pos}
                  y2={24}
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-muted-foreground"
                />
                {isMajor && (
                  <text
                    x={pos + 4}
                    y={12}
                    fontSize="9"
                    fill="currentColor"
                    className="text-foreground font-mono"
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
      <div className="absolute top-0 left-0 bottom-0 w-6 bg-muted/80 border-r border-border pointer-events-none z-[9999]">
        <svg width="24" height={canvasHeight}>
          {Array.from({ length: verticalTicks }).map((_, i) => {
            const pos = i * minorInterval;
            const isMajor = i % (majorInterval / minorInterval) === 0;
            
            if (pos > canvasHeight) return null;
            
            return (
              <g key={i}>
                <line
                  x1={isMajor ? 0 : 14}
                  y1={pos}
                  x2={24}
                  y2={pos}
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-muted-foreground"
                />
                {isMajor && (
                  <text
                    x={12}
                    y={pos - 4}
                    fontSize="9"
                    fill="currentColor"
                    transform={`rotate(-90 12 ${pos - 4})`}
                    className="text-foreground font-mono"
                  >
                    {i * minorInterval}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </>
  );
}
