import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    // Очищаем localStorage
    localStorage.clear();
    
    // Сбрасываем состояние
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    
    // Перезагружаем страницу
    window.location.href = '/';
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="h-8 w-8 text-destructive" />
                <CardTitle className="text-2xl">Произошла ошибка</CardTitle>
              </div>
              <CardDescription>
                Приложение столкнулось с непредвиденной ошибкой. Вы можете попробовать перезагрузить страницу или сбросить состояние.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {this.state.error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <p className="font-mono text-sm text-destructive font-semibold mb-2">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                        Показать детали ошибки
                      </summary>
                      <pre className="mt-2 text-xs overflow-auto max-h-40 text-muted-foreground">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              <div className="flex gap-3 flex-wrap">
                <Button
                  onClick={this.handleReload}
                  variant="default"
                  className="flex-1 min-w-[150px]"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Перезагрузить страницу
                </Button>
                <Button
                  onClick={this.handleReset}
                  variant="destructive"
                  className="flex-1 min-w-[150px]"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Сбросить состояние
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Если проблема повторяется, попробуйте сбросить состояние приложения.
                Это удалит все сохраненные данные и вернет приложение к начальному состоянию.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
