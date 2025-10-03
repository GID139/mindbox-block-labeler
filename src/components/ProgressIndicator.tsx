import { Check, Loader2, Clock } from "lucide-react";
import { Progress } from "./ui/progress";
import { Card } from "./ui/card";

interface Step {
  name: string;
  status: "pending" | "processing" | "completed";
}

interface ProgressIndicatorProps {
  steps: Step[];
  currentProgress: number;
  message?: string;
}

export function ProgressIndicator({ steps, currentProgress, message }: ProgressIndicatorProps) {
  return (
    <Card className="p-6 space-y-4">
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              step.status === "completed" 
                ? "bg-green-500/20 text-green-500" 
                : step.status === "processing"
                ? "bg-primary/20 text-primary"
                : "bg-muted text-muted-foreground"
            }`}>
              {step.status === "completed" && <Check className="h-4 w-4" />}
              {step.status === "processing" && <Loader2 className="h-4 w-4 animate-spin" />}
              {step.status === "pending" && <Clock className="h-4 w-4" />}
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                step.status === "processing" ? "text-foreground" : "text-muted-foreground"
              }`}>
                {step.name}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="space-y-2">
        <Progress value={currentProgress} className="h-2" />
        {message && (
          <p className="text-sm text-muted-foreground text-center">
            {message}
          </p>
        )}
      </div>
    </Card>
  );
}
