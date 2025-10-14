import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { useVisualEditorStore } from '@/stores/visual-editor-store';
import { validateMindboxProject, formatValidationErrors } from '@/lib/visual-editor/mindbox-validator';
import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

export function MindboxValidationPanel() {
  const blocks = useVisualEditorStore(state => state.blocks);
  const visualLayout = useVisualEditorStore(state => state.visualLayout);
  const [validationResult, setValidationResult] = useState(() => 
    validateMindboxProject(blocks, visualLayout)
  );

  const handleRevalidate = () => {
    setValidationResult(validateMindboxProject(blocks, visualLayout));
  };

  const mindboxBlocksCount = blocks.filter(b => b.mindboxSettings?.enabled).length;

  if (mindboxBlocksCount === 0) {
    return (
      <Card className="p-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            No Mindbox blocks found. Enable Mindbox mode on blocks to see validation.
          </AlertDescription>
        </Alert>
      </Card>
    );
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Mindbox Validation</h3>
          <p className="text-xs text-muted-foreground">
            {mindboxBlocksCount} Mindbox block{mindboxBlocksCount !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRevalidate}
          className="gap-2"
        >
          <RefreshCw className="h-3 w-3" />
          Revalidate
        </Button>
      </div>

      {/* Status Summary */}
      <div className="flex gap-2">
        {validationResult.valid ? (
          <Badge variant="default" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Valid
          </Badge>
        ) : (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            {validationResult.errors.length} Error{validationResult.errors.length !== 1 ? 's' : ''}
          </Badge>
        )}
        
        {validationResult.warnings.length > 0 && (
          <Badge variant="secondary" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            {validationResult.warnings.length} Warning{validationResult.warnings.length !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* Errors */}
      {validationResult.errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="text-xs font-medium mb-2">Errors:</div>
            <ScrollArea className="h-[120px]">
              <ul className="text-xs space-y-1">
                {validationResult.errors.map((error, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="font-medium">[{error.blockName}]</span>
                    <span>{error.message}</span>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </AlertDescription>
        </Alert>
      )}

      {/* Warnings */}
      {validationResult.warnings.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="text-xs font-medium mb-2">Warnings:</div>
            <ScrollArea className="h-[100px]">
              <ul className="text-xs space-y-1">
                {validationResult.warnings.map((warning, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="font-medium">[{warning.blockName}]</span>
                    <span>{warning.message}</span>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </AlertDescription>
        </Alert>
      )}

      {/* Success */}
      {validationResult.valid && validationResult.warnings.length === 0 && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription className="text-xs">
            All validations passed! Ready to export.
          </AlertDescription>
        </Alert>
      )}
    </Card>
  );
}
