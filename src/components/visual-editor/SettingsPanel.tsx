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
import { BackgroundPicker } from './BackgroundPicker';
import { Badge } from '@/components/ui/badge';
import { buttonPresets, textPresets } from '@/lib/visual-editor/presets';
import { BackgroundSetting, BlockInstance } from '@/types/visual-editor';
import { cn } from '@/lib/utils';

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
  const { blocks, selectedBlockIds, updateBlock, visualLayout, updateVisualLayout, selectedTableCell, selectBlock } = useVisualEditorStore();
  
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

  const layout = visualLayout[block.id];

  const renderSettings = () => {
    switch (block.type) {
      case 'TEXT':
        return (
          <div className="space-y-4">
            {/* Primary Settings */}
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Text Content</Label>
                <Textarea
                  value={block.settings.text || ''}
                  onChange={(e) => updateSettings({ text: e.target.value })}
                  className="mt-1.5 min-h-[80px]"
                  placeholder="Enter text..."
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-sm">Font Size (px)</Label>
                <Input
                  type="number"
                  value={parseInt(block.settings.fontSize) || 16}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 16;
                    updateSettings({ fontSize: `${value}px` });
                  }}
                  className="mt-1.5 h-9"
                  placeholder="16"
                  min={8}
                  max={200}
                />
              </div>

                <ColorPickerInput
                  label="Color"
                  value={block.settings.color || '#000000'}
                  onChange={(value) => updateSettings({ color: value })}
                />
              </div>
            </div>

            {/* Advanced Settings */}
            <Accordion type="multiple" className="border rounded-md">
              <AccordionItem value="advanced" className="border-0">
                <AccordionTrigger className="px-3 py-2 text-sm hover:no-underline">
                  <span className="flex items-center gap-2">
                    Advanced
                    <Badge variant="outline" className="text-xs">Optional</Badge>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-3 space-y-3">
                  <BackgroundPicker
                    value={block.settings.background || { type: 'transparent' }}
                    onChange={(background) => updateSettings({ background })}
                  />
                  
                  <div>
                    <Label className="text-sm">Padding (px)</Label>
                    <Input
                      type="text"
                      value={block.settings.padding || '10px'}
                      onChange={(e) => updateSettings({ padding: e.target.value })}
                      className="mt-1.5 h-9"
                      placeholder="10px"
                    />
                  </div>

                  <div>
                    <Label className="text-sm">Presets</Label>
                    <Select onValueChange={(preset) => applyPreset(textPresets[preset])}>
                      <SelectTrigger className="mt-1.5 h-9">
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
                    <Label className="text-sm">Font Weight</Label>
                    <Select
                      value={block.settings.fontWeight || 'normal'}
                      onValueChange={(value) => updateSettings({ fontWeight: value })}
                    >
                      <SelectTrigger className="mt-1.5 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="bold">Bold</SelectItem>
                        <SelectItem value="light">Light</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm">Text Align</Label>
                    <Select
                      value={block.settings.textAlign || 'left'}
                      onValueChange={(value) => updateSettings({ textAlign: value })}
                    >
                      <SelectTrigger className="mt-1.5 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm">Line Height</Label>
                    <Input
                      type="text"
                      value={block.settings.lineHeight || '1.5'}
                      onChange={(e) => updateSettings({ lineHeight: e.target.value })}
                      className="mt-1.5 h-9"
                      placeholder="1.5"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        );

      case 'BUTTON':
        return (
          <div className="space-y-4">
            {/* Primary Settings */}
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Button Text</Label>
                <Input
                  value={block.settings.text || ''}
                  onChange={(e) => updateSettings({ text: e.target.value })}
                  className="mt-1.5 h-9"
                  placeholder="Click me"
                />
              </div>

              <ColorPickerInput
                label="Background Color"
                value={block.settings.backgroundColor || '#007bff'}
                onChange={(value) => updateSettings({ backgroundColor: value })}
              />

              <div>
                <Label className="text-sm">Link URL</Label>
                <Input
                  type="url"
                  value={block.settings.href || ''}
                  onChange={(e) => updateSettings({ href: e.target.value })}
                  className="mt-1.5 h-9"
                  placeholder="https://example.com"
                />
              </div>
            </div>

            {/* Advanced Settings */}
            <Accordion type="multiple" className="border rounded-md">
              <AccordionItem value="advanced" className="border-0">
                <AccordionTrigger className="px-3 py-2 text-sm hover:no-underline">
                  <span className="flex items-center gap-2">
                    Advanced
                    <Badge variant="outline" className="text-xs">Optional</Badge>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-3 space-y-3">
                  <div>
                    <Label className="text-sm">Presets</Label>
                    <Select onValueChange={(preset) => applyPreset(buttonPresets[preset])}>
                      <SelectTrigger className="mt-1.5 h-9">
                        <SelectValue placeholder="Choose preset" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="primary">Primary</SelectItem>
                        <SelectItem value="secondary">Secondary</SelectItem>
                        <SelectItem value="outline">Outline</SelectItem>
                        <SelectItem value="ghost">Ghost</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <ColorPickerInput
                    label="Text Color"
                    value={block.settings.color || '#ffffff'}
                    onChange={(value) => updateSettings({ color: value })}
                  />

                  <div>
                    <Label className="text-sm">Border Radius</Label>
                    <Input
                      type="text"
                      value={block.settings.borderRadius || '4px'}
                      onChange={(e) => updateSettings({ borderRadius: e.target.value })}
                      className="mt-1.5 h-9"
                      placeholder="4px"
                    />
                  </div>

                  <div>
                    <Label className="text-sm">Padding</Label>
                    <Input
                      type="text"
                      value={block.settings.padding || '8px 16px'}
                      onChange={(e) => updateSettings({ padding: e.target.value })}
                      className="mt-1.5 h-9"
                      placeholder="8px 16px"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        );

      case 'IMAGE':
        return (
          <div className="space-y-4">
            {/* Primary Settings */}
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Image URL</Label>
                <Input
                  type="url"
                  value={block.settings.url || ''}
                  onChange={(e) => {
                    const url = e.target.value;
                    updateSettings({ url, src: url });
                  }}
                  className="mt-1.5 h-9"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <Label className="text-sm">Alt Text</Label>
                <Input
                  value={block.settings.alt || ''}
                  onChange={(e) => updateSettings({ alt: e.target.value })}
                  className="mt-1.5 h-9"
                  placeholder="Image description"
                />
              </div>
            </div>

            {/* Advanced Settings */}
            <Accordion type="multiple" className="border rounded-md">
              <AccordionItem value="advanced" className="border-0">
                <AccordionTrigger className="px-3 py-2 text-sm hover:no-underline">
                  <span className="flex items-center gap-2">
                    Advanced
                    <Badge variant="outline" className="text-xs">Optional</Badge>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-3 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-sm">Width (px)</Label>
                      <Input
                        type="text"
                        value={block.settings.width || 'auto'}
                        onChange={(e) => updateSettings({ width: e.target.value })}
                        className="mt-1.5 h-9"
                        placeholder="auto"
                      />
                    </div>

                    <div>
                      <Label className="text-sm">Height (px)</Label>
                      <Input
                        type="text"
                        value={block.settings.height || 'auto'}
                        onChange={(e) => updateSettings({ height: e.target.value })}
                        className="mt-1.5 h-9"
                        placeholder="auto"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm">Border Radius</Label>
                    <Input
                      type="text"
                      value={block.settings.borderRadius || '0px'}
                      onChange={(e) => updateSettings({ borderRadius: e.target.value })}
                      className="mt-1.5 h-9"
                      placeholder="0px"
                    />
                  </div>

                  <div>
                    <Label className="text-sm">Object Fit</Label>
                    <Select
                      value={block.settings.objectFit || 'cover'}
                      onValueChange={(value) => updateSettings({ objectFit: value })}
                    >
                      <SelectTrigger className="mt-1.5 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cover">Cover</SelectItem>
                        <SelectItem value="contain">Contain</SelectItem>
                        <SelectItem value="fill">Fill</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        );

      case 'CONTAINER':
      case 'FLEX_CONTAINER':
        return (
          <div className="space-y-4">
            {/* Primary Settings */}
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Layout Direction</Label>
                <Select
                  value={block.settings.flexDirection || 'row'}
                  onValueChange={(value) => updateSettings({ flexDirection: value })}
                >
                  <SelectTrigger className="mt-1.5 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="row">Horizontal (Row)</SelectItem>
                    <SelectItem value="column">Vertical (Column)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm">Gap (px)</Label>
                <Input
                  type="text"
                  value={block.settings.gap || '16px'}
                  onChange={(e) => updateSettings({ gap: e.target.value })}
                  className="mt-1.5 h-9"
                  placeholder="16px"
                />
              </div>

              <ColorPickerInput
                label="Background Color"
                value={block.settings.backgroundColor || 'transparent'}
                onChange={(value) => updateSettings({ backgroundColor: value })}
              />
            </div>

            {/* Advanced Settings */}
            <Accordion type="multiple" className="border rounded-md">
              <AccordionItem value="advanced" className="border-0">
                <AccordionTrigger className="px-3 py-2 text-sm hover:no-underline">
                  <span className="flex items-center gap-2">
                    Advanced
                    <Badge variant="outline" className="text-xs">Optional</Badge>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-3 space-y-3">
                  <div>
                    <Label className="text-sm">Justify Content</Label>
                    <Select
                      value={block.settings.justifyContent || 'flex-start'}
                      onValueChange={(value) => updateSettings({ justifyContent: value })}
                    >
                      <SelectTrigger className="mt-1.5 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="flex-start">Start</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="flex-end">End</SelectItem>
                        <SelectItem value="space-between">Space Between</SelectItem>
                        <SelectItem value="space-around">Space Around</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm">Align Items</Label>
                    <Select
                      value={block.settings.alignItems || 'stretch'}
                      onValueChange={(value) => updateSettings({ alignItems: value })}
                    >
                      <SelectTrigger className="mt-1.5 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stretch">Stretch</SelectItem>
                        <SelectItem value="flex-start">Start</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="flex-end">End</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm">Padding (px)</Label>
                    <Input
                      type="text"
                      value={block.settings.padding || '10px'}
                      onChange={(e) => updateSettings({ padding: e.target.value })}
                      className="mt-1.5 h-9"
                      placeholder="10px"
                    />
                  </div>

                  <div>
                    <Label className="text-sm">Border Radius</Label>
                    <Input
                      type="text"
                      value={block.settings.borderRadius || '0px'}
                      onChange={(e) => updateSettings({ borderRadius: e.target.value })}
                      className="mt-1.5 h-9"
                      placeholder="0px"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        );

      case 'GRID_CONTAINER':
        return (
          <div className="space-y-4">
            {/* Primary Settings */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-sm font-medium">Columns</Label>
                  <Input
                    type="number"
                    value={block.settings.gridTemplateColumns?.split(' ').length || 2}
                    onChange={(e) => {
                      const cols = parseInt(e.target.value) || 2;
                      updateSettings({ gridTemplateColumns: `repeat(${cols}, 1fr)` });
                    }}
                    className="mt-1.5 h-9"
                    min={1}
                  />
                </div>

                <div>
                  <Label className="text-sm">Gap (px)</Label>
                  <Input
                    type="text"
                    value={block.settings.gap || '16px'}
                    onChange={(e) => updateSettings({ gap: e.target.value })}
                    className="mt-1.5 h-9"
                    placeholder="16px"
                  />
                </div>
              </div>

              <ColorPickerInput
                label="Background Color"
                value={block.settings.backgroundColor || 'transparent'}
                onChange={(value) => updateSettings({ backgroundColor: value })}
              />
            </div>

            {/* Advanced Settings */}
            <Accordion type="multiple" className="border rounded-md">
              <AccordionItem value="advanced" className="border-0">
                <AccordionTrigger className="px-3 py-2 text-sm hover:no-underline">
                  <span className="flex items-center gap-2">
                    Advanced
                    <Badge variant="outline" className="text-xs">Optional</Badge>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-3 space-y-3">
                  <div>
                    <Label className="text-sm">Grid Template</Label>
                    <Input
                      type="text"
                      value={block.settings.gridTemplateColumns || 'repeat(2, 1fr)'}
                      onChange={(e) => updateSettings({ gridTemplateColumns: e.target.value })}
                      className="mt-1.5 h-9"
                      placeholder="repeat(2, 1fr)"
                    />
                  </div>

                  <div>
                    <Label className="text-sm">Padding (px)</Label>
                    <Input
                      type="text"
                      value={block.settings.padding || '10px'}
                      onChange={(e) => updateSettings({ padding: e.target.value })}
                      className="mt-1.5 h-9"
                      placeholder="10px"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        );

      case 'RECTANGLE':
      case 'CIRCLE':
        return (
          <div className="space-y-4">
            {/* Primary Settings */}
            <div className="space-y-3">
              <ColorPickerInput
                label="Fill Color"
                value={block.settings.fill || '#cccccc'}
                onChange={(value) => updateSettings({ fill: value })}
              />

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-sm">Width (px)</Label>
                  <Input
                    type="text"
                    value={block.settings.width || '100px'}
                    onChange={(e) => updateSettings({ width: e.target.value })}
                    className="mt-1.5 h-9"
                    placeholder="100px"
                  />
                </div>

                <div>
                  <Label className="text-sm">Height (px)</Label>
                  <Input
                    type="text"
                    value={block.settings.height || '100px'}
                    onChange={(e) => updateSettings({ height: e.target.value })}
                    className="mt-1.5 h-9"
                    placeholder="100px"
                  />
                </div>
              </div>
            </div>

            {/* Advanced Settings */}
            <Accordion type="multiple" className="border rounded-md">
              <AccordionItem value="advanced" className="border-0">
                <AccordionTrigger className="px-3 py-2 text-sm hover:no-underline">
                  <span className="flex items-center gap-2">
                    Advanced
                    <Badge variant="outline" className="text-xs">Optional</Badge>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-3 space-y-3">
                  <ColorPickerInput
                    label="Stroke Color"
                    value={block.settings.stroke || '#000000'}
                    onChange={(value) => updateSettings({ stroke: value })}
                  />

                  <div>
                    <Label className="text-sm">Stroke Width</Label>
                    <Input
                      type="text"
                      value={block.settings.strokeWidth || '1px'}
                      onChange={(e) => updateSettings({ strokeWidth: e.target.value })}
                      className="mt-1.5 h-9"
                      placeholder="1px"
                    />
                  </div>

                  {block.type === 'RECTANGLE' && (
                    <div>
                      <Label className="text-sm">Border Radius</Label>
                      <Input
                        type="text"
                        value={block.settings.borderRadius || '0px'}
                        onChange={(e) => updateSettings({ borderRadius: e.target.value })}
                        className="mt-1.5 h-9"
                        placeholder="0px"
                      />
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        );

      case 'TABLE':
        const { selectedTableCell, selectTableCell, clearTableCellSelection, updateCellSetting } = useVisualEditorStore.getState();
        const tableSettings = block.settings as any;
        const rows = tableSettings.rows || 2;
        const cols = tableSettings.cols || 2;
        
        return (
          <div className="space-y-4">
            {/* Table Size Controls */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-sm font-medium">Rows</Label>
                  <div className="flex items-center gap-1 mt-1.5">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-9 w-9"
                      onClick={() => {
                        const { updateTableSize } = useVisualEditorStore.getState();
                        updateTableSize(block.id, 'rows', -1);
                      }}
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      value={rows}
                      onChange={(e) => {
                        const newRows = parseInt(e.target.value) || 2;
                        const { updateTableSize } = useVisualEditorStore.getState();
                        updateTableSize(block.id, 'rows', newRows - rows);
                      }}
                      className="h-9 text-center"
                      min={1}
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-9 w-9"
                      onClick={() => {
                        const { updateTableSize } = useVisualEditorStore.getState();
                        updateTableSize(block.id, 'rows', 1);
                      }}
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Columns</Label>
                  <div className="flex items-center gap-1 mt-1.5">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-9 w-9"
                      onClick={() => {
                        const { updateTableSize } = useVisualEditorStore.getState();
                        updateTableSize(block.id, 'cols', -1);
                      }}
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      value={cols}
                      onChange={(e) => {
                        const newCols = parseInt(e.target.value) || 2;
                        const { updateTableSize } = useVisualEditorStore.getState();
                        updateTableSize(block.id, 'cols', newCols - cols);
                      }}
                      className="h-9 text-center"
                      min={1}
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-9 w-9"
                      onClick={() => {
                        const { updateTableSize } = useVisualEditorStore.getState();
                        updateTableSize(block.id, 'cols', 1);
                      }}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Table Cell Selector */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Select Cell to Configure</Label>
              <div className="border rounded-md p-2 bg-muted/30">
                <div className="space-y-1">
                  {Array.from({ length: rows }, (_, rowIdx) => (
                    <div key={rowIdx} className="flex gap-1">
                      {Array.from({ length: cols }, (_, colIdx) => {
                        const cellKey = `${rowIdx},${colIdx}`;
                        const isSelected = selectedTableCell?.tableId === block.id && selectedTableCell?.cellKey === cellKey;
                        return (
                          <Button
                            key={cellKey}
                            variant={isSelected ? 'default' : 'outline'}
                            size="sm"
                            className="flex-1 h-10 text-xs"
                            onClick={() => selectTableCell(block.id, cellKey)}
                          >
                            {String.fromCharCode(65 + rowIdx)}{colIdx + 1}
                          </Button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Selected Cell Settings */}
            {selectedTableCell?.tableId === block.id && (
              <div className="space-y-3 border rounded-md p-3 bg-accent/5">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Cell {selectedTableCell.cellKey.split(',').map((v, i) => i === 0 ? String.fromCharCode(65 + parseInt(v)) : parseInt(v) + 1).join('')} Settings</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearTableCellSelection()}
                  >
                    ✕
                  </Button>
                </div>

                <ColorPickerInput
                  label="Background Color"
                  value={tableSettings.cells?.[selectedTableCell.cellKey]?.settings?.background || 'transparent'}
                  onChange={(value) => updateCellSetting(block.id, selectedTableCell.cellKey, 'background', value)}
                />

                <div>
                  <Label className="text-sm">Padding</Label>
                  <Input
                    type="text"
                    value={tableSettings.cells?.[selectedTableCell.cellKey]?.settings?.padding || '8px'}
                    onChange={(e) => updateCellSetting(block.id, selectedTableCell.cellKey, 'padding', e.target.value)}
                    className="mt-1.5 h-9"
                    placeholder="8px"
                  />
                </div>

                <div>
                  <Label className="text-sm">Vertical Align</Label>
                  <Select
                    value={tableSettings.cells?.[selectedTableCell.cellKey]?.settings?.verticalAlign || 'top'}
                    onValueChange={(value) => updateCellSetting(block.id, selectedTableCell.cellKey, 'verticalAlign', value)}
                  >
                    <SelectTrigger className="mt-1.5 h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top">Top</SelectItem>
                      <SelectItem value="middle">Middle</SelectItem>
                      <SelectItem value="bottom">Bottom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Cell Content */}
                <div className="border-t pt-3 mt-3">
                  <Label className="text-sm font-medium">Cell Content</Label>
                  <div className="mt-2 space-y-2">
                    {tableSettings.cells?.[selectedTableCell.cellKey]?.children?.length > 0 ? (
                      tableSettings.cells[selectedTableCell.cellKey].children.map((childBlock: BlockInstance, idx: number) => {
                        const template = getTemplate(childBlock.type);
                        return (
                          <div
                            key={childBlock.id}
                            className={cn(
                              "p-2 border rounded cursor-pointer hover:bg-accent/50 transition-colors",
                              selectedBlockIds.includes(childBlock.id) && "bg-accent border-primary"
                            )}
                            onClick={() => selectBlock(childBlock.id)}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-base">{template.icon}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{childBlock.name}</p>
                                <p className="text-xs text-muted-foreground">{childBlock.type}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-muted-foreground text-center py-2">
                        No blocks in this cell. Drop blocks from the library.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="w-80 border-l bg-background overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* Block Header */}
        <Card className="p-3 space-y-2 bg-muted/30">
          <div>
            <Label className="text-xs text-muted-foreground">Block Name</Label>
            <p className="text-sm font-medium mt-0.5">{block.name}</p>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Type</Label>
            <Badge variant="secondary" className="mt-0.5">
              {block.type}
            </Badge>
          </div>
        </Card>

        {/* Settings */}
        <Card className="p-4">
          {renderSettings()}
        </Card>

        {/* Position & Size */}
        {layout && (
          <Card className="p-4 space-y-3">
            <h3 className="text-sm font-medium">Position & Size</h3>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">X</Label>
                <Input
                  type="number"
                  value={Math.round(layout.x)}
                  onChange={(e) => updateVisualLayout(block.id, { x: parseInt(e.target.value) || 0 })}
                  className="mt-1 h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Y</Label>
                <Input
                  type="number"
                  value={Math.round(layout.y)}
                  onChange={(e) => updateVisualLayout(block.id, { y: parseInt(e.target.value) || 0 })}
                  className="mt-1 h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">W</Label>
                <Input
                  type="number"
                  value={Math.round(layout.width)}
                  onChange={(e) => updateVisualLayout(block.id, { width: parseInt(e.target.value) || 0 })}
                  className="mt-1 h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">H</Label>
                <Input
                  type="number"
                  value={Math.round(layout.height)}
                  onChange={(e) => updateVisualLayout(block.id, { height: parseInt(e.target.value) || 0 })}
                  className="mt-1 h-8 text-xs"
                />
              </div>
            </div>
          </Card>
        )}

        {/* Children Info */}
        {block.children && block.children.length > 0 && (
          <Card className="p-3">
            <Label className="text-xs text-muted-foreground">Children</Label>
            <p className="text-sm mt-1">
              {block.children.length} child block{block.children.length !== 1 ? 's' : ''}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
