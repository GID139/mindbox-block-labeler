// Сборщики промптов для 4-шагового пайплайна генерации Mindbox блоков
import { KB } from './mindbox-kb';

function buildKBExcerpt() {
  const fonts = KB.allowedFonts.join('", "');
  const lineHeights = KB.allowedLineHeights.join('", "');
  const alignVals = KB.alignValues.join('", "');
  const collections = KB.allowedCollections.join('", "');
  const bgModes = KB.bgModes.join('", "');

  return [
    'Ключевые допуски Mindbox (использовать строго):',
    `- Шрифты: "${fonts}"`,
    `- lineHeight: "${lineHeights}"`,
    '- DISPLAY_TOGGLE: defaultValue — строка "true"/"false".',
    '- SIZE: defaultValue "manual 55 *", extra.allowedTypes ["inherit","manual"], extra.defaultMaxWidth "600px".',
    '- HEIGHTV2: defaultValue "100 100".',
    '- TEXT_SIZE: defaultValue "30 30".',
    '- BUTTON_SIZE: width "pixels|percent NN NN", height "NN NN".',
    '- BORDER: "none" или "solid black 2".',
    `- ALIGN: "${alignVals}"`,
    `- BACKGROUND: defaultValue.type ∈ {transparent|color|image}; для image — url и mode ∈ {"${bgModes}"}. Применять ТОЛЬКО к <td>.`,
    `- COLLECTION: defaultValue ∈ {"${collections}"}.`,
    ''
  ].join('\n');
}

function buildKbHtmlUsageExcerpt() {
  return [
    'Примеры синтаксиса (вставлять корректно):',
    '- DISPLAY_TOGGLE: @{if editor.var} ... @{end if}',
    '- SIZE (в <img>): width="${editor.var.formattedWidthAttribute}", style="${editor.var.formattedWidthStyle}"',
    '- HEIGHTV2 (в <img> или <td>): height="${editor.var.formattedHeight}"',
    '- TEXT_SIZE (контейнер): style="${editor.var.containerStyle}"; height="${editor.var.containerHeightAttribute}"',
    '- BACKGROUND (только <td>):',
    '  <td bgcolor="${editor.bg.color}" style="${editor.bg.formattedBackgroundStyles};" ${ if(editor.bg.type = "image", \'background="\' & editor.bg.image & \'"\', "" ) }>',
    ''
  ].join('\n');
}

export interface Step1Params {
  goal: string;
  isDynamicGrid: boolean;
  isEditable: boolean;
  settingsList: string;
}

export function buildStep1({ goal, isDynamicGrid, isEditable, settingsList }: Step1Params) {
  return [
    '# Шаг 1: Генерация ПОЛНОГО HTML-каркаса (Mindbox)',
    '',
    'Роль: эксперт по email-верстке под Mindbox.',
    'Задача: Сгенерировать ПОЛНЫЙ и ИСЧЕРПЫВАЮЩИЙ HTML, без сокращений и заглушек.',
    '',
    'Требования:',
    '- Начать с комментария .',
    '- Вёрстка строго на <table> с учетом email-safe практик.',
    '- Каждый редактируемый элемент/логический блок — обернуть в @{if editor.shouldShow...} ... @{end if}.',
    '- Для типов SIZE/HEIGHTV2/BACKGROUND/BUTTON_SIZE использовать точный синтаксис из справки ниже.',
    '- BACKGROUND применять ТОЛЬКО к <td>, не к <table>.',
    '- Внутри @{if} у текстовых тегов должны быть явные font-size и line-height.',
    '- Вернуть ТОЛЬКО один блок ```html. Без пояснений/комментариев/пропусков.',
    '',
    'Контекст пользователя:',
    `Цель: ${goal || '(не указана)'}`,
    `Флаги: isDynamicGrid=${isDynamicGrid}, isEditable=${isEditable}`,
    '',
    'Выбранные группы/параметры:',
    settingsList || '(нет)',
    '',
    buildKBExcerpt(),
    buildKbHtmlUsageExcerpt(),
    'ВАЖНО: никаких "..." / "omitted" / "TODO" / сокращений. Полный законченный HTML.',
    '',
    'Вывод: верни ТОЛЬКО один блок с полным кодом:',
    '```html',
    '',
    '```'
  ].join('\n');
}

