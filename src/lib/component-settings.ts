// Конфигурация компонентов и их настроек
import type { Component } from '@/types/mindbox';

export const components: Record<string, Component> = {
  button: {
    title: 'Кнопка',
    settings: {
      displayToggle: { group: 'Видимость', tooltip: 'Показывать/скрывать кнопку' },
      url: { group: 'Контент', tooltip: 'URL ссылки кнопки' },
      text: { group: 'Контент', tooltip: 'Текст на кнопке' },
      size: { group: 'Размеры', tooltip: 'Ширина и высота кнопки' },
      align: { group: 'Позиционирование', tooltip: 'Выравнивание кнопки' },
      background: { group: 'Стили', tooltip: 'Цвет фона кнопки' },
      textStyles: { group: 'Стили', tooltip: 'Стили текста кнопки' },
      borderRadius: { group: 'Стили', tooltip: 'Скругление углов' },
      border: { group: 'Стили', tooltip: 'Рамка кнопки' },
      innerSpacing: { group: 'Отступы', tooltip: 'Внутренние отступы' },
      spacing: { group: 'Отступы', tooltip: 'Внешние отступы' }
    }
  },
  image: {
    title: 'Изображение',
    settings: {
      displayToggle: { group: 'Видимость', tooltip: 'Показывать/скрывать изображение' },
      url: { group: 'Контент', tooltip: 'URL изображения' },
      alt: { group: 'Контент', tooltip: 'Альтернативный текст' },
      link: { group: 'Контент', tooltip: 'Ссылка при клике на изображение' },
      size: { group: 'Размеры', tooltip: 'Ширина изображения' },
      height: { group: 'Размеры', tooltip: 'Высота изображения' },
      align: { group: 'Позиционирование', tooltip: 'Выравнивание изображения' },
      borderRadius: { group: 'Стили', tooltip: 'Скругление углов' },
      border: { group: 'Стили', tooltip: 'Рамка изображения' },
      innerSpacing: { group: 'Отступы', tooltip: 'Внутренние отступы' },
      spacing: { group: 'Отступы', tooltip: 'Внешние отступы' }
    }
  },
  text: {
    title: 'Текст',
    settings: {
      displayToggle: { group: 'Видимость', tooltip: 'Показывать/скрывать текст' },
      content: { group: 'Контент', tooltip: 'Текстовое содержимое' },
      textStyles: { group: 'Стили', tooltip: 'Стили текста' },
      simpleTextStyles: { group: 'Стили', tooltip: 'Упрощенные стили текста' },
      align: { group: 'Позиционирование', tooltip: 'Выравнивание текста' },
      size: { group: 'Размеры', tooltip: 'Ширина контейнера текста' },
      height: { group: 'Размеры', tooltip: 'Высота контейнера текста' },
      borderRadius: { group: 'Стили', tooltip: 'Скругление углов' },
      border: { group: 'Стили', tooltip: 'Рамка контейнера' },
      innerSpacing: { group: 'Отступы', tooltip: 'Внутренние отступы' },
      spacing: { group: 'Отступы', tooltip: 'Внешние отступы' }
    }
  },
  logo: {
    title: 'Логотип',
    settings: {
      displayToggle: { group: 'Видимость', tooltip: 'Показывать/скрывать логотип' },
      url: { group: 'Контент', tooltip: 'URL логотипа' },
      alt: { group: 'Контент', tooltip: 'Альтернативный текст' },
      link: { group: 'Контент', tooltip: 'Ссылка при клике' },
      size: { group: 'Размеры', tooltip: 'Ширина логотипа' },
      height: { group: 'Размеры', tooltip: 'Высота логотипа' },
      align: { group: 'Позиционирование', tooltip: 'Выравнивание' },
      borderRadius: { group: 'Стили', tooltip: 'Скругление углов' },
      border: { group: 'Стили', tooltip: 'Рамка логотипа' },
      innerSpacing: { group: 'Отступы', tooltip: 'Внутренние отступы' },
      spacing: { group: 'Отступы', tooltip: 'Внешние отступы' }
    }
  },
  container: {
    title: 'Контейнер',
    settings: {
      displayToggle: { group: 'Видимость', tooltip: 'Показывать/скрывать контейнер' },
      size: { group: 'Размеры', tooltip: 'Ширина контейнера' },
      height: { group: 'Размеры', tooltip: 'Высота контейнера' },
      background: { group: 'Стили', tooltip: 'Фон контейнера' },
      borderRadius: { group: 'Стили', tooltip: 'Скругление углов' },
      border: { group: 'Стили', tooltip: 'Рамка' },
      innerSpacing: { group: 'Отступы', tooltip: 'Внутренние отступы' },
      spacing: { group: 'Отступы', tooltip: 'Внешние отступы' }
    }
  },
  product: {
    title: 'Товар (динамический)',
    settings: {
      collection: { group: 'Данные', tooltip: 'Источник данных о товарах' },
      displayToggle: { group: 'Видимость', tooltip: 'Показывать/скрывать блок товара' },
      imageUrl: { group: 'Изображение товара', tooltip: 'URL изображения товара' },
      imageSize: { group: 'Изображение товара', tooltip: 'Размер изображения' },
      name: { group: 'Информация о товаре', tooltip: 'Название товара' },
      price: { group: 'Информация о товаре', tooltip: 'Цена товара' },
      oldPrice: { group: 'Информация о товаре', tooltip: 'Старая цена' },
      link: { group: 'Информация о товаре', tooltip: 'Ссылка на товар' },
      buttonText: { group: 'Кнопка', tooltip: 'Текст кнопки' },
      buttonUrl: { group: 'Кнопка', tooltip: 'URL кнопки' },
      size: { group: 'Размеры', tooltip: 'Ширина блока товара' },
      height: { group: 'Размеры', tooltip: 'Высота блока товара' },
      borderRadius: { group: 'Стили', tooltip: 'Скругление углов' },
      border: { group: 'Стили', tooltip: 'Рамка блока' },
      innerSpacing: { group: 'Отступы', tooltip: 'Внутренние отступы' },
      spacing: { group: 'Отступы', tooltip: 'Внешние отступы' }
    }
  }
};

export const friendlyNames: Record<string, string> = {
  displayToggle: 'Видимость',
  url: 'URL',
  text: 'Текст',
  content: 'Содержимое',
  size: 'Ширина',
  height: 'Высота',
  align: 'Выравнивание',
  background: 'Фон',
  textStyles: 'Стили текста',
  simpleTextStyles: 'Простые стили текста',
  borderRadius: 'Скругление углов',
  border: 'Рамка',
  innerSpacing: 'Внутренние отступы',
  spacing: 'Внешние отступы',
  alt: 'Альтернативный текст',
  link: 'Ссылка',
  collection: 'Коллекция данных',
  imageUrl: 'URL изображения',
  imageSize: 'Размер изображения',
  name: 'Название',
  price: 'Цена',
  oldPrice: 'Старая цена',
  buttonText: 'Текст кнопки',
  buttonUrl: 'URL кнопки'
};

export const smartHints: Record<string, string> = {
  background: '<!-- AI-подсказка: фон для этого элемента следует применять к родительской ячейке <td>, а не к самому элементу, если это не <td>. -->',
  size: '<!-- AI-подсказка: для элемента с настройкой "Ширина" (SIZE) используй свойства .formattedWidthAttribute и .formattedWidthStyle. -->',
  height: '<!-- AI-подсказка: для элемента с настройкой "Высота" (HEIGHTV2) используй свойство .formattedHeight. -->',
  spacing: '<!-- AI-подсказка: "Внешние отступы" (spacing) реализуй как пустую строку таблицы `<tr><td><div style="height: ${editor.var}px"></div></td></tr>` для создания вертикального пространства. -->'
};
