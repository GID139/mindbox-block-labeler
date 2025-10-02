import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Download } from "lucide-react";
import { toast } from "sonner";
import type { MindboxState } from "@/types/mindbox";
import { CodeEditor } from "@/components/CodeEditor";
import JSZip from "jszip";

interface FixedCodeTabProps {
  state: MindboxState;
  updateState: (updates: Partial<MindboxState>) => void;
}

export function FixedCodeTab({ state, updateState }: FixedCodeTabProps) {
  const [showHtml, setShowHtml] = useState(true);
  const [showJson, setShowJson] = useState(true);
  const [showReport, setShowReport] = useState(true);
  const [collapsedBlocks, setCollapsedBlocks] = useState<Record<number, boolean>>({});

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Файл ${filename} скачан`);
  };

  const downloadZip = async () => {
    try {
      const zip = new JSZip();
      if (state.fixedHtml) {
        zip.file("fixed.html", state.fixedHtml);
      }
      if (state.fixedJson) {
        zip.file("fixed.json", state.fixedJson);
      }
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = "fixed-code.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Архив скачан");
    } catch (error) {
      toast.error("Не удалось создать архив");
    }
  };

  const renderReport = (markdown: string) => {
    if (!markdown) {
      return (
        <p className="text-sm text-muted-foreground">
          Отчет отсутствует. Возможно, был использован режим быстрого исправления.
        </p>
      );
    }

    return (
      <div className="space-y-4">
        {markdown.split(/\n\n+/).map((block, index) => {
          const isCollapsed = collapsedBlocks[index];

          return (
            <Card key={index} className="overflow-hidden">
              <div
                className="flex items-center justify-between p-3 bg-muted cursor-pointer hover:bg-muted/80"
                onClick={() =>
                  setCollapsedBlocks((prev) => ({
                    ...prev,
                    [index]: !prev[index],
                  }))
                }
              >
                <span className="text-sm font-medium">
                  Блок {index + 1}
                </span>
                {isCollapsed ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </div>
              {!isCollapsed && (
                <div className="p-4">
                  <pre className="text-sm whitespace-pre-wrap text-foreground">
                    {block}
                  </pre>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    );
  };

  if (!state.fixedHtml && !state.fixedJson) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground mb-2">
          Исправленный код пока отсутствует
        </p>
        <p className="text-sm text-muted-foreground">
          Перейдите на вкладку "Создание и Редактирование" и запустите анализ
        </p>
      </Card>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {(state.fixedHtml || state.fixedJson) && (
        <div className="flex justify-end gap-2">
          {state.fixedHtml && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadFile(state.fixedHtml, "fixed.html")}
            >
              <Download className="h-4 w-4 mr-2" />
              Скачать HTML
            </Button>
          )}
          {state.fixedJson && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadFile(state.fixedJson, "fixed.json")}
            >
              <Download className="h-4 w-4 mr-2" />
              Скачать JSON
            </Button>
          )}
          {state.fixedHtml && state.fixedJson && (
            <Button
              variant="outline"
              size="sm"
              onClick={downloadZip}
            >
              <Download className="h-4 w-4 mr-2" />
              Скачать архив
            </Button>
          )}
        </div>
      )}

      {state.fixedHtml && (
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between p-4 bg-muted">
            <Button
              variant="ghost"
              onClick={() => setShowHtml(!showHtml)}
              className="flex items-center gap-2"
            >
              <h2 className="text-xl font-bold">Исправленный HTML</h2>
              {showHtml ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
          {showHtml && (
            <div className="p-4 bg-card">
              <CodeEditor
                value={state.fixedHtml}
                onChange={(value) => updateState({ fixedHtml: value })}
                language="html"
                showCopy={true}
                readOnly={false}
              />
            </div>
          )}
        </Card>
      )}

      {state.fixedJson && (
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between p-4 bg-muted">
            <Button
              variant="ghost"
              onClick={() => setShowJson(!showJson)}
              className="flex items-center gap-2"
            >
              <h2 className="text-xl font-bold">Исправленный JSON</h2>
              {showJson ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
          {showJson && (
            <div className="p-4 bg-card">
              <CodeEditor
                value={state.fixedJson}
                onChange={(value) => updateState({ fixedJson: value })}
                language="json"
                showCopy={true}
                readOnly={false}
              />
            </div>
          )}
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between p-4 bg-muted">
          <Button
            variant="ghost"
            onClick={() => setShowReport(!showReport)}
            className="flex items-center gap-2"
          >
            <h2 className="text-xl font-bold">Отчет об изменениях</h2>
            {showReport ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
        {showReport && (
          <div className="p-6">
            {renderReport(state.reportMarkdown)}
          </div>
        )}
      </Card>
    </div>
  );
}
