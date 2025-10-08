import { useVisualEditorStore } from '@/stores/visual-editor-store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings } from 'lucide-react';
import { ColorPickerInput } from './ColorPickerInput';

export function GlobalStylesDialog() {
  const { globalStyles, setGlobalStyles } = useVisualEditorStore();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Project Settings">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Global Project Styles</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label>Default Font</Label>
            <Select
              value={globalStyles.defaultFont}
              onValueChange={(value: any) => setGlobalStyles({ defaultFont: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Arial">Arial</SelectItem>
                <SelectItem value="Helvetica">Helvetica</SelectItem>
                <SelectItem value="Roboto">Roboto</SelectItem>
                <SelectItem value="Open Sans">Open Sans</SelectItem>
                <SelectItem value="Montserrat">Montserrat</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Default Font Size</Label>
            <Input
              type="number"
              value={globalStyles.defaultFontSize}
              onChange={(e) => setGlobalStyles({ defaultFontSize: Number(e.target.value) })}
              className="mt-1"
            />
          </div>

          <ColorPickerInput
            label="Default Text Color"
            value={globalStyles.defaultTextColor}
            onChange={(value) => setGlobalStyles({ defaultTextColor: value })}
          />

          <ColorPickerInput
            label="Default Background Color"
            value={globalStyles.defaultBackgroundColor}
            onChange={(value) => setGlobalStyles({ defaultBackgroundColor: value })}
          />

          <div>
            <Label>Default Padding (px)</Label>
            <Input
              type="number"
              value={globalStyles.defaultPadding}
              onChange={(e) => setGlobalStyles({ defaultPadding: Number(e.target.value) })}
              className="mt-1"
            />
          </div>

          <ColorPickerInput
            label="Default Button Color"
            value={globalStyles.defaultButtonColor}
            onChange={(value) => setGlobalStyles({ defaultButtonColor: value })}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}