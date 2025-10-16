import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CodeEditor } from "@/components/CodeEditor";
import { DiagnosticLog } from "@/components/DiagnosticLog";
import { ComponentSettings } from "@/components/ComponentSettings";
import { ZipUpload } from "@/components/ZipUpload";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { Loader2, Sparkles, Wand2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { callBothubAPI, estimateTokens } from "@/lib/bothub-api";
import { useMindboxPrompts } from "@/hooks/useMindboxPrompts";
import type { Scenario } from "@/lib/prompts";
import { buildSingleShotPrompt } from "@/lib/prompts";
import { saveToHistory } from "@/lib/history-manager";
import { components, friendlyNames, smartHints } from "@/lib/component-settings";
import type { MindboxState } from "@/types/mindbox";
import { applySettingsToCode } from "@/lib/code-sync";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { logger } from "@/lib/logger";

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
  const [progressMessage, setProgressMessage] = useState("");
  const [selectedSettings, setSelectedSettings] = useState<Record<string, boolean>>({});
  const [isApplyingSettings, setIsApplyingSettings] = useState(false);
  const [goalInput, setGoalInput] = useState(state.goal);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  // Синхронизируем goalInput с state.goal при монтировании
  useEffect(() => {
    setGoalInput(state.goal);
  }, [state.goal]);

  // Мемоизируем список настроек для промптов
  const settingsList = useMemo(() => {
    return Object.entries(selectedSettings)
      .filter(([_, checked]) => checked)
      .map(([settingId]) => settingId)
      .join(', ');
  }, [selectedSettings]);

  // Используем хук с мемоизацией промптов
  const {
    scenario,
    step1Prompt,
    step2Prompt,
    step3Prompt,
    stepNames,
    pipelineDescription
  } = useMindboxPrompts({
    goal: state.goal,
    html: state.originalHtml,
    visualHtml: state.visualHtml,
    json: state.originalJson,
    isDynamicGrid: state.isDynamicGrid,
    isEditable: state.isEditable,
    settingsList,
    quickFix: state.quickFix
  });

  // Мемоизируем оценку токенов
  const tokenEstimate = useMemo(() => {
    const combinedText = [state.goal, state.originalHtml, state.originalJson].join('\n');
    return estimateTokens(combinedText) * 3; // Умножаем на 3 шага
  }, [state.goal, state.originalHtml, state.originalJson]);

  // Мемоизируем полный промпт для предпросмотра (все 3 шага)
  const outputPrompt = useMemo(() => {
    return `# СЦЕНАРИЙ: ${pipelineDescription}

# ОЦЕНКА ТОКЕНОВ: ~${tokenEstimate} токенов

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 ШАГ 1: ${stepNames.step1}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${step1Prompt}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 ШАГ 2: ${stepNames.step2}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${step2Prompt}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 ШАГ 3: ${stepNames.step3}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${step3Prompt}`;
  }, [pipelineDescription, tokenEstimate, stepNames, step1Prompt, step2Prompt, step3Prompt]);

  const addLog = (message: string) => {
    const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];
    const logEntry = `[${timestamp}] ${message}`;
    updateState({ log: [...state.log, logEntry] });
  };

  const applyGoal = () => {
    updateState({ goal: goalInput });
    toast.success("Цель применена к промпту");
  };

  const isGoalChanged = useMemo(() => {
    return goalInput.trim() !== state.goal.trim();
  }, [goalInput, state.goal]);

  const updateHtml = (html: string) => {
    updateState({ originalHtml: html });
  };

  const updateJson = (json: string) => {
    updateState({ originalJson: json });
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
      let newGoal = goalInput;
      if (checked && !newGoal.includes(hint)) {
        newGoal = (newGoal.trim() + '\n' + hint).trim();
      } else if (!checked && newGoal.includes(hint)) {
        newGoal = newGoal.replace('\n' + hint, '').replace(hint, '').trim();
      }
      setGoalInput(newGoal);
      updateState({ goal: newGoal });
    }

    // Интерактивное редактирование: применяем изменения к коду
    if (state.originalHtml.trim() || state.originalJson.trim()) {
      setIsApplyingSettings(true);
      try {
        const { html: newHtml, json: newJson } = applySettingsToCode(
          state.originalHtml,
          state.originalJson,
          settingId,
          checked
        );
        
        updateState({ originalHtml: newHtml, originalJson: newJson });
        addLog(`Настройка ${settingId} ${checked ? 'включена' : 'отключена'}`);
      } catch (error) {
        logger.error('Error applying settings', 'CreateTab', { error: error instanceof Error ? error.message : error });
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
      goalInput.includes(hint)
    );

    let goal = `Создать блок с следующими настройками:\n\n${selected.join('\n')}`;
    
    // Добавляем сохраненные подсказки обратно
    if (existingHints.length > 0) {
      goal = goal + '\n\n' + existingHints.join('\n');
    }

    setGoalInput(goal);
    updateState({ goal });
    toast.success("Цель сгенерирована из настроек");
  };

  const handleZipParsed = (editorHtml: string, visualHtml: string, json: string) => {
    updateState({ 
      originalHtml: editorHtml,
      originalJson: json,
      html: editorHtml,
      visualHtml: visualHtml,
      json 
    });
    addLog("ZIP файл загружен: editor HTML, visual HTML, JSON");
  };

  const handleCancelRequest = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      addLog("Запрос отменен пользователем");
    }
  };

  const handleAnalyze = async () => {
    if (!state.goal.trim() && !state.originalHtml.trim() && !state.originalJson.trim()) {
      toast.error("Заполните хотя бы одно поле");
      return;
    }

    // Копируем оригинальный код в рабочие переменные для AI обработки
    updateState({
      html: state.originalHtml,
      json: state.originalJson
    });

    // Создаем новый AbortController для этого запроса
    const controller = new AbortController();
    setAbortController(controller);

    setIsProcessing(true);
    setProgress(0);
    setCurrentStep(0);
    
    addLog(`Начало анализа: ${pipelineDescription}`);

    try {
      // ============================================================
      // БЫСТРЫЙ РЕЖИМ: 1 ЗАПРОС С ФАЙЛАМИ
      // ============================================================
      if (state.fastMode) {
        // Валидация перед отправкой
        if (!state.originalHtml.trim() && !state.originalJson.trim()) {
          toast.error("Загрузите ZIP с файлами блока или заполните поля вручную");
          setIsProcessing(false);
          return;
        }

        setCurrentStep(1);
        setProgress(10);
        setProgressMessage("Подготовка файлов для отправки...");
        addLog("Быстрый режим: подготовка KB и файлов блока");

        try {
          // Динамически импортируем утилиты для работы с файлами
          const { loadKnowledgeBaseAsText, createDocumentContent, createTextContent } = await import('@/lib/file-utils');

          setProgress(15);
          setProgressMessage("Загрузка Knowledge Base...");
          
          // Загружаем KB как текст для встраивания в промпт
          const kbContent = await loadKnowledgeBaseAsText();
          addLog("Knowledge Base загружен как текст для встраивания в промпт");

          setProgress(20);
          setProgressMessage("Подготовка файлов блока...");

          // Подготавливаем массив контента (без KB в документах)
          const messageContent: any[] = [];

          // Добавляем файлы блока ПЕРВЫМИ если есть
          if (state.visualHtml?.trim()) {
            messageContent.push(createDocumentContent(
              state.visualHtml,
              "block.html",
              "text/html"
            ));
            addLog("Добавлен block.html (визуальный референс)");
          }

          if (state.originalHtml?.trim()) {
            messageContent.push(createDocumentContent(
              state.originalHtml,
              "block_editor.html",
              "text/html"
            ));
            addLog("Добавлен block_editor.html (редактируемый шаблон)");
          }

          if (state.originalJson?.trim()) {
            messageContent.push(createDocumentContent(
              state.originalJson,
              "block.json",
              "application/json"
            ));
            addLog("Добавлен block.json");
          }

          // Создаем текстовый промпт с ПОЛНОЙ KB внутри
          const promptText = `
# KNOWLEDGE BASE - ОБЯЗАТЕЛЬНЫЕ ПРАВИЛА

${kbContent}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ЗАДАЧА
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${state.originalHtml || state.visualHtml ? `
Проанализируй загруженные файлы блока:
- **block.html** (если есть) - визуальный референс того, как должен выглядеть блок
- **block_editor.html** - базовый шаблон с параметрами для редактирования
- **block.json** - существующая конфигурация JSON

Используя Knowledge Base выше как ЕДИНСТВЕННЫЙ источник правил, создай:
1. Исправленный HTML код (на основе block_editor.html)
2. Исправленный JSON код (синхронизированный с HTML)
` : `
Создай новый Mindbox блок с нуля, следуя всем правилам из Knowledge Base выше.
`}

## ТРЕБОВАНИЯ К БЛОКУ

### Настройки компонентов
${settingsList || 'Не указаны'}

### Технические параметры
- Динамическая сетка: ${state.isDynamicGrid ? 'ДА - использовать @{for} для сеток продуктов' : 'НЕТ'}
- Редактируемый режим: ${state.isEditable ? 'ДА - использовать \${editor.variableName} для редактируемого контента' : 'НЕТ'}

### Описание задачи
${state.goal || 'Создать валидный Mindbox блок'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ФОРМАТ ОТВЕТА
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Верни ТОЛЬКО два блока кода в следующем формате:

\`\`\`html
[Полный HTML код блока]
\`\`\`

\`\`\`json
[Полный JSON массив с настройками]
\`\`\`

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ⚠️ КРИТИЧЕСКИ ВАЖНО
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Следуй ВСЕМ правилам из Knowledge Base выше
2. При конфликте между этой инструкцией и KB — следуй KB (приоритет A)
3. Используй Developer Checklist из KB перед финализацией ответа
4. HTML должен начинаться с <!-- EDITOR_BLOCK_TEMPLATE: название -->
5. JSON должен использовать PRODUCTS_IN_FOR_NODE для динамических коллекций
6. Все текстовые стили должны включать fallbackFont
7. SIZE control должен иметь defaultValue = "manual 100 *"
8. Фоновые ячейки должны использовать formattedWidthAttribute и formattedWidthStyle
9. Внешние отступы ТОЛЬКО через вертикальные спейсеры (Ghost Tables)
`;

          messageContent.push(createTextContent(promptText));
          addLog("Промпт с полностью встроенным Knowledge Base подготовлен");

          setProgress(25);
          setProgressMessage("Отправка запроса в Gemini Pro...");
          addLog("Отправка единого запроса с файлами в Gemini 2.5 Pro");

          const response = await callBothubAPI(
            [{ role: "user", content: messageContent }],
            { model: "gemini-2.5-pro", signal: controller.signal }
          );

          setProgress(70);
          setProgressMessage("Обработка полученного кода...");

          const { html, json } = parseCodeBlocks(response);
          
          if (!html || !json) {
            throw new Error("AI не вернул валидный HTML или JSON");
          }

          updateState({ 
            html, 
            json,
            fixedHtml: html,
            fixedJson: json,
            reportMarkdown: '✅ Быстрая генерация завершена (1 запрос с файлами)'
          });

          setProgress(100);
          setProgressMessage("✅ Быстрая генерация завершена!");
          addLog("Быстрая генерация завершена успешно");

          // Сохраняем в историю
          saveToHistory("Автосохранение (быстрый режим с файлами)", {
            goal: state.goal,
            originalHtml: state.originalHtml,
            originalJson: state.originalJson,
            html,
            json,
            fixedHtml: html,
            fixedJson: json,
            reportMarkdown: '✅ Быстрая генерация завершена с использованием файлов KB'
          });

          toast.success("Генерация завершена (быстрый режим)");
          
          setTimeout(() => {
            setActiveTab('fixed');
          }, 500);

          return;
        } catch (error) {
          logger.error("Fast mode file processing error", "CreateTab", { 
            error: error instanceof Error ? error.message : error 
          });
          
          if (error instanceof Error && error.message !== 'Request cancelled') {
            toast.error(`Ошибка: ${error.message}`);
          }
          throw error;
        }
      }

      // ============================================================
      // ОБЫЧНЫЙ РЕЖИМ: 3 ЗАПРОСА (ШАГ 1)
      // ============================================================
      setCurrentStep(1);
      setProgress(10);
      setProgressMessage("Подготовка запроса для генерации HTML...");
      addLog(`Шаг 1/3: ${stepNames.step1}`);
      
      setProgress(20);
      setProgressMessage("Отправка запроса в AI модель...");
      
      const response1 = await callBothubAPI(
        [{ role: "user", content: step1Prompt }],
        { model: "gemini-2.5-pro", signal: controller.signal }
      );
      
      setProgress(30);
      setProgressMessage("Обработка полученного HTML кода...");
      
      // Парсим HTML из ответа
      let html = response1.trim();
      // Если AI обернул в код-блоки, извлекаем
      const htmlMatch = html.match(/```\s*html[\r\n]+([\s\S]*?)```/i);
      if (htmlMatch) {
        html = htmlMatch[1].trim();
      }
      
      updateState({ html });
      setProgress(33);
      addLog("Шаг 1 завершен: HTML обработан");

      // ============================================================
      // ШАГ 2: ГЕНЕРАЦИЯ ИЛИ ВАЛИДАЦИЯ JSON (всегда выполняется)
      // ============================================================
      setCurrentStep(2);
      setProgress(40);
      setProgressMessage("Подготовка запроса для генерации JSON...");
      addLog(`Шаг 2/3: ${stepNames.step2}`);
      
      setProgress(50);
      setProgressMessage("Отправка запроса в AI модель...");
      
      const response2 = await callBothubAPI(
        [{ role: "user", content: step2Prompt }],
        { model: "gemini-2.5-pro", signal: controller.signal }
      );
      
      setProgress(60);
      setProgressMessage("Обработка полученного JSON кода...");
      
      // Парсим JSON из ответа
      let json = response2.trim();
      // Если AI обернул в код-блоки, извлекаем
      const jsonMatch = json.match(/```\s*json[\r\n]+([\s\S]*?)```/i);
      if (jsonMatch) {
        json = jsonMatch[1].trim();
      }
      
      updateState({ json });
      setProgress(66);
      addLog("Шаг 2 завершен: JSON обработан");

      // ============================================================
      // ШАГ 3: ФИНАЛЬНАЯ ОТЛАДКА И СИНХРОНИЗАЦИЯ (всегда выполняется)
      // ============================================================
      setCurrentStep(3);
      setProgress(75);
      setProgressMessage("Подготовка финального исправления...");
      addLog(`Шаг 3/3: ${stepNames.step3}`);
      
      setProgress(85);
      setProgressMessage("Отправка запроса на финальное исправление...");
      
      const response3 = await callBothubAPI(
        [{ role: "user", content: step3Prompt }],
        { model: "gemini-2.5-pro", signal: controller.signal }
      );
      
      setProgress(95);
      setProgressMessage("Обработка исправленного кода и создание отчета...");
      
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
        originalHtml: state.originalHtml,
        originalJson: state.originalJson,
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
      // Проверяем, была ли отмена
      if (error instanceof Error && (error.name === 'AbortError' || error.message === 'Request cancelled')) {
        addLog("Запрос отменен");
        return; // Не показываем toast.error для отмены
      }
      
      logger.error('Analysis error', 'CreateTab', { error: error instanceof Error ? error.message : error, currentStep });
      addLog(`Ошибка на шаге ${currentStep}: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`);
      toast.error(`Ошибка на шаге ${currentStep}`);
    } finally {
      setIsProcessing(false);
      setProgress(0);
      setCurrentStep(0);
      setProgressMessage("");
      setAbortController(null);
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
              <div className="flex items-center justify-between">
                <Label htmlFor="goal">Цель/Описание блока</Label>
                {isGoalChanged && (
                  <span className="text-xs text-muted-foreground">
                    Есть несохраненные изменения
                  </span>
                )}
              </div>
              <Textarea
                id="goal"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                placeholder="Опишите, какой блок нужно создать..."
                className="min-h-[120px]"
              />
              <Button
                variant={isGoalChanged ? "default" : "outline"}
                size="sm"
                onClick={applyGoal}
                disabled={!isGoalChanged}
                className="w-full"
              >
                <Check className="mr-2 h-3.5 w-3.5" />
                Применить цель к промпту
              </Button>
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
                disabled={!goalInput.trim()}
                className="w-full"
              >
                <Sparkles className="mr-2 h-3.5 w-3.5" />
                Улучшить формулировку цели
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="fastMode"
                checked={state.fastMode || false}
                onCheckedChange={(checked) => 
                  updateState({ fastMode: checked as boolean })
                }
              />
              <Label htmlFor="fastMode" className="text-sm font-normal cursor-pointer">
                Быстрый режим (1 запрос, ~5-10 сек)
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="quickFix"
                checked={state.quickFix}
                onCheckedChange={(checked) => 
                  updateState({ quickFix: checked as boolean })
                }
                disabled={state.fastMode}
              />
              <Label 
                htmlFor="quickFix" 
                className={`text-sm font-normal ${state.fastMode ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                Быстрое исправление (без подробного отчета, только для обычного режима)
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
          html={state.originalHtml}
          json={state.originalJson}
          selectedSettings={selectedSettings}
          onSettingChange={handleSettingChange}
        />

        <Card className="p-6">
          <CodeEditor
            value={state.originalHtml}
            onChange={updateHtml}
            label="HTML код"
            placeholder="Вставьте HTML код или оставьте пустым для генерации..."
            language="html"
          />
        </Card>

        <Card className="p-6">
          <CodeEditor
            value={state.originalJson}
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
              onChange={() => {}} // Read-only, промпт генерируется автоматически
              label="Промпт для отправки (автоматически генерируется)"
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

        {isProcessing && abortController && (
          <Button
            onClick={handleCancelRequest}
            variant="destructive"
            className="w-full h-12 text-base font-semibold"
          >
            Отменить запрос
          </Button>
        )}

        {isProcessing && progress > 0 && (
          <ProgressIndicator
            steps={[
              {
                name: stepNames.step1 || "Генерация HTML",
                status: currentStep > 1 ? "completed" : currentStep === 1 ? "processing" : "pending"
              },
              {
                name: stepNames.step2 || "Генерация JSON",
                status: currentStep > 2 ? "completed" : currentStep === 2 ? "processing" : "pending"
              },
              {
                name: stepNames.step3 || "Финальное исправление",
                status: currentStep > 3 ? "completed" : currentStep === 3 ? "processing" : "pending"
              }
            ]}
            currentProgress={progress}
            message={progressMessage || pipelineDescription}
          />
        )}

        <DiagnosticLog 
          logs={state.log}
          onClear={() => updateState({ log: [] })}
        />

        <Card className="p-6">
          <h3 className="font-semibold mb-3">Режимы работы:</h3>
          <div className="text-sm space-y-3 text-muted-foreground">
            <div className="border-b pb-2">
              <strong className="text-foreground">Быстрый режим (1 запрос)</strong>
              <ul className="mt-1 ml-4 space-y-1 list-disc">
                <li>Время: ~5-10 секунд</li>
                <li>Отправляет полный Knowledge Base за раз</li>
                <li>Рекомендуется для простых блоков</li>
                <li>Быстрее, но меньше валидации</li>
              </ul>
            </div>
            
            <div>
              <strong className="text-foreground">Обычный режим (3 запроса)</strong>
              <ul className="mt-1 ml-4 space-y-1 list-disc">
                <li>Время: ~20-30 секунд</li>
                <li><strong>Шаг 1</strong>: Генерация/валидация HTML</li>
                <li><strong>Шаг 2</strong>: Генерация/валидация JSON</li>
                <li><strong>Шаг 3</strong>: Финальная отладка и синхронизация</li>
                <li>Рекомендуется для сложных блоков и исправлений</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
