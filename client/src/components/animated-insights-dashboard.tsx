import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
  LineChart
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
}

function MetricCard({ title, value, change, icon, color, formatter, delay = 0 }: MetricCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ 
        scale: 1.02, 
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        transition: { duration: 0.2 }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
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
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, backgroundColor: "rgba(0,0,0,0.02)" }}
              className="p-4 border rounded-lg cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {activity.type === 'breach' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                    {activity.type === 'contract' && <FileText className="h-4 w-4 text-blue-500" />}
                    {activity.type === 'showing' && <Calendar className="h-4 w-4 text-green-500" />}
                    {activity.type === 'alert' && <Shield className="h-4 w-4 text-orange-500" />}
                    
                    <span className="font-medium text-gray-900">{activity.title}</span>
                    
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
                  
                  <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                  
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

  const { data: dashboardStats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    refetchInterval: 30000,
  });

  const { data: alerts } = useQuery({
    queryKey: ["/api/alerts"],
  });

  const { data: contracts } = useQuery({
    queryKey: ["/api/contracts"],
  });

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
    <div className="p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Insights Dashboard</h1>
          <p className="text-gray-600 mt-1">Real-time analytics and commission protection insights</p>
        </div>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button variant="outline" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Export Report
          </Button>
        </motion.div>
      </motion.div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Active Contracts"
          value={dashboardStats?.activeContracts || 0}
          change={12}
          icon={<FileText className="h-6 w-6 text-white" />}
          color="bg-blue-500/10 text-blue-600"
          delay={0}
        />
        
        <MetricCard
          title="Protected Commission"
          value={125000}
          change={8}
          icon={<DollarSign className="h-6 w-6 text-white" />}
          color="bg-green-500/10 text-green-600"
          formatter={formatCurrency}
          delay={0.1}
        />
        
        <MetricCard
          title="Potential Breaches"
          value={dashboardStats?.potentialBreaches || 0}
          change={-15}
          icon={<AlertTriangle className="h-6 w-6 text-white" />}
          color="bg-red-500/10 text-red-600"
          delay={0.2}
        />
        
        <MetricCard
          title="Active Clients"
          value={24}
          change={5}
          icon={<Users className="h-6 w-6 text-white" />}
          color="bg-purple-500/10 text-purple-600"
          delay={0.3}
        />
      </div>

      {/* Performance Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
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
                transition={{ duration: 1.5, delay: 0.8 }}
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
                transition={{ duration: 1.5, delay: 1 }}
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
                transition={{ duration: 1.5, delay: 1.2 }}
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
              <ProgressRing
                percentage={85}
                size={80}
                strokeWidth={6}
                color="#10b981"
                label="Secured Deals"
                delay={0.5}
              />
              
              <ProgressRing
                percentage={92}
                size={80}
                strokeWidth={6}
                color="#3b82f6"
                label="Client Satisfaction"
                delay={0.7}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Activity Feed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
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
              <h3 className="font-semibold mb-2">Start Protection</h3>
              <p className="text-sm text-gray-600">Create new commission protection record</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02, y: -5 }} 
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-green-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardContent className="p-6 text-center relative z-10">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
              >
                <FileText className="h-8 w-8 text-green-600 mx-auto mb-3" />
              </motion.div>
              <h3 className="font-semibold mb-2">New Contract</h3>
              <p className="text-sm text-gray-600">Upload representation agreement</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02, y: -5 }} 
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
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

      {/* Floating Action Notifications */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.8, x: 100 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.8, x: 100 }}
          transition={{ duration: 0.5, delay: 2 }}
          className="fixed bottom-6 right-6 z-50"
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
            className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-blue-500 max-w-sm"
          >
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Activity className="h-5 w-5 text-blue-600" />
              </motion.div>
              <div>
                <p className="text-sm font-medium text-gray-900">Live Monitoring Active</p>
                <p className="text-xs text-gray-600">Commission protection is running</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}