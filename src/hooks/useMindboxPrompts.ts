import { useMemo } from 'react';
import { 
  buildStep1,
  buildStep2,
  buildStep3,
  detectScenario,
  getStepName,
  getPipelineDescription,
  type Scenario
} from '@/lib/prompts';

interface UseMindboxPromptsParams {
  goal: string;
  html: string;
  visualHtml?: string;
  json: string;
  isDynamicGrid: boolean;
  isEditable: boolean;
  settingsList: string;
  quickFix?: boolean;
}

/**
 * Hook для мемоизации промптов Mindbox
 * Предотвращает пересборку промптов при каждом рендере
 */
export function useMindboxPrompts(params: UseMindboxPromptsParams) {
  const {
    goal,
    html,
    visualHtml,
    json,
    isDynamicGrid,
    isEditable,
    settingsList,
    quickFix = false
  } = params;

  // Мемоизируем определение сценария
  const scenario = useMemo<Scenario>(() => {
    return detectScenario(html, json);
  }, [html, json]);

  // Мемоизируем промпт для Step 1 (HTML generation/validation)
  const step1Prompt = useMemo(() => {
    return buildStep1({
      goal,
      html,
      visualHtml,
      isDynamicGrid,
      isEditable,
      settingsList
    });
  }, [goal, html, visualHtml, isDynamicGrid, isEditable, settingsList]);

  // Мемоизируем промпт для Step 2 (JSON generation/validation)
  const step2Prompt = useMemo(() => {
    return buildStep2({
      html,
      visualHtml,
      json
    });
  }, [html, visualHtml, json]);

  // Мемоизируем промпт для Step 3 (debugging & sync)
  const step3Prompt = useMemo(() => {
    return buildStep3({
      goal,
      html,
      visualHtml,
      json,
      quickFix
    });
  }, [goal, html, visualHtml, json, quickFix]);

  // Мемоизируем названия шагов
  const stepNames = useMemo(() => ({
    step1: getStepName(1, scenario),
    step2: getStepName(2, scenario),
    step3: getStepName(3, scenario)
  }), [scenario]);

  // Мемоизируем описание пайплайна
  const pipelineDescription = useMemo(() => {
    return getPipelineDescription(scenario);
  }, [scenario]);

  return {
    scenario,
    step1Prompt,
    step2Prompt,
    step3Prompt,
    stepNames,
    pipelineDescription
  };
}
