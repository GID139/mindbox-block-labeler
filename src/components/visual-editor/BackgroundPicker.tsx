import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ColorPickerInput } from './ColorPickerInput';
import { BackgroundSetting } from '@/types/visual-editor';

interface BackgroundPickerProps {
  value: BackgroundSetting;
  onChange: (value: BackgroundSetting) => void;
}

const gradientPresets = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
];

export function BackgroundPicker({ value, onChange }: BackgroundPickerProps) {
  const [activeTab, setActiveTab] = useState<string>(value.type || 'transparent');

  const handleTypeChange = (type: BackgroundSetting['type']) => {
    setActiveTab(type);
    onChange({ ...value, type });
  };

  return (
    <div className="space-y-3">
      <Label className="text-xs">Background</Label>
      <Tabs value={activeTab} onValueChange={(v) => handleTypeChange(v as BackgroundSetting['type'])}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="transparent">None</TabsTrigger>
          <TabsTrigger value="color">Color</TabsTrigger>
          <TabsTrigger value="image">Image</TabsTrigger>
          <TabsTrigger value="gradient">Gradient</TabsTrigger>
        </TabsList>

        <TabsContent value="transparent" className="text-xs text-muted-foreground mt-2">
          Transparent background
        </TabsContent>

        <TabsContent value="color" className="space-y-2 mt-2">
          <ColorPickerInput
            value={value.color || '#ffffff'}
            onChange={(color) => onChange({ ...value, type: 'color', color })}
          />
        </TabsContent>

        <TabsContent value="image" className="space-y-2 mt-2">
          <Input
            type="url"
            placeholder="Image URL"
            value={value.imageUrl || ''}
            onChange={(e) => onChange({ ...value, type: 'image', imageUrl: e.target.value })}
            className="h-8 text-xs"
          />
          <p className="text-[10px] text-muted-foreground">
            Enter a URL to an image (e.g., https://example.com/image.jpg)
          </p>
        </TabsContent>

        <TabsContent value="gradient" className="space-y-2 mt-2">
          <div className="grid grid-cols-3 gap-2">
            {gradientPresets.map((gradient, idx) => (
              <button
                key={idx}
                className="h-12 rounded border-2 hover:border-primary transition-colors"
                style={{ background: gradient }}
                onClick={() => onChange({ ...value, type: 'gradient', gradient })}
                title="Click to apply"
              />
            ))}
          </div>
          <Input
            placeholder="Custom gradient (CSS)"
            value={value.gradient || ''}
            onChange={(e) => onChange({ ...value, type: 'gradient', gradient: e.target.value })}
            className="h-8 text-xs"
          />
          <p className="text-[10px] text-muted-foreground">
            Example: linear-gradient(90deg, #FF0000, #0000FF)
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}