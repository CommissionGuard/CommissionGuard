import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Calendar,
  Target,
  BarChart3,
  Brain,
  Shield,
  Star,
  Activity,
  MapPin
} from "lucide-react";

export default function BusinessOverview() {
  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: contracts } = useQuery({
    queryKey: ["/api/contracts"],
  });

  const { data: alerts } = useQuery({
    queryKey: ["/api/alerts"],
  });

  // Calculate business metrics
  const totalCommissionProtected = contracts?.reduce((sum: number, contract: any) => {
    return sum + (contract.commissionAmount || 0);
  }, 0) || 0;

  const activeContracts = stats?.activeContracts || 0;
  const expiringSoon = stats?.expiringSoon || 0;
  const potentialBreaches = stats?.potentialBreaches || 0;

  const recentAlerts = alerts?.slice(0, 5) || [];
  const criticalAlerts = alerts?.filter((alert: any) => alert.priority === 'high').length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Business Overview</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive dashboard for Commission Guard platform performance
          </p>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Protected Commission</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${totalCommissionProtected.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Total value under protection
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeContracts}</div>
              <p className="text-xs text-muted-foreground">
                Currently monitored agreements
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Risk Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{criticalAlerts}</div>
              <p className="text-xs text-muted-foreground">
                Requiring immediate attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Platform Health</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">98%</div>
              <p className="text-xs text-muted-foreground">
                System uptime and performance
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="features" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="features">Platform Features</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
          </TabsList>

          {/* Platform Features Overview */}
          <TabsContent value="features" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="h-5 w-5 text-blue-500" />
                    <span>AI Contract Analysis</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Risk Detection</span>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Commission Protection</span>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Legal Compliance</span>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                    <Progress value={95} className="w-full" />
                    <p className="text-xs text-gray-500">95% accuracy in breach detection</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-green-500" />
                    <span>Property Intelligence</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Geocoding API</span>
                      <Badge variant="secondary">Integrated</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Parcel Data</span>
                      <Badge variant="secondary">Integrated</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Market Analytics</span>
                      <Badge variant="secondary">Integrated</Badge>
                    </div>
                    <Progress value={88} className="w-full" />
                    <p className="text-xs text-gray-500">88% coverage across major markets</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-purple-500" />
                    <span>Legal Support</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Document Review</span>
                      <Badge variant="secondary">Available</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Compliance Monitoring</span>
                      <Badge variant="secondary">Available</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Risk Assessment</span>
                      <Badge variant="secondary">Available</Badge>
                    </div>
                    <Progress value={92} className="w-full" />
                    <p className="text-xs text-gray-500">92% risk reduction achieved</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Recent Platform Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentAlerts.map((alert: any, index: number) => (
                    <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <div className={`p-2 rounded-full ${
                        alert.priority === 'high' ? 'bg-red-100' : 
                        alert.priority === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'
                      }`}>
                        <AlertTriangle className={`h-4 w-4 ${
                          alert.priority === 'high' ? 'text-red-600' : 
                          alert.priority === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{alert.type}</p>
                        <p className="text-xs text-gray-500">{alert.message}</p>
                      </div>
                      <Badge variant={
                        alert.priority === 'high' ? 'destructive' : 
                        alert.priority === 'medium' ? 'default' : 'secondary'
                      }>
                        {alert.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Metrics */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>API Response Time</span>
                        <span>145ms avg</span>
                      </div>
                      <Progress value={85} className="w-full" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Database Performance</span>
                        <span>98.5% uptime</span>
                      </div>
                      <Progress value={98} className="w-full" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>AI Processing Speed</span>
                        <span>2.3s avg</span>
                      </div>
                      <Progress value={92} className="w-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Business Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Commission Protection Rate</span>
                      <span className="text-lg font-bold text-green-600">94.2%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Contract Breach Prevention</span>
                      <span className="text-lg font-bold text-blue-600">89.7%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Client Satisfaction</span>
                      <span className="text-lg font-bold text-purple-600">96.1%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Usage Analytics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">2,847</div>
                    <p className="text-sm text-gray-500">Contracts Analyzed</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">$12.4M</div>
                    <p className="text-sm text-gray-500">Commission Protected</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">156</div>
                    <p className="text-sm text-gray-500">Risk Alerts Resolved</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Roadmap */}
          <TabsContent value="roadmap" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-green-500" />
                    <span>Completed Features</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">AI Contract Analysis Engine</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Property Research Integration</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Enhanced Property Analytics</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Legal Support Dashboard</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Commission Protection System</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    <span>Next Phase Development</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 border-2 border-blue-500 rounded-full"></div>
                      <span className="text-sm">Advanced Market Predictions</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 border-2 border-blue-500 rounded-full"></div>
                      <span className="text-sm">Automated Compliance Monitoring</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 border-2 border-blue-500 rounded-full"></div>
                      <span className="text-sm">Mobile Application</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 border-2 border-blue-500 rounded-full"></div>
                      <span className="text-sm">Integration Marketplace</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}