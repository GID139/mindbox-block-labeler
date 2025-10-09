import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useVisualEditorStore } from '@/stores/visual-editor-store';
import { Save, Eye, Code, Loader2, Undo, Redo, Monitor, Tablet, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { CodePreviewModal } from './CodePreviewModal';
import { CanvasModeToggle } from './CanvasModeToggle';
import { ViewDropdown } from './ViewDropdown';
import { ToolsDropdown } from './ToolsDropdown';
import { ZoomDropdown } from './ZoomDropdown';
import { FileDropdown } from './FileDropdown';
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
    deviceMode,
    setDeviceMode,
    canvasMode,
    blocks,
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
    try {
      const projectsList = await listProjects();
      setProjects(projectsList);
    } catch (error) {
      toast.error('Failed to load projects');
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const handleProjectChange = async (value: string) => {
    if (value === 'new') {
      const newName = `Project ${Date.now()}`;
      await createNewProject(newName);
      await loadProjectsList();
      toast.success('New project created');
    } else {
      await loadProject(value);
      toast.success('Project loaded');
    }
  };

  const handleSave = async () => {
    try {
      await saveProject();
      toast.success('Project saved');
    } catch (error) {
      toast.error('Failed to save project');
    }
  };

  const formatLastSaved = () => {
    if (!lastSavedAt) return 'Never saved';
    const now = new Date();
    const diff = now.getTime() - lastSavedAt.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 minute ago';
    if (minutes < 60) return `${minutes} minutes ago`;
    return lastSavedAt.toLocaleTimeString();
  };

  const handleCopyCode = () => {
    const html = generateHTML(blocks);
    const json = JSON.stringify(blocks, null, 2);
    const combined = `<!-- HTML -->\n${html}\n\n<!-- JSON -->\n${json}`;
    navigator.clipboard.writeText(combined);
    toast.success('Code copied to clipboard');
  };

  return (
    <>
      <div className="flex items-center gap-2 p-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-wrap">
        {/* Project Selection */}
        <Select value={currentProjectId || ''} onValueChange={handleProjectChange} disabled={isLoadingProjects}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Select project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new">+ New Project</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Project Name */}
        {isEditingName ? (
          <Input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            onBlur={() => setIsEditingName(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setIsEditingName(false);
            }}
            className="w-[180px] h-9"
            autoFocus
          />
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditingName(true)}
            className="font-medium"
          >
            {projectName}
          </Button>
        )}

        <div className="h-6 w-px bg-border" />

        {/* History Controls */}
        <Button
          variant="ghost"
          size="sm"
          onClick={undo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={redo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
        >
          <Redo className="h-4 w-4" />
        </Button>

        <div className="h-6 w-px bg-border" />

        {/* Canvas Mode Toggle */}
        <CanvasModeToggle />

        <div className="h-6 w-px bg-border" />

        {/* Tools & View (Visual Mode Only) */}
        {canvasMode === 'visual' && (
          <>
            <ToolsDropdown />
            <ViewDropdown />
            <div className="h-6 w-px bg-border" />
          </>
        )}

        {/* Zoom Control (Visual Mode Only) */}
        {canvasMode === 'visual' && (
          <>
            <ZoomDropdown />
            <div className="h-6 w-px bg-border" />
          </>
        )}

        {/* Device Mode (Visual Mode Only) */}
        {canvasMode === 'visual' && (
          <>
            <Tabs value={deviceMode} onValueChange={(v) => setDeviceMode(v as typeof deviceMode)}>
              <TabsList className="h-9">
                <TabsTrigger value="desktop" className="px-3">
                  <Monitor className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="tablet" className="px-3">
                  <Tablet className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="mobile" className="px-3">
                  <Smartphone className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="h-6 w-px bg-border" />
          </>
        )}

        {/* File Operations */}
        <FileDropdown />

        <div className="flex-1" />

        {/* Preview & Code */}
        <Button
          variant="outline"
          size="sm"
          onClick={togglePreviewMode}
          className="gap-1"
        >
          <Eye className="h-4 w-4" />
          Preview
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCodeModal(true)}
          className="gap-1"
        >
          <Code className="h-4 w-4" />
          Code
        </Button>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={isSaving}
          size="sm"
          className="gap-1"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save
            </>
          )}
        </Button>

        {lastSavedAt && (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatLastSaved()}
          </span>
        )}
      </div>

      <CodePreviewModal
        open={showCodeModal}
        onClose={() => setShowCodeModal(false)}
      />
    </>
  );
}
