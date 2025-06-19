import { useState, useEffect, useCallback } from 'react';
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
    position: 'bottom',
    action: 'Click to view clients'
  },
  {
    id: 'contracts',
    title: 'Contract Protection',
    content: 'Upload and analyze your representation agreements. Our AI will identify risks and track expiration dates automatically.',
    target: 'contracts-widget',
    position: 'bottom',
    action: 'Manage contracts'
  },
  {
    id: 'showings',
    title: 'Showing Tracker',
    content: 'Track all property showings and client interactions. This creates a paper trail that helps prove your representation relationship.',
    target: 'showing-widget',
    position: 'bottom',
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
    id: 'commission-intelligence',
    title: 'Commission Intelligence',
    content: 'AI-powered commission protection analysis with contract risk assessment, client behavior monitoring, and market intelligence insights.',
    target: 'commission-widget',
    position: 'top',
    action: 'Advanced protection strategies'
  },
  {
    id: 'reports',
    title: 'Reports & Analytics',
    content: 'Generate comprehensive reports on client activity, contract performance, and commission protection metrics for your business insights.',
    target: 'reports-widget',
    position: 'top',
    action: 'Track your protection success'
  },
  {
    id: 'help-support',
    title: 'Help & Support',
    content: 'Access our comprehensive support system including legal assistance, technical help, and real estate expertise whenever you need it.',
    target: 'help-button',
    position: 'bottom',
    action: 'Get help when you need it most'
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
  const [highlightPosition, setHighlightPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [isElementVisible, setIsElementVisible] = useState(true);
  const [isBottomRow, setIsBottomRow] = useState(false);

  const updatePositions = useCallback(() => {
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      
      // Check if element is visible in viewport
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const elementVisible = rect.bottom > 0 && rect.top < viewportHeight && rect.right > 0 && rect.left < viewportWidth;
      setIsElementVisible(elementVisible);
      
      // Center the highlight box with the widget center (top-bottom and left-right)
      const highlightMargin = 8;
      const widgetCenterX = rect.left + (rect.width / 2);
      const widgetCenterY = rect.top + (rect.height / 2);
      const highlightWidth = rect.width + (highlightMargin * 2);
      const highlightHeight = rect.height + (highlightMargin * 2);
      
      setHighlightPosition({
        top: widgetCenterY - (highlightHeight / 2),
        left: widgetCenterX - (highlightWidth / 2),
        width: highlightWidth,
        height: highlightHeight
      });
      
      // Determine if widget is in bottom row for card positioning
      const isInBottomRow = widgetCenterY > (viewportHeight / 2);
      setIsBottomRow(isInBottomRow);
    }
  }, [targetElement, currentStep]);

  useEffect(() => {
    if (isOpen && tourSteps[currentStep]) {
      console.log(`Looking for element with data-tour-id: ${tourSteps[currentStep].target}`);
      const element = document.querySelector(`[data-tour-id="${tourSteps[currentStep].target}"]`) as HTMLElement;
      setTargetElement(element);
      
      if (element) {
        console.log(`Found element for step ${currentStep}: ${tourSteps[currentStep].target}`);
        const bounds = element.getBoundingClientRect();
        console.log('Element bounds:', bounds);
        console.log('Element classes:', element.className);
        console.log('Computed styles:', {
          borderRadius: window.getComputedStyle(element).borderRadius,
          padding: window.getComputedStyle(element).padding,
          margin: window.getComputedStyle(element).margin
        });
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Update position after scroll animation
        setTimeout(() => {
          updatePositions();
        }, 500);
      } else {
        console.warn(`Element not found for step ${currentStep}: ${tourSteps[currentStep].target}`);
      }
    }
  }, [isOpen, currentStep, updatePositions]);

  useEffect(() => {
    if (targetElement) {
      updatePositions();
      
      // Update position on scroll and resize
      const handleScroll = () => updatePositions();
      const handleResize = () => updatePositions();
      
      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [targetElement, updatePositions]);

  const nextStep = () => {
    console.log(`Current step: ${currentStep}, Total steps: ${tourSteps.length}`);
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      console.log(`Advanced to step: ${currentStep + 1}`);
    } else {
      console.log('Completing tour');
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('commission-guard-onboarding-completed', 'true');
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
            className="fixed inset-0 bg-black/40 z-20"
            onClick={skipTour}
          />

          {/* Tour Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed z-20 pointer-events-auto"
            style={{
              top: isBottomRow ? Math.max(50, (highlightPosition?.top || 0) - 280) : Math.min(window.innerHeight - 320, (highlightPosition?.top || 0) + (highlightPosition?.height || 0) + 20),
              left: Math.min(window.innerWidth - 400, Math.max(20, (highlightPosition?.left || 0))),
              transition: 'all 0.15s ease-out'
            }}
          >
            <Card className="w-80 shadow-2xl border-2 border-blue-200 max-h-96 overflow-y-auto">
              <CardContent className="p-6 pointer-events-auto">
                <div className="flex items-center justify-between mb-4 pointer-events-auto">
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

                  <div className="flex items-center justify-between pt-4 pointer-events-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={prevStep}
                      disabled={currentStep === 0}
                      className="flex items-center gap-2 pointer-events-auto"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Previous
                    </Button>

                    <div className="flex gap-1 pointer-events-auto">
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
                      className="flex items-center gap-2 pointer-events-auto"
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
              className="fixed z-20 pointer-events-none"
              style={{
                top: highlightPosition.top,
                left: highlightPosition.left,
                width: highlightPosition.width,
                height: highlightPosition.height,
                border: '3px solid #2563eb',
                borderRadius: '20px',
                boxShadow: '0 0 0 4px rgba(37, 99, 235, 0.2), 0 0 20px rgba(37, 99, 235, 0.4)',
                background: 'transparent',
                transition: 'all 0.15s ease-out'
              }}
            />
          )}
        </>
      )}
    </AnimatePresence>
  );
}