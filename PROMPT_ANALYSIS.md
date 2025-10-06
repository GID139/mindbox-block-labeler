# Анализ новой структуры промптов Mindbox

## ✅ СИЛЬНЫЕ СТОРОНЫ

### 1. Хорошая модульность
- KB разделена на 6 логических модулей
- Каждый Step импортирует только нужные модули
- Отсутствует дублирование кода

### 2. Правильная приоритизация
- Priority Hierarchy (A > B > C) четко определена
- Все модули согласованы по терминологии

### 3. Полнота основных типов
Все основные типы Mindbox присутствуют:
- DISPLAY_TOGGLE ✅
- TEXT / SIMPLE_TEXT ✅
- IMAGE, URL, ALT, ICON ✅
- SIZE, HEIGHTV2, TEXT_SIZE, BUTTON_SIZE ✅
- INNER_SPACING, BORDER, BORDER_RADIUS ✅
- BACKGROUND ✅
- TEXT_STYLES, SIMPLE_TEXT_STYLES ✅
- COLOR, ALIGN ✅
- COLLECTION ✅

## ❌ КРИТИЧЕСКИЕ ОШИБКИ

### 1. **ОТСУТСТВУЕТ тип NUMBER** (Критично!)
**Где должен быть:** `src/lib/prompts/kb/core-types.ts`

**Из документации Mindbox (строка 869):**
> Размер шрифта, "разрыва"; любая настройка стиля, где нужно менять одно число | NUMBER | Любое число

**Проблема:**
- В HTML_RULES_KB Rule 3 упоминается: "Use NUMBER, HEIGHTV2, or TEXT_SIZE"
- Но определения NUMBER в CORE_TYPES_KB НЕТ!

**Примеры использования NUMBER из документации:**
```html
<!-- Gap/Spacer -->
<div style="height: ${editor.gap}px; line-height: 36px; font-size: 8px ">&nbsp;</div>
```

**Решение:** Добавить в CORE_TYPES_KB:
```typescript
### NUMBER
- Type: Numeric value
- Usage: For single numeric values (font size, spacing, gap, etc.)
- Default: "20"
- Format: String containing number
- Example: ${editor.gap}px
```

### 2. **Неправильная информация о role и defaultValue**
**Где:** `src/lib/prompts/kb/sync-rules.ts` (строка 38)

**Текущий текст:**
> Role parameters don't have defaultValue in JSON

**Из документации Mindbox (строки 891-904):**
Role-параметры ИМЕЮТ defaultValue:
| Добавляемая настройка | role | defaultValue |
| Название продукта | ProductTitle | Любой текст |
| Актуальная цена | ProductPrice | Любой текст |

**Проблема:** Это противоречие может привести к некорректной генерации JSON.

**Решение:** Исправить на:
> Role parameters HAVE defaultValue (any sample text), but it gets replaced by dynamic data from collection

## ⚠️ ВАЖНЫЕ НЕТОЧНОСТИ

### 3. **fallbackFont - не только "Helvetica"**
**Где:** `src/lib/prompts/kb/core-types.ts` (строка 60)

**Текущий текст:**
> fallbackFont: "Helvetica" (MANDATORY)

**Из документации Mindbox:**
> fallbackFont: "Arial" / "Geneva" / "Helvetica" / "Times New Roman" / "Verdana" / "Courier / Courier New" / "Tahoma" / "Georgia" / "Palatino" / "Trebuchet MS"

**Решение:** Изменить на:
```
- fallbackFont: One of allowed fonts (MANDATORY). Example: "Helvetica"
```

### 4. **SIZE default - не только "manual 100 *"**
**Где:** `src/lib/prompts/kb/core-types.ts` (строка 23, 80)

**Текущий текст:**
> Format: "manual 100 *" (MANDATORY default)

**Из документации Mindbox (строка 877):**
> "manual 55 *", число — любое до 100

**Проблема:** 100 - это максимум, а не фиксированное значение.

**Решение:** Уточнить:
```
- Format: "manual X *" where X is number up to 100 (commonly 55)
- Example: "manual 55 *"
```

### 5. **BACKGROUND color - специфичный для Mindbox**
**Где:** `src/lib/prompts/kb/core-types.ts` (строка 49, 81)

**Текущий текст:**
> Color: { "type": "color", "color": "#39AA5D" } (MANDATORY default)

**Проблема:** #39AA5D - это конкретный зеленый цвет Mindbox, не универсальный default.

**Решение:** Добавить примечание:
```
- Color: { "type": "color", "color": "#39AA5D" } (Example: Mindbox brand color)
- Common alternatives: "#FFFFFF" (white), "#000000" (black), "#F0F0F0" (light gray)
```

## 📝 ОТСУТСТВУЮЩИЕ ДЕТАЛИ

### 6. **SIZE extra fields**
**Где:** `src/lib/prompts/kb/core-types.ts`

**Из документации (строка 877):**
```json
{
  "extra": {
    "defaultMaxWidth": "600px",
    "allowedTypes": ["inherit", "manual"]
  }
}
```

**Решение:** Добавить в CORE_TYPES_KB:
```
SIZE requires "extra" object:
- defaultMaxWidth: Max width of email (usually "600px")
- allowedTypes: ["inherit", "manual"] or just ["manual"]
```

### 7. **COLLECTION size parameter**
**Где:** `src/lib/prompts/kb/core-types.ts`

**Из документации (строка 885):**
> Количество выводимых товаров задается отдельно: "size": 2

**Решение:** Добавить в CORE_TYPES_KB:
```
COLLECTION can have optional "size" parameter to limit displayed items:
"size": 2  // Shows 2 products
```

### 8. **Gap/Spacer примеры**
**Где:** Отсутствуют в `src/lib/prompts/kb/html-rules.ts`

**Из документации (строки 577-625):**
```html
<div style="height: ${editor.gap}px; line-height: 36px; font-size: 8px ">&nbsp;</div>
```

**Решение:** Добавить Gap/Spacer template в HTML_RULES_KB.

### 9. **Адаптивность (div vs table)**
**Где:** Отсутствует в `src/lib/prompts/kb/html-rules.ts`

**Из документации (строки 767-771):**
> Чтобы товарные карточки перестраивались (адаптивность) - использовать div.
> Для одинакового отображения на десктопе и мобильных - использовать table.

**Решение:** Добавить примечание в HTML_RULES_KB о выборе между div и table.

## 🔄 РЕКОМЕНДАЦИИ ПО УЛУЧШЕНИЮ

### 10. Ghost tables - не всегда обязательны
**Где:** `src/lib/prompts/kb/html-rules.ts` Rule 1

**Текущий текст:**
> Wrap in ghost tables: `<!--[if mso | IE]>...<![endif]-->`

**Из документации:** Есть примеры без ghost tables (особенно для динамических сеток через div).

**Рекомендация:** Уточнить:
```
Wrap in ghost tables for Outlook compatibility (recommended for table-based layouts):
`<!--[if mso | IE]>...<![endif]-->`
Note: Can be omitted for div-based adaptive grids
```

### 11. Dynamic product grids - дополнительные правила
**Где:** Частично в `src/lib/prompts/kb/html-rules.ts`

**Из документации (строки 740-765):**
```html
<table>
@{for row in Tablerows(editor.collection, 3)}
    <tr>
    @{for cell in row.Cells}
        <td>
        @{if cell.Value != null}
            <!-- content -->
        @{end if}
        </td>
    @{end for}
    </tr>
@{end for}
</table>
```

**Рекомендация:** Добавить Tablerows() паттерн в HTML_RULES_KB для табличных сеток.

## 📊 ИТОГОВАЯ ОЦЕНКА

| Категория | Оценка | Комментарий |
|-----------|--------|-------------|
| Модульность | ✅ Отлично | Хорошая структура, нет дублирования |
| Полнота типов | ⚠️ Хорошо | Есть все основные, но отсутствует NUMBER |
| Точность информации | ⚠️ Хорошо | Несколько неточностей в деталях |
| Соответствие документации | ⚠️ Хорошо | 90% покрытие, но есть пробелы |
| Готовность к использованию | ❌ Требует исправлений | Критичные ошибки блокируют использование |

## 🎯 ПРИОРИТЕТ ИСПРАВЛЕНИЙ

**P0 (Критично - блокирует работу):**
1. ❌ Добавить тип NUMBER в CORE_TYPES_KB
2. ❌ Исправить информацию о role + defaultValue в SYNC_RULES_KB

**P1 (Важно - может привести к ошибкам):**
3. ⚠️ Уточнить fallbackFont (не только Helvetica)
4. ⚠️ Уточнить SIZE default (не только 100)
5. ⚠️ Добавить extra fields для SIZE
6. ⚠️ Добавить size parameter для COLLECTION

**P2 (Желательно - улучшит качество):**
7. 📝 Добавить Gap/Spacer примеры
8. 📝 Добавить информацию об адаптивности
9. 📝 Уточнить про ghost tables
10. 📝 Добавить Tablerows() паттерн
11. 📝 Уточнить BACKGROUND color примечание

## ✨ ВЫВОДЫ

**Плюсы рефакторинга:**
- ✅ Модульная структура значительно улучшает читаемость
- ✅ Сокращение контекста для AI на 50-60% достигнуто
- ✅ Нет дублирования кода
- ✅ Логическое разделение ответственности

**Минусы:**
- ❌ 2 критические ошибки (NUMBER, role+defaultValue)
- ⚠️ Несколько неточностей в деталях
- 📝 Отсутствуют некоторые edge cases из документации

**Рекомендация:** Исправить критические ошибки (P0), затем важные неточности (P1), и система будет готова к использованию.
