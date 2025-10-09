interface MeasurementsProps {
  selectedBlockIds: string[];
  visualLayout: Record<string, any>;
}

export function Measurements({ selectedBlockIds, visualLayout }: MeasurementsProps) {
  if (selectedBlockIds.length === 0) return null;

  return (
    <>
      {selectedBlockIds.map(blockId => {
        const layout = visualLayout[blockId];
        if (!layout) return null;

        const showTopMeasurement = layout.y >= 30;
        const topMeasurementY = showTopMeasurement ? layout.y - 24 : layout.y + layout.height + 8;

        return (
          <div key={blockId}>
            {/* Width measurement */}
            <div
              className="absolute pointer-events-none z-[9997]"
              style={{
                left: `${layout.x}px`,
                top: `${topMeasurementY}px`,
                width: `${layout.width}px`,
                height: '20px',
              }}
            >
              <div className="relative w-full h-full">
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-2 py-0.5 rounded text-xs font-medium shadow-md whitespace-nowrap">
                  {Math.round(layout.width)} × {Math.round(layout.height)}
                </div>
              </div>
              <svg
                width={layout.width}
                height="20"
                className="absolute top-0 left-0"
              >
                <line
                  x1="0"
                  y1="10"
                  x2={layout.width}
                  y2="10"
                  stroke="hsl(var(--primary))"
                  strokeWidth="1.5"
                  strokeDasharray="2,2"
                />
                <line
                  x1="0"
                  y1="6"
                  x2="0"
                  y2="14"
                  stroke="hsl(var(--primary))"
                  strokeWidth="1.5"
                />
                <line
                  x1={layout.width}
                  y1="6"
                  x2={layout.width}
                  y2="14"
                  stroke="hsl(var(--primary))"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
          </div>
        );
      })}
    </>
  );
}
