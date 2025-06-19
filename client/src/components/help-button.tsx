import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HelpButtonProps {
  onClick: () => void;
}

export function HelpButton({ onClick }: HelpButtonProps) {
  return (
    <Button 
      variant="ghost" 
      size="sm"
      onClick={onClick}
      className="flex items-center gap-2"
    >
      <HelpCircle className="h-4 w-4" />
      Help
    </Button>
  );
}