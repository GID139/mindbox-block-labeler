import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ColorPickerInput } from './ColorPickerInput';
import { Slider } from '@/components/ui/slider';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

interface KonvaStyleSettingsProps {
  settings: any;
  onUpdate: (settings: any) => void;
  showFillColor?: boolean;
}

export function KonvaStyleSettings({ settings, onUpdate, showFillColor = false }: KonvaStyleSettingsProps) {
  return (
    <Accordion type="multiple" className="border rounded-md">
      <AccordionItem value="styles" className="border-0">
        <AccordionTrigger className="px-3 py-2 text-sm hover:no-underline">
          <span className="flex items-center gap-2">
            Styles
            <Badge variant="outline" className="text-xs">Konva</Badge>
          </span>
        </AccordionTrigger>
        <AccordionContent className="px-3 pb-3 space-y-3">
          {showFillColor && (
            <ColorPickerInput
              label="Fill Color"
              value={settings.fill || '#000000'}
              onChange={(value) => onUpdate({ fill: value })}
            />
          )}

          <div>
            <Label className="text-sm">Stroke</Label>
            <div className="grid grid-cols-2 gap-2 mt-1.5">
              <ColorPickerInput
                label="Color"
                value={settings.stroke || ''}
                onChange={(value) => onUpdate({ stroke: value })}
              />
              <div>
                <Label className="text-xs text-muted-foreground">Width (px)</Label>
                <Input
                  type="number"
                  value={settings.strokeWidth || 0}
                  onChange={(e) => onUpdate({ strokeWidth: parseInt(e.target.value) || 0 })}
                  className="h-9"
                  min={0}
                  max={10}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Shadow</Label>
            <ColorPickerInput
              label="Color"
              value={settings.shadowColor || '#000000'}
              onChange={(value) => onUpdate({ shadowColor: value })}
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-muted-foreground">Offset X</Label>
                <Input
                  type="number"
                  value={settings.shadowOffsetX || 0}
                  onChange={(e) => onUpdate({ shadowOffsetX: parseInt(e.target.value) || 0 })}
                  className="h-9"
                  min={-100}
                  max={100}
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Offset Y</Label>
                <Input
                  type="number"
                  value={settings.shadowOffsetY || 0}
                  onChange={(e) => onUpdate({ shadowOffsetY: parseInt(e.target.value) || 0 })}
                  className="h-9"
                  min={-100}
                  max={100}
                />
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Blur (px)</Label>
              <Input
                type="number"
                value={settings.shadowBlur || 0}
                onChange={(e) => onUpdate({ shadowBlur: parseInt(e.target.value) || 0 })}
                className="h-9"
                min={0}
                max={50}
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Shadow Opacity</Label>
              <Slider
                value={[parseFloat(settings.shadowOpacity) || 0]}
                onValueChange={([value]) => onUpdate({ shadowOpacity: value })}
                min={0}
                max={1}
                step={0.1}
                className="mt-2"
              />
              <div className="text-xs text-muted-foreground mt-1 text-center">
                {(parseFloat(settings.shadowOpacity) || 0).toFixed(1)}
              </div>
            </div>
          </div>

          <div>
            <Label className="text-sm">Opacity</Label>
            <Slider
              value={[parseFloat(settings.opacity) || 1]}
              onValueChange={([value]) => onUpdate({ opacity: value })}
              min={0}
              max={1}
              step={0.1}
              className="mt-2"
            />
            <div className="text-xs text-muted-foreground mt-1 text-center">
              {(parseFloat(settings.opacity) || 1).toFixed(1)}
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
