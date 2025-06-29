import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const tourSteps: TourStep[] = [
  {
    id: 'dashboard-header',
    title: 'Welcome to Commission Protection',
    description: 'This is your Commission Protection Dashboard where you can protect your commissions and track your success. Let\'s explore the key features.',
    target: 'dashboard-header',
    position: 'bottom'
  },
  {
    id: 'clients-widget',
    title: 'Active Clients',
    description: 'Monitor your active clients and their representation status. Click to manage client relationships.',
    target: 'clients-widget',
    position: 'top'
  },
  {
    id: 'contracts-widget',
    title: 'Active Contracts',
    description: 'Track your representation agreements and their expiration dates to prevent commission loss.',
    target: 'contracts-widget',
    position: 'top'
  },
  {
    id: 'showing-widget',
    title: 'Property Showings',
    description: 'Log property visits to build evidence of your representation and commission protection.',
    target: 'showing-widget',
    position: 'top'
  },
  {
    id: 'protected-commission-widget',
    title: 'Protected Commission',
    description: 'Track the total value of commissions you have protected through proper documentation and monitoring.',
    target: 'protected-commission-widget',
    position: 'top'
  },
  {
    id: 'alerts-widget',
    title: 'Potential Breaches',
    description: 'Get alerted to potential commission breaches and take immediate action to protect your earnings.',
    target: 'alerts-widget',
    position: 'top'
  },
  {
    id: 'records-widget',
    title: 'Public Records Monitor',
    description: 'Automatically monitor public records for unauthorized transactions by your clients.',
    target: 'records-widget',
    position: 'top'
  },
  {
    id: 'commission-widget',
    title: 'Commission Intelligence',
    description: 'Get AI-powered insights and recommendations for protecting your commissions.',
    target: 'commission-widget',
    position: 'top'
  },
  {
    id: 'reports-widget',
    title: 'Commission Reports',
    description: 'View detailed reports and analytics on your commission protection and recovery efforts.',
    target: 'reports-widget',
    position: 'top'
  },
  {
    id: 'help-button',
    title: 'Get Help & Support',
    description: 'Access contextual help, support resources, and guidance whenever you need assistance.',
    target: 'help-button',
    position: 'bottom'
  },
  {
    id: 'activity-stream',
    title: 'Real-Time Activity Stream',
    description: 'Stay updated with live monitoring alerts and commission protection activities.',
    target: 'activity-stream',
    position: 'left'
  },
  {
    id: 'nav-dashboard',
    title: 'Dashboard Navigation',
    description: 'Return to your main dashboard and overview at any time.',
    target: 'nav-dashboard',
    position: 'bottom'
  },
  {
    id: 'nav-clients',
    title: 'Client Management',
    description: 'Manage your client relationships and representation agreements.',
    target: 'nav-clients',
    position: 'bottom'
  },
  {
    id: 'nav-contracts',
    title: 'Contract Protection',
    description: 'Upload, analyze, and monitor your representation contracts.',
    target: 'nav-contracts',
    position: 'bottom'
  },
  {
    id: 'nav-showings',
    title: 'Showing Tracker',
    description: 'Track property visits to build commission protection evidence.',
    target: 'nav-showings',
    position: 'bottom'
  },
  {
    id: 'nav-commission-protection',
    title: 'Commission Protection',
    description: 'Access commission protection tools and monitoring systems.',
    target: 'nav-commission-protection',
    position: 'bottom'
  },
  {
    id: 'nav-alerts',
    title: 'Alert System',
    description: 'Monitor and respond to potential commission breach alerts.',
    target: 'nav-alerts',
    position: 'bottom'
  },
  {
    id: 'nav-records',
    title: 'Public Records',
    description: 'Monitor public records for unauthorized client transactions.',
    target: 'nav-records',
    position: 'bottom'
  },
  {
    id: 'nav-intelligence',
    title: 'Commission Intelligence',
    description: 'Access AI-powered commission protection analysis and insights.',
    target: 'nav-intelligence',
    position: 'bottom'
  },
  {
    id: 'nav-reports',
    title: 'Reports & Analytics',
    description: 'View comprehensive reports on your commission protection efforts.',
    target: 'nav-reports',
    position: 'bottom'
  },
  {
    id: 'profile-dropdown',
    title: 'Profile & Settings',
    description: 'Access your profile, subscription settings, and account management options.',
    target: 'profile-dropdown',
    position: 'bottom'
  },
  {
    id: 'profile-menu',
    title: 'Profile Menu Options',
    description: 'Click on your profile to access settings, subscription management, support, and sign out options.',
    target: 'profile-menu',
    position: 'bottom'
  }
];

