import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TourStep {
  id: string;
  title: string;
  content: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: string;
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Commission Guard',
    content: 'Your complete commission protection platform. Let me show you the key features to help you protect your commissions from client ghosting.',
    target: 'dashboard-header',
    position: 'bottom'
  },
  {
    id: 'clients',
    title: 'Client Management',
    content: 'Add and manage your clients here. Track their contact info, representation history, and monitor their activity for potential risks.',
    target: 'clients-widget',
    position: 'top',
    action: 'Click to view clients'
  },
  {
    id: 'contracts',
    title: 'Contract Protection',
    content: 'Upload and analyze your representation agreements. Our AI will identify risks and track expiration dates automatically.',
    target: 'contracts-widget',
    position: 'top',
    action: 'Manage contracts'
  },
  {
    id: 'showings',
    title: 'Showing Tracker',
    content: 'Track all property showings and client interactions. This creates a paper trail that helps prove your representation relationship.',
    target: 'showing-widget',
    position: 'top',
    action: 'Track showings'
  },
  {
    id: 'alerts',
    title: 'Breach Alerts',
    content: 'Get notified immediately when potential commission breaches are detected through public records monitoring.',
    target: 'alerts-widget',
    position: 'top',
    action: 'View alerts'
  },
  {
    id: 'public-records',
    title: 'Public Records Monitor',
    content: '24/7 monitoring of Nassau & Suffolk county records to detect when your clients buy through other agents.',
    target: 'records-widget',
    position: 'top',
    action: 'Monitor records'
  },
  {
    id: 'ai-assistant',
    title: 'AI Support Chat',
    content: 'Get instant help with commission protection strategies, contract analysis, and platform guidance.',
    target: 'ai-chat-button',
    position: 'left',
    action: 'Try AI chat'
  }
];

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function OnboardingTour({ isOpen, onClose, onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen && tourSteps[currentStep]) {
      const element = document.querySelector(`[data-tour-id="${tourSteps[currentStep].target}"]`) as HTMLElement;
      setTargetElement(element);
      
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [isOpen, currentStep]);

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete();
    onClose();
  };

  const skipTour = () => {
    onClose();
  };

  if (!isOpen || !tourSteps[currentStep]) return null;

  const step = tourSteps[currentStep];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={skipTour}
          />

          {/* Tour Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed z-50"
            style={{
              top: targetElement ? targetElement.offsetTop + targetElement.offsetHeight + 20 : '50%',
              left: targetElement ? targetElement.offsetLeft : '50%',
              transform: !targetElement ? 'translate(-50%, -50%)' : 'none'
            }}
          >
            <Card className="w-80 shadow-2xl border-2 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="secondary" className="text-xs">
                    Step {currentStep + 1} of {tourSteps.length}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={skipTour}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {step.content}
                    </p>
                  </div>

                  {step.action && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-xs text-blue-700 font-medium">
                        💡 {step.action}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={prevStep}
                      disabled={currentStep === 0}
                      className="flex items-center gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Previous
                    </Button>

                    <div className="flex gap-1">
                      {tourSteps.map((_, index) => (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentStep ? 'bg-blue-500' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>

                    <Button
                      size="sm"
                      onClick={nextStep}
                      className="flex items-center gap-2"
                    >
                      {currentStep === tourSteps.length - 1 ? (
                        <>
                          <Check className="h-4 w-4" />
                          Complete
                        </>
                      ) : (
                        <>
                          Next
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Highlight Target Element */}
          {targetElement && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed z-40 pointer-events-none"
              style={{
                top: targetElement.offsetTop - 4,
                left: targetElement.offsetLeft - 4,
                width: targetElement.offsetWidth + 8,
                height: targetElement.offsetHeight + 8,
                border: '3px solid #3b82f6',
                borderRadius: '12px',
                boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.3)'
              }}
            />
          )}
        </>
      )}
    </AnimatePresence>
  );
}