interface RulerProps {
  orientation: 'horizontal' | 'vertical';
  stageScale: number;
  stagePos: { x: number; y: number };
  canvasSize: number;
  viewportSize: number;
}

export function Ruler({ orientation, stageScale, stagePos, canvasSize, viewportSize }: RulerProps) {
  const rulerSize = 30;
  const majorInterval = 100;
  const minorInterval = 20;

  const offset = orientation === 'horizontal' ? stagePos.x : stagePos.y;
  
  // Calculate visible range on canvas
  const start = -offset / stageScale;
  const end = start + (viewportSize / stageScale);

  const ticks: JSX.Element[] = [];
  for (let i = Math.floor(start / minorInterval) * minorInterval; i <= end; i += minorInterval) {
    const isMajor = i % majorInterval === 0;
    const pos = i * stageScale + offset;

    // Skip if outside viewport
    if (pos < 0 || pos > viewportSize) continue;

    ticks.push(
      <div
        key={i}
        className="absolute"
        style={{
          [orientation === 'horizontal' ? 'left' : 'top']: `${pos}px`,
          [orientation === 'horizontal' ? 'height' : 'width']: isMajor ? '12px' : '6px',
          [orientation === 'horizontal' ? 'width' : 'height']: '1px',
          backgroundColor: 'hsl(var(--muted-foreground))',
          [orientation === 'horizontal' ? 'bottom' : 'right']: '0',
        }}
      >
        {isMajor && (
          <span
            className="absolute text-[9px] text-foreground font-mono"
            style={{
              [orientation === 'horizontal' ? 'top' : 'left']: orientation === 'horizontal' ? '-14px' : '2px',
              [orientation === 'horizontal' ? 'left' : 'top']: orientation === 'horizontal' ? '-8px' : '-18px',
              ...(orientation === 'vertical' && {
                transform: 'rotate(-90deg)',
                transformOrigin: 'left top',
              }),
            }}
          >
            {i}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className="absolute bg-card/90 backdrop-blur-sm border-border pointer-events-none z-[45]"
      style={{
        [orientation === 'horizontal' ? 'top' : 'left']: 0,
        [orientation === 'horizontal' ? 'left' : 'top']: orientation === 'horizontal' ? `${rulerSize}px` : 0,
        [orientation === 'horizontal' ? 'width' : 'height']: orientation === 'horizontal' ? `calc(100% - ${rulerSize}px)` : '100%',
        [orientation === 'horizontal' ? 'height' : 'width']: `${rulerSize}px`,
        [orientation === 'horizontal' ? 'borderBottom' : 'borderRight']: '1px solid',
      }}
    >
      {ticks}
    </div>
  );
}
