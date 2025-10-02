import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CodeEditor } from "@/components/CodeEditor";
import { DiagnosticLog } from "@/components/DiagnosticLog";
import { ComponentSettings } from "@/components/ComponentSettings";
import { ZipUpload } from "@/components/ZipUpload";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { callGeminiAPI, estimateTokens } from "@/lib/gemini-api";
import { 
  buildStep1, 
  buildStep2, 
  buildStep3, 
  detectScenario, 
  getStepName,
  getPipelineDescription,
  type Scenario 
} from "@/lib/mindbox-prompts-v2";
import { saveToHistory } from "@/lib/history-manager";
import { components, friendlyNames, smartHints } from "@/lib/component-settings";
import type { MindboxState } from "@/types/mindbox";
import { Progress } from "@/components/ui/progress";
import { applySettingsToCode } from "@/lib/code-sync";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CreateTabProps {
  state: MindboxState;
  updateState: (updates: Partial<MindboxState>) => void;
  setActiveTab: (tab: string) => void;
  onImproveGoalClick: () => void;
}

export function CreateTab({ state, updateState, setActiveTab, onImproveGoalClick }: CreateTabProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentScenario, setCurrentScenario] = useState<Scenario>('generate-from-scratch');
  const [progressMessage, setProgressMessage] = useState("");
  const [tokenEstimate, setTokenEstimate] = useState(0);
  const [outputPrompt, setOutputPrompt] = useState("");
  const [selectedSettings, setSelectedSettings] = useState<Record<string, boolean>>({});
  const [isApplyingSettings, setIsApplyingSettings] = useState(false);

  useEffect(() => {
    updatePrompt();
  }, [state.goal, state.html, state.json, state.quickFix, state.isDynamicGrid, state.isEditable]);

  const addLog = (message: string) => {
    const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];
    const logEntry = `[${timestamp}] ${message}`;
    updateState({ log: [...state.log, logEntry] });
  };

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

  const updatePrompt = () => {
    // Определяем сценарий на основе наличия HTML/JSON
    const scenario = detectScenario(state.html, state.json);
    setCurrentScenario(scenario);
    
    // Для предпросмотра показываем описание пайплайна
    const description = getPipelineDescription(scenario);
    setOutputPrompt(`Текущий сценарий: ${description}\n\nПромпты будут сгенерированы автоматически на каждом шаге.`);
    
    // Оцениваем токены для всех данных
    const combinedText = [state.goal, state.html, state.json].join('\n');
    setTokenEstimate(estimateTokens(combinedText) * 3); // Умножаем на 3 шага
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

  const handleSettingChange = async (component: string, setting: string, checked: boolean) => {
    const settingId = `${component}-${setting}`;
    setSelectedSettings(prev => ({ ...prev, [settingId]: checked }));

    // Добавляем/удаляем умные подсказки
    const hint = smartHints[setting];
    if (hint) {
      let newGoal = state.goal;
      if (checked && !newGoal.includes(hint)) {
        newGoal = (newGoal.trim() + '\n' + hint).trim();
      } else if (!checked && newGoal.includes(hint)) {
        newGoal = newGoal.replace('\n' + hint, '').replace(hint, '').trim();
      }
      updateState({ goal: newGoal });
    }

    // Интерактивное редактирование: применяем изменения к коду
    if (state.html.trim() || state.json.trim()) {
      setIsApplyingSettings(true);
      try {
        const { html: newHtml, json: newJson } = applySettingsToCode(
          state.html,
          state.json,
          settingId,
          checked
        );
        
        updateState({ html: newHtml, json: newJson });
        addLog(`Настройка ${settingId} ${checked ? 'включена' : 'отключена'}`);
      } catch (error) {
        console.error('Error applying settings:', error);
        toast.error("Ошибка при применении настройки");
      } finally {
        setIsApplyingSettings(false);
      }
    }
  };

  const generateGoalFromSettings = () => {
    const selected = Object.entries(selectedSettings)
      .filter(([_, checked]) => checked)
      .map(([settingId]) => {
        const [component, setting] = settingId.split('-');
        const componentTitle = components[component]?.title || component;
        const settingName = friendlyNames[setting] || setting;
        return `- ${componentTitle}: ${settingName}`;
      });

    if (selected.length === 0) {
      toast.error("Выберите хотя бы одну настройку");
      return;
    }

    // Сохраняем существующие AI подсказки
    const existingHints = Object.values(smartHints).filter(hint => 
      state.goal.includes(hint)
    );

    let goal = `Создать блок с следующими настройками:\n\n${selected.join('\n')}`;
    
    // Добавляем сохраненные подсказки обратно
    if (existingHints.length > 0) {
      goal = goal + '\n\n' + existingHints.join('\n');
    }

    updateState({ goal });
    toast.success("Цель сгенерирована из настроек");
  };

  const handleZipParsed = (html: string, json: string) => {
    updateState({ html, json });
    addLog("ZIP файл загружен и распарсен");
  };

  const handleAnalyze = async () => {
    if (!state.goal.trim() && !state.html.trim() && !state.json.trim()) {
      toast.error("Заполните хотя бы одно поле");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setCurrentStep(0);
    
    // Определяем сценарий
    const scenario = detectScenario(state.html, state.json);
    setCurrentScenario(scenario);
    
    const pipelineDesc = getPipelineDescription(scenario);
    addLog(`Начало анализа: ${pipelineDesc}`);

    try {
      const settingsList = Object.entries(selectedSettings)
        .filter(([_, checked]) => checked)
        .map(([settingId]) => settingId)
        .join(', ');

      // ============================================================
      // ШАГ 1: ГЕНЕРАЦИЯ ИЛИ ВАЛИДАЦИЯ HTML (всегда выполняется)
      // ============================================================
      setCurrentStep(1);
      setProgress(33);
      const step1Name = getStepName(1, scenario);
      setProgressMessage(step1Name);
      addLog(`Шаг 1/3: ${step1Name}`);
      
      const prompt1 = buildStep1({
        goal: state.goal,
        html: state.html, // Передаем существующий HTML для валидации
        isDynamicGrid: state.isDynamicGrid,
        isEditable: state.isEditable,
        settingsList
      });
      
      const response1 = await callGeminiAPI(prompt1, {
        model: "gemini-2.0-flash-exp"
      });
      
      // Парсим HTML из ответа
      let html = response1.trim();
      // Если AI обернул в код-блоки, извлекаем
      const htmlMatch = html.match(/```\s*html[\r\n]+([\s\S]*?)```/i);
      if (htmlMatch) {
        html = htmlMatch[1].trim();
      }
      
      updateState({ html });
      addLog("Шаг 1 завершен: HTML обработан");

      // ============================================================
      // ШАГ 2: ГЕНЕРАЦИЯ ИЛИ ВАЛИДАЦИЯ JSON (всегда выполняется)
      // ============================================================
      setCurrentStep(2);
      setProgress(66);
      const step2Name = getStepName(2, scenario);
      setProgressMessage(step2Name);
      addLog(`Шаг 2/3: ${step2Name}`);
      
      const prompt2 = buildStep2({
        html,
        json: state.json // Передаем существующий JSON для валидации
      });
      
      const response2 = await callGeminiAPI(prompt2, {
        model: "gemini-2.0-flash-exp"
      });
      
      // Парсим JSON из ответа
      let json = response2.trim();
      // Если AI обернул в код-блоки, извлекаем
      const jsonMatch = json.match(/```\s*json[\r\n]+([\s\S]*?)```/i);
      if (jsonMatch) {
        json = jsonMatch[1].trim();
      }
      
      updateState({ json });
      addLog("Шаг 2 завершен: JSON обработан");

      // ============================================================
      // ШАГ 3: ФИНАЛЬНАЯ ОТЛАДКА И СИНХРОНИЗАЦИЯ (всегда выполняется)
      // ============================================================
      setCurrentStep(3);
      setProgress(90);
      const step3Name = getStepName(3, scenario);
      setProgressMessage(step3Name);
      addLog(`Шаг 3/3: ${step3Name}`);
      
      const prompt3 = buildStep3({
        goal: state.goal,
        html,
        json,
        quickFix: state.quickFix
      });
      
      const response3 = await callGeminiAPI(prompt3, {
        model: "gemini-2.0-flash-exp"
      });
      
      // Парсим результаты Step 3
      let fixedHtml = '';
      let fixedJson = '';
      let reportMarkdown = '';
      
      if (state.quickFix) {
        // В режиме quickFix ответ в формате: HTML ---JSON--- JSON
        const parts = response3.split('---JSON---');
        if (parts.length === 2) {
          fixedHtml = parts[0].trim();
          fixedJson = parts[1].trim();
          
          // Убираем код-блоки если есть
          const htmlMatch = fixedHtml.match(/```\s*html[\r\n]+([\s\S]*?)```/i);
          if (htmlMatch) fixedHtml = htmlMatch[1].trim();
          
          const jsonMatch = fixedJson.match(/```\s*json[\r\n]+([\s\S]*?)```/i);
          if (jsonMatch) fixedJson = jsonMatch[1].trim();
          
          reportMarkdown = '✅ Быстрое исправление выполнено';
        }
      } else {
        // Полный режим: извлекаем HTML, JSON и отчет
        const htmlMatch = response3.match(/```\s*html[\r\n]+([\s\S]*?)```/i);
        const jsonMatch = response3.match(/```\s*json[\r\n]+([\s\S]*?)```/i);
        
        fixedHtml = htmlMatch ? htmlMatch[1].trim() : html;
        fixedJson = jsonMatch ? jsonMatch[1].trim() : json;
        
        // Извлекаем отчет (всё после JSON блока или с маркером отчета)
        const reportMatch = response3.match(/```\s*json[\r\n]+[\s\S]*?```[\r\n]+([\s\S]*)/i);
        reportMarkdown = reportMatch ? reportMatch[1].trim() : '✅ Валидация завершена';
      }

      updateState({
        fixedHtml,
        fixedJson,
        reportMarkdown
      });

      setProgress(100);
      setProgressMessage("✅ Все 3 шага завершены успешно!");
      addLog("Анализ завершен: все 3 шага выполнены");
      
      // Сохраняем в историю
      saveToHistory("Автосохранение", {
        goal: state.goal,
        html,
        json,
        fixedHtml,
        fixedJson,
        reportMarkdown
      });

      toast.success("Все 3 шага выполнены успешно");
      
      setTimeout(() => {
        setActiveTab('fixed');
      }, 500);
    } catch (error) {
      console.error('Analysis error:', error);
      addLog(`Ошибка на шаге ${currentStep}: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`);
      toast.error(`Ошибка на шаге ${currentStep}`);
    } finally {
      setIsProcessing(false);
      setProgress(0);
      setCurrentStep(0);
      setProgressMessage("");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        {isApplyingSettings && (
          <Alert>
            <AlertDescription>
              Применение настроек к коду...
            </AlertDescription>
          </Alert>
        )}
        
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-4">Начало работы</h2>
          
          <div className="space-y-4">
            <ZipUpload onZipParsed={handleZipParsed} isLoading={isProcessing} />
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">или</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal">Цель/Описание блока</Label>
              <Textarea
                id="goal"
                value={state.goal}
                onChange={(e) => updateGoal(e.target.value)}
                placeholder="Опишите, какой блок нужно создать..."
                className="min-h-[120px]"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={generateGoalFromSettings}
                className="w-full"
              >
                <Wand2 className="mr-2 h-3.5 w-3.5" />
                Сгенерировать цель из настроек
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onImproveGoalClick}
                disabled={!state.goal.trim()}
                className="w-full"
              >
                <Sparkles className="mr-2 h-3.5 w-3.5" />
                Улучшить формулировку цели
              </Button>
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

            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold mb-3 text-sm">Специальные настройки</h3>
              
              <div className="flex items-center space-x-2 mb-3">
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

              {state.isDynamicGrid && (
                <Alert className="mb-3">
                  <AlertDescription className="text-xs">
                    Включена поддержка динамической генерации товаров в сетке
                  </AlertDescription>
                </Alert>
              )}

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
          </div>
        </Card>

        <ComponentSettings
          html={state.html}
          json={state.json}
          selectedSettings={selectedSettings}
          onSettingChange={handleSettingChange}
        />

        <Card className="p-6">
          <CodeEditor
            value={state.html}
            onChange={updateHtml}
            label="HTML код"
            placeholder="Вставьте HTML код или оставьте пустым для генерации..."
            language="html"
          />
        </Card>

        <Card className="p-6">
          <CodeEditor
            value={state.json}
            onChange={updateJson}
            label="JSON настройки"
            placeholder="Вставьте JSON настройки или оставьте пустым для генерации..."
            language="json"
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

        {outputPrompt && (
          <Card className="p-6">
            <CodeEditor
              value={outputPrompt}
              onChange={setOutputPrompt}
              label="Промпт для отправки (редактируемый)"
              placeholder=""
              showCopy={true}
              className="min-h-[200px]"
            />
          </Card>
        )}

        <Button
          onClick={handleAnalyze}
          disabled={isProcessing || isApplyingSettings}
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
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Шаг {currentStep}/3</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
              {progressMessage && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-center">
                    {progressMessage}
                  </p>
                  <p className="text-xs text-muted-foreground text-center">
                    {getPipelineDescription(currentScenario)}
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}

        <DiagnosticLog 
          logs={state.log}
          onClear={() => updateState({ log: [] })}
        />

        <Card className="p-6">
          <h3 className="font-semibold mb-3">Как работает пайплайн:</h3>
          <ol className="text-sm space-y-2 text-muted-foreground list-decimal list-inside">
            <li><strong>Шаг 1</strong>: Генерация или валидация HTML кода</li>
            <li><strong>Шаг 2</strong>: Генерация или валидация JSON настроек</li>
            <li><strong>Шаг 3</strong>: Финальная отладка и синхронизация</li>
            <li className="pt-2 border-t">Все 3 шага выполняются всегда, независимо от наличия кода</li>
            <li>Нажмите кнопку анализа</li>
            <li>Получите исправленный код</li>
          </ol>
        </Card>
      </div>
    </div>
  );
}
