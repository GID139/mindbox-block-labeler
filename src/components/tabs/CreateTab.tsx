import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CodeEditor } from "@/components/CodeEditor";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { callGeminiAPI, estimateTokens } from "@/lib/gemini-api";
import { buildStep1, buildStep2, buildStep4 } from "@/lib/mindbox-prompts";
import type { MindboxState } from "@/types/mindbox";
import { Progress } from "@/components/ui/progress";

interface CreateTabProps {
  state: MindboxState;
  updateState: (updates: Partial<MindboxState>) => void;
  setActiveTab: (tab: string) => void;
}

export function CreateTab({ state, updateState, setActiveTab }: CreateTabProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [tokenEstimate, setTokenEstimate] = useState(0);

  const updateGoal = (goal: string) => {
    updateState({ goal });
    updateTokenEstimate(goal, state.html, state.json);
  };

  const updateHtml = (html: string) => {
    updateState({ html });
    updateTokenEstimate(state.goal, html, state.json);
  };

  const updateJson = (json: string) => {
    updateState({ json });
    updateTokenEstimate(state.goal, state.html, json);
  };

  const updateTokenEstimate = (goal: string, html: string, json: string) => {
    const combinedText = [goal, html, json].join('\n');
    setTokenEstimate(estimateTokens(combinedText));
  };

  const parseCodeBlocks = (text: string) => {
    const htmlMatch = text.match(/```\s*html[\r\n]+([\s\S]*?)```/i);
    const jsonMatch = text.match(/```\s*json[\r\n]+([\s\S]*?)```/i);
    const reportMatch = text.match(/---\s*ОТЧЕТ ОБ ИЗМЕНЕНИЯХ\s*---[\r\n]+([\s\S]*)/i);
    
    return {
      html: htmlMatch ? htmlMatch[1].trim() : '',
      json: jsonMatch ? jsonMatch[1].trim() : '',
      report: reportMatch ? reportMatch[1].trim() : ''
    };
  };

  const handleAnalyze = async () => {
    if (!state.goal.trim() && !state.html.trim() && !state.json.trim()) {
      toast.error("Заполните хотя бы одно поле");
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      // Шаг 1: Генерация HTML (если нужно)
      let html = state.html;
      if (!html.trim() && state.goal.trim()) {
        setProgress(25);
        const prompt1 = buildStep1({
          goal: state.goal,
          isDynamicGrid: state.isDynamicGrid,
          isEditable: state.isEditable,
          settingsList: ''
        });
        
        const response1 = await callGeminiAPI(prompt1);
        const parsed1 = parseCodeBlocks(response1);
        html = parsed1.html;
        updateState({ html });
      }

      // Шаг 2: Генерация JSON (если нужно)
      let json = state.json;
      if (!json.trim() && html.trim()) {
        setProgress(50);
        const prompt2 = buildStep2({ html });
        const response2 = await callGeminiAPI(prompt2);
        const parsed2 = parseCodeBlocks(response2);
        json = parsed2.json;
        updateState({ json });
      }

      // Шаг 4: Финальная валидация и исправление
      setProgress(75);
      const prompt4 = buildStep4({
        goal: state.goal,
        html,
        json,
        quickFix: state.quickFix
      });
      
      const response4 = await callGeminiAPI(prompt4);
      const parsed4 = parseCodeBlocks(response4);

      updateState({
        fixedHtml: parsed4.html,
        fixedJson: parsed4.json,
        reportMarkdown: parsed4.report
      });

      setProgress(100);
      toast.success("Анализ завершен успешно");
      
      setTimeout(() => {
        setActiveTab('fixed');
      }, 500);
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error("Ошибка при анализе кода");
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-4">Настройки</h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="goal">Цель/Описание блока</Label>
              <Textarea
                id="goal"
                value={state.goal}
                onChange={(e) => updateGoal(e.target.value)}
                placeholder="Опишите, какой блок нужно создать..."
                className="min-h-[120px]"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="quickFix"
                checked={state.quickFix}
                onCheckedChange={(checked) => 
                  updateState({ quickFix: checked as boolean })
                }
              />
              <Label htmlFor="quickFix" className="text-sm font-normal cursor-pointer">
                Быстрое исправление (без подробного отчета)
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isDynamicGrid"
                checked={state.isDynamicGrid}
                onCheckedChange={(checked) => 
                  updateState({ isDynamicGrid: checked as boolean })
                }
              />
              <Label htmlFor="isDynamicGrid" className="text-sm font-normal cursor-pointer">
                Динамическая сетка товаров
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isEditable"
                checked={state.isEditable}
                onCheckedChange={(checked) => 
                  updateState({ isEditable: checked as boolean })
                }
              />
              <Label htmlFor="isEditable" className="text-sm font-normal cursor-pointer">
                Редактируемый блок
              </Label>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <CodeEditor
            value={state.html}
            onChange={updateHtml}
            label="HTML код"
            placeholder="Вставьте HTML код или оставьте пустым для генерации..."
          />
        </Card>

        <Card className="p-6">
          <CodeEditor
            value={state.json}
            onChange={updateJson}
            label="JSON настройки"
            placeholder="Вставьте JSON настройки или оставьте пустым для генерации..."
          />
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-2">Оценка токенов</h3>
          <p className="text-sm text-muted-foreground">
            Примерно {tokenEstimate.toLocaleString()} токенов
          </p>
        </Card>

        <Button
          onClick={handleAnalyze}
          disabled={isProcessing}
          className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary-hover"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Обработка...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Проанализировать и исправить
            </>
          )}
        </Button>

        {isProcessing && progress > 0 && (
          <Card className="p-4">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2 text-center">
              {progress === 25 && "Генерация HTML..."}
              {progress === 50 && "Генерация JSON..."}
              {progress === 75 && "Валидация и исправление..."}
              {progress === 100 && "Готово!"}
            </p>
          </Card>
        )}

        <Card className="p-6">
          <h3 className="font-semibold mb-3">Как использовать:</h3>
          <ol className="text-sm space-y-2 text-muted-foreground list-decimal list-inside">
            <li>Опишите цель или вставьте существующий HTML/JSON</li>
            <li>Настройте параметры блока (динамическая сетка, редактируемость)</li>
            <li>Нажмите кнопку анализа</li>
            <li>Получите исправленный код во вкладке "Исправленный код"</li>
          </ol>
        </Card>
      </div>
    </div>
  );
}
