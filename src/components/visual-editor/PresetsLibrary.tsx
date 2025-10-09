import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useVisualEditorStore } from '@/stores/visual-editor-store';
import { defaultPresets, Preset } from '@/lib/visual-editor/presets';
import { Plus, Trash2, Download } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

export function PresetsLibrary() {
  const { addBlock, selectedBlockIds, customPresets, addCustomPreset, deleteCustomPreset, blocks } = useVisualEditorStore();
  const [presetName, setPresetName] = useState('');
  const [presetCategory, setPresetCategory] = useState<Preset['category']>('custom');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleApplyPreset = (preset: Preset) => {
    // Clone blocks with new IDs to avoid conflicts
    const clonedBlocks = JSON.parse(JSON.stringify(preset.blocks)).map((block: any) => ({
      ...block,
      id: `${block.type.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }));
    
    clonedBlocks.forEach((block: any) => {
      addBlock(block);
    });
    
    toast.success(`Applied preset: ${preset.name}`);
  };

  const handleSavePreset = () => {
    if (!presetName.trim()) {
      toast.error('Please enter a preset name');
      return;
    }

    if (selectedBlockIds.length === 0) {
      toast.error('Please select blocks to save as preset');
      return;
    }

    // Get selected blocks from the blocks tree
    const findBlockById = (blocks: any[], id: string): any => {
      for (const block of blocks) {
        if (block.id === id) return block;
        if (block.children?.length > 0) {
          const found = findBlockById(block.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    const selectedBlocks = selectedBlockIds.map(id => findBlockById(blocks, id)).filter(Boolean);

    const newPreset: Preset = {
      id: `custom-${Date.now()}`,
      name: presetName,
      category: presetCategory,
      blocks: selectedBlocks,
    };

    addCustomPreset(newPreset);
    toast.success(`Saved preset: ${presetName}`);
    setPresetName('');
    setIsDialogOpen(false);
  };

  const renderPresetCard = (preset: Preset, isCustom = false) => (
    <Card key={preset.id} className="hover:border-primary transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-sm">{preset.name}</CardTitle>
            {preset.description && (
              <CardDescription className="text-xs mt-1">
                {preset.description}
              </CardDescription>
            )}
          </div>
          {isCustom && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 -mt-1"
              onClick={() => {
                deleteCustomPreset(preset.id);
                toast.success('Preset deleted');
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => handleApplyPreset(preset)}
        >
          <Download className="h-3 w-3 mr-2" />
          Apply
        </Button>
      </CardContent>
    </Card>
  );

  const categories: Array<{ value: Preset['category']; label: string }> = [
    { value: 'layout', label: 'Layouts' },
    { value: 'header', label: 'Headers' },
    { value: 'footer', label: 'Footers' },
    { value: 'cta', label: 'CTAs' },
    { value: 'content', label: 'Content' },
    { value: 'custom', label: 'Custom' },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold">Presets & Templates</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Save Preset
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Custom Preset</DialogTitle>
              <DialogDescription>
                Save the selected blocks as a reusable preset
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="preset-name">Preset Name</Label>
                <Input
                  id="preset-name"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  placeholder="My Custom Preset"
                />
              </div>
              <div>
                <Label htmlFor="preset-category">Category</Label>
                <select
                  id="preset-category"
                  className="w-full border rounded-md p-2"
                  value={presetCategory}
                  onChange={(e) => setPresetCategory(e.target.value as Preset['category'])}
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSavePreset}>Save Preset</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="flex-1">
        <Tabs defaultValue="layout" className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b h-auto p-0">
            {categories.map((cat) => (
              <TabsTrigger
                key={cat.value}
                value={cat.value}
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((cat) => (
            <TabsContent key={cat.value} value={cat.value} className="p-4">
              <div className="grid gap-3">
                {cat.value === 'custom' ? (
                  customPresets.length > 0 ? (
                    customPresets.map((preset) => renderPresetCard(preset, true))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No custom presets yet. Select blocks and click "Save Preset" to create one.
                    </p>
                  )
                ) : (
                  defaultPresets
                    .filter((preset) => preset.category === cat.value)
                    .map((preset) => renderPresetCard(preset))
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </ScrollArea>
    </div>
  );
}
