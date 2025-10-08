import { useVisualEditorStore } from '@/stores/visual-editor-store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { validateBlockName } from '@/lib/visual-editor/naming';
import { toast } from 'sonner';

function findBlockById(blocks: any[], id: string): any {
  for (const block of blocks) {
    if (block.id === id) return block;
    if (block.children?.length > 0) {
      const found = findBlockById(block.children, id);
      if (found) return found;
    }
  }
  return null;
}

export function SettingsPanel() {
  const { blocks, selectedBlockId, updateBlock, updateSetting } = useVisualEditorStore();
  
  if (!selectedBlockId) return null;
  
  const block = findBlockById(blocks, selectedBlockId);
  if (!block) return null;

  const handleNameChange = (newName: string) => {
    if (!validateBlockName(newName)) {
      toast.error('Name can only contain letters, numbers, and underscores');
      return;
    }
    
    updateBlock(selectedBlockId, { name: newName });
  };

  const renderSettingControl = (key: string, value: any) => {
    // Basic text/number input
    if (typeof value === 'string' || typeof value === 'number') {
      return (
        <div key={key}>
          <Label htmlFor={key} className="text-xs capitalize">
            {key.replace(/([A-Z])/g, ' $1').trim()}
          </Label>
          <Input
            id={key}
            value={value}
            onChange={(e) => updateSetting(selectedBlockId, key, e.target.value)}
            className="mt-1"
          />
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="text-sm font-semibold mb-2">Block Settings</h3>
        <Card className="p-3">
          <div className="space-y-3">
            <div>
              <Label htmlFor="block-name" className="text-xs">Block Name</Label>
              <Input
                id="block-name"
                value={block.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs">Type</Label>
              <div className="text-sm text-muted-foreground mt-1">{block.type}</div>
            </div>
          </div>
        </Card>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-semibold mb-2">Properties</h3>
        <Card className="p-3">
          <div className="space-y-3">
            {Object.entries(block.settings).map(([key, value]) => 
              renderSettingControl(key, value)
            )}
          </div>
        </Card>
      </div>

      {block.children && block.children.length > 0 && (
        <>
          <Separator />
          <div>
            <h3 className="text-sm font-semibold mb-2">Children</h3>
            <Card className="p-3">
              <div className="text-xs text-muted-foreground">
                {block.children.length} child block(s)
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
