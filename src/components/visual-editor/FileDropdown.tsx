import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FileDown, FileUp } from 'lucide-react';
import { useVisualEditorStore } from '@/stores/visual-editor-store';
import { exportToPNG, exportToSVG, exportToJSON } from '@/lib/visual-editor/export-utils';
import { exportMindboxHTML, exportMindboxJSON, downloadMindboxHTML, downloadMindboxJSON } from '@/lib/visual-editor/mindbox-exporter';
import { validateMindboxProject } from '@/lib/visual-editor/mindbox-validator';
import { toast } from '@/hooks/use-toast';

export function FileDropdown() {
  const { blocks, projectName, visualLayout } = useVisualEditorStore();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPNG = async () => {
    const canvas = document.querySelector('.visual-canvas') as HTMLElement;
    if (!canvas) {
      toast({ title: 'Canvas not found', variant: 'destructive' });
      return;
    }
    setIsExporting(true);
    try {
      await exportToPNG(canvas, `${projectName}.png`);
      toast({ title: 'PNG exported successfully' });
    } catch (error) {
      toast({ title: 'Export failed', variant: 'destructive' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportSVG = async () => {
    const canvas = document.querySelector('.visual-canvas') as HTMLElement;
    if (!canvas) {
      toast({ title: 'Canvas not found', variant: 'destructive' });
      return;
    }
    setIsExporting(true);
    try {
      await exportToSVG(canvas, `${projectName}.svg`);
      toast({ title: 'SVG exported successfully' });
    } catch (error) {
      toast({ title: 'Export failed', variant: 'destructive' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJSON = () => {
    exportToJSON(blocks, `${projectName}.json`);
    toast({ title: 'JSON exported successfully' });
  };

  const handleImportJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);
        useVisualEditorStore.getState().importBlocks(data.blocks || data);
        toast({ title: 'JSON imported successfully' });
      } catch (error) {
        toast({ title: 'Import failed', variant: 'destructive' });
      }
    };
    input.click();
  };

  const handleImportImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        const store = useVisualEditorStore.getState();
        const imageBlock = {
          id: crypto.randomUUID(),
          name: `Image ${Date.now()}`,
          type: 'IMAGE' as const,
          settings: { src: imageUrl, alt: file.name },
          children: [],
          canContainChildren: false,
          maxNestingLevel: 0,
        };
        store.addBlock(imageBlock);
        toast({ title: 'Image imported successfully' });
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handleExportMindbox = () => {
    // Validate before export
    const validation = validateMindboxProject(blocks, visualLayout);
    
    if (!validation.valid) {
      toast({
        title: "Validation failed",
        description: `Found ${validation.errors.length} error(s). Please fix them before exporting.`,
        variant: "destructive"
      });
      return;
    }

    if (validation.warnings.length > 0) {
      toast({
        title: "Validation warnings",
        description: `Found ${validation.warnings.length} warning(s). Export will proceed.`,
      });
    }

    const html = exportMindboxHTML(blocks, visualLayout, projectName);
    const json = exportMindboxJSON(blocks);
    
    downloadMindboxHTML(html, `${projectName}_mindbox.html`);
    downloadMindboxJSON(json, `${projectName}_mindbox.json`);
    
    toast({ 
      title: 'Mindbox template exported',
      description: 'HTML and JSON files downloaded'
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1">
          <FileDown className="h-4 w-4" />
          File
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Export</DropdownMenuLabel>
        <DropdownMenuItem onClick={handleExportPNG} disabled={isExporting}>
          <FileDown className="h-4 w-4 mr-2" />
          Export as PNG
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportSVG} disabled={isExporting}>
          <FileDown className="h-4 w-4 mr-2" />
          Export as SVG
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportJSON}>
          <FileDown className="h-4 w-4 mr-2" />
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportMindbox}>
          <FileDown className="h-4 w-4 mr-2" />
          Export Mindbox Template
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Import</DropdownMenuLabel>
        <DropdownMenuItem onClick={handleImportJSON}>
          <FileUp className="h-4 w-4 mr-2" />
          Import JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleImportImage}>
          <FileUp className="h-4 w-4 mr-2" />
          Import Image
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
