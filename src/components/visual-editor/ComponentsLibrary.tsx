import { useVisualEditorStore } from '@/stores/visual-editor-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Copy } from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export function ComponentsLibrary() {
  const { components, selectedComponentId, setSelectedComponent, deleteComponent, addVariant, deleteVariant, instantiateComponent } = useVisualEditorStore();
  const [newVariantName, setNewVariantName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeComponentId, setActiveComponentId] = useState<string | null>(null);

  const handleAddVariant = (componentId: string) => {
    if (newVariantName.trim()) {
      addVariant(componentId, newVariantName.trim());
      setNewVariantName('');
      setIsDialogOpen(false);
    }
  };

  const handleInstantiateComponent = (componentId: string, variantId?: string) => {
    instantiateComponent(componentId, variantId);
  };

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle className="text-sm">Components Library</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="px-4 pb-4 space-y-4">
            {components.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No components yet. Select a block and create a component from the toolbar.
              </p>
            ) : (
              components.map((component) => (
                <div
                  key={component.id}
                  className={`border rounded-lg p-3 space-y-2 cursor-pointer transition-colors ${
                    selectedComponentId === component.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedComponent(component.id)}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm">{component.name}</h3>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInstantiateComponent(component.id);
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteComponent(component.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-xs">
                      {component.masterBlock.type}
                    </Badge>
                    <span>{component.variants.length} variants</span>
                  </div>

                  <Separator />

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">Variants</span>
                      <Dialog open={isDialogOpen && activeComponentId === component.id} onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (open) setActiveComponentId(component.id);
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-5 w-5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent onClick={(e) => e.stopPropagation()}>
                          <DialogHeader>
                            <DialogTitle>Add Variant</DialogTitle>
                            <DialogDescription>
                              Create a new variant for "{component.name}"
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="variant-name">Variant Name</Label>
                              <Input
                                id="variant-name"
                                value={newVariantName}
                                onChange={(e) => setNewVariantName(e.target.value)}
                                placeholder="e.g., Large, Dark, Hover"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleAddVariant(component.id);
                                  }
                                }}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button onClick={() => handleAddVariant(component.id)}>
                              Add Variant
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {component.variants.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">
                        No variants yet
                      </p>
                    ) : (
                      <div className="space-y-1">
                        {component.variants.map((variant) => (
                          <div
                            key={variant.id}
                            className="flex items-center justify-between p-2 rounded border border-border/50 hover:bg-accent/50"
                          >
                            <span className="text-xs">{variant.name}</span>
                            <div className="flex gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-5 w-5"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleInstantiateComponent(component.id, variant.id);
                                }}
                              >
                                <Copy className="h-2.5 w-2.5" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-5 w-5 text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteVariant(component.id, variant.id);
                                }}
                              >
                                <Trash2 className="h-2.5 w-2.5" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
