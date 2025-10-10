import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useVisualEditorStore } from '@/stores/visual-editor-store';
import { AutoLayoutSettings as AutoLayoutSettingsType } from '@/types/visual-editor';

interface AutoLayoutSettingsProps {
  blockId: string;
  settings: AutoLayoutSettingsType;
}

export function AutoLayoutSettings({ blockId, settings }: AutoLayoutSettingsProps) {
  const { updateBlock, blocks } = useVisualEditorStore();
  const block = blocks.find(b => b.id === blockId);

  if (!block) return null;

  const updateAutoLayout = (updates: Partial<AutoLayoutSettingsType>) => {
    const newSettings = {
      ...block.settings,
      autoLayout: {
        ...settings,
        ...updates,
      },
    };
    updateBlock(blockId, { settings: newSettings });
  };

  const updatePadding = (side: 'top' | 'right' | 'bottom' | 'left', value: number) => {
    updateAutoLayout({
      padding: {
        ...settings.padding,
        [side]: value,
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Auto-Layout</Label>
        <Switch
          checked={settings.enabled}
          onCheckedChange={(enabled) => updateAutoLayout({ enabled })}
        />
      </div>

      {settings.enabled && (
        <>
          <div className="space-y-2">
            <Label>Direction</Label>
            <Select
              value={settings.direction}
              onValueChange={(direction: 'horizontal' | 'vertical') =>
                updateAutoLayout({ direction })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="horizontal">Horizontal</SelectItem>
                <SelectItem value="vertical">Vertical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Gap</Label>
            <Input
              type="number"
              value={settings.gap}
              onChange={(e) => updateAutoLayout({ gap: parseInt(e.target.value) || 0 })}
              min={0}
            />
          </div>

          <div className="space-y-2">
            <Label>Padding</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Top</Label>
                <Input
                  type="number"
                  value={settings.padding.top}
                  onChange={(e) => updatePadding('top', parseInt(e.target.value) || 0)}
                  min={0}
                />
              </div>
              <div>
                <Label className="text-xs">Right</Label>
                <Input
                  type="number"
                  value={settings.padding.right}
                  onChange={(e) => updatePadding('right', parseInt(e.target.value) || 0)}
                  min={0}
                />
              </div>
              <div>
                <Label className="text-xs">Bottom</Label>
                <Input
                  type="number"
                  value={settings.padding.bottom}
                  onChange={(e) => updatePadding('bottom', parseInt(e.target.value) || 0)}
                  min={0}
                />
              </div>
              <div>
                <Label className="text-xs">Left</Label>
                <Input
                  type="number"
                  value={settings.padding.left}
                  onChange={(e) => updatePadding('left', parseInt(e.target.value) || 0)}
                  min={0}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Align</Label>
            <Select
              value={settings.align}
              onValueChange={(align: 'start' | 'center' | 'end') => updateAutoLayout({ align })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="start">Start</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="end">End</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Justify</Label>
            <Select
              value={settings.justify}
              onValueChange={(justify: 'start' | 'center' | 'end' | 'space-between' | 'space-around') =>
                updateAutoLayout({ justify })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="start">Start</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="end">End</SelectItem>
                <SelectItem value="space-between">Space Between</SelectItem>
                <SelectItem value="space-around">Space Around</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}
    </div>
  );
}
