import { Copy } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useState } from "react";

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
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Скопировано в буфер обмена");
    } catch (error) {
      toast.error("Не удалось скопировать");
    }
  };

  const handleEdit = () => {
    setEditValue(value);
    setIsEditing(true);
  };

  const handleSave = () => {
    onChange(editValue);
    setIsEditing(false);
    toast.success("Код обновлен");
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-foreground">{label}</label>
          <div className="flex gap-2">
            {!readOnly && !isEditing && value && (
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
            {!readOnly && !isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                className="h-8"
              >
                Редактировать
              </Button>
            )}
            {isEditing && (
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
      {isEditing ? (
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
          <div className="overflow-y-auto" style={{ maxHeight: "480px" }}>
            <SyntaxHighlighter
              language={language}
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                padding: "1rem",
                fontSize: "0.875rem",
                background: "#1e1e1e",
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
