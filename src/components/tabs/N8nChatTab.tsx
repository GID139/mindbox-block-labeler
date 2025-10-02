import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

const N8N_CHAT_URL = "https://n8n.mindbox.cloud/webhook/2982e424-ede3-4d1d-924e-49e2f8f6be0c/chat";

export function N8nChatTab() {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkN8nStatus();
  }, []);

  const checkN8nStatus = async () => {
    setIsChecking(true);
    try {
      const response = await fetch(N8N_CHAT_URL, { 
        method: 'HEAD',
        mode: 'no-cors'
      });
      // С no-cors мы не получим реальный статус, но отсутствие ошибки означает доступность
      setIsOnline(true);
    } catch (error) {
      console.error('n8n status check failed:', error);
      setIsOnline(false);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        {isChecking ? (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>Проверка статуса n8n сервиса...</AlertDescription>
          </Alert>
        ) : isOnline ? (
          <Alert className="border-green-500/50 bg-green-500/10">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700 dark:text-green-400">
              n8n Chat сервис доступен
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-red-500/50 bg-red-500/10">
            <XCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-700 dark:text-red-400">
              n8n Chat сервис недоступен. Проверьте URL или попробуйте позже.
            </AlertDescription>
          </Alert>
        )}
      </Card>

      <Card className="p-0 overflow-hidden" style={{ height: 'calc(100vh - 280px)' }}>
        <iframe
          src={N8N_CHAT_URL}
          className="w-full h-full border-0"
          title="n8n Chat"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
        />
      </Card>
    </div>
  );
}