export interface Step2Params {
  html: string;
}

export function buildStep2({ html }: Step2Params) {
  return [
    '# Шаг 2: Генерация ПОЛНОГО JSON-массива настроек',
    '',
    'Роль: эксперт Mindbox JSON.',
    'Задача: На основе HTML с переменными редактора ${editor.*} сформировать ПОЛНЫЙ JSON-массив настроек.',
    '',
    'Требования:',
    '- Для каждой переменной ${editor.*} создать корректный JSON-объект.',
    '- Строго соблюдать типы и допустимые значения (см. допуски ниже).',
    '- Для составных типов (SIZE, HEIGHTV2, BUTTON_SIZE, BACKGROUND, TEXT_STYLES, SIMPLE_TEXT_STYLES) — использовать канонические шаблоны defaultValue/extra.',
    '- DISPLAY_TOGGLE: defaultValue — строго строка "true"/"false".',
    '- Для ролей цен (ProductOldPrice/ProductPrice) — type TEXT.',
    '- Вернуть ТОЛЬКО один блок ```json. Без пояснений/комментариев/пропусков.',
    '',
    buildKBExcerpt(),
    'HTML (входные данные):',
    '```html',
    html || '',
    '```',
    '',
    'Вывод: верни ТОЛЬКО один блок с полным JSON:',
    '```json',
    '[ ]',
    '```'
  ].join('\n');
}

export interface Step4Params {
  goal: string;
  html: string;
  json: string;
  quickFix: boolean;
}

export function buildStep4({ goal, html, json, quickFix }: Step4Params) {
  const lines = [
    '# Шаг 4: Авто-дебаг и финальная синхронизация (Mindbox)',
    '',
    'Роль: Debugger & Synchronizer (эксперт Mindbox).',
    'Задача: Исправить ВСЕ синтаксические/логические ошибки и рассинхронизации между HTML и JSON.',
    '',
    'Требования:',
    '- Использовать правила и допуски из Mindbox (см. ниже).',
    '- Выдать ПОЛНЫЕ файлы, БЕЗ пропусков/заглушек.',
    '- Строго: BACKGROUND — только на <td>; lineHeight — только из допустимых значений; DISPLAY_TOGGLE — строка; прочие типы — по шаблонам.',
    '- Вывод:',
    '  1) Полный HTML в ```html',
    '  2) Полный JSON в ```json',
    quickFix
      ? '  (Режим Quick Fix: отчет об изменениях НЕ НУЖЕН)'
      : '  3) Затем отчёт на русском: --- ОТЧЕТ ОБ ИЗМЕНЕНИЯХ --- (Markdown: Проблема, Решение, Обоснование, Влияние, Было/Стало)',
    '',
    buildKBExcerpt(),
    'Входные данные:',
    `Цель: ${goal || '(не указана)'}`,
    '',
    'HTML (исходный):',
    '```html',
    html || '',
    '```',
    '',
    'JSON (исходный):',
    '```json',
    json || '[]',
    '```',
    '',
    'ВЫХОД (строго соблюдать формат):',
    '1) Полный HTML в блоке:',
    '```html',
    '',
    '```',
    '',
    '2) Полный JSON в блоке:',
    '```json',
    '[]',
    '```',
    ''
  ];

  if (!quickFix) {
    lines.push(
      '3) Отчет об изменениях НА РУССКОМ после разделителя:',
      '--- ОТЧЕТ ОБ ИЗМЕНЕНИЯХ ---',
      '',
      'Структура для каждого изменения:',
      '**Проблема:** ...',
      '**Решение:** ...',
      '**Обоснование:** ... (ссылка на правило из допусков, где возможно)',
      '**Влияние:** ...',
      'Было:',
      '```html',
      '```',
      '```json',
      '```',
      'Стало:',
      '```html',
      '```',
      '```json',
      '```'
    );
  } else {
    lines.push('Напоминание: Режим Quick Fix — отчет НЕ нужен.');
  }

  return lines.join('\n');
}
