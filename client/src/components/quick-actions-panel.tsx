import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, FileText, Calendar, AlertTriangle, Search, Brain, BarChart3, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLocation } from 'wouter';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  color: string;
  description: string;
}

interface QuickActionsPanelProps {
  onOpenHelp: (context: string) => void;
}

export function QuickActionsPanel({ onOpenHelp }: QuickActionsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [, setLocation] = useLocation();

  const quickActions: QuickAction[] = [
    {
      id: 'add-client',
      label: 'Add Client',
      icon: <Users className="h-4 w-4" />,
      action: () => setLocation('/clients'),
      color: 'bg-purple-500 hover:bg-purple-600',
      description: 'Add new client to your portfolio'
    },
    {
      id: 'add-contract',
      label: 'New Contract',
      icon: <FileText className="h-4 w-4" />,
      action: () => setLocation('/contracts'),
      color: 'bg-blue-500 hover:bg-blue-600',
      description: 'Upload representation agreement'
    },
    {
      id: 'schedule-showing',
      label: 'Schedule Showing',
      icon: <Calendar className="h-4 w-4" />,
      action: () => setLocation('/showing-tracker'),
      color: 'bg-orange-500 hover:bg-orange-600',
      description: 'Schedule property showing'
    },
    {
      id: 'check-alerts',
      label: 'Check Alerts',
      icon: <AlertTriangle className="h-4 w-4" />,
      action: () => setLocation('/alerts'),
      color: 'bg-red-500 hover:bg-red-600',
      description: 'Review breach alerts'
    },
    {
      id: 'search-records',
      label: 'Search Records',
      icon: <Search className="h-4 w-4" />,
      action: () => setLocation('/public-records'),
      color: 'bg-teal-500 hover:bg-teal-600',
      description: 'Monitor public records'
    },
    {
      id: 'ai-analysis',
      label: 'AI Analysis',
      icon: <Brain className="h-4 w-4" />,
      action: () => setLocation('/commission-intelligence'),
      color: 'bg-violet-500 hover:bg-violet-600',
      description: 'Get AI-powered insights'
    },
    {
      id: 'view-reports',
      label: 'Reports',
      icon: <BarChart3 className="h-4 w-4" />,
      action: () => setLocation('/reports'),
      color: 'bg-emerald-500 hover:bg-emerald-600',
      description: 'View commission reports'
    },
    {
      id: 'get-help',
      label: 'Get Help',
      icon: <HelpCircle className="h-4 w-4" />,
      action: () => onOpenHelp('dashboard'),
      color: 'bg-gray-500 hover:bg-gray-600',
      description: 'Get contextual help'
    }
  ];

  const handleActionClick = (action: QuickAction) => {
    action.action();
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-40"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="lg"
                className="rounded-full w-14 h-14 shadow-2xl bg-blue-600 hover:bg-blue-700"
                onClick={() => setIsOpen(!isOpen)}
              >
                <motion.div
                  animate={{ rotate: isOpen ? 45 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Plus className="h-6 w-6" />
                </motion.div>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Quick Actions</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </motion.div>

      {/* Quick Actions Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-30"
              onClick={() => setIsOpen(false)}
            />

            {/* Actions Grid */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="fixed bottom-24 right-6 z-40"
            >
              <Card className="w-80 shadow-2xl">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-3">
                    {quickActions.map((action, index) => (
                      <motion.div
                        key={action.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                className="w-full h-20 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                                onClick={() => handleActionClick(action)}
                              >
                                <div className={`p-2 rounded-full text-white ${action.color} transition-colors`}>
                                  {action.icon}
                                </div>
                                <span className="text-xs font-medium text-center leading-tight">
                                  {action.label}
                                </span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="left">
                              <p>{action.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}