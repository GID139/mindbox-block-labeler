import { useEffect, useRef, useState, useMemo } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Copy, Trash2, Download, Filter } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";

interface DiagnosticLogProps {
  logs: string[];
  onClear: () => void;
}

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'ALL';

interface ParsedLog {
  timestamp: string;
  level: LogLevel;
  message: string;
  raw: string;
}

export function DiagnosticLog({ logs, onClear }: DiagnosticLogProps) {
  const logRef = useRef<HTMLDivElement>(null);
  const [filters, setFilters] = useState<Set<LogLevel>>(new Set(['INFO', 'WARN', 'ERROR', 'DEBUG']));

  useEffect(() => {
    // Автоскролл к последней записи
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  const parseLog = (log: string): ParsedLog => {
    // Пытаемся разобрать формат: [timestamp] LEVEL [context] message
    const match = log.match(/^\[([^\]]+)\]\s+(INFO|WARN|ERROR|DEBUG)\s+(.+)$/);
    if (match) {
      return {
        timestamp: match[1],
        level: match[2] as LogLevel,
        message: match[3],
        raw: log
      };
    }
    // Если не распознали формат, считаем INFO
    return {
      timestamp: '',
      level: 'INFO',
      message: log,
      raw: log
    };
  };

  const parsedLogs = useMemo(() => logs.map(parseLog), [logs]);

  const filteredLogs = useMemo(() => {
    return parsedLogs.filter(log => filters.has(log.level));
  }, [parsedLogs, filters]);

  const toggleFilter = (level: LogLevel) => {
    setFilters(prev => {
      const newFilters = new Set(prev);
      if (newFilters.has(level)) {
        newFilters.delete(level);
      } else {
        newFilters.add(level);
      }
      return newFilters;
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(filteredLogs.map(l => l.raw).join("\n"));
      toast.success("Лог скопирован в буфер обмена");
    } catch {
      toast.error("Не удалось скопировать");
    }
  };

  const handleExportJson = () => {
    try {
      const jsonData = JSON.stringify(parsedLogs, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `diagnostic-log-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Лог экспортирован в JSON");
    } catch {
      toast.error("Не удалось экспортировать");
    }
  };

  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case 'ERROR': return 'bg-red-500/20 text-red-500';
      case 'WARN': return 'bg-yellow-500/20 text-yellow-500';
      case 'DEBUG': return 'bg-blue-500/20 text-blue-500';
      default: return 'bg-green-500/20 text-green-500';
    }
  };

  const logStats = useMemo(() => {
    const stats = { INFO: 0, WARN: 0, ERROR: 0, DEBUG: 0 };
    parsedLogs.forEach(log => {
      if (log.level in stats) {
        stats[log.level]++;
      }
    });
    return stats;
  }, [parsedLogs]);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-foreground">Диагностический лог</h3>
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="text-xs">
              {filteredLogs.length}/{logs.length}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-3.5 w-3.5 mr-1" />
                Фильтры
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Уровни логирования</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(['INFO', 'WARN', 'ERROR', 'DEBUG'] as LogLevel[]).map(level => (
                <DropdownMenuCheckboxItem
                  key={level}
                  checked={filters.has(level)}
                  onCheckedChange={() => toggleFilter(level)}
                >
                  <span className="flex items-center gap-2">
                    {level}
                    <Badge variant="outline" className="ml-auto text-xs">
                      {logStats[level]}
                    </Badge>
                  </span>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportJson}
            disabled={logs.length === 0}
          >
            <Download className="h-3.5 w-3.5 mr-1" />
            JSON
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            disabled={filteredLogs.length === 0}
          >
            <Copy className="h-3.5 w-3.5 mr-1" />
            Копировать
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onClear}
            disabled={logs.length === 0}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Очистить
          </Button>
        </div>
      </div>
      <div
        ref={logRef}
        className="h-36 overflow-auto text-xs font-mono bg-editor-bg text-foreground rounded p-3 border"
      >
        {filteredLogs.length === 0 ? (
          <div className="text-muted-foreground">
            {logs.length === 0 ? 'Лог пуст' : 'Нет логов соответствующих фильтрам'}
          </div>
        ) : (
          filteredLogs.map((log, index) => (
            <div key={index} className="mb-1 flex items-start gap-2">
              <Badge 
                variant="outline" 
                className={`${getLevelColor(log.level)} text-[10px] px-1 py-0 shrink-0`}
              >
                {log.level}
              </Badge>
              <span className="flex-1">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
