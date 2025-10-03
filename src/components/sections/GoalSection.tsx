import { Header } from "@/components/Header";
import { toast } from "sonner";
import type { MindboxState } from "@/types/mindbox";

interface GoalSectionProps {
  state: MindboxState;
  onHistoryClick: () => void;
  onUploadState: (file: File) => void;
}

export function GoalSection({ state, onHistoryClick, onUploadState }: GoalSectionProps) {
  const handleShareClick = () => {
    try {
      const dataToShare = {
        goal: state.goal,
        html: state.html,
        json: state.json,
        isDynamicGrid: state.isDynamicGrid,
        isEditable: state.isEditable
      };
      const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(dataToShare))));
      const url = `${window.location.origin}${window.location.pathname}?data=${encoded}`;
      navigator.clipboard.writeText(url);
      toast.success("Ссылка скопирована в буфер обмена");
    } catch {
      toast.error("Не удалось создать ссылку");
    }
  };

  const handleDownloadState = () => {
    try {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      a.download = `mindbox-state-${timestamp}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Состояние скачано");
    } catch {
      toast.error("Ошибка экспорта");
    }
  };

  return (
    <Header
      onShareClick={handleShareClick}
      onHistoryClick={onHistoryClick}
      onDownloadState={handleDownloadState}
      onUploadState={onUploadState}
    />
  );
}
