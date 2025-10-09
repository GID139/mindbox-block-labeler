interface MarqueeSelectionProps {
  start: { x: number; y: number };
  end: { x: number; y: number };
  zoom: number;
}

export function MarqueeSelection({ start, end, zoom }: MarqueeSelectionProps) {
  const minX = Math.min(start.x, end.x);
  const minY = Math.min(start.y, end.y);
  const width = Math.abs(end.x - start.x);
  const height = Math.abs(end.y - start.y);

  return (
    <div
      className="absolute pointer-events-none border border-primary bg-primary/10"
      style={{
        left: `${minX}px`,
        top: `${minY}px`,
        width: `${width}px`,
        height: `${height}px`,
        zIndex: 9999,
      }}
    />
  );
}