export function OnboardingTour({ isOpen, onClose, onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightPosition, setHighlightPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });

  useEffect(() => {
    if (isOpen) {
      updateHighlightPosition();
      
      // Add scroll listener to update position during scroll
      const handleScroll = () => updateHighlightPosition();
      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', handleScroll, { passive: true });
      
      return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleScroll);
      };
    }
  }, [isOpen, currentStep]);

  const updateHighlightPosition = () => {
    const step = tourSteps[currentStep];
    const element = document.querySelector(`[data-tour-id="${step.target}"]`);
    
    if (element) {
      const rect = element.getBoundingClientRect();
      
      // Special handling for dashboard header to fit text better
      if (step.target === 'dashboard-header') {
        setHighlightPosition({
          top: rect.top - 30, // Move highlight box up above the text
          left: rect.left,
          width: Math.min(rect.width, 500), // Limit width to fit text better
          height: rect.height + 5 // Bring bottom extremely close to text
        });
      } else if (step.target === 'clients-widget' || step.target === 'contracts-widget' || step.target === 'showing-widget' || step.target === 'protected-commission-widget' || step.target === 'alerts-widget' || step.target === 'records-widget' || step.target === 'commission-widget' || step.target === 'reports-widget') {
        setHighlightPosition({
          top: rect.top - 30, // Move widget highlights higher
          left: rect.left,
          width: rect.width,
          height: rect.height - 5 // Bring bottom closer to widget top
        });
      } else if (step.target === 'help-button') {
        setHighlightPosition({
          top: rect.top - 30, // Move help button highlight down slightly
          left: rect.left,
          width: rect.width,
          height: rect.height - 5 // Slightly increase height from bottom
        });
      } else if (step.target === 'activity-stream') {
        setHighlightPosition({
          top: rect.top - 35, // Move activity stream highlight up even more
          left: rect.left,
          width: rect.width,
          height: rect.height
        });
      } else if (step.target === 'nav-dashboard' || step.target === 'nav-clients' || step.target === 'nav-contracts' || step.target === 'nav-showings' || step.target === 'nav-commission-protection' || step.target === 'nav-alerts' || step.target === 'nav-records' || step.target === 'nav-intelligence' || step.target === 'nav-reports') {
        // Uniform positioning for all navigation tabs (steps 12-20)
        setHighlightPosition({
          top: rect.top, // Align with actual tab top
          left: rect.left - 10, // Center the box over the tab
          width: rect.width + 20, // Expand width for better centering
          height: rect.height - 30 // Reduce height to move bottom higher
        });
      } else if (step.target === 'profile-dropdown') {
        // Full box format with four walls for profile dropdown (step 21) - keep it stationary
        setHighlightPosition({
          top: rect.top - 30,
          left: rect.left - 2,
          width: rect.width + 4,
          height: rect.height + 4
        });
      } else if (step.target === 'profile-menu') {
        // Full box format for dropdown menu (step 22)
        setHighlightPosition({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        });
      } else {
        setHighlightPosition({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        });
      }

      // Scroll element into view if needed (skip for profile dropdown to prevent movement)
      if (step.target !== 'profile-dropdown' && (rect.top < 100 || rect.bottom > window.innerHeight - 100)) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center'
        });
      }
    }
  };

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      const nextStepIndex = currentStep + 1;
      setCurrentStep(nextStepIndex);
      
      // Immediately open dropdown when entering step 22
      if (nextStepIndex === 21) { // Step 22 (0-indexed as 21)
        setTimeout(() => {
          // Try multiple methods to trigger the dropdown
          const profileButton = document.querySelector('[data-tour-id="profile-dropdown"]') as HTMLElement;
          if (profileButton) {
            // Simulate mouse events to properly trigger the dropdown
            const mouseEvent = new MouseEvent('click', {
              view: window,
              bubbles: true,
              cancelable: true,
            });
            profileButton.dispatchEvent(mouseEvent);
            
            // Also try focus + enter key
            profileButton.focus();
            setTimeout(() => {
              const enterEvent = new KeyboardEvent('keydown', {
                key: 'Enter',
                code: 'Enter',
                bubbles: true
              });
              profileButton.dispatchEvent(enterEvent);
            }, 10);
          }
        }, 100);
      }
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTour = () => {
    onClose();
  };

  if (!isOpen) return null;

  const currentTourStep = tourSteps[currentStep];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 pointer-events-none"
          />

          {/* Highlight Box */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed z-50 pointer-events-none"
            style={{
              top: highlightPosition.top - 6,
              left: highlightPosition.left - 6,
              width: highlightPosition.width + 12,
              height: highlightPosition.height + 12,
              outline: (currentStep >= 11 && currentStep <= 19) ? 'none' : '3px solid #3B82F6', // Remove outline for navigation tabs only
              outlineOffset: '2px',
              borderRadius: '6px',
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
              background: 'transparent',
              transition: 'all 0.3s ease-out',
              // Create U-shape border for navigation tabs (steps 12-20)
              ...((currentStep >= 11 && currentStep <= 19) && {
                borderLeft: '3px solid #3B82F6',
                borderRight: '3px solid #3B82F6',
                borderBottom: '3px solid #3B82F6',
                borderTop: 'none',
                borderRadius: '0 0 6px 6px' // Square top corners, rounded bottom
              }),
              // Full box border for profile dropdown (step 21) and profile menu (step 22)
              ...((currentStep === 20 || currentStep === 21) && {
                border: '3px solid #3B82F6',
                borderRadius: '6px',
                outline: 'none'
              })
            }}
          />

          {/* Tour Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed z-50 bg-white rounded-lg shadow-2xl p-4 max-w-xs w-full mx-4"
            style={{
              top: currentStep === 20 || currentStep === 21 ? // Steps 21 and 22
                Math.min(window.innerHeight - 280, highlightPosition.top + highlightPosition.height + 20) :
                currentTourStep.position === 'bottom' || currentStep === 1 || currentStep === 2 || currentStep === 3 || currentStep === 4 ? 
                Math.min(window.innerHeight - 280, highlightPosition.top + highlightPosition.height + 20) :
                currentTourStep.position === 'top' || currentStep === 5 || currentStep === 6 || currentStep === 7 || currentStep === 8 ? 
                Math.max(20, highlightPosition.top - 260) :
                Math.max(20, Math.min(window.innerHeight - 260, highlightPosition.top + (highlightPosition.height / 2) - 130)),
              left: currentStep === 20 || currentStep === 21 ? // Steps 21 and 22 - move card to the left
                Math.max(20, highlightPosition.left - 340) :
                currentTourStep.position === 'right' ? 
                Math.min(window.innerWidth - 320, highlightPosition.left + highlightPosition.width + 20) :
                currentTourStep.position === 'left' ? 
                Math.max(20, highlightPosition.left - 340) :
                Math.max(20, Math.min(window.innerWidth - 320, highlightPosition.left + (highlightPosition.width / 2) - 160)),
              transition: 'all 0.3s ease-out'
            }}
          >
            {/* Close Button */}
            <button
              onClick={skipTour}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors z-10"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Content */}
            <div className="pr-6">
              <h2 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2">
                {currentTourStep.title}
              </h2>
              <p className="text-sm text-gray-600 mb-3 leading-relaxed line-clamp-3">
                {currentTourStep.description}
              </p>
            </div>

            {/* Step Counter */}
            <div className="text-xs text-gray-500 mb-3 text-center">
              Step {currentStep + 1} of {tourSteps.length}
            </div>

            {/* Progress Dots */}
            <div className="flex justify-center items-center space-x-1 mb-3">
              {tourSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    index === currentStep ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
              {currentStep > 0 ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevStep}
                  className="flex items-center gap-1 text-xs px-3 py-1.5"
                >
                  <ChevronLeft className="h-3 w-3" />
                  Back
                </Button>
              ) : (
                <div></div>
              )}
              
              <Button
                size="sm"
                onClick={nextStep}
                className="flex items-center gap-1 text-xs px-3 py-1.5"
              >
                {currentStep === tourSteps.length - 1 ? 'Complete' : 'Next'}
                {currentStep < tourSteps.length - 1 && <ChevronRight className="h-3 w-3" />}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}