# Mindbox Validation Rules

## ✅ Правила экспорта Mindbox

### 1. Именование блоков (КРИТИЧНО)

**Разрешено:** Только латинские буквы, цифры, подчеркивания `[a-zA-Z0-9_]+`

**Примеры:**
- ✅ `header_block`, `product_card`, `footer1`
- ❌ `Untitled Project` (пробел), `блок1` (кириллица), `my-block` (дефис)

**Рекомендация:** Используйте camelCase вместо underscores для лучшей совместимости
- ✅ `headerBlock`, `productCard`
- ⚠️ `header_block` (работает, но может вызывать проблемы)

### 2. Структура блоков

Каждый логический элемент должен быть отдельным `EDITOR_BLOCK_TEMPLATE`:

```html
<!-- EDITOR_BLOCK_TEMPLATE: main_template -->
<table>
  <tr>
    <td>
      
      <!-- EDITOR_BLOCK_TEMPLATE: container1 -->
      <table>...</table>
      
      <!-- EDITOR_BLOCK_TEMPLATE: text1 -->
      <div>...</div>
      
      <!-- EDITOR_BLOCK_TEMPLATE: button1 -->
      <a>...</a>
      
    </td>
  </tr>
</table>
```

### 3. Использование переменных BACKGROUND

**❌ ЗАПРЕЩЕНО:**
```html
<td bgcolor="${editor.container1_background}">
<td style="background: ${editor.myBackground};">
```

**✅ ПРАВИЛЬНО:**
```html
<td style="${editor.container1Background.background};">
```

**Для bgcolor используйте COLOR тип:**
```json
{ "name": "containerBgColor", "type": "COLOR", "defaultValue": "#FFFFFF" }
```
```html
<td bgcolor="${editor.containerBgColor}">
```

### 4. ⚠️ КРИТИЧНО: Ограничение точек в переменных

Mindbox парсер **НЕ ПОДДЕРЖИВАЕТ** более 1 точки в путях переменных.

**❌ ЗАПРЕЩЕНО (2+ точки):**
```html
${editor.container1Background.background}  <!-- 2 точки -->
${editor.text1_background.color.value}     <!-- 3 точки -->
```

**✅ ПРАВИЛЬНО (максимум 1 точка):**
```html
${editor.container1BgColor}                          <!-- 0 точек -->
${editor.text1Styles}                                <!-- 0 точек -->
${editor.titleWidth.formattedWidthAttribute}         <!-- 1 точка, спец. тип SIZE -->
${editor.imageHeight.formattedHeight}                <!-- 1 точка, спец. тип HEIGHTV2 -->
```

**Исключения (разрешённые паттерны с 1 точкой):**
- `*.formattedWidthAttribute` (тип SIZE)
- `*.formattedWidthStyle` (тип SIZE)
- `*.formattedHeight` (тип HEIGHTV2)
- `*.containerHeightAttribute` (тип TEXT_SIZE)
- `*.containerStyle` (тип TEXT_SIZE)

**Решение для фонов:**

Вместо `BACKGROUND` типа используйте `COLOR`:

**JSON:**
```json
{
  "name": "containerBgColor",
  "type": "COLOR",
  "defaultValue": "#FFFFFF",
  "group": "Container >> Общие стили",
  "extra": { "label": "Цвет фона" }
}
```

**HTML:**
```html
<td style="background-color: ${editor.containerBgColor};">
  <!-- контент -->
</td>
```

### 5. Именование переменных

**Правило:** Используйте camelCase БЕЗ подчеркиваний

| Тип | Суффикс | Пример | Использование |
|-----|---------|--------|---------------|
| SIZE | `*Width` | `containerWidth` | `${editor.containerWidth.formattedWidthAttribute}` |
| HEIGHTV2 | `*Height` | `imageHeight` | `${editor.imageHeight.formattedHeight}` |
| BACKGROUND | `*Background` | `headerBackground` | `${editor.headerBackground.background}` |
| COLOR | `*Color` | `textColor` | `${editor.textColor}` |
| TEXT_STYLES | `*Styles` | `headingStyles` | `${editor.headingStyles}` |

**Примеры замен:**
```
container1_background  →  container1Background
container1_innerSpacing  →  container1InnerSpacing
text1_styles  →  text1Styles
button1_buttonText  →  button1ButtonText
```

### 6. Синхронизация HTML ↔ JSON

**JSON:**
```json
{
  "name": "container1Background",
  "type": "BACKGROUND",
  "group": "Container1 >> Общие стили"
}
```

**HTML:**
```html
<td style="${editor.container1Background.background};">
```

### 7. Ghost Tables для Outlook (ОБЯЗАТЕЛЬНО)

Каждый блок ОБЯЗАН быть обернут в ghost tables для обеспечения совместимости с Outlook:

```html
<!-- EDITOR_BLOCK_TEMPLATE: block_name -->

<!--[if mso | IE]>
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600">
<tr><td>
<![endif]-->

<!-- Основной контент -->

<!--[if mso | IE]>
</td></tr>
</table>
<![endif]-->
```

### 8. Внешние отступы через вертикальные spacer'ы

