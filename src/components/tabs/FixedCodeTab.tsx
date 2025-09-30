import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Copy } from "lucide-react";
import { toast } from "sonner";
import type { MindboxState } from "@/types/mindbox";

interface FixedCodeTabProps {
  state: MindboxState;
}

export function FixedCodeTab({ state }: FixedCodeTabProps) {
  const [showHtml, setShowHtml] = useState(true);
  const [showJson, setShowJson] = useState(true);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} скопирован в буфер обмена`);
    } catch {
      toast.error("Не удалось скопировать");
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
        {markdown.split(/\n\n+/).map((block, index) => (
          <Card key={index} className="p-4">
            <pre className="text-sm whitespace-pre-wrap text-foreground">
              {block}
            </pre>
          </Card>
        ))}
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(state.fixedHtml, "HTML")}
            >
              <Copy className="h-4 w-4 mr-2" />
              Копировать
            </Button>
          </div>
          {showHtml && (
            <div className="p-4 bg-card">
              <pre className="text-sm font-mono overflow-x-auto p-4 bg-editor-bg text-foreground rounded-lg">
                {state.fixedHtml}
              </pre>
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(state.fixedJson, "JSON")}
            >
              <Copy className="h-4 w-4 mr-2" />
              Копировать
            </Button>
          </div>
          {showJson && (
            <div className="p-4 bg-card">
              <pre className="text-sm font-mono overflow-x-auto p-4 bg-editor-bg text-foreground rounded-lg">
                {state.fixedJson}
              </pre>
            </div>
          )}
        </Card>
      )}

      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Отчет об изменениях</h2>
        {renderReport(state.reportMarkdown)}
      </Card>
    </div>
  );
}
