import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import type { MindboxState } from "@/types/mindbox";

interface ControlPanelProps {
  onClearSession: () => void;
}

const initialState: MindboxState = {
  goal: '',
  html: '',
  json: '',
  quickFix: false,
  isDynamicGrid: false,
  isEditable: false,
  settings: {},
  improvedGoal: '',
  fixedHtml: '',
  fixedJson: '',
  reportMarkdown: '',
  log: []
};

export function ControlPanel({ onClearSession }: ControlPanelProps) {
  const handleClear = () => {
    if (confirm("Вы уверены, что хотите очистить текущий сеанс? Все несохраненные данные будут потеряны.")) {
      onClearSession();
      toast.success("Сеанс очищен");
    }
  };

  return (
    <div className="flex justify-end mb-4">
      <Button
        variant="outline"
        size="sm"
        onClick={handleClear}
      >
        <RotateCcw className="h-4 w-4 mr-2" />
        Очистить сеанс
      </Button>
    </div>
  );
}
