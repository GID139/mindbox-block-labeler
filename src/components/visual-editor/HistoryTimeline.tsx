import { useVisualEditorStore } from '@/stores/visual-editor-store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';

export function HistoryTimeline() {
  const { historyIndex, goToHistoryState, getHistoryList } = useVisualEditorStore();
  const historyList = getHistoryList();

  if (historyList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <Clock className="w-12 h-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No history yet</p>
        <p className="text-xs text-muted-foreground mt-2">
          Make changes to see your history here
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-2 p-4">
        {historyList.map((item, index) => (
          <Button
            key={index}
            variant={index === historyIndex ? 'default' : 'ghost'}
            onClick={() => goToHistoryState(index)}
            className={cn(
              'justify-start h-auto py-3 px-3 text-left',
              index === historyIndex && 'bg-primary/10 text-primary hover:bg-primary/20'
            )}
          >
            <div className="flex gap-3 items-center w-full">
              {item.preview && (
                <img
                  src={item.preview}
                  alt={item.action}
                  className="w-16 h-12 rounded border object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{item.action}</div>
                <div className="text-xs text-muted-foreground">
                  {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                </div>
              </div>
            </div>
          </Button>
        ))}
      </div>
    </ScrollArea>
  );
}
