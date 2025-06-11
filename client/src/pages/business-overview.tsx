import Navbar from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { 
  DollarSign, 
  TrendingUp, 
  Users,
  Home,
  Shield,
  Calendar,
  Target,
  Award,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Clock
} from "lucide-react";

export default function BusinessOverview() {
  const { data: contracts = [] } = useQuery({ queryKey: ["/api/contracts"] });
  const { data: clients = [] } = useQuery({ queryKey: ["/api/clients"] });
  const { data: alerts = [] } = useQuery({ queryKey: ["/api/alerts"] });

  // Calculate business metrics from actual data
  const activeContracts = contracts.filter((c: any) => c.status === 'active').length;
  const totalClients = clients.length;
  const pendingAlerts = alerts.filter((a: any) => !a.read).length;
  
  // Estimate commission values based on contract data
  const totalCommissionValue = contracts.reduce((sum: number, contract: any) => {
    const estimatedValue = 500000; // Average property value
    const commissionRate = 0.03; // 3% commission
    return sum + (estimatedValue * commissionRate);
  }, 0);

  const protectedCommissions = activeContracts * 15000; // Protected amount per active contract

  const businessMetrics = [
    {
      title: "Active Contracts",
      value: activeContracts,
      subtitle: "Commission protection active",
      icon: Shield,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      title: "Total Clients",
      value: totalClients,
      subtitle: "Relationship management",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      title: "Protected Value",
      value: `$${protectedCommissions.toLocaleString()}`,
      subtitle: "Commission security",
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    },
    {
      title: "Active Alerts",
      value: pendingAlerts,
      subtitle: "Monitoring notifications",
      icon: AlertTriangle,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200"
    }
  ];

  const quickActions = [
    {
      title: "Analyze Market",
      description: "Research property markets and competition",
      href: "/property-analyzer",
      icon: Target,
      color: "bg-blue-600 hover:bg-blue-700"
    },
    {
      title: "Track Deals",
      description: "Monitor your sales pipeline and forecasts",
      href: "/deal-pipeline",
      icon: TrendingUp,
      color: "bg-green-600 hover:bg-green-700"
    },
    {
      title: "Manage Contracts",
      description: "Protect commissions and monitor agreements",
      href: "/contracts",
      icon: Shield,
      color: "bg-purple-600 hover:bg-purple-700"
    },
    {
      title: "Client Management",
      description: "Track client relationships and communications",
      href: "/clients",
      icon: Users,
      color: "bg-indigo-600 hover:bg-indigo-700"
    }
  ];

  const recentActivity = [
    {
      type: "contract",
      message: "New commission protection activated",
      time: "2 hours ago",
      status: "success"
    },
    {
      type: "alert",
      message: "Market analysis completed for downtown area",
      time: "4 hours ago",
      status: "info"
    },
    {
      type: "client",
      message: "Client consultation scheduled",
      time: "1 day ago",
      status: "pending"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Business Overview</h1>
          <p className="text-gray-600">
            Comprehensive dashboard for real estate commission protection and business management
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {businessMetrics.map((metric, index) => (
            <Card key={index} className={`${metric.bgColor} ${metric.borderColor} border-2 hover:shadow-lg transition-all duration-300`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                    <p className={`text-3xl font-bold ${metric.color} mt-1`}>{metric.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{metric.subtitle}</p>
                  </div>
                  <div className={`${metric.bgColor.replace('50', '100')} rounded-full p-3`}>
                    <metric.icon className={`h-6 w-6 ${metric.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Platform Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-6 text-left border-2 hover:shadow-md transition-all"
                  onClick={() => window.location.href = action.href}
                >
                  <div className="flex flex-col items-start space-y-3 w-full">
                    <div className={`${action.color} rounded-lg p-2`}>
                      <action.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{action.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400 ml-auto" />
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Business Health Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-yellow-600" />
                <span>Business Health Score</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {Math.min(100, Math.max(0, (activeContracts * 25) + (totalClients * 10) + 30))}
                </div>
                <p className="text-gray-600">Overall Performance</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Contract Protection</span>
                    <span>{Math.min(100, activeContracts * 25)}%</span>
                  </div>
                  <Progress value={Math.min(100, activeContracts * 25)} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Client Relationships</span>
                    <span>{Math.min(100, totalClients * 20)}%</span>
                  </div>
                  <Progress value={Math.min(100, totalClients * 20)} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Market Analysis</span>
                    <span>85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.status === 'success' ? 'bg-green-500' :
                      activity.status === 'info' ? 'bg-blue-500' : 'bg-yellow-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
                
                {contracts.length === 0 && clients.length === 0 && (
                  <div className="text-center py-6 text-gray-500">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No recent activity</p>
                    <p className="text-xs">Create clients and contracts to see activity here</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Features Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Commission Guard Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 border rounded-lg">
                <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Commission Protection</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Monitor representation agreements and detect potential breaches automatically
                </p>
                <Button variant="outline" size="sm" onClick={() => window.location.href = "/contracts"}>
                  Manage Contracts
                </Button>
              </div>
              
              <div className="text-center p-6 border rounded-lg">
                <Target className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Market Intelligence</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Analyze local competition, property values, and market opportunities in real-time
                </p>
                <Button variant="outline" size="sm" onClick={() => window.location.href = "/property-analyzer"}>
                  Analyze Markets
                </Button>
              </div>
              
              <div className="text-center p-6 border rounded-lg">
                <TrendingUp className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Deal Pipeline</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Track deals from lead to closing with commission forecasting and stage management
                </p>
                <Button variant="outline" size="sm" onClick={() => window.location.href = "/deal-pipeline"}>
                  View Pipeline
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}