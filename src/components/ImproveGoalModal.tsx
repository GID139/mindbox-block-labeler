import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { callBothubAPI } from "@/lib/bothub-api";

interface ImproveGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGoal: string;
  onAccept: (improvedGoal: string) => void;
}

type ImproveMode = "short" | "medium" | "full";

export function ImproveGoalModal({
  isOpen,
  onClose,
  currentGoal,
  onAccept,
}: ImproveGoalModalProps) {
  const [improvedText, setImprovedText] = useState("");
  const [mode, setMode] = useState<ImproveMode>("medium");
  const [isLoading, setIsLoading] = useState(false);

  // Мемоизируем промпт для улучшения цели
  const improvePrompt = useMemo(() => {
    if (mode === "short") {
      return `Переформулируй цель максимально кратко (1-2 предложения), без потери смысла. Верни только текст цели.\n\nЦель:\n${currentGoal}`;
    }
    if (mode === "medium") {
      return `Переформулируй цель кратко и понятно (2-4 предложения), сохрани требования. Верни только текст цели.\n\nЦель:\n${currentGoal}`;
    }
    return `Переформулируй цель максимально чётко и однозначно для ИИ. Укажи ключевые параметры, входные данные и ожидаемые выходы. Верни только текст цели.\n\nЦель:\n${currentGoal}`;
  }, [mode, currentGoal]);

  const handleImprove = async () => {
    if (!currentGoal.trim()) {
      toast.error("Сначала опишите цель");
      return;
    }

    setIsLoading(true);
    try {
      const result = await callBothubAPI(
        [{ role: "user", content: improvePrompt }],
        { model: "gpt-4o-mini", temperature: 0.7 }
      );
      setImprovedText(result.trim());
      toast.success("Цель улучшена");
    } catch (error) {
      toast.error("Ошибка при улучшении цели");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = () => {
    if (improvedText.trim()) {
      onAccept(improvedText.trim());
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Улучшение формулировки цели</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-semibold mb-2 block">
              Режим улучшения
            </Label>
            <RadioGroup value={mode} onValueChange={(v) => setMode(v as ImproveMode)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="short" id="short" />
                <Label htmlFor="short" className="font-normal cursor-pointer">
                  Кратко (1-2 предложения)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="medium" />
                <Label htmlFor="medium" className="font-normal cursor-pointer">
                  Детально (2-4 предложения)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="full" id="full" />
                <Label htmlFor="full" className="font-normal cursor-pointer">
                  Максимально четко (для AI)
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label className="text-sm font-semibold mb-2 block">
              Улучшенная формулировка
            </Label>
            <Textarea
              value={improvedText}
              onChange={(e) => setImprovedText(e.target.value)}
              placeholder="Нажмите 'Запросить улучшение' для генерации..."
              className="min-h-[200px]"
            />
          </div>

          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Улучшаем формулировку...
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="secondary"
            onClick={handleImprove}
            disabled={isLoading || !currentGoal.trim()}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Запросить улучшение
          </Button>
          <Button
            onClick={handleAccept}
            disabled={!improvedText.trim()}
          >
            Принять
          </Button>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
