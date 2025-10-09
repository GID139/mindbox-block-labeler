import { SnapGuide } from '@/lib/visual-editor/snapping-utils';

interface SmartGuidesProps {
  guides: SnapGuide[];
  canvasWidth: number;
  canvasHeight: number;
}

export function SmartGuides({ guides, canvasWidth, canvasHeight }: SmartGuidesProps) {
  return (
    <>
      {guides.map((guide, index) => (
        <div
          key={index}
          className="absolute pointer-events-none z-[9998]"
          style={
            guide.type === 'vertical'
              ? {
                  left: `${guide.position}px`,
                  top: 0,
                  width: '1px',
                  height: `${canvasHeight}px`,
                  backgroundColor: '#FF00FF',
                  boxShadow: '0 0 2px rgba(255, 0, 255, 0.5)',
                }
              : {
                  left: 0,
                  top: `${guide.position}px`,
                  width: `${canvasWidth}px`,
                  height: '1px',
                  backgroundColor: '#FF00FF',
                  boxShadow: '0 0 2px rgba(255, 0, 255, 0.5)',
                }
          }
        />
      ))}
    </>
  );
}
