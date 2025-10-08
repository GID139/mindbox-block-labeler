import { useVisualEditorStore } from '@/stores/visual-editor-store';
import { getTemplate } from '@/lib/visual-editor/block-templates';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ColorPickerInput } from './ColorPickerInput';
import { X, Combine, Split } from 'lucide-react';
import { buttonPresets, textPresets } from '@/lib/visual-editor/presets';

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
  const { blocks, selectedBlockIds, updateBlock } = useVisualEditorStore();
  
  const selectedBlockId = selectedBlockIds[0];
  
  if (!selectedBlockId) return null;
  
  const block = findBlockById(blocks, selectedBlockId);
  if (!block) return null;

  const updateSettings = (newSettings: any) => {
    updateBlock(block.id, { 
      settings: { ...block.settings, ...newSettings } 
    });
  };

  const applyPreset = (preset: any) => {
    updateSettings(preset);
  };

  const template = getTemplate(block.type);

  const renderSettings = () => {
    switch (block.type) {
      case 'TEXT':
        return (
          <Accordion type="multiple" defaultValue={['content', 'style']}>
            <AccordionItem value="content">
              <AccordionTrigger>📝 Content</AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div>
                  <Label>Text Content</Label>
                  <Textarea
                    value={block.settings.text || ''}
                    onChange={(e) => updateSettings({ text: e.target.value })}
                    className="mt-1 font-mono text-sm"
                    rows={4}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="style">
              <AccordionTrigger>🎨 Style</AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div>
                  <Label>Presets</Label>
                  <Select onValueChange={(preset) => applyPreset(textPresets[preset])}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Choose preset" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="heading">Heading</SelectItem>
                      <SelectItem value="subheading">Subheading</SelectItem>
                      <SelectItem value="body">Body Text</SelectItem>
                      <SelectItem value="caption">Caption</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Font Size</Label>
                  <Input
                    type="number"
                    value={block.settings.fontSize || ''}
                    onChange={(e) => updateSettings({ fontSize: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Font Weight</Label>
                  <Select
                    value={block.settings.fontWeight}
                    onValueChange={(value) => updateSettings({ fontWeight: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="bold">Bold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <ColorPickerInput
                  label="Text Color"
                  value={block.settings.color || '#000000'}
                  onChange={(value) => updateSettings({ color: value })}
                />

                <div>
                  <Label>Text Align</Label>
                  <Select
                    value={block.settings.textAlign}
                    onValueChange={(value) => updateSettings({ textAlign: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        );

      case 'BUTTON':
        return (
          <Accordion type="multiple" defaultValue={['content', 'style']}>
            <AccordionItem value="content">
              <AccordionTrigger>📝 Content</AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div>
                  <Label>Button Text</Label>
                  <Input
                    value={block.settings.text || ''}
                    onChange={(e) => updateSettings({ text: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Link URL</Label>
                  <Input
                    value={block.settings.href || ''}
                    onChange={(e) => updateSettings({ href: e.target.value })}
                    className="mt-1"
                    placeholder="https://example.com"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="style">
              <AccordionTrigger>🎨 Style</AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div>
                  <Label>Presets</Label>
                  <Select onValueChange={(preset) => applyPreset(buttonPresets[preset])}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Choose preset" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">Primary Button</SelectItem>
                      <SelectItem value="secondary">Secondary Button</SelectItem>
                      <SelectItem value="success">Success Button</SelectItem>
                      <SelectItem value="danger">Danger Button</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <ColorPickerInput
                  label="Background Color"
                  value={block.settings.backgroundColor || '#39AA5D'}
                  onChange={(value) => updateSettings({ backgroundColor: value })}
                />

                <ColorPickerInput
                  label="Text Color"
                  value={block.settings.textColor || '#FFFFFF'}
                  onChange={(value) => updateSettings({ textColor: value })}
                />

                <div>
                  <Label>Border Radius</Label>
                  <Input
                    type="number"
                    value={block.settings.borderRadius || ''}
                    onChange={(e) => updateSettings({ borderRadius: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        );

      case 'IMAGE':
        return (
          <Accordion type="multiple" defaultValue={['content', 'layout']}>
            <AccordionItem value="content">
              <AccordionTrigger>📝 Content</AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div>
                  <Label>Image URL</Label>
                  <Input
                    value={block.settings.url || ''}
                    onChange={(e) => updateSettings({ url: e.target.value })}
                    className="mt-1"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <Label>Alt Text</Label>
                  <Input
                    value={block.settings.alt || ''}
                    onChange={(e) => updateSettings({ alt: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="layout">
              <AccordionTrigger>📐 Layout</AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div>
                  <Label>Width</Label>
                  <Input
                    value={block.settings.width || ''}
                    onChange={(e) => updateSettings({ width: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Height</Label>
                  <Input
                    value={block.settings.height || ''}
                    onChange={(e) => updateSettings({ height: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        );

      case 'CONTAINER':
        return (
          <Accordion type="multiple" defaultValue={['style', 'layout']}>
            <AccordionItem value="style">
              <AccordionTrigger>🎨 Style</AccordionTrigger>
              <AccordionContent className="space-y-3">
                <ColorPickerInput
                  label="Background Color"
                  value={block.settings.backgroundColor || ''}
                  onChange={(value) => updateSettings({ backgroundColor: value })}
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="layout">
              <AccordionTrigger>📐 Layout</AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div>
                  <Label>Padding</Label>
                  <Input
                    value={block.settings.padding || ''}
                    onChange={(e) => updateSettings({ padding: e.target.value })}
                    className="mt-1"
                    placeholder="e.g., 20px"
                  />
                </div>

                <div>
                  <Label>Width</Label>
                  <Input
                    value={block.settings.width || ''}
                    onChange={(e) => updateSettings({ width: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Layout Direction</Label>
                  <Select
                    value={block.settings.layout || 'vertical'}
                    onValueChange={(value) => updateSettings({ layout: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vertical">Vertical</SelectItem>
                      <SelectItem value="horizontal">Horizontal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        );

      case 'TABLE':
        return (
          <Accordion type="multiple" defaultValue={['structure']}>
            <AccordionItem value="structure">
              <AccordionTrigger>📊 Table Structure</AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Rows: {block.settings.rows}</Label>
                  </div>
                  <div>
                    <Label>Cols: {block.settings.cols}</Label>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                  💡 Click on table cells in the canvas to add content. Use merge/resize controls on individual cells.
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        );

      default:
        return (
          <div className="space-y-3">
            {Object.entries(block.settings).map(([key, value]) => (
              <div key={key}>
                <Label>{key}</Label>
                <Input
                  value={String(value)}
                  onChange={(e) => updateSettings({ [key]: e.target.value })}
                  className="mt-1"
                />
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="p-4 space-y-4">
      <Card className="p-4">
        <div className="space-y-3">
          <div>
            <Label>Block Name</Label>
            <Input
              value={block.name}
              onChange={(e) => updateBlock(block.id, { name: e.target.value })}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label>Type</Label>
            <div className="mt-1 px-3 py-2 bg-muted rounded text-sm">
              {template.icon} {block.type}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-3">Settings</h3>
        {renderSettings()}
      </Card>

      {block.children && block.children.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Children ({block.children.length})</h3>
          <div className="flex flex-wrap gap-2">
            {block.children.map((child: any) => (
              <div key={child.id} className="px-2 py-1 bg-muted rounded text-xs">
                {child.name}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
