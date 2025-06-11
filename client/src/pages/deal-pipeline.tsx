import { useState } from "react";
import Navbar from "@/components/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  DollarSign, 
  TrendingUp, 
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Target,
  BarChart3,
  Users,
  Home,
  Plus,
  Edit,
  Eye
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function DealPipeline() {
  const [newDeal, setNewDeal] = useState({
    clientName: "",
    propertyAddress: "",
    dealValue: "",
    commissionRate: "3",
    stage: "lead",
    expectedCloseDate: ""
  });

  // Get contracts data to populate pipeline
  const { data: contracts = [] } = useQuery({
    queryKey: ["/api/contracts"]
  });

  const pipelineStages = [
    { id: "lead", name: "Lead", color: "bg-gray-100 text-gray-800", icon: Users },
    { id: "showing", name: "Showing", color: "bg-blue-100 text-blue-800", icon: Home },
    { id: "offer", name: "Offer Made", color: "bg-yellow-100 text-yellow-800", icon: Edit },
    { id: "negotiation", name: "Negotiation", color: "bg-orange-100 text-orange-800", icon: TrendingUp },
    { id: "contract", name: "Under Contract", color: "bg-purple-100 text-purple-800", icon: CheckCircle },
    { id: "closing", name: "Closing", color: "bg-green-100 text-green-800", icon: DollarSign }
  ];

  // Convert contracts to pipeline deals
  const pipelineDeals = contracts.map((contract: any) => ({
    id: contract.id,
    clientName: contract.client?.fullName || 'Unknown Client',
    propertyAddress: contract.propertyAddress || 'Property Address TBD',
    dealValue: 450000 + (contract.id * 50000), // Sample calculation
    commissionRate: 3,
    stage: contract.status === 'active' ? 'contract' : contract.status === 'pending' ? 'negotiation' : 'lead',
    expectedCloseDate: contract.endDate,
    daysInStage: Math.floor(Math.random() * 30) + 1,
    probability: contract.status === 'active' ? 85 : contract.status === 'pending' ? 60 : 30
  }));

  const calculateStageStats = () => {
    const stageStats = pipelineStages.map(stage => {
      const dealsInStage = pipelineDeals.filter(deal => deal.stage === stage.id);
      const totalValue = dealsInStage.reduce((sum, deal) => sum + deal.dealValue, 0);
      const avgProbability = dealsInStage.length > 0 
        ? dealsInStage.reduce((sum, deal) => sum + deal.probability, 0) / dealsInStage.length 
        : 0;
      
      return {
        ...stage,
        count: dealsInStage.length,
        totalValue,
        avgProbability,
        deals: dealsInStage
      };
    });
    
    return stageStats;
  };

  const stageStats = calculateStageStats();
  
  const totalPipelineValue = pipelineDeals.reduce((sum, deal) => sum + deal.dealValue, 0);
  const weightedPipelineValue = pipelineDeals.reduce((sum, deal) => sum + (deal.dealValue * deal.probability / 100), 0);
  const totalCommissionPotential = pipelineDeals.reduce((sum, deal) => sum + (deal.dealValue * deal.commissionRate / 100), 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Deal Pipeline</h1>
          <p className="text-gray-600 mt-2">
            Track your deals from lead to closing and forecast your commission income
          </p>
        </div>

        {/* Pipeline Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Pipeline</p>
                  <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalPipelineValue)}</p>
                </div>
                <Target className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Weighted Value</p>
                  <p className="text-3xl font-bold text-green-600">{formatCurrency(weightedPipelineValue)}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Commission Potential</p>
                  <p className="text-3xl font-bold text-purple-600">{formatCurrency(totalCommissionPotential)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Active Deals</p>
                  <p className="text-3xl font-bold text-orange-600">{pipelineDeals.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pipeline Stages */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Pipeline by Stage</CardTitle>
            <CardDescription>
              Track deals through each stage of your sales process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {stageStats.map((stage) => (
                <div key={stage.id} className="text-center">
                  <div className={`p-4 rounded-lg ${stage.color} mb-2`}>
                    <stage.icon className="h-6 w-6 mx-auto mb-2" />
                    <div className="font-medium">{stage.name}</div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="font-medium">{stage.count} deals</div>
                    <div>{formatCurrency(stage.totalValue)}</div>
                    <div>{Math.round(stage.avgProbability)}% avg</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Deal Details */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Deals</TabsTrigger>
            <TabsTrigger value="hot">Hot Leads</TabsTrigger>
            <TabsTrigger value="closing">Closing Soon</TabsTrigger>
            <TabsTrigger value="forecast">Forecast</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Deal Details</CardTitle>
                <CardDescription>
                  All deals in your current pipeline
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pipelineDeals.map((deal) => (
                    <div key={deal.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div>
                            <h4 className="font-medium">{deal.clientName}</h4>
                            <p className="text-sm text-gray-600">{deal.propertyAddress}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(deal.dealValue)}</div>
                          <div className="text-sm text-gray-600">{deal.commissionRate}% commission</div>
                        </div>
                        
                        <div className="text-center">
                          <Badge className={stageStats.find(s => s.id === deal.stage)?.color}>
                            {stageStats.find(s => s.id === deal.stage)?.name}
                          </Badge>
                          <div className="text-xs text-gray-500 mt-1">{deal.daysInStage} days</div>
                        </div>
                        
                        <div className="text-center min-w-[80px]">
                          <div className="font-medium text-green-600">{deal.probability}%</div>
                          <Progress value={deal.probability} className="w-16 h-2" />
                        </div>
                        
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {pipelineDeals.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <h3 className="font-medium mb-2">No deals in pipeline</h3>
                      <p className="text-sm">Create your first contract to start tracking deals</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hot" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Hot Leads</CardTitle>
                <CardDescription>
                  Deals with high probability of closing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pipelineDeals
                    .filter(deal => deal.probability >= 70)
                    .map((deal) => (
                      <div key={deal.id} className="flex items-center justify-between p-4 border border-green-200 bg-green-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-green-900">{deal.clientName}</h4>
                          <p className="text-sm text-green-700">{deal.propertyAddress}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-green-900">{formatCurrency(deal.dealValue)}</div>
                          <div className="text-sm text-green-700">{deal.probability}% probability</div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="closing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Closing Soon</CardTitle>
                <CardDescription>
                  Deals expected to close within 30 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pipelineDeals
                    .filter(deal => deal.stage === 'contract' || deal.stage === 'closing')
                    .map((deal) => (
                      <div key={deal.id} className="flex items-center justify-between p-4 border border-blue-200 bg-blue-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-blue-900">{deal.clientName}</h4>
                          <p className="text-sm text-blue-700">{deal.propertyAddress}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-blue-900">{formatCurrency(deal.dealValue * deal.commissionRate / 100)}</div>
                          <div className="text-sm text-blue-700">Expected commission</div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forecast" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Forecast</CardTitle>
                <CardDescription>
                  Projected commission income based on current pipeline
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {formatCurrency(weightedPipelineValue * 0.03)}
                    </div>
                    <div className="text-sm text-green-700">Expected Commission (3%)</div>
                  </div>
                  
                  <div className="text-center p-6 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {Math.round(pipelineDeals.filter(d => d.probability >= 70).length)}
                    </div>
                    <div className="text-sm text-blue-700">Likely Closings</div>
                  </div>
                  
                  <div className="text-center p-6 bg-purple-50 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {Math.round(pipelineDeals.reduce((sum, deal) => sum + deal.probability, 0) / pipelineDeals.length || 0)}%
                    </div>
                    <div className="text-sm text-purple-700">Average Probability</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}