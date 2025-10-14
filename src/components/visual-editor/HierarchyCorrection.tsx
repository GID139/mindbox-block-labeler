import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useVisualEditorStore } from '@/stores/visual-editor-store';
import { buildBlockTree } from '@/lib/visual-editor/hierarchy-detector';
import { ArrowRight, Layers, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function HierarchyCorrection() {
  const blocks = useVisualEditorStore(state => state.blocks);
  const visualLayout = useVisualEditorStore(state => state.visualLayout);
  const groupSelectedBlocks = useVisualEditorStore(state => state.groupSelectedBlocks);
  const selectedBlockIds = useVisualEditorStore(state => state.selectedBlockIds);

  const tree = buildBlockTree(blocks, visualLayout);
  const hasNestedBlocks = tree.some(node => node.children.length > 0);

  const handleAutoGroup = () => {
    if (selectedBlockIds.length >= 2) {
      groupSelectedBlocks();
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Hierarchy Control
          </h3>
          <p className="text-xs text-muted-foreground">
            Manual grouping and nesting
          </p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Info className="h-3 w-3" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Hybrid Grouping System</DialogTitle>
              <DialogDescription className="space-y-3 text-xs">
                <div>
                  <strong>Automatic Detection:</strong>
                  <p>The system automatically detects nesting based on visual overlap when exporting to Mindbox.</p>
                </div>
                <div>
                  <strong>Manual Grouping:</strong>
                  <p>Select multiple blocks and use Ctrl+G (or the "Group" button) to create an explicit group.</p>
                </div>
                <div>
                  <strong>Best Practice:</strong>
                  <p>Use manual grouping for complex layouts to ensure correct nesting structure.</p>
                </div>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>

      {hasNestedBlocks && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Auto-detected nested blocks. Export will use this hierarchy.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={handleAutoGroup}
          disabled={selectedBlockIds.length < 2}
        >
          Group Selected (Ctrl+G)
        </Button>

        {selectedBlockIds.length >= 2 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary">{selectedBlockIds.length} blocks selected</Badge>
            <ArrowRight className="h-3 w-3" />
            <span>Will create 1 group</span>
          </div>
        )}
      </div>
    </Card>
  );
}