НЕ использовать `padding` для внешних отступов. Вместо этого использовать `<div>` с фиксированной высотой:

```html
<!-- ❌ Неправильно -->
<td style="padding: 20px;">...</td>

<!-- ✅ Правильно -->
<tr>
  <td>
    <div style="height: ${editor.blockOuterSpacing}; line-height: ${editor.blockOuterSpacing}; font-size: 8px;">&nbsp;</div>
  </td>
</tr>
```

### 9. SIZE контрол для каждого блока

Каждый блок ДОЛЖЕН иметь параметр SIZE для управления шириной с использованием `formattedWidthAttribute` и `formattedWidthStyle`:

**JSON:**
```json
{
  "name": "blockWidth",
  "type": "SIZE",
  "defaultValue": "manual 100 600",
  "group": "Block >> Общие стили",
  "extra": {
    "label": "Ширина блока",
    "defaultMaxWidth": "600px",
    "allowedTypes": ["inherit", "manual"]
  }
}
```

**HTML:**
```html
<table width="${editor.blockWidth.formattedWidthAttribute}" 
       style="${editor.blockWidth.formattedWidthStyle}; background-color: ${editor.blockBgColor};">
  <tr>
    <td style="padding: ${editor.blockInnerSpacing};">
      <!-- контент -->
    </td>
  </tr>
</table>
```

### 10. FallbackFont в TEXT_STYLES

Каждый TEXT_STYLES и SIMPLE_TEXT_STYLES параметр ДОЛЖЕН содержать `fallbackFont`:

```json
{
  "name": "textStyles",
  "type": "TEXT_STYLES",
  "defaultValue": {
    "font": "Arial",
    "fallbackFont": "Arial, sans-serif",
    "fontSize": "16px",
    "color": "#000000",
    "lineHeight": "1.5"
  }
}
```

## 🛠️ Реализованные изменения

### 1. MindboxHTMLGenerator (mindbox-generator-helpers.ts)

**До:**
```typescript
`<td bgcolor="\${editor.${name}_background}" 
    style="padding: \${editor.${name}_innerSpacing};
           \${editor.${name}_background.formattedBackgroundStyles};">`
```

**После:**
```typescript
`<td style="\${editor.${name}Background.background}; 
           padding: \${editor.${name}InnerSpacing}; 
           border-radius: \${editor.${name}BorderRadius}; 
           border: \${editor.${name}Border};">`
```

### 2. MindboxJSONGenerator (mindbox-generator-helpers.ts)

Все переменные теперь используют camelCase:
- `${name}_background` → `${name}Background`
- `${name}_innerSpacing` → `${name}InnerSpacing`
- `${name}_border` → `${name}Border`
- `${name}_borderRadius` → `${name}BorderRadius`

### 3. Валидация имен блоков (mindbox-exporter.ts)

```typescript
// Валидация имени шаблона
const sanitizedName = templateName.replace(/\s+/g, '_');
if (!validateBlockName(sanitizedName)) {
  throw new Error('Invalid template name...');
}

// Валидация всех Mindbox блоков
for (const block of mindboxBlocks) {
  const blockName = block.mindboxSettings?.blockName || '';
  if (!validateBlockName(blockName)) {
    throw new Error('Invalid block name...');
  }
}
```

### 4. Валидатор предупреждений (mindbox-validator.ts)

Добавлено предупреждение о подчеркиваниях:

```typescript
if (settings.blockName.includes('_')) {
  errors.push({
    severity: 'warning',
    message: 'Block name contains underscores. Consider using camelCase...'
  });
}
```

## ✅ Чеклист перед экспортом

- [ ] Имя шаблона: только `[a-zA-Z0-9_]`
- [ ] Каждый элемент = отдельный `EDITOR_BLOCK_TEMPLATE`
- [ ] Все BACKGROUND используют `.background` метод
- [ ] Максимум 2 точки во всех `${editor.*}` путях
- [ ] Имена переменных в camelCase (без подчеркиваний)
- [ ] Все переменные синхронизированы HTML ↔ JSON
- [ ] Ghost tables добавлены для Outlook
- [ ] Все изображения имеют alt атрибуты
- [ ] `@{if}` блоки содержат HTML элементы
- [ ] Все `<tr>` находятся внутри `<table>`

## 🔍 Типичные ошибки и решения

### "Системное имя шаблона содержит неразрешенные символы"
**Причина:** Пробелы, кириллица, спецсимволы в имени  
**Решение:** Переименуйте в `my_template` или `myTemplate`

### "В файле нет размеченных блоков"
**Причина:** Нет отдельных `EDITOR_BLOCK_TEMPLATE` для элементов  
**Решение:** Разделите код на отдельные блоки

### "Value can't be used as Primitive, due to usages as Composite"
**Причина:** Неправильное использование BACKGROUND типа  
**Решение:** Используйте `.background` метод или COLOR тип для bgcolor

### "3+ dots in variable path"
**Причина:** Подчеркивания в именах или глубокая вложенность  
**Решение:** Используйте camelCase: `myBackground` вместо `my_background`
