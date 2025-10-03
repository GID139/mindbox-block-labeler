// Управление историей сессий
import type { MindboxState, HistoryItem } from '@/types/mindbox';
import { logger } from './logger';

const HISTORY_KEY = 'mbx_history_v3';
const MAX_HISTORY_ITEMS = 50;

export function saveToHistory(name: string, state: Partial<MindboxState>) {
  try {
    const history = getHistory();
    const newItem: HistoryItem = {
      timestamp: Date.now(),
      name: name || `Сессия ${new Date().toLocaleString('ru-RU')}`,
      data: state
    };
    
    // Добавляем в начало массива
    history.unshift(newItem);
    
    // Ограничиваем размер истории
    if (history.length > MAX_HISTORY_ITEMS) {
      history.splice(MAX_HISTORY_ITEMS);
    }
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    return true;
  } catch (error) {
    logger.error('Error saving to history', 'history-manager', { error: error instanceof Error ? error.message : error });
    return false;
  }
}

export function getHistory(): HistoryItem[] {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    logger.error('Error loading history', 'history-manager', { error: error instanceof Error ? error.message : error });
    return [];
  }
}

export function deleteHistoryItem(timestamp: number) {
  try {
    const history = getHistory();
    const filtered = history.filter(item => item.timestamp !== timestamp);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    logger.error('Error deleting history item', 'history-manager', { error: error instanceof Error ? error.message : error, timestamp });
    return false;
  }
}

export function renameHistoryItem(timestamp: number, newName: string) {
  try {
    const history = getHistory();
    const updated = history.map(item => 
      item.timestamp === timestamp ? { ...item, name: newName } : item
    );
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return true;
  } catch (error) {
    logger.error('Error renaming history item', 'history-manager', { error: error instanceof Error ? error.message : error, timestamp, newName });
    return false;
  }
}

export function clearHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY);
    return true;
  } catch (error) {
    logger.error('Error clearing history', 'history-manager', { error: error instanceof Error ? error.message : error });
    return false;
  }
}
