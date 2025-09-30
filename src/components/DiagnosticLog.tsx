import { useEffect, useRef } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface DiagnosticLogProps {
  logs: string[];
  onClear: () => void;
}

export function DiagnosticLog({ logs, onClear }: DiagnosticLogProps) {
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Автоскролл к последней записи
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(logs.join("\n"));
      toast.success("Лог скопирован в буфер обмена");
    } catch {
      toast.error("Не удалось скопировать");
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-foreground">Диагностический лог</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            disabled={logs.length === 0}
          >
            <Copy className="h-3.5 w-3.5 mr-1" />
            Копировать
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onClear}
            disabled={logs.length === 0}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Очистить
          </Button>
        </div>
      </div>
      <div
        ref={logRef}
        className="h-36 overflow-auto text-xs font-mono bg-editor-bg text-foreground rounded p-3 border"
      >
        {logs.length === 0 ? (
          <div className="text-muted-foreground">Лог пуст</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="mb-1">
              {log}
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
