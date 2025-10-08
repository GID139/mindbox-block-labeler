import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lightbulb, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

const tips = [
  '💡 Double-click text blocks to edit inline',
  '🎨 Use color pickers for precise color selection',
  '📐 Drag blocks to reorder or nest them',
  '🔍 Click breadcrumbs to navigate block hierarchy',
  '⚡ Changes auto-save every 5 minutes',
  '🎯 Use Structure mode for precise layouts',
];

export function QuickTips() {
  const [currentTip, setCurrentTip] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [hasSeenTips, setHasSeenTips] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('visual-editor-tips-seen');
    if (seen) {
      setIsVisible(false);
      setHasSeenTips(true);
    }
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [isVisible]);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('visual-editor-tips-seen', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-5">
      <Alert className="border-primary/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <Lightbulb className="h-4 w-4 text-primary" />
        <AlertDescription className="flex items-start justify-between gap-2">
          <span className="text-sm">
            {tips[currentTip]}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 shrink-0"
            onClick={handleClose}
          >
            <X className="h-3 w-3" />
          </Button>
        </AlertDescription>
        <div className="flex gap-1 mt-2">
          {tips.map((_, index) => (
            <div
              key={index}
              className={`h-1 rounded-full transition-all ${
                index === currentTip ? 'w-8 bg-primary' : 'w-1 bg-muted'
              }`}
            />
          ))}
        </div>
      </Alert>
    </div>
  );
}
