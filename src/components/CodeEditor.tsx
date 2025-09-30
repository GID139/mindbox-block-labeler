import { Textarea } from "./ui/textarea";
import { Copy } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  showCopy?: boolean;
}

export function CodeEditor({
  value,
  onChange,
  placeholder,
  className = "",
  label,
  showCopy = true,
}: CodeEditorProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Скопировано в буфер обмена");
    } catch (error) {
      toast.error("Не удалось скопировать");
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-foreground">{label}</label>
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
      )}
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`font-mono text-sm min-h-[300px] bg-card ${className}`}
        spellCheck={false}
      />
    </div>
  );
}
