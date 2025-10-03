import { HistoryModal } from "@/components/HistoryModal";
import { ImproveGoalModal } from "@/components/ImproveGoalModal";
import { toast } from "sonner";
import type { HistoryItem } from "@/types/mindbox";

interface HistorySectionProps {
  showHistory: boolean;
  showImproveGoal: boolean;
  currentGoal: string;
  onCloseHistory: () => void;
  onCloseImproveGoal: () => void;
  onRestoreHistory: (item: HistoryItem) => void;
  onAcceptImprovedGoal: (improvedGoal: string) => void;
}

export function HistorySection({
  showHistory,
  showImproveGoal,
  currentGoal,
  onCloseHistory,
  onCloseImproveGoal,
  onRestoreHistory,
  onAcceptImprovedGoal
}: HistorySectionProps) {
  const handleAcceptGoal = (improvedGoal: string) => {
    onAcceptImprovedGoal(improvedGoal);
    toast.success("Цель обновлена");
  };

  return (
    <>
      <HistoryModal
        isOpen={showHistory}
        onClose={onCloseHistory}
        onRestore={onRestoreHistory}
      />

      <ImproveGoalModal
        isOpen={showImproveGoal}
        onClose={onCloseImproveGoal}
        currentGoal={currentGoal}
        onAccept={handleAcceptGoal}
      />
    </>
  );
}
