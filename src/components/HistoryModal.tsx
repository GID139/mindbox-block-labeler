import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Trash2, Edit2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  getHistory,
  deleteHistoryItem,
  renameHistoryItem,
  clearHistory,
} from "@/lib/history-manager";
import type { HistoryItem } from "@/types/mindbox";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestore: (data: HistoryItem) => void;
}

export function HistoryModal({ isOpen, onClose, onRestore }: HistoryModalProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = () => {
    setHistory(getHistory());
  };

  const handleDelete = (timestamp: number) => {
    if (confirm("Удалить эту запись из истории?")) {
      deleteHistoryItem(timestamp);
      loadHistory();
      toast.success("Запись удалена");
    }
  };

  const handleRename = (timestamp: number) => {
    if (editName.trim()) {
      renameHistoryItem(timestamp, editName);
      loadHistory();
      setEditingId(null);
      setEditName("");
      toast.success("Запись переименована");
    }
  };

  const handleClearAll = () => {
    if (confirm("Очистить всю историю? Это действие необратимо.")) {
      clearHistory();
      loadHistory();
      toast.success("История очищена");
    }
  };

  const handleRestore = (item: HistoryItem) => {
    onRestore(item);
    onClose();
    toast.success("Сессия восстановлена");
  };

  const startEdit = (item: HistoryItem) => {
    setEditingId(item.timestamp);
    setEditName(item.name);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>История сессий</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4" style={{ maxHeight: "500px" }}>
          {history.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              История пуста
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((item) => (
                <div
                  key={item.timestamp}
                  className="flex items-center gap-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {editingId === item.timestamp ? (
                    <div className="flex-1 flex items-center gap-2">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRename(item.timestamp);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        className="flex-1"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        onClick={() => handleRename(item.timestamp)}
                      >
                        Сохранить
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingId(null)}
                      >
                        Отмена
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => handleRestore(item)}
                      >
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(item.timestamp).toLocaleString("ru-RU")}
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => startEdit(item)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(item.timestamp)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button variant="destructive" onClick={handleClearAll}>
            Очистить всю историю
          </Button>
          <Button variant="outline" onClick={onClose}>
            Закрыть
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
