import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useVisualEditorStore } from '@/stores/visual-editor-store';
import { Save, Eye, Code, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { CodePreviewModal } from './CodePreviewModal';

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

  return (
    <>
      <div className="flex items-center gap-3 p-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {/* Project Selector */}
        <Select
          value={currentProjectId || undefined}
          onValueChange={handleProjectChange}
          disabled={isLoadingProjects}
        >
          <SelectTrigger className="w-64">
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
              onKeyDown={(e) => {
                if (e.key === 'Enter') setIsEditingName(false);
              }}
              className="w-48"
              autoFocus
            />
          ) : (
            <div
              className="text-sm font-medium cursor-pointer hover:text-primary"
              onClick={() => setIsEditingName(true)}
            >
              {projectName}
            </div>
          )
        )}

        <div className="flex-1" />

        {/* Auto-save indicator */}
        <div className="text-xs text-muted-foreground">
          Auto-save: {formatLastSaved()}
        </div>

        {/* Preview Toggle */}
        <Button
          variant={previewMode ? 'default' : 'outline'}
          size="sm"
          onClick={togglePreviewMode}
        >
          <Eye className="h-4 w-4 mr-2" />
          {previewMode ? 'Edit Mode' : 'Preview'}
        </Button>

        {/* Generate Code */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCodeModal(true)}
        >
          <Code className="h-4 w-4 mr-2" />
          Generate Code
        </Button>

        {/* Save Button */}
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save
            </>
          )}
        </Button>
      </div>

      <CodePreviewModal
        open={showCodeModal}
        onClose={() => setShowCodeModal(false)}
      />
    </>
  );
}
