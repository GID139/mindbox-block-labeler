import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useVisualEditorStore } from '@/stores/visual-editor-store';
import { generateHTML, generateJSON } from '@/lib/visual-editor/code-generator';
import { CodeEditor } from '@/components/CodeEditor';
import { Download, Copy, FileArchive } from 'lucide-react';
import { toast } from 'sonner';
import JSZip from 'jszip';

interface CodePreviewModalProps {
  open: boolean;
  onClose: () => void;
}

export function CodePreviewModal({ open, onClose }: CodePreviewModalProps) {
  const { blocks } = useVisualEditorStore();
  const [html, setHtml] = useState('');
  const [json, setJson] = useState('');

  // Generate code when modal opens
  useEffect(() => {
    if (open) {
      const generatedHtml = generateHTML(blocks);
      const generatedJson = generateJSON(blocks);
      setHtml(generatedHtml);
      setJson(generatedJson);
    }
  }, [open, blocks]);

  const downloadFile = (filename: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}`);
  };

  const downloadZip = async () => {
    const zip = new JSZip();
    zip.file('template.html', html);
    zip.file('config.json', json);
    
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mindbox-template.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Downloaded ZIP archive');
  };

  const copyToClipboard = (content: string, type: string) => {
    navigator.clipboard.writeText(content);
    toast.success(`${type} copied to clipboard`);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Generated Code</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="html" className="flex-1">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="html">HTML</TabsTrigger>
            <TabsTrigger value="json">JSON</TabsTrigger>
          </TabsList>

          <TabsContent value="html" className="space-y-4">
            <div className="max-h-[50vh] overflow-auto">
              <CodeEditor
                value={html}
                onChange={() => {}}
                language="html"
                readOnly
                placeholder=""
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => downloadFile('template.html', html, 'text/html')}
              >
                <Download className="h-4 w-4 mr-2" />
                Download HTML
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(html, 'HTML')}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy HTML
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="json" className="space-y-4">
            <div className="max-h-[50vh] overflow-auto">
              <CodeEditor
                value={json}
                onChange={() => {}}
                language="json"
                readOnly
                placeholder=""
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => downloadFile('config.json', json, 'application/json')}
              >
                <Download className="h-4 w-4 mr-2" />
                Download JSON
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(json, 'JSON')}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy JSON
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={downloadZip}>
            <FileArchive className="h-4 w-4 mr-2" />
            Download ZIP (HTML + JSON)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
