import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface SmartTooltipProps {
  context: string;
  children: React.ReactNode;
}

const contextualTips: Record<string, string[]> = {
  dashboard: [
    "Click any widget to dive deeper into that area",
    "Use the Help button for step-by-step guidance",
    "The activity stream shows real-time updates"
  ],
  clients: [
    "Always document first contact date for legal protection",
    "Use the communication log to track all interactions",
    "Set reminders for contract renewals"
  ],
  contracts: [
    "Upload contracts immediately after signing",
    "Review AI analysis for potential weaknesses",
    "Set automatic expiration alerts"
  ],
  showings: [
    "Document all property visits with photos when possible",
    "Follow up within 24 hours of each showing",
    "Track client reactions and preferences"
  ]
};

export function SmartTooltips({ context, children }: SmartTooltipProps) {
  const [currentTip, setCurrentTip] = useState<string | null>(null);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const tips = contextualTips[context];
    if (tips && tips.length > 0) {
      // Show tip after user has been on page for 10 seconds
      const timer = setTimeout(() => {
        setCurrentTip(tips[tipIndex]);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [context, tipIndex]);

  const nextTip = () => {
    const tips = contextualTips[context];
    if (tips) {
      const nextIndex = (tipIndex + 1) % tips.length;
      setTipIndex(nextIndex);
      setCurrentTip(tips[nextIndex]);
    }
  };

  const closeTip = () => {
    setCurrentTip(null);
  };

  return (
    <div className="relative">
      {children}
      
      <AnimatePresence>
        {currentTip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="fixed bottom-20 right-6 z-50 max-w-sm"
          >
            <Card className="shadow-xl border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-yellow-100 rounded-full p-1 flex-shrink-0">
                    <Lightbulb className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-yellow-800 font-medium mb-2">
                      Pro Tip
                    </p>
                    <p className="text-sm text-yellow-700">
                      {currentTip}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={closeTip}
                    className="h-6 w-6 p-0 text-yellow-600 hover:text-yellow-800"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                
                <div className="flex items-center justify-between mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={nextTip}
                    className="text-yellow-700 hover:text-yellow-900 text-xs"
                  >
                    More tips
                  </Button>
                  <div className="text-xs text-yellow-600">
                    {tipIndex + 1} of {contextualTips[context]?.length || 0}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}