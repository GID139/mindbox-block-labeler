import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      toast.error("Пожалуйста, введите текст отзыва");
      return;
    }

    setIsSubmitting(true);
    
    // Здесь можно добавить отправку на сервер
    try {
      // Для демонстрации просто логируем
      console.log('Feedback submitted:', feedback);
      
      toast.success("Спасибо за ваш отзыв!");
      setFeedback("");
      setIsOpen(false);
    } catch (error) {
      toast.error("Ошибка при отправке отзыва");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all z-50"
          title="Оставить отзыв"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Обратная связь</DialogTitle>
          <DialogDescription>
            Расскажите нам о вашем опыте использования приложения
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Что вам понравилось или что можно улучшить?"
            className="min-h-[150px]"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Отправка..." : "Отправить"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
