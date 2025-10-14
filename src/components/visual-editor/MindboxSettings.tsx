import { BlockInstance, MindboxSettings } from '@/types/visual-editor';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card } from '@/components/ui/card';
import { BackgroundPicker } from './BackgroundPicker';
import { SpacingSettings } from './SpacingSettings';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MindboxSettingsPanelProps {
  block: BlockInstance;
  onUpdate: (settings: Partial<MindboxSettings>) => void;
}

export function MindboxSettingsPanel({ block, onUpdate }: MindboxSettingsPanelProps) {
  const settings = block.mindboxSettings;

  const initializeMindboxSettings = () => {
    const defaultSettings: MindboxSettings = {
      enabled: true,
      blockName: block.name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      background: { type: 'color', color: '#FFFFFF' },
      innerSpacing: '10 10 10 10',
      outerSpacing: '10',
      displayToggle: true,
      width: { type: 'percent', value: '100' },
      height: '0',
      border: 'none',
      borderRadius: '0 0 0 0',
      align: 'center',
      ...(block.type === 'TEXT' && {
        textSettings: {
          text: block.settings.text || 'Enter text...',
          textStyles: {
            font: 'Arial',
            fontSize: '16',
            lineHeight: '1.5',
            color: '#000000',
            fallbackFont: 'sans-serif'
          }
        }
      }),
      ...(block.type === 'BUTTON' && {
        buttonSettings: {
          url: '#',
          buttonText: block.settings.text || 'Button',
          textStyles: {
            font: 'Arial',
            fontSize: '16',
            lineHeight: '1.5',
            color: '#FFFFFF',
            fallbackFont: 'sans-serif'
          }
        }
      }),
      ...(block.type === 'IMAGE' && {
        imageSettings: {
          url: '#',
          image: block.settings.src || '',
          alt: block.settings.alt || 'Image'
        }
      })
    };
    
    onUpdate(defaultSettings);
  };

  const updateSetting = (key: string, value: any) => {
    if (!settings) return;
    onUpdate({ ...settings, [key]: value });
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium">Mindbox Mode</Label>
          <p className="text-xs text-muted-foreground mt-1">
            Generate Mindbox-compatible HTML/JSON
          </p>
        </div>
        <Switch
          checked={settings?.enabled || false}
          onCheckedChange={(enabled) => {
            if (enabled && !settings) {
              initializeMindboxSettings();
            } else if (settings) {
              updateSetting('enabled', enabled);
            }
          }}
        />
      </div>

      {settings?.enabled && (
        <Accordion type="multiple" className="w-full">
          {/* General Settings */}
          <AccordionItem value="general">
            <AccordionTrigger className="text-sm">General Settings</AccordionTrigger>
            <AccordionContent className="space-y-3">
              <div>
                <Label className="text-sm">Block Name</Label>
                <Input
                  value={settings.blockName}
                  onChange={(e) => updateSetting('blockName', e.target.value)}
                  className="mt-1.5 h-9"
                  placeholder="e.g., header, footer"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Used for variable names (e.g., header_background)
                </p>
              </div>

              <div>
                <Label className="text-sm">Background</Label>
                <BackgroundPicker
                  value={settings.background}
                  onChange={(bg) => updateSetting('background', bg)}
                />
              </div>

              <div>
                <Label className="text-sm">Inner Spacing (padding)</Label>
                <Input
                  value={settings.innerSpacing}
                  onChange={(e) => updateSetting('innerSpacing', e.target.value)}
                  className="mt-1.5 h-9"
                  placeholder="10 10 20 10"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Format: top right bottom left (in px)
                </p>
              </div>

              <div>
                <Label className="text-sm">Outer Spacing (margin)</Label>
                <Input
                  value={settings.outerSpacing}
                  onChange={(e) => updateSetting('outerSpacing', e.target.value)}
                  className="mt-1.5 h-9"
                  placeholder="10"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Emulated via padding wrapper (in px)
                </p>
              </div>

              <div>
                <Label className="text-sm">Border</Label>
                <Input
                  value={settings.border}
                  onChange={(e) => updateSetting('border', e.target.value)}
                  className="mt-1.5 h-9"
                  placeholder="none or 1px solid #000000"
                />
              </div>

              <div>
                <Label className="text-sm">Border Radius</Label>
                <Input
                  value={settings.borderRadius}
                  onChange={(e) => updateSetting('borderRadius', e.target.value)}
                  className="mt-1.5 h-9"
                  placeholder="0 0 0 0"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Format: top-left top-right bottom-right bottom-left (in px)
                </p>
              </div>

              <div>
                <Label className="text-sm">Align</Label>
                <Select
                  value={settings.align}
                  onValueChange={(value: any) => updateSetting('align', value)}
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

              <div className="flex items-center justify-between">
                <Label className="text-sm">Display Toggle</Label>
                <Switch
                  checked={settings.displayToggle}
                  onCheckedChange={(checked) => updateSetting('displayToggle', checked)}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Text-specific settings */}
          {block.type === 'TEXT' && (
            <AccordionItem value="text">
              <AccordionTrigger className="text-sm">Text Settings</AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div>
                  <Label className="text-sm">Text</Label>
                  <Input
                    value={settings.textSettings?.text || ''}
                    onChange={(e) => updateSetting('textSettings', {
                      ...settings.textSettings,
                      text: e.target.value
                    })}
                    className="mt-1.5 h-9"
                  />
                </div>
                
                <div>
                  <Label className="text-sm">Font</Label>
                  <Input
                    value={settings.textSettings?.textStyles?.font || 'Arial'}
                    onChange={(e) => updateSetting('textSettings', {
                      ...settings.textSettings,
                      textStyles: {
                        ...settings.textSettings?.textStyles,
                        font: e.target.value
                      }
                    })}
                    className="mt-1.5 h-9"
                  />
                </div>

                <div>
                  <Label className="text-sm">Font Size</Label>
                  <Input
                    value={settings.textSettings?.textStyles?.fontSize || '16'}
                    onChange={(e) => updateSetting('textSettings', {
                      ...settings.textSettings,
                      textStyles: {
                        ...settings.textSettings?.textStyles,
                        fontSize: e.target.value
                      }
                    })}
                    className="mt-1.5 h-9"
                  />
                </div>

                <div>
                  <Label className="text-sm">Color</Label>
                  <Input
                    type="color"
                    value={settings.textSettings?.textStyles?.color || '#000000'}
                    onChange={(e) => updateSetting('textSettings', {
                      ...settings.textSettings,
                      textStyles: {
                        ...settings.textSettings?.textStyles,
                        color: e.target.value
                      }
                    })}
                    className="mt-1.5 h-9"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Button-specific settings */}
          {block.type === 'BUTTON' && (
            <AccordionItem value="button">
              <AccordionTrigger className="text-sm">Button Settings</AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div>
                  <Label className="text-sm">Button Text</Label>
                  <Input
                    value={settings.buttonSettings?.buttonText || ''}
                    onChange={(e) => updateSetting('buttonSettings', {
                      ...settings.buttonSettings,
                      buttonText: e.target.value
                    })}
                    className="mt-1.5 h-9"
                  />
                </div>

                <div>
                  <Label className="text-sm">URL</Label>
                  <Input
                    value={settings.buttonSettings?.url || ''}
                    onChange={(e) => updateSetting('buttonSettings', {
                      ...settings.buttonSettings,
                      url: e.target.value
                    })}
                    className="mt-1.5 h-9"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Image-specific settings */}
          {block.type === 'IMAGE' && (
            <AccordionItem value="image">
              <AccordionTrigger className="text-sm">Image Settings</AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div>
                  <Label className="text-sm">Image URL</Label>
                  <Input
                    value={settings.imageSettings?.image || ''}
                    onChange={(e) => updateSetting('imageSettings', {
                      ...settings.imageSettings,
                      image: e.target.value
                    })}
                    className="mt-1.5 h-9"
                  />
                </div>

                <div>
                  <Label className="text-sm">Link URL</Label>
                  <Input
                    value={settings.imageSettings?.url || ''}
                    onChange={(e) => updateSetting('imageSettings', {
                      ...settings.imageSettings,
                      url: e.target.value
                    })}
                    className="mt-1.5 h-9"
                  />
                </div>

                <div>
                  <Label className="text-sm">Alt Text</Label>
                  <Input
                    value={settings.imageSettings?.alt || ''}
                    onChange={(e) => updateSetting('imageSettings', {
                      ...settings.imageSettings,
                      alt: e.target.value
                    })}
                    className="mt-1.5 h-9"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      )}
    </Card>
  );
}
