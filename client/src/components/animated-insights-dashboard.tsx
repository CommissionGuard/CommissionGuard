import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  HouseLoadingAnimation, 
  KeyLoadingAnimation,
  PropertySearchAnimation,
  CommissionProtectionAnimation,
  ClientLoadingAnimation,
  ContractLoadingAnimation,
  MoneyLoadingAnimation,
  ShowingLoadingAnimation,
  PropertyCardSkeleton,
  FloatingHouse,
  FloatingKey,
  FloatingDollar,
  ButtonSpinner
} from "@/components/ui/loading-animations";

import { OnboardingTour } from '@/components/onboarding-tour';
import { ContextualHelp } from '@/components/contextual-help';
import { QuickActionsPanel } from '@/components/quick-actions-panel';
import { HelpButton } from '@/components/help-button';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  Users,
  FileText,
  Clock,
  Shield,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Bell,
  Search,
  Home,
  HelpCircle,
  Brain
} from "lucide-react";

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  formatter?: (value: number) => string;
}

function AnimatedCounter({ end, duration = 2, prefix = "", suffix = "", formatter }: AnimatedCounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = Math.floor(easeOutQuart * end);
      
      setCount(currentCount);
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  const displayValue = formatter ? formatter(count) : count.toString();
  return <span>{prefix}{displayValue}{suffix}</span>;
}

interface MetricCardProps {
  title: string;
  value: number;
  change?: number;
  icon: React.ReactNode;
  color: string;
  formatter?: (value: number) => string;
  delay?: number;
  onClick?: () => void;
}

function MetricCard({ title, value, change, icon, color, formatter, delay = 0, onClick }: MetricCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ 
        scale: 1.05, 
        y: -4,
        boxShadow: "0 12px 30px rgba(0,0,0,0.15)",
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      whileTap={{ 
        scale: 0.98,
        transition: { duration: 0.1 }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
    >
      <Card className="relative overflow-hidden cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <div className="text-3xl font-bold text-gray-900">
                <AnimatedCounter 
                  end={value} 
                  formatter={formatter}
                  duration={1.5}
                />
              </div>
              {change !== undefined && (
                <motion.div 
                  className="flex items-center space-x-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  {change > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ${
                    change > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {Math.abs(change)}%
                  </span>
                </motion.div>
              )}
            </div>
            
            <motion.div
              className={`p-3 rounded-full ${color}`}
              animate={{ 
                rotate: isHovered ? 360 : 0,
                scale: isHovered ? 1.1 : 1
              }}
              transition={{ duration: 0.3 }}
            >
              {icon}
            </motion.div>
          </div>
        </CardContent>
        
        <motion.div
          className={`absolute bottom-0 left-0 h-1 ${color.replace('bg-', 'bg-').replace('/10', '')}`}
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 1, delay: delay + 0.5 }}
        />
      </Card>
    </motion.div>
  );
}

interface ActivityItem {
  id: string;
  type: 'breach' | 'contract' | 'showing' | 'alert';
  title: string;
  description: string;
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
}

function ActivityFeed({ activities }: { activities: ActivityItem[] }) {
  const [, setLocation] = useLocation();
  
  const handleActivityClick = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'breach':
        setLocation("/alerts");
        break;
      case 'contract':
        setLocation("/contracts");
        break;
      case 'showing':
        setLocation("/showing-tracker");
        break;
      case 'alert':
        setLocation("/alerts");
        break;
      default:
        break;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className="space-y-4"
    >
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <Activity className="h-5 w-5" />
        Recent Activity
      </h3>
      
      <div className="space-y-3 max-h-96 overflow-y-auto overflow-x-hidden">
        <AnimatePresence>
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ 
                scale: 1.02, 
                x: 4,
                backgroundColor: "rgba(59, 130, 246, 0.03)",
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.98 }}
              className="p-4 border rounded-lg cursor-pointer transition-colors"
              onClick={() => handleActivityClick(activity)}
            >
              <div className="w-full">
                <div className="w-full">
                  <div className="flex items-start gap-2 mb-1 flex-wrap">
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {activity.type === 'breach' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                      {activity.type === 'contract' && <FileText className="h-4 w-4 text-blue-500" />}
                      {activity.type === 'showing' && <Calendar className="h-4 w-4 text-green-500" />}
                      {activity.type === 'alert' && <Shield className="h-4 w-4 text-orange-500" />}
                      
                      <span className="font-medium text-gray-900 break-words">{activity.title}</span>
                    </div>
                    
                    <TooltipProvider delayDuration={0} skipDelayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="inline-block cursor-help flex-shrink-0">
                            <Badge 
                              variant={
                                activity.priority === 'high' ? 'destructive' : 
                                activity.priority === 'medium' ? 'default' : 'secondary'
                              }
                              className="text-xs"
                            >
                              {activity.priority}
                            </Badge>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" align="center" sideOffset={5}>
                          <p className="max-w-xs text-sm">
                            {activity.priority === 'high' && 'Urgent attention required - immediate action needed to prevent commission loss'}
                            {activity.priority === 'medium' && 'Important notification - review and take action within 24 hours'}
                            {activity.priority === 'low' && 'General information - review when convenient for awareness'}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2 break-words">{activity.description}</p>
                  
                  <p className="text-xs text-gray-400">{activity.timestamp}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

interface ProgressRingProps {
  percentage: number;
  size: number;
  strokeWidth: number;
  color: string;
  label: string;
  delay?: number;
}

function ProgressRing({ percentage, size, strokeWidth, color, label, delay = 0 }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <motion.div 
      className="flex flex-col items-center space-y-2"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
    >
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-gray-200"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
            initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, delay: delay + 0.5, ease: "easeOut" }}
            style={{ strokeDasharray: circumference }}
          />
        </svg>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span 
            className="text-lg font-bold text-gray-900"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 1 }}
          >
            <AnimatedCounter end={percentage} suffix="%" duration={1.5} />
          </motion.span>
        </div>
      </div>
      
      <span className="text-sm font-medium text-gray-600 text-center">{label}</span>
    </motion.div>
  );
}

