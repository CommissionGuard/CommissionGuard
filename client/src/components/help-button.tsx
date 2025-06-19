import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HelpButtonProps {
  onClick?: () => void;
  onStartTour?: () => void;
}

export function HelpButton({ onClick, onStartTour }: HelpButtonProps) {
  return (
    <Button 
      variant="ghost" 
      size="sm"
      onClick={onStartTour || onClick}
      className="flex items-center gap-2 hover:scale-105 hover:bg-blue-50 transition-all duration-200"
      data-tour-id="help-button"
    >
      <HelpCircle className="h-4 w-4 transition-transform duration-200 hover:rotate-12" />
      Help
    </Button>
  );
}