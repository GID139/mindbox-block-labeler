import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useVisualEditorStore } from '@/stores/visual-editor-store';
import { Save, Eye, Code, Plus, Loader2, Undo, Redo, Grid, ZoomIn, ZoomOut, Monitor, Tablet, Smartphone, List, Copy, MousePointer, Square, Circle, Minus } from 'lucide-react';
import { toast } from 'sonner';
import { CodePreviewModal } from './CodePreviewModal';
import { CanvasModeToggle } from './CanvasModeToggle';
import { KeyboardShortcutsHelp } from './KeyboardShortcutsHelp';
import { GlobalStylesDialog } from './GlobalStylesDialog';
import { generateHTML } from '@/lib/visual-editor/code-generator';

export function Toolbar() {
  const {
    currentProjectId,
    projectName,
    setProjectName,
    saveProject,
    loadProject,
    createNewProject,
    listProjects,
    isSaving,
    lastSavedAt,
    previewMode,
    togglePreviewMode,
    undo,
    redo,
    canUndo,
    canRedo,
    showGrid,
    setShowGrid,
    zoom,
    setZoom,
    deviceMode,
    setDeviceMode,
    showOutline,
    setShowOutline,
    canvasMode,
    blocks,
    drawingTool,
    setDrawingTool,
  } = useVisualEditorStore();

  const [projects, setProjects] = useState<any[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);

  useEffect(() => {
    loadProjectsList();
  }, []);

  const loadProjectsList = async () => {
    setIsLoadingProjects(true);
    const data = await listProjects();
    setProjects(data);
    setIsLoadingProjects(false);
  };

  const handleProjectChange = async (projectId: string) => {
    if (projectId === 'new') {
      const name = prompt('Enter project name:');
      if (name) {
        await createNewProject(name);
        await loadProjectsList();
        toast.success('New project created');
      }
    } else {
      await loadProject(projectId);
      await loadProjectsList();
    }
  };

  const handleSave = async () => {
    await saveProject();
    await loadProjectsList();
  };

  const formatLastSaved = () => {
    if (!lastSavedAt) return 'Never';
    const diff = Date.now() - lastSavedAt.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes === 0) return 'Just now';
    if (minutes === 1) return '1 min ago';
    return `${minutes} mins ago`;
  };

  const handleCopyCode = () => {
    const html = generateHTML(blocks);
    const json = JSON.stringify(blocks, null, 2);
    const code = `<!-- HTML -->\n${html}\n\n<!-- JSON -->\n${json}`;
    
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard!');
  };

  return (
    <>
      <div className="flex items-center gap-2 p-3 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-wrap">
        {/* Project Selector */}
        <Select value={currentProjectId || undefined} onValueChange={handleProjectChange} disabled={isLoadingProjects}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select project..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>New Project</span>
              </div>
            </SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Project Name */}
        {currentProjectId && (
          isEditingName ? (
            <Input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onBlur={() => setIsEditingName(false)}
              onKeyDown={(e) => { if (e.key === 'Enter') setIsEditingName(false); }}
              className="w-40"
              autoFocus
            />
          ) : (
            <div className="text-sm font-medium cursor-pointer hover:text-primary" onClick={() => setIsEditingName(true)}>
              {projectName}
            </div>
          )
        )}

        <div className="h-6 w-px bg-border" />

        {/* History */}
        <Button variant="ghost" size="icon" onClick={undo} disabled={!canUndo} title="Undo (Cmd+Z)">
          <Undo className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={redo} disabled={!canRedo} title="Redo (Cmd+Shift+Z)">
          <Redo className="h-4 w-4" />
        </Button>

        <div className="h-6 w-px bg-border" />

        {/* Canvas Mode Toggle */}
        <div className="canvas-mode-toggle">
          <CanvasModeToggle />
        </div>

        {/* Drawing Tools (Visual Mode Only) */}
        {canvasMode === 'visual' && (
          <>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-md">
              <Button 
                variant={drawingTool === 'select' ? 'default' : 'ghost'} 
                size="icon" 
                onClick={() => setDrawingTool('select')}
                title="Select Tool (V)"
                className="h-8 w-8"
              >
                <MousePointer className="h-4 w-4" />
              </Button>
              <Button 
                variant={drawingTool === 'rectangle' ? 'default' : 'ghost'} 
                size="icon" 
                onClick={() => setDrawingTool('rectangle')}
                title="Rectangle Tool (R)"
                className="h-8 w-8"
              >
                <Square className="h-4 w-4" />
              </Button>
              <Button 
                variant={drawingTool === 'circle' ? 'default' : 'ghost'} 
                size="icon" 
                onClick={() => setDrawingTool('circle')}
                title="Circle Tool (C)"
                className="h-8 w-8"
              >
                <Circle className="h-4 w-4" />
              </Button>
              <Button 
                variant={drawingTool === 'line' ? 'default' : 'ghost'} 
                size="icon" 
                onClick={() => setDrawingTool('line')}
                title="Line Tool (L)"
                className="h-8 w-8"
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}

        {/* Visual Mode Controls */}
        {canvasMode === 'visual' && (
          <>
            <Button variant="ghost" size="icon" onClick={() => setShowGrid(!showGrid)} title="Toggle Grid">
              <Grid className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => setZoom(Math.max(25, zoom - 25))} title="Zoom Out">
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-xs w-12 text-center">{zoom}%</span>
              <Button variant="ghost" size="icon" onClick={() => setZoom(Math.min(200, zoom + 25))} title="Zoom In">
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>

            <Tabs value={deviceMode} onValueChange={(v: any) => setDeviceMode(v)}>
              <TabsList className="h-8">
                <TabsTrigger value="mobile" className="px-2"><Smartphone className="h-3 w-3" /></TabsTrigger>
                <TabsTrigger value="tablet" className="px-2"><Tablet className="h-3 w-3" /></TabsTrigger>
                <TabsTrigger value="desktop" className="px-2"><Monitor className="h-3 w-3" /></TabsTrigger>
              </TabsList>
            </Tabs>
          </>
        )}

        <div className="flex-1" />

        {/* Outline Toggle */}
        <Button variant="ghost" size="icon" onClick={() => setShowOutline(!showOutline)} title="Toggle Outline">
          <List className="h-4 w-4" />
        </Button>

        {/* Global Styles */}
        <GlobalStylesDialog />

        {/* Keyboard Shortcuts */}
        <KeyboardShortcutsHelp />

        {/* Auto-save */}
        <div className="text-xs text-muted-foreground hidden md:block">
          {formatLastSaved()}
        </div>

        {/* Preview */}
        <Button variant={previewMode !== 'editor' ? 'default' : 'outline'} size="sm" onClick={togglePreviewMode}>
          <Eye className="h-4 w-4 mr-1" />
          Preview
        </Button>

        {/* Copy Code */}
        <Button variant="outline" size="sm" onClick={handleCopyCode}>
          <Copy className="h-4 w-4 mr-1" />
          Copy Code
        </Button>

        {/* Generate Code */}
        <Button variant="outline" size="sm" onClick={() => setShowCodeModal(true)}>
          <Code className="h-4 w-4 mr-1" />
          View Code
        </Button>

        {/* Save */}
        <Button size="sm" onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
          Save
        </Button>
      </div>

      <CodePreviewModal open={showCodeModal} onClose={() => setShowCodeModal(false)} />
    </>
  );
}