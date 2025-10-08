import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Keyboard } from 'lucide-react';

export function KeyboardShortcutsHelp() {
  const shortcuts = [
    { key: 'Double Click', action: 'Edit text inline (Text/Button blocks)' },
    { key: 'Click', action: 'Select block' },
    { key: 'Delete', action: 'Remove selected block (click trash icon)' },
    { key: 'Drag', action: 'Reorder blocks or move from library' },
    { key: 'Ctrl/Cmd + S', action: 'Save project (coming soon)' },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Keyboard className="h-4 w-4" />
          <span className="hidden md:inline">Shortcuts</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>⌨️ Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Quick reference for Visual Editor shortcuts
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 mt-4">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-start gap-3 p-2 rounded hover:bg-muted/50">
              <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded min-w-[120px] text-center">
                {shortcut.key}
              </kbd>
              <span className="text-sm text-muted-foreground flex-1">
                {shortcut.action}
              </span>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-3 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-xs text-muted-foreground">
            💡 <strong>Tip:</strong> Hover over blocks to see drag handles and action buttons.
            Use the Structure mode for precise nesting, or switch to Visual mode for free-form editing.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