export default function AnimatedInsightsDashboard() {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [location, setLocation] = useLocation();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [helpContext, setHelpContext] = useState('');
  const [hasCheckedOnboarding, setHasCheckedOnboarding] = useState(false);

  // Function to restart onboarding tour
  const restartOnboarding = () => {
    setShowOnboarding(true);
  };

  // Add global function and event listener for restarting onboarding
  useEffect(() => {
    const handleRestartOnboarding = () => {
      setShowOnboarding(true);
    };

    // Make function globally accessible
    (window as any).restartOnboarding = handleRestartOnboarding;
    
    // Add event listener for custom event
    window.addEventListener('restart-onboarding', handleRestartOnboarding);

    return () => {
      window.removeEventListener('restart-onboarding', handleRestartOnboarding);
      delete (window as any).restartOnboarding;
    };
  }, []);

  const { data: dashboardStats, isLoading } = useQuery<{
    activeContracts: number;
    expiringSoon: number;
    potentialBreaches: number;
    protectedCommission: number;
  }>({
    queryKey: ["/api/dashboard/stats"],
    refetchInterval: 30000,
  });

  const { data: alerts } = useQuery({
    queryKey: ["/api/alerts"],
  });

  const { data: contracts } = useQuery({
    queryKey: ["/api/contracts"],
  });

  const { data: clients } = useQuery({
    queryKey: ["/api/clients"],
  });

  const { data: onboardingStatus } = useQuery({
    queryKey: ["/api/auth/onboarding-status"],
  });

  const handleCardClick = (cardTitle: string) => {
    switch (cardTitle) {
      case "Active Contracts":
        setLocation("/contracts");
        break;
      case "Protected Commission":
        setLocation("/commission-tracker");
        break;
      case "Potential Breaches":
        setLocation("/breach-management");
        break;
      case "Active Clients":
        setLocation("/clients");
        break;
      default:
        break;
    }
  };



  // Check if user should see onboarding tour on first load
  useEffect(() => {
    if (onboardingStatus && !hasCheckedOnboarding) {
      setHasCheckedOnboarding(true);
      
      // Show onboarding tour only if not completed
      if (!onboardingStatus?.onboardingCompleted) {
        const timer = setTimeout(() => {
          setShowOnboarding(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [onboardingStatus, hasCheckedOnboarding]);

  const handleOnboardingComplete = async () => {
    setShowOnboarding(false);
    
    // Mark onboarding as completed in the database
    try {
      const response = await fetch("/api/auth/complete-onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to mark onboarding as completed");
      }
    } catch (error) {
      console.error("Error marking onboarding as completed:", error);
    }
  };

  const handleOpenHelp = (context: string) => {
    setHelpContext(context);
    setShowHelp(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const sampleActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'breach',
      title: 'Potential Breach Detected',
      description: 'Client Sarah Johnson may have purchased through unauthorized agent',
      timestamp: '2 hours ago',
      priority: 'high'
    },
    {
      id: '2',
      type: 'contract',
      title: 'Contract Expiring Soon',
      description: 'Exclusive representation agreement expires in 7 days',
      timestamp: '4 hours ago',
      priority: 'medium'
    },
    {
      id: '3',
      type: 'showing',
      title: 'Showing Completed',
      description: 'Property viewing at 123 Main St marked as completed',
      timestamp: '6 hours ago',
      priority: 'low'
    },
    {
      id: '4',
      type: 'alert',
      title: 'New Alert Generated',
      description: 'Commission protection alert for high-value property',
      timestamp: '1 day ago',
      priority: 'medium'
    }
  ];

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="h-24 bg-gray-200 rounded-lg"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <div data-tour-id="dashboard-header">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Commission Protection Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Protect your commissions and track your success</p>
          </div>
          
          <div className="flex items-center gap-3">
            <HelpButton onStartTour={() => setShowOnboarding(true)} />
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button variant="outline" className="flex items-center gap-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                <BarChart3 className="h-4 w-4" />
                Export Report
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Success Pathway Guide */}
        {Array.isArray(clients) && clients.length === 0 && (
          <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200"
        >
          <div className="flex items-center mb-4">
            <Shield className="h-6 w-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Start Protecting Your Commissions</h2>
          </div>
          <p className="text-gray-600 mb-6">Follow these simple steps to secure your commissions and prevent client ghosting:</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <div className="flex items-center mb-3">
                <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-semibold text-sm">1</span>
                </div>
                <h3 className="font-semibold text-gray-900">Add Your Clients</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">Start by adding your clients to track their information and activity</p>
              <Button 
                size="sm" 
                className="w-full"
                onClick={() => setLocation("/clients")}
              >
                Add First Client
              </Button>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <div className="flex items-center mb-3">
                <div className="bg-green-100 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                  <span className="text-green-600 font-semibold text-sm">2</span>
                </div>
                <h3 className="font-semibold text-gray-900">Upload Contracts</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">Upload your exclusive representation agreements for AI analysis</p>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full"
                onClick={() => setLocation("/contracts")}
              >
                Add Contract
              </Button>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <div className="flex items-center mb-3">
                <div className="bg-purple-100 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                  <span className="text-purple-600 font-semibold text-sm">3</span>
                </div>
                <h3 className="font-semibold text-gray-900">Track Showings</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">Record property visits to build protection evidence</p>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full"
                onClick={() => setLocation("/showing-tracker")}
              >
                Schedule Showing
              </Button>
            </div>
            </div>
          </motion.div>
        )}

        {/* All Widgets - Unified Format */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Active Clients Widget */}
          <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0 }}
                whileHover={{ y: -2, scale: 1.02 }}
                className="bg-gradient-to-r from-white to-purple-200 rounded-xl p-4 border border-purple-200 cursor-pointer group"
                onClick={() => handleCardClick("Active Clients")}
                data-tour-id="clients-widget"
              >
                <div className="flex items-center justify-between mb-3">
                  <motion.div
                    className="bg-purple-100 rounded-full p-2"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Users className="h-5 w-5 text-purple-600" />
                  </motion.div>
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                    className="opacity-20"
                    style={{ filter: 'drop-shadow(0 0 1px black)' }}
                  >
                    <Users className="h-8 w-8 text-black" />
                  </motion.div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Active Clients</h3>
                <p className="text-sm text-gray-600 mb-3">Client relationships</p>
                <div className="text-2xl font-bold text-purple-600 mb-1">{Array.isArray(clients) ? clients.length : 0}</div>
                <div className="text-xs text-gray-500">+5% this month</div>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Click to view and manage your client relationships</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Active Contracts Widget */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                whileHover={{ y: -2, scale: 1.02 }}
                className="bg-gradient-to-r from-white to-blue-200 rounded-xl p-4 border border-blue-200 cursor-pointer group"
                onClick={() => handleCardClick("Active Contracts")}
                data-tour-id="contracts-widget"
              >
                <div className="flex items-center justify-between mb-3">
                  <motion.div
                    className="bg-blue-100 rounded-full p-2"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FileText className="h-5 w-5 text-blue-600" />
                  </motion.div>
                  <motion.div
                    animate={{ 
                      rotateY: [0, 180, 360],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 4, repeat: Infinity, repeatDelay: 1 }}
                    className="opacity-20"
                    style={{ filter: 'drop-shadow(0 0 1px black)' }}
                  >
                    <FileText className="h-8 w-8 text-black" />
                  </motion.div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Active Contracts</h3>
                <p className="text-sm text-gray-600 mb-3">Representation agreements</p>
                <div className="text-2xl font-bold text-blue-600 mb-1">{(dashboardStats as any)?.activeContracts || 0}</div>
                <div className="text-xs text-gray-500">+12% this month</div>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Your exclusive representation agreements being monitored</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Showing Tracker Quick Access */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ y: -2, scale: 1.02 }}
                className="bg-gradient-to-r from-white to-orange-200 rounded-xl p-4 border border-orange-200 cursor-pointer group"
                onClick={() => setLocation("/showing-tracker")}
                data-tour-id="showing-widget"
              >
                <div className="flex items-center justify-between mb-3">
                  <motion.div
                    className="bg-orange-100 rounded-full p-2"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Calendar className="h-5 w-5 text-orange-600" />
                  </motion.div>
                  <motion.div
                    animate={{ 
                      rotate: [0, -10, 10, 0],
                      scale: [1, 1.15, 1]
                    }}
                    transition={{ 
                      rotate: { duration: 2, repeat: Infinity, repeatDelay: 2 },
                      scale: { duration: 1.5, repeat: Infinity, repeatDelay: 3 }
                    }}
                    className="opacity-20"
                    style={{ filter: 'drop-shadow(0 0 1px black)' }}
                  >
                    <Clock className="h-8 w-8 text-black" />
                  </motion.div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Showings</h3>
                <p className="text-sm text-gray-600 mb-3">Schedule & track</p>
                <div className="text-2xl font-bold text-orange-600 mb-1">Quick</div>
                <div className="text-xs text-gray-500">Access tracker</div>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Schedule showings and track property visits</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Protected Commission Widget */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                whileHover={{ y: -2, scale: 1.02 }}
                className="bg-gradient-to-r from-white to-green-200 rounded-xl p-4 border border-green-200 cursor-pointer group"
                onClick={() => handleCardClick("Protected Commission")}
                data-tour-id="protected-commission-widget"
              >
                <div className="flex items-center justify-between mb-3">
                  <motion.div
                    className="bg-green-100 rounded-full p-2"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </motion.div>
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotateZ: [0, 360]
                    }}
                    transition={{ 
                      scale: { duration: 2, repeat: Infinity, repeatDelay: 2 },
                      rotateZ: { duration: 6, repeat: Infinity, ease: "linear" }
                    }}
                    className="opacity-20"
                    style={{ filter: 'drop-shadow(0 0 1px black)' }}
                  >
                    <DollarSign className="h-8 w-8 text-black" />
                  </motion.div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Protected Commission</h3>
                <p className="text-sm text-gray-600 mb-3">Secured earnings</p>
                <div className="text-2xl font-bold text-green-600 mb-1">{formatCurrency((dashboardStats as any)?.protectedCommission || 0)}</div>
                <div className="text-xs text-gray-500">+8% this month</div>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Total commission value secured with evidence</p>
            </TooltipContent>
          </Tooltip>
          </TooltipProvider>
        </div>

        {/* Second Row - Records & Market Integration */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Potential Breaches Widget */}
          <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                whileHover={{ y: -2, scale: 1.02 }}
                className="bg-gradient-to-r from-white to-red-200 rounded-xl p-4 border border-red-200 cursor-pointer group"
                onClick={() => setLocation("/alerts")}
                data-tour-id="alerts-widget"
              >
                <div className="flex items-center justify-between mb-3">
                  <motion.div
                    className="bg-red-100 rounded-full p-2"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </motion.div>
                  <motion.div
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 0.9, 1]
                    }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    className="opacity-20"
                    style={{ filter: 'drop-shadow(0 0 1px black)' }}
                  >
                    <AlertTriangle className="h-8 w-8 text-black" />
                  </motion.div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Potential Breaches</h3>
                <p className="text-sm text-gray-600 mb-3">Commission threats</p>
                <div className="text-2xl font-bold text-red-600 mb-1">{(dashboardStats as any)?.potentialBreaches || 0}</div>
                <div className="text-xs text-gray-500">-15% this month</div>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Warning signs of possible commission threats</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Public Records Monitoring Widget */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                whileHover={{ y: -2, scale: 1.02 }}
                className="bg-gradient-to-r from-white to-indigo-200 rounded-xl p-4 border border-indigo-200 cursor-pointer group"
                onClick={() => setLocation("/public-records")}
                data-tour-id="records-widget"
              >
                <div className="flex items-center justify-between mb-3">
                  <motion.div
                    className="bg-indigo-100 rounded-full p-2"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Search className="h-5 w-5 text-indigo-600" />
                  </motion.div>
                  <motion.div
                    animate={{ 
                      rotate: [0, 360],
                      scale: [1, 1.15, 1]
                    }}
                    transition={{ 
                      rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                      scale: { duration: 3, repeat: Infinity, repeatDelay: 2 }
                    }}
                    className="opacity-20"
                    style={{ filter: 'drop-shadow(0 0 1px black)' }}
                  >
                    <Eye className="h-8 w-8 text-black" />
                  </motion.div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Records Monitor</h3>
                <p className="text-sm text-gray-600 mb-3">Property surveillance</p>
                <div className="text-2xl font-bold text-indigo-600 mb-1">24/7</div>
                <div className="text-xs text-gray-500">Nassau & Suffolk</div>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Monitor public records for unauthorized client transactions</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Property Research Widget */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                whileHover={{ y: -2, scale: 1.02 }}
                className="bg-gradient-to-r from-white to-violet-200 rounded-xl p-4 border border-violet-200 cursor-pointer group"
                onClick={() => setLocation("/commission-intelligence")}
                data-tour-id="commission-widget"
              >
                <div className="flex items-center justify-between mb-3">
                  <motion.div
                    className="bg-violet-100 rounded-full p-2"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Home className="h-5 w-5 text-violet-600" />
                  </motion.div>
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotateY: [0, 180, 360]
                    }}
                    transition={{ 
                      scale: { duration: 2.5, repeat: Infinity, repeatDelay: 2 },
                      rotateY: { duration: 4, repeat: Infinity, repeatDelay: 1 }
                    }}
                    className="opacity-20"
                    style={{ filter: 'drop-shadow(0 0 1px black)' }}
                  >
                    <MapPin className="h-8 w-8 text-black" />
                  </motion.div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Research</h3>
                <p className="text-sm text-gray-600 mb-3">Property intelligence</p>
                <div className="text-2xl font-bold text-violet-600 mb-1">AI</div>
                <div className="text-xs text-gray-500">Powered analysis</div>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Research properties with AI-powered market insights</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Market Analysis Widget */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                whileHover={{ y: -2, scale: 1.02 }}
                className="bg-gradient-to-r from-white to-emerald-200 rounded-xl p-4 border border-emerald-200 cursor-pointer group"
                onClick={() => setLocation("/reports")}
                data-tour-id="reports-widget"
              >
                <div className="flex items-center justify-between mb-3">
                  <motion.div
                    className="bg-emerald-100 rounded-full p-2"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                  </motion.div>
                  <motion.div
                    animate={{ 
                      y: [0, -3, 0],
                      rotateX: [0, 180, 360]
                    }}
                    transition={{ 
                      y: { duration: 2, repeat: Infinity, repeatDelay: 1 },
                      rotateX: { duration: 5, repeat: Infinity, repeatDelay: 3 }
                    }}
                    className="opacity-20"
                    style={{ filter: 'drop-shadow(0 0 1px black)' }}
                  >
                    <BarChart3 className="h-8 w-8 text-black" />
                  </motion.div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Commission Reports</h3>
                <p className="text-sm text-gray-600 mb-3">Analysis & insights</p>
                <div className="text-2xl font-bold text-emerald-600 mb-1">Live</div>
                <div className="text-xs text-gray-500">Market data</div>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Access comprehensive market analysis and property trends</p>
            </TooltipContent>
          </Tooltip>
          </TooltipProvider>
        </div>

        {/* Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          data-tour-id="activity-stream"
        >
          <Card>
            <CardHeader>
              <CardTitle>Real-Time Activity Stream</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityFeed activities={sampleActivities} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Performance Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                Commission Protection Effectiveness
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Contract Compliance</span>
                  <span className="text-sm text-gray-600">94%</span>
                </div>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "94%" }}
                  transition={{ duration: 1.5, delay: 1.0 }}
                  className="h-2 bg-green-500 rounded-full"
                  style={{ width: "94%" }}
                />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Breach Prevention</span>
                  <span className="text-sm text-gray-600">87%</span>
                </div>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "87%" }}
                  transition={{ duration: 1.5, delay: 1.2 }}
                  className="h-2 bg-blue-500 rounded-full"
                  style={{ width: "87%" }}
                />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Client Retention</span>
                  <span className="text-sm text-gray-600">91%</span>
                </div>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "91%" }}
                  transition={{ duration: 1.5, delay: 1.4 }}
                  className="h-2 bg-purple-500 rounded-full"
                  style={{ width: "91%" }}
                />
              </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Portfolio Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <ProgressRing
                        percentage={85}
                        size={80}
                        strokeWidth={6}
                        color="#10b981"
                        label="Secured Deals"
                        delay={0.7}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="center">
                    <p className="max-w-xs text-sm">
                      Percentage of deals successfully closed with commission protection in place. 
                      This metric tracks your conversion rate for contracts under monitoring.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <ProgressRing
                        percentage={92}
                        size={80}
                        strokeWidth={6}
                        color="#3b82f6"
                        label="Client Satisfaction"
                        delay={0.9}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="center">
                    <p className="max-w-xs text-sm">
                      Client satisfaction score based on communication frequency, contract adherence, 
                      and successful deal completion. Higher scores indicate stronger client relationships.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <motion.div 
          whileHover={{ scale: 1.02, y: -5 }} 
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          onClick={() => setLocation("/support")}
        >
          <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardContent className="p-6 text-center relative z-10">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Shield className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              </motion.div>
              <h3 className="font-semibold mb-2">Legal Support</h3>
              <p className="text-sm text-gray-600">Access legal, IT, and real estate support services</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02, y: -5 }} 
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          onClick={() => setLocation("/subscription")}
        >
          <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardContent className="p-6 text-center relative z-10">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
              >
                <DollarSign className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              </motion.div>
              <h3 className="font-semibold mb-2">Subscription</h3>
              <p className="text-sm text-gray-600">Upgrade or manage your account</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02, y: -5 }} 
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          onClick={() => setLocation("/reports")}
        >
          <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardContent className="p-6 text-center relative z-10">
              <motion.div
                animate={{ rotateY: [0, 180, 360] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
              >
                <Eye className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              </motion.div>
              <h3 className="font-semibold mb-2">View Reports</h3>
              <p className="text-sm text-gray-600">Analyze protection performance</p>
            </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* User Guidance Components */}
        <OnboardingTour
          isOpen={showOnboarding}
          onClose={() => setShowOnboarding(false)}
          onComplete={handleOnboardingComplete}
        />
        
        <ContextualHelp
          isOpen={showHelp}
          onClose={() => setShowHelp(false)}
          context={helpContext}
        />
        
        <QuickActionsPanel onOpenHelp={handleOpenHelp} />

        {/* Floating Action Notifications - Side Tab */}
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5, delay: 2 }}
            className="fixed bottom-6 left-0 z-50 group"
          >
            <motion.div
            animate={{ 
              boxShadow: [
                "0 0 20px rgba(59, 130, 246, 0.5)",
                "0 0 30px rgba(59, 130, 246, 0.8)",
                "0 0 20px rgba(59, 130, 246, 0.5)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="bg-white rounded-r-lg shadow-lg border-l-4 border-blue-500 transition-all duration-300 ease-in-out cursor-pointer overflow-hidden"
          >
            {/* Collapsed State - Compact tab */}
            <motion.div 
              className="flex items-center gap-2 p-3 group-hover:hidden min-w-fit"
              initial={{ opacity: 1 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Activity className="h-4 w-4 text-blue-600" />
              </motion.div>
              <span className="text-xs font-medium text-gray-700 whitespace-nowrap">Live</span>
            </motion.div>
            
            {/* Expanded State - Full content */}
            <motion.div 
              className="hidden group-hover:flex items-center gap-3 p-4"
              initial={{ opacity: 0, width: 0 }}
              whileHover={{ opacity: 1, width: "auto" }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Activity className="h-5 w-5 text-blue-600" />
              </motion.div>
              <div className="whitespace-nowrap">
                <p className="text-sm font-medium text-gray-900">Live Monitoring Active</p>
                <p className="text-xs text-gray-600">Commission protection is running</p>
              </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
}