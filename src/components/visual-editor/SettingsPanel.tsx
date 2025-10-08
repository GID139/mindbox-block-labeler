import { useVisualEditorStore } from '@/stores/visual-editor-store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { validateBlockName } from '@/lib/visual-editor/naming';
import { toast } from 'sonner';
import { ColorPickerInput } from './ColorPickerInput';

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
  const { blocks, selectedBlockId, updateBlock, updateSetting, updateTableSize, updateCellSetting } = useVisualEditorStore();
  
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
    const labelText = key.replace(/([A-Z])/g, ' $1').trim();
    
    // Boolean (Switch)
    if (typeof value === 'boolean') {
      return (
        <div key={key} className="flex items-center justify-between">
          <Label htmlFor={key} className="text-xs capitalize">
            {labelText}
          </Label>
          <Switch
            id={key}
            checked={value}
            onCheckedChange={(checked) => updateSetting(selectedBlockId, key, checked)}
          />
        </div>
      );
    }
    
    // Color (if key contains 'color' or 'Color')
    if (typeof value === 'string' && (key.toLowerCase().includes('color') || value.match(/^#[0-9A-Fa-f]{6}$/))) {
      return (
        <ColorPickerInput
          key={key}
          label={labelText}
          value={value}
          onChange={(newValue) => updateSetting(selectedBlockId, key, newValue)}
        />
      );
    }
    
    // Number input (if value is a number string or actual number)
    if (typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value)) && value !== '')) {
      return (
        <div key={key}>
          <Label htmlFor={key} className="text-xs capitalize">
            {labelText}
          </Label>
          <Input
            id={key}
            type="number"
            value={value}
            onChange={(e) => updateSetting(selectedBlockId, key, e.target.value)}
            className="mt-1"
          />
        </div>
      );
    }
    
    // Text input (default)
    if (typeof value === 'string') {
      // Textarea for longer text (if key is 'text' or value is long)
      if (key === 'text' || value.length > 50) {
        return (
          <div key={key}>
            <Label htmlFor={key} className="text-xs capitalize">
              {labelText}
            </Label>
            <textarea
              id={key}
              value={value}
              onChange={(e) => updateSetting(selectedBlockId, key, e.target.value)}
              className="mt-1 w-full min-h-[60px] px-3 py-2 text-sm border border-input rounded-md bg-background"
            />
          </div>
        );
      }
      
      return (
        <div key={key}>
          <Label htmlFor={key} className="text-xs capitalize">
            {labelText}
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
            {block.type === 'TABLE' ? (
              // Special handling for TABLE blocks
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <Label className="text-xs">Rows: {block.settings.rows}</Label>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateTableSize(selectedBlockId, 'rows', 1)}
                      className="h-7 px-2"
                    >
                      + Row
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateTableSize(selectedBlockId, 'rows', -1)}
                      disabled={block.settings.rows <= 1}
                      className="h-7 px-2"
                    >
                      - Row
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between gap-2">
                  <Label className="text-xs">Cols: {block.settings.cols}</Label>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateTableSize(selectedBlockId, 'cols', 1)}
                      className="h-7 px-2"
                    >
                      + Col
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateTableSize(selectedBlockId, 'cols', -1)}
                      disabled={block.settings.cols <= 1}
                      className="h-7 px-2"
                    >
                      - Col
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="text-xs text-muted-foreground">
                  Total cells: {block.settings.rows * block.settings.cols}
                </div>
              </div>
            ) : (
              // Regular settings for other blocks
              Object.entries(block.settings).map(([key, value]) => 
                renderSettingControl(key, value)
              )
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
