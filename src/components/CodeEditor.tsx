import { Copy } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useState, useEffect } from "react";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  showCopy?: boolean;
  language?: "html" | "json";
  readOnly?: boolean;
}

export function CodeEditor({
  value,
  onChange,
  placeholder,
  className = "",
  label,
  showCopy = true,
  language = "html",
  readOnly = false,
}: CodeEditorProps) {
  const [editValue, setEditValue] = useState(value);

  // Синхронизируем editValue с value при изменении value извне
  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Скопировано в буфер обмена");
    } catch (error) {
      toast.error("Не удалось скопировать");
    }
  };

  const handleSave = () => {
    onChange(editValue);
    toast.success("Код обновлен");
  };

  const handleCancel = () => {
    setEditValue(value);
  };

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-foreground">{label}</label>
          <div className="flex gap-2">
            {!readOnly && value && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onChange('');
                  toast.success("Код очищен");
                }}
                className="h-8"
              >
                Очистить
              </Button>
            )}
            {!readOnly && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  className="h-8"
                >
                  Отмена
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSave}
                  className="h-8"
                >
                  Сохранить
                </Button>
              </>
            )}
            {showCopy && value && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-8"
              >
                <Copy className="h-3.5 w-3.5 mr-1" />
                Копировать
              </Button>
            )}
          </div>
        </div>
      )}
      {!readOnly ? (
        <textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          placeholder={placeholder}
          className={`w-full font-mono text-sm bg-[#1e1e1e] text-[#d4d4d4] p-4 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-ring overflow-y-auto ${className}`}
          style={{ height: "480px", maxHeight: "480px" }}
          spellCheck={false}
        />
      ) : (
        <div className="relative rounded-lg overflow-hidden border border-input" style={{ maxHeight: "480px" }}>
          <style>{`
            .code-scroll-container::-webkit-scrollbar {
              height: 12px;
              width: 8px;
            }
            .code-scroll-container::-webkit-scrollbar-track {
              background: #1e1e1e;
            }
            .code-scroll-container::-webkit-scrollbar-thumb {
              background: #404040;
              border-radius: 4px;
            }
            .code-scroll-container::-webkit-scrollbar-thumb:hover {
              background: #505050;
            }
          `}</style>
          <div 
            className="code-scroll-container" 
            style={{ 
              maxHeight: "480px",
              overflowY: "auto",
              overflowX: "scroll",
              scrollbarWidth: "thin",
              scrollbarColor: "#404040 #1e1e1e"
            }}
          >
            <SyntaxHighlighter
              language={language}
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                padding: "1rem",
                fontSize: "0.875rem",
                background: "#1e1e1e",
                minWidth: "max-content",
              }}
              showLineNumbers
              wrapLines={false}
              wrapLongLines={false}
            >
              {value || placeholder || ""}
            </SyntaxHighlighter>
          </div>
        </div>
      )}
    </div>
  );
}
