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
import React from 'react';
import { findBlockById } from '@/lib/visual-editor/coordinate-utils';
import { Switch } from '@/components/ui/switch';
import { KonvaStyleSettings } from './SettingsKonva';
import { SpacingSettings } from './SpacingSettings';

export function SettingsPanel() {
  const { 
    blocks, 
    selectedBlockIds, 
    updateBlock, 
    visualLayout, 
    updateVisualLayout, 
    selectedTableCell, 
    selectBlock, 
    selectTableCell,
    clearTableCellSelection,
    addBlockToTableCell,
    removeBlockFromTableCell,
    updateCellSetting,
  } = useVisualEditorStore();
  
  const [settingsContext, setSettingsContext] = React.useState<Array<{ id: string; name: string; type: string }>>([]);
  
  const selectedBlockId = selectedBlockIds[0];
  
  if (!selectedBlockId) return null;
  
  const block = findBlockById(blocks, selectedBlockId);
  if (!block) return null;

  // Initialize context stack if empty
  React.useEffect(() => {
    if (settingsContext.length === 0) {
      setSettingsContext([{ id: block.id, name: block.name, type: block.type }]);
    }
  }, [block.id]);

  // Get the current block to display settings for (either main block or nested block)
  const currentContextId = settingsContext[settingsContext.length - 1]?.id || block.id;
  const currentBlock = findBlockById(blocks, currentContextId) || block;

  const handleBackNavigation = () => {
    if (settingsContext.length > 1) {
      const newContext = settingsContext.slice(0, -1);
      setSettingsContext(newContext);
      selectBlock(newContext[newContext.length - 1].id);
    }
  };

  const handleNestedBlockClick = (nestedBlock: BlockInstance) => {
    setSettingsContext([...settingsContext, { id: nestedBlock.id, name: nestedBlock.name, type: nestedBlock.type }]);
    selectBlock(nestedBlock.id);
  };

  const createNewBlock = (type: 'TEXT' | 'BUTTON' | 'IMAGE'): BlockInstance => {
    const template = getTemplate(type);
    return {
      id: `${type.toLowerCase()}-${Date.now()}`,
      type,
      name: `${type} ${Date.now()}`,
      settings: { ...template.defaultSettings },
      canContainChildren: false,
      maxNestingLevel: 0,
    };
  };

  const updateSettings = (newSettings: any) => {
    updateBlock(currentBlock.id, { 
      settings: { ...currentBlock.settings, ...newSettings } 
    });
  };

  const applyPreset = (preset: any) => {
    updateSettings(preset);
  };

  const layout = visualLayout[currentBlock.id];

  // Force re-render when layout dimensions change (for size sync)
  React.useEffect(() => {
    // This ensures the Width/Height inputs update when resizing with mouse
  }, [layout?.width, layout?.height]);

  const renderSizeSettings = () => {
    const padding = currentBlock.settings.padding || { top: 0, right: 0, bottom: 0, left: 0 };
    const visualWidth = Math.round((layout?.width || 0) + padding.left + padding.right);
    const visualHeight = Math.round((layout?.height || 0) + padding.top + padding.bottom);
    
    return (
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-medium">Size</Label>
          <Badge variant="secondary" className="text-xs">px</Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm flex items-center justify-between">
              <span>Width</span>
              <span className="text-xs text-muted-foreground font-mono">
                {visualWidth}
              </span>
            </Label>
            <Input
              type="number"
              value={visualWidth}
              onChange={(e) => {
                const newVisualWidth = parseInt(e.target.value) || 0;
                const newContentWidth = newVisualWidth - padding.left - padding.right;
                updateVisualLayout(currentBlock.id, { width: Math.max(20, newContentWidth) });
              }}
              className="mt-1.5 h-9"
              min={(currentBlock.constraints?.minWidth || 20) + padding.left + padding.right}
              max={(currentBlock.constraints?.maxWidth || 2000) + padding.left + padding.right}
            />
          </div>
          
          <div>
            <Label className="text-sm flex items-center justify-between">
              <span>Height</span>
              <span className="text-xs text-muted-foreground font-mono">
                {visualHeight}
              </span>
            </Label>
            <Input
              type="number"
              value={visualHeight}
              onChange={(e) => {
                const newVisualHeight = parseInt(e.target.value) || 0;
                const newContentHeight = newVisualHeight - padding.top - padding.bottom;
                updateVisualLayout(currentBlock.id, { height: Math.max(20, newContentHeight) });
              }}
              className="mt-1.5 h-9"
              min={(currentBlock.constraints?.minHeight || 20) + padding.top + padding.bottom}
              max={(currentBlock.constraints?.maxHeight || 2000) + padding.top + padding.bottom}
            />
          </div>
        </div>
      </Card>
    );
  };

  const renderUniversalSettings = () => (
    <Accordion type="multiple" className="border rounded-md mb-4">
      <AccordionItem value="block-properties" className="border-0">
        <AccordionTrigger className="px-3 py-2 text-sm hover:no-underline">
          Block Properties
        </AccordionTrigger>
        <AccordionContent className="px-3 pb-3 space-y-3">
          <div>
            <Label className="text-sm">Name</Label>
            <Input
              value={currentBlock.name}
              onChange={(e) => updateBlock(currentBlock.id, { name: e.target.value })}
              className="mt-1.5 h-9"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label className="text-sm">Locked</Label>
            <Switch
              checked={currentBlock.locked || false}
              onCheckedChange={(locked) => updateBlock(currentBlock.id, { locked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label className="text-sm">Hidden</Label>
            <Switch
              checked={currentBlock.hidden || false}
              onCheckedChange={(hidden) => updateBlock(currentBlock.id, { hidden })}
            />
          </div>
        </AccordionContent>
      </AccordionItem>
      
      <AccordionItem value="position-size" className="border-0">
        <AccordionTrigger className="px-3 py-2 text-sm hover:no-underline">
          Position & Size
        </AccordionTrigger>
        <AccordionContent className="px-3 pb-3 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-sm flex items-center justify-between">
                <span>X</span>
                <span className="text-xs text-muted-foreground">{Math.round(layout?.x || 0)}px</span>
              </Label>
              <Input
                type="number"
                value={Math.round(layout?.x || 0)}
                onChange={(e) => updateVisualLayout(currentBlock.id, { x: parseInt(e.target.value) })}
                className="mt-1.5 h-9"
              />
            </div>
            <div>
              <Label className="text-sm flex items-center justify-between">
                <span>Y</span>
                <span className="text-xs text-muted-foreground">{Math.round(layout?.y || 0)}px</span>
              </Label>
              <Input
                type="number"
                value={Math.round(layout?.y || 0)}
                onChange={(e) => updateVisualLayout(currentBlock.id, { y: parseInt(e.target.value) })}
                className="mt-1.5 h-9"
              />
            </div>
            <div>
              <Label className="text-sm flex items-center justify-between">
                <span>Width</span>
                <span className="text-xs text-muted-foreground">{Math.round(layout?.width || 0)}px</span>
              </Label>
              <Input
                type="number"
                value={Math.round(layout?.width || 0)}
                onChange={(e) => updateVisualLayout(currentBlock.id, { width: parseInt(e.target.value) })}
                className="mt-1.5 h-9"
              />
            </div>
            <div>
              <Label className="text-sm flex items-center justify-between">
                <span>Height</span>
                <span className="text-xs text-muted-foreground">{Math.round(layout?.height || 0)}px</span>
              </Label>
              <Input
                type="number"
                value={Math.round(layout?.height || 0)}
                onChange={(e) => updateVisualLayout(currentBlock.id, { height: parseInt(e.target.value) })}
                className="mt-1.5 h-9"
              />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
      
      <AccordionItem value="constraints" className="border-0">
        <AccordionTrigger className="px-3 py-2 text-sm hover:no-underline">
          Constraints
        </AccordionTrigger>
        <AccordionContent className="px-3 pb-3 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-sm">Min Width</Label>
              <Input
                type="number"
                value={currentBlock.constraints?.minWidth || (
                  currentBlock.type === 'BUTTON' ? 60 :
                  currentBlock.type === 'CONTAINER' || currentBlock.type === 'GROUP' ? 100 :
                  currentBlock.type === 'TEXT' ? 50 :
                  20
                )}
                onChange={(e) => updateBlock(currentBlock.id, {
                  constraints: { ...currentBlock.constraints, minWidth: parseInt(e.target.value) }
                })}
                className="mt-1.5 h-9"
              />
            </div>
            <div>
              <Label className="text-sm">Max Width</Label>
              <Input
                type="number"
                value={currentBlock.constraints?.maxWidth || 2000}
                onChange={(e) => updateBlock(currentBlock.id, {
                  constraints: { ...currentBlock.constraints, maxWidth: parseInt(e.target.value) }
                })}
                className="mt-1.5 h-9"
              />
            </div>
            <div>
              <Label className="text-sm">Min Height</Label>
              <Input
                type="number"
                value={currentBlock.constraints?.minHeight || (
                  currentBlock.type === 'BUTTON' ? 30 :
                  currentBlock.type === 'CONTAINER' || currentBlock.type === 'GROUP' ? 100 :
                  currentBlock.type === 'TEXT' ? 20 :
                  20
                )}
                onChange={(e) => updateBlock(currentBlock.id, {
                  constraints: { ...currentBlock.constraints, minHeight: parseInt(e.target.value) }
                })}
                className="mt-1.5 h-9"
              />
            </div>
            <div>
              <Label className="text-sm">Max Height</Label>
              <Input
                type="number"
                value={currentBlock.constraints?.maxHeight || 2000}
                onChange={(e) => updateBlock(currentBlock.id, {
                  constraints: { ...currentBlock.constraints, maxHeight: parseInt(e.target.value) }
                })}
                className="mt-1.5 h-9"
              />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );

  const renderSettings = () => {
    // Alias for settings access - use currentBlock for context-aware settings
    const settingsSource = currentBlock;
    
    switch (currentBlock.type) {
      case 'TEXT':
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Text Content</Label>
                <Textarea
                  value={currentBlock.settings.text || ''}
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
                    value={parseInt(currentBlock.settings.fontSize) || 16}
                    onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) || 16 })}
                    className="mt-1.5 h-9"
                    min={8}
                    max={200}
                  />
                </div>
                <div>
                  <Label className="text-sm">Font Family</Label>
                  <Select
                    value={currentBlock.settings.fontFamily || 'Arial'}
                    onValueChange={(value) => updateSettings({ fontFamily: value })}
                  >
                    <SelectTrigger className="mt-1.5 h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Arial">Arial</SelectItem>
                      <SelectItem value="Helvetica">Helvetica</SelectItem>
                      <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                      <SelectItem value="Georgia">Georgia</SelectItem>
                      <SelectItem value="Courier New">Courier New</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-sm">Font Weight</Label>
                  <Select
                    value={currentBlock.settings.fontWeight || 'normal'}
                    onValueChange={(value) => updateSettings({ fontWeight: value })}
                  >
                    <SelectTrigger className="mt-1.5 h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="bold">Bold</SelectItem>
                      <SelectItem value="lighter">Lighter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">Text Align</Label>
                  <Select
                    value={currentBlock.settings.textAlign || 'left'}
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
              </div>
            </div>

            <SpacingSettings
              margin={currentBlock.settings.margin}
              onMarginChange={(margin) => updateSettings({ margin })}
              showPadding={false}
            />

            <SpacingSettings
              margin={currentBlock.settings.margin}
              padding={currentBlock.settings.padding}
              onMarginChange={(margin) => updateSettings({ margin })}
              onPaddingChange={(padding) => updateSettings({ padding })}
              showPadding={true}
            />

            <KonvaStyleSettings
              settings={currentBlock.settings}
              onUpdate={updateSettings}
              showFillColor={true}
            />
          </div>
        );

      case 'BUTTON':
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Button Text</Label>
                <Input
                  value={currentBlock.settings.text || ''}
                  onChange={(e) => updateSettings({ text: e.target.value })}
                  className="mt-1.5 h-9"
                  placeholder="Button"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <ColorPickerInput
                  label="Fill Color"
                  value={currentBlock.settings.fill || '#007bff'}
                  onChange={(value) => updateSettings({ fill: value })}
                />
                <ColorPickerInput
                  label="Text Color"
                  value={currentBlock.settings.textColor || '#ffffff'}
                  onChange={(value) => updateSettings({ textColor: value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-sm">Border Radius (px)</Label>
                  <Input
                    type="number"
                    value={currentBlock.settings.borderRadius || 8}
                    onChange={(e) => updateSettings({ borderRadius: parseInt(e.target.value) || 0 })}
                    className="mt-1.5 h-9"
                    min={0}
                    max={50}
                  />
                </div>
                <div>
                  <Label className="text-sm">Link URL</Label>
                  <Input
                    type="url"
                    value={currentBlock.settings.href || ''}
                    onChange={(e) => updateSettings({ href: e.target.value })}
                    className="mt-1.5 h-9"
                    placeholder="https://"
                  />
                </div>
              </div>
            </div>

            <SpacingSettings
              margin={currentBlock.settings.margin}
              padding={currentBlock.settings.padding}
              onMarginChange={(margin) => updateSettings({ margin })}
              onPaddingChange={(padding) => updateSettings({ padding })}
              showPadding={true}
            />

            <KonvaStyleSettings
              settings={currentBlock.settings}
              onUpdate={updateSettings}
              showFillColor={false}
            />
          </div>
        );

      case 'IMAGE':
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Image URL</Label>
                <Input
                  type="url"
                  value={currentBlock.settings.src || ''}
                  onChange={(e) => updateSettings({ src: e.target.value })}
                  className="mt-1.5 h-9"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <Label className="text-sm">Alt Text</Label>
                <Input
                  value={currentBlock.settings.alt || ''}
                  onChange={(e) => updateSettings({ alt: e.target.value })}
                  className="mt-1.5 h-9"
                  placeholder="Image description"
                />
              </div>

              <div>
                <Label className="text-sm">Border Radius (px)</Label>
                <Input
                  type="number"
                  value={currentBlock.settings.borderRadius || 0}
                  onChange={(e) => updateSettings({ borderRadius: parseInt(e.target.value) || 0 })}
                  className="mt-1.5 h-9"
                  min={0}
                  max={50}
                />
              </div>
            </div>

            <SpacingSettings
              margin={currentBlock.settings.margin}
              padding={currentBlock.settings.padding}
              onMarginChange={(margin) => updateSettings({ margin })}
              onPaddingChange={(padding) => updateSettings({ padding })}
              showPadding={true}
            />

            <KonvaStyleSettings
              settings={currentBlock.settings}
              onUpdate={updateSettings}
              showFillColor={false}
            />
          </div>
        );

      case 'CONTAINER':
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <ColorPickerInput
                label="Fill Color"
                value={currentBlock.settings.fill || 'transparent'}
                onChange={(value) => updateSettings({ fill: value })}
              />

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-sm">Border Radius (px)</Label>
                  <Input
                    type="number"
                    value={currentBlock.settings.borderRadius || 0}
                    onChange={(e) => updateSettings({ borderRadius: parseInt(e.target.value) || 0 })}
                    className="mt-1.5 h-9"
                    min={0}
                    max={50}
                  />
                </div>
              </div>
            </div>

            <SpacingSettings
              margin={currentBlock.settings.margin}
              padding={currentBlock.settings.padding}
              onMarginChange={(margin) => updateSettings({ margin })}
              onPaddingChange={(padding) => updateSettings({ padding })}
              showPadding={true}
            />

            <KonvaStyleSettings
              settings={currentBlock.settings}
              onUpdate={updateSettings}
              showFillColor={false}
            />
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
        const tableBlock = currentBlock; // Use currentBlock for TABLE case
        const tableSettings = tableBlock.settings as any;
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
                        updateTableSize(tableBlock.id, 'rows', -1);
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
                        updateTableSize(tableBlock.id, 'rows', newRows - rows);
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
                        updateTableSize(tableBlock.id, 'rows', 1);
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
                        updateTableSize(tableBlock.id, 'cols', -1);
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
                        updateTableSize(tableBlock.id, 'cols', newCols - cols);
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
                        updateTableSize(tableBlock.id, 'cols', 1);
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
                        const isSelected = selectedTableCell?.tableId === tableBlock.id && selectedTableCell?.cellKey === cellKey;
                        return (
                          <Button
                            key={cellKey}
                            variant={isSelected ? 'default' : 'outline'}
                            size="sm"
                            className="flex-1 h-10 text-xs"
                            onClick={() => selectTableCell(tableBlock.id, cellKey)}
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
            {selectedTableCell?.tableId === tableBlock.id && (
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
                  onChange={(value) => updateCellSetting(tableBlock.id, selectedTableCell.cellKey, 'background', value)}
                />

                <div>
                  <Label className="text-sm">Padding</Label>
                  <Input
                    type="text"
                    value={tableSettings.cells?.[selectedTableCell.cellKey]?.settings?.padding || '8px'}
                    onChange={(e) => updateCellSetting(tableBlock.id, selectedTableCell.cellKey, 'padding', e.target.value)}
                    className="mt-1.5 h-9"
                    placeholder="8px"
                  />
                </div>

                <div>
                  <Label className="text-sm">Vertical Align</Label>
                  <Select
                    value={tableSettings.cells?.[selectedTableCell.cellKey]?.settings?.verticalAlign || 'top'}
                    onValueChange={(value) => updateCellSetting(tableBlock.id, selectedTableCell.cellKey, 'verticalAlign', value)}
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

                {/* Cell Content Management */}
                <div className="border-t pt-3 mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium">Cell Content</Label>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => {
                          const newBlock = createNewBlock('TEXT');
                          addBlockToTableCell(tableBlock.id, selectedTableCell.cellKey, newBlock);
                        }}
                      >
                        + Text
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => {
                          const newBlock = createNewBlock('BUTTON');
                          addBlockToTableCell(tableBlock.id, selectedTableCell.cellKey, newBlock);
                        }}
                      >
                        + Button
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => {
                          const newBlock = createNewBlock('IMAGE');
                          addBlockToTableCell(tableBlock.id, selectedTableCell.cellKey, newBlock);
                        }}
                      >
                        + Image
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2 space-y-2">
                    {tableSettings.cells?.[selectedTableCell.cellKey]?.children?.length > 0 ? (
                      tableSettings.cells[selectedTableCell.cellKey].children.map((childBlock: BlockInstance) => {
                        const template = getTemplate(childBlock.type);
                        const isChildSelected = selectedBlockIds.includes(childBlock.id);
                        return (
                          <div
                            key={childBlock.id}
                            className={cn(
                              "p-2 border rounded cursor-pointer hover:bg-accent/50 transition-colors",
                              isChildSelected && "bg-accent border-primary"
                            )}
                            onClick={() => handleNestedBlockClick(childBlock)}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-base">{template.icon}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{childBlock.name}</p>
                                <p className="text-xs text-muted-foreground">{childBlock.type}</p>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeBlockFromTableCell(tableBlock.id, selectedTableCell.cellKey, childBlock.id);
                                }}
                              >
                                🗑️
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-muted-foreground text-center py-2">
                        No blocks in this cell. Click buttons above to add content.
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
        {/* Breadcrumb Navigation */}
        {settingsContext.length > 1 && (
          <Card className="p-2 bg-muted/20">
            <div className="flex items-center gap-1 text-xs">
              {settingsContext.map((ctx, idx) => (
                <React.Fragment key={ctx.id}>
                  {idx > 0 && <span className="text-muted-foreground">/</span>}
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-6 px-2 text-xs",
                      idx === settingsContext.length - 1 && "font-semibold"
                    )}
                    onClick={() => {
                      const newContext = settingsContext.slice(0, idx + 1);
                      setSettingsContext(newContext);
                      selectBlock(ctx.id);
                    }}
                  >
                    {ctx.name}
                  </Button>
                </React.Fragment>
              ))}
              {settingsContext.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 ml-auto"
                  onClick={handleBackNavigation}
                >
                  ← Back
                </Button>
              )}
            </div>
          </Card>
        )}
        
        {/* Block Header */}
        <Card className="p-3 space-y-2 bg-muted/30">
          <div>
            <Label className="text-xs text-muted-foreground">Block Name</Label>
            <p className="text-sm font-medium mt-0.5">{currentBlock.name}</p>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Type</Label>
            <Badge variant="secondary" className="mt-0.5">
              {currentBlock.type}
            </Badge>
          </div>
        </Card>

        {/* Settings */}
        <Card className="p-4">
          {/* Universal Settings */}
          <Accordion type="multiple" className="border rounded-md mb-4">
            <AccordionItem value="block-properties" className="border-0">
              <AccordionTrigger className="px-3 py-2 text-sm hover:no-underline">
                Block Properties
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-3 space-y-3">
                <div>
                  <Label className="text-sm">Name</Label>
                  <Input
                    value={currentBlock.name}
                    onChange={(e) => updateBlock(currentBlock.id, { name: e.target.value })}
                    className="mt-1.5 h-9"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Locked</Label>
                  <Switch
                    checked={currentBlock.locked || false}
                    onCheckedChange={(locked) => updateBlock(currentBlock.id, { locked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Hidden</Label>
                  <Switch
                    checked={currentBlock.hidden || false}
                    onCheckedChange={(hidden) => updateBlock(currentBlock.id, { hidden })}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="constraints" className="border-0">
              <AccordionTrigger className="px-3 py-2 text-sm hover:no-underline">
                Constraints
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-3 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-sm">Min Width</Label>
                    <Input
                      type="number"
                      value={currentBlock.constraints?.minWidth || 20}
                      onChange={(e) => updateBlock(currentBlock.id, {
                        constraints: { ...currentBlock.constraints, minWidth: parseInt(e.target.value) }
                      })}
                      className="mt-1.5 h-9"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Max Width</Label>
                    <Input
                      type="number"
                      value={currentBlock.constraints?.maxWidth || 1000}
                      onChange={(e) => updateBlock(currentBlock.id, {
                        constraints: { ...currentBlock.constraints, maxWidth: parseInt(e.target.value) }
                      })}
                      className="mt-1.5 h-9"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Min Height</Label>
                    <Input
                      type="number"
                      value={currentBlock.constraints?.minHeight || 20}
                      onChange={(e) => updateBlock(currentBlock.id, {
                        constraints: { ...currentBlock.constraints, minHeight: parseInt(e.target.value) }
                      })}
                      className="mt-1.5 h-9"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Max Height</Label>
                    <Input
                      type="number"
                      value={currentBlock.constraints?.maxHeight || 1000}
                      onChange={(e) => updateBlock(currentBlock.id, {
                        constraints: { ...currentBlock.constraints, maxHeight: parseInt(e.target.value) }
                      })}
                      className="mt-1.5 h-9"
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          {['BUTTON', 'IMAGE', 'CONTAINER'].includes(currentBlock.type) && renderSizeSettings()}
          
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
                  onChange={(e) => updateVisualLayout(currentBlock.id, { x: parseInt(e.target.value) || 0 })}
                  className="mt-1 h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Y</Label>
                <Input
                  type="number"
                  value={Math.round(layout.y)}
                  onChange={(e) => updateVisualLayout(currentBlock.id, { y: parseInt(e.target.value) || 0 })}
                  className="mt-1 h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">W</Label>
                <Input
                  type="number"
                  value={Math.round(layout.width)}
                  onChange={(e) => updateVisualLayout(currentBlock.id, { width: parseInt(e.target.value) || 0 })}
                  className="mt-1 h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">H</Label>
                <Input
                  type="number"
                  value={Math.round(layout.height)}
                  onChange={(e) => updateVisualLayout(currentBlock.id, { height: parseInt(e.target.value) || 0 })}
                  className="mt-1 h-8 text-xs"
                />
              </div>
            </div>
          </Card>
        )}

      </div>
    </div>
  );
}
