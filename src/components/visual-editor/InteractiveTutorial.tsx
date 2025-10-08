import { useState, useEffect } from 'react';
import Joyride, { Step, CallBackProps, STATUS } from 'react-joyride';

export function InteractiveTutorial() {
  const [run, setRun] = useState(false);

  useEffect(() => {
    // Check if user has completed tutorial
    const completed = localStorage.getItem('visual-editor-tutorial-completed');
    if (!completed) {
      // Wait a bit before starting to let the UI load
      setTimeout(() => setRun(true), 1000);
    }
  }, []);

  const steps: Step[] = [
    {
      target: '.block-library',
      content: '👋 Welcome! This is the Block Library. Drag blocks from here to build your email template.',
      disableBeacon: true,
      placement: 'right',
    },
    {
      target: '.canvas-container',
      content: '📧 This is your Canvas. Drop blocks here to create your email layout. You can switch between Structure and Visual modes.',
      placement: 'left',
    },
    {
      target: '.canvas-mode-toggle',
      content: '🎨 Use this toggle to switch between Structure mode (tree view) and Visual mode (drag & resize like Figma).',
      placement: 'bottom',
    },
    {
      target: '.settings-panel-container',
      content: '⚙️ When you select a block, its settings appear here. You can customize colors, text, layout, and more.',
      placement: 'left',
    },
    {
      target: '.toolbar',
      content: '🛠️ The toolbar has all your tools: save, undo/redo, preview, code generation, and project settings.',
      placement: 'bottom',
    },
    {
      target: 'body',
      content: '⌨️ Tip: Use keyboard shortcuts! Cmd+Z to undo, Cmd+D to duplicate, Delete to remove blocks, and Cmd+S to save.',
      placement: 'center',
    },
  ];

  const handleCallback = (data: CallBackProps) => {
    const { status } = data;
    
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      localStorage.setItem('visual-editor-tutorial-completed', 'true');
      setRun(false);
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showSkipButton
      showProgress
      callback={handleCallback}
      styles={{
        options: {
          primaryColor: '#39AA5D',
          zIndex: 10000,
        },
        buttonNext: {
          backgroundColor: '#39AA5D',
          borderRadius: '4px',
        },
        buttonBack: {
          marginRight: 10,
        },
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Finish',
        next: 'Next',
        skip: 'Skip Tutorial',
      }}
    />
  );
}
