// Scenario detection logic
import type { Scenario } from './shared-types';

export function detectScenario(html: string, json: string): Scenario {
  const hasHtml = html.trim().length > 0;
  const hasJson = json.trim().length > 0;

  if (!hasHtml && !hasJson) {
    return 'generate-from-scratch';
  } else if (hasHtml && !hasJson) {
    return 'validate-html-generate-json';
  } else {
    return 'validate-both';
  }
}

export function getStepName(step: number, scenario: Scenario): string {
  if (step === 1) {
    return scenario === 'generate-from-scratch' || scenario === 'validate-html-generate-json'
      ? scenario === 'generate-from-scratch' ? 'Generate HTML' : 'Validate HTML'
      : 'Validate HTML';
  }
  if (step === 2) {
    return scenario === 'validate-both' ? 'Validate JSON' : 'Generate JSON';
  }
  if (step === 3) {
    return 'Debug & Sync';
  }
  return `Step ${step}`;
}

export function getPipelineDescription(scenario: Scenario): string {
  switch (scenario) {
    case 'generate-from-scratch':
      return 'Generate HTML → Generate JSON → Debug & Sync';
    case 'validate-html-generate-json':
      return 'Validate HTML → Generate JSON → Debug & Sync';
    case 'validate-both':
      return 'Validate HTML → Validate JSON → Debug & Sync';
    default:
      return 'Unknown scenario';
  }
}
