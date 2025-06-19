import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, BookOpen, Video, MessageCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface HelpContent {
  title: string;
  description: string;
  steps: string[];
  tips: string[];
  relatedLinks: { text: string; url: string }[];
}

const helpContent: Record<string, HelpContent> = {
  dashboard: {
    title: 'Dashboard Overview',
    description: 'Your commission protection command center with real-time insights and quick actions.',
    steps: [
      'Review active contracts and expiration dates',
      'Check potential breach alerts in red widget',
      'Monitor client activity in the activity stream',
      'Use quick action cards for common tasks'
    ],
    tips: [
      'Click any widget to navigate to detailed view',
      'Set up alerts for contracts expiring in 30 days',
      'Review activity stream daily for early warnings'
    ],
    relatedLinks: [
      { text: 'Commission Protection Guide', url: '/support?tab=real-estate' },
      { text: 'Alert Management', url: '/alerts' }
    ]
  },
  clients: {
    title: 'Client Management',
    description: 'Manage client relationships and track representation agreements to prevent commission losses.',
    steps: [
      'Add new clients with complete contact information',
      'Upload representation agreements for each client',
      'Track client communication and property interests',
      'Monitor client activity for potential red flags'
    ],
    tips: [
      'Always document first client contact date',
      'Keep detailed notes of property showings',
      'Update client status regularly',
      'Set reminders for contract renewals'
    ],
    relatedLinks: [
      { text: 'Contract Templates', url: '/contracts' },
      { text: 'Legal Support', url: '/support?tab=legal' }
    ]
  },
  contracts: {
    title: 'Contract Protection',
    description: 'AI-powered contract analysis and monitoring to strengthen your commission protection.',
    steps: [
      'Upload representation agreements in PDF format',
      'Review AI analysis for potential weaknesses',
      'Set up automatic expiration reminders',
      'Track contract compliance and amendments'
    ],
    tips: [
      'Use exclusive representation agreements when possible',
      'Include specific commission terms and percentages',
      'Document all contract modifications',
      'Keep originals and signed copies secure'
    ],
    relatedLinks: [
      { text: 'Contract Templates', url: '/support?tab=legal' },
      { text: 'AI Contract Analysis', url: '/commission-intelligence' }
    ]
  },
  showings: {
    title: 'Showing Tracker',
    description: 'Document all client interactions and property visits to build a strong representation trail.',
    steps: [
      'Schedule showings with date, time, and property details',
      'Mark showings as completed or missed after visits',
      'Add notes about client reactions and interests',
      'Track follow-up communications'
    ],
    tips: [
      'Always confirm showings 24 hours in advance',
      'Document client preferences and feedback',
      'Take photos of client at properties when appropriate',
      'Follow up within 24 hours of each showing'
    ],
    relatedLinks: [
      { text: 'ShowingTime Integration', url: '/showing-tracker' },
      { text: 'SMS Reminders Setup', url: '/support?tab=it' }
    ]
  },
  alerts: {
    title: 'Breach Detection',
    description: 'Advanced monitoring system to detect potential commission breaches before they happen.',
    steps: [
      'Review high-priority alerts immediately',
      'Investigate suspicious client activity',
      'Contact clients about potential concerns',
      'Document all follow-up actions taken'
    ],
    tips: [
      'Respond to high-priority alerts within 2 hours',
      'Keep detailed records of all communications',
      'Use legal support for serious breach concerns',
      'Set up SMS notifications for urgent alerts'
    ],
    relatedLinks: [
      { text: 'Public Records Monitor', url: '/public-records' },
      { text: 'Legal Support', url: '/support?tab=legal' }
    ]
  }
};

interface ContextualHelpProps {
  isOpen: boolean;
  onClose: () => void;
  context: string;
}

export function ContextualHelp({ isOpen, onClose, context }: ContextualHelpProps) {
  const [content, setContent] = useState<HelpContent | null>(null);

  useEffect(() => {
    if (isOpen && context && helpContent[context]) {
      setContent(helpContent[context]);
    }
  }, [isOpen, context]);

  if (!isOpen || !content) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-2xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="shadow-2xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <HelpCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{content.title}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{content.description}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="max-h-[60vh] overflow-y-auto">
              <Tabs defaultValue="guide" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="guide">Step-by-Step</TabsTrigger>
                  <TabsTrigger value="tips">Pro Tips</TabsTrigger>
                  <TabsTrigger value="resources">Resources</TabsTrigger>
                </TabsList>
                
                <TabsContent value="guide" className="space-y-4 mt-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      How to Use This Feature
                    </h3>
                    <div className="space-y-3">
                      {content.steps.map((step, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <Badge variant="outline" className="mt-0.5 text-xs">
                            {index + 1}
                          </Badge>
                          <p className="text-sm text-gray-700 flex-1">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="tips" className="space-y-4 mt-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      Expert Tips
                    </h3>
                    <div className="space-y-3">
                      {content.tips.map((tip, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                          <p className="text-sm text-gray-700">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="resources" className="space-y-4 mt-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Related Resources
                    </h3>
                    <div className="space-y-2">
                      {content.relatedLinks.map((link, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          className="w-full justify-start h-auto p-3"
                          onClick={() => {
                            window.location.href = link.url;
                            onClose();
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <ExternalLink className="h-4 w-4 text-blue-600" />
                            <span className="text-sm">{link.text}</span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        window.location.href = '/support';
                        onClose();
                      }}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Contact Support Team
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}