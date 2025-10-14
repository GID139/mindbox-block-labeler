import { BlockInstance } from '@/types/visual-editor';
import { VisualLayout } from '@/stores/visual-editor-store';
import { buildBlockTree, HierarchyConflict, detectHierarchyConflicts } from '@/lib/visual-editor/hierarchy-detector';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface HierarchyPreviewProps {
  blocks: BlockInstance[];
  visualLayout: VisualLayout;
}

export function HierarchyPreview({ blocks, visualLayout }: HierarchyPreviewProps) {
  const tree = buildBlockTree(blocks, visualLayout);
  const conflicts = detectHierarchyConflicts(blocks, visualLayout);

  const renderNode = (
    node: { block: BlockInstance; children: any[]; relativeCoords?: { x: number; y: number } },
    depth: number = 0
  ): JSX.Element => {
    const hasChildren = node.children.length > 0;
    const indent = depth * 20;

    return (
      <div key={node.block.id}>
        <div
          className="flex items-center gap-2 py-1.5 px-2 hover:bg-accent/50 rounded-sm"
          style={{ paddingLeft: `${indent + 8}px` }}
        >
          {hasChildren && <ChevronRight className="h-3 w-3" />}
          <span className="text-sm font-medium">{node.block.name}</span>
          <Badge variant="outline" className="text-xs">
            {node.block.type}
          </Badge>
          {node.block.mindboxSettings?.enabled && (
            <Badge variant="secondary" className="text-xs">
              Mindbox
            </Badge>
          )}
        </div>
        {hasChildren && (
          <div>
            {node.children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="p-4 space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-2">Hierarchy Preview</h3>
        <p className="text-xs text-muted-foreground">
          Auto-detected nesting based on visual layout
        </p>
      </div>

      {conflicts.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <div className="font-medium mb-1">Hierarchy Conflicts Detected:</div>
            <ul className="list-disc list-inside space-y-1">
              {conflicts.map((conflict, idx) => (
                <li key={idx}>
                  {conflict.blockA.name} overlaps with {conflict.blockB.name}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {conflicts.length === 0 && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Hierarchy is valid. No overlapping blocks detected.
          </AlertDescription>
        </Alert>
      )}

      <div className="border rounded-md p-2 max-h-[300px] overflow-y-auto">
        {tree.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            No blocks to display
          </p>
        ) : (
          tree.map((node) => renderNode(node))
        )}
      </div>
    </Card>
  );
}
