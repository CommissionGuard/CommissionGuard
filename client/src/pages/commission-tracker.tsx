import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navbar from "@/components/navbar";
import AnimatedBackground from "@/components/animated-background";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Calculator,
  PieChart,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Target,
  BarChart3,
  Receipt,
  Wallet
} from "lucide-react";

export default function CommissionTracker() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [calculatorData, setCalculatorData] = useState({
    salePrice: "",
    commissionRate: "3",
    splitRate: "50",
    brokerageFee: "0",
    transactionFee: "0"
  });

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-32 w-32 border-4 border-gray-200"></div>
            <div className="animate-spin rounded-full h-32 w-32 border-4 border-primary border-t-transparent absolute top-0"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Calculator className="h-8 w-8 text-primary animate-pulse" />
            </div>
          </div>
          <p className="mt-6 text-gray-700 font-medium">Loading commission tracker...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const calculateCommission = () => {
    const salePrice = parseFloat(calculatorData.salePrice) || 0;
    const commissionRate = parseFloat(calculatorData.commissionRate) || 0;
    const splitRate = parseFloat(calculatorData.splitRate) || 0;
    const brokerageFee = parseFloat(calculatorData.brokerageFee) || 0;
    const transactionFee = parseFloat(calculatorData.transactionFee) || 0;

    const grossCommission = salePrice * (commissionRate / 100);
    const agentSplit = grossCommission * (splitRate / 100);
    const netCommission = agentSplit - brokerageFee - transactionFee;

    return {
      salePrice,
      grossCommission,
      agentSplit,
      netCommission,
      brokerageFee,
      transactionFee
    };
  };

  const calculations = calculateCommission();

  const commissionData = {
    totalEarned: 284750,
    pendingCommissions: 52300,
    protectedAmount: 337050,
    averageCommission: 8950,
    monthlyGrowth: 15.2,
    yearToDate: 178250
  };

  const recentTransactions = [
    { id: 1, client: "Sarah Johnson", property: "123 Main St", amount: 12500, status: "Paid", date: "2024-01-15", type: "Buyer" },
    { id: 2, client: "Mike Chen", property: "456 Oak Ave", amount: 18750, status: "Pending", date: "2024-01-20", type: "Seller" },
    { id: 3, client: "Lisa Rodriguez", property: "789 Pine Rd", amount: 9200, status: "Protected", date: "2024-01-25", type: "Buyer" },
    { id: 4, client: "David Wilson", property: "321 Elm St", amount: 15600, status: "Paid", date: "2024-01-28", type: "Seller" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 relative">
      <AnimatedBackground />
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-xl shadow-lg">
              <DollarSign className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Commission Tracker & Calculator
              </h1>
              <p className="text-gray-600 mt-1">Track earnings, calculate commissions, and monitor your financial performance</p>
            </div>
          </div>
        </div>

        {/* Commission Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-700 text-sm font-medium">Total Earned</p>
                  <p className="text-3xl font-bold text-green-900 mt-1">${commissionData.totalEarned.toLocaleString()}</p>
                </div>
                <div className="bg-green-200 rounded-full p-3">
                  <Wallet className="h-6 w-6 text-green-700" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-green-700 font-medium ml-1">+{commissionData.monthlyGrowth}%</span>
                <span className="text-green-600 ml-1">this month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-700 text-sm font-medium">Pending</p>
                  <p className="text-3xl font-bold text-yellow-900 mt-1">${commissionData.pendingCommissions.toLocaleString()}</p>
                </div>
                <div className="bg-yellow-200 rounded-full p-3">
                  <Clock className="h-6 w-6 text-yellow-700" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
                <span className="text-yellow-700 font-medium">3 transactions</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-700 text-sm font-medium">Protected Amount</p>
                  <p className="text-3xl font-bold text-blue-900 mt-1">${commissionData.protectedAmount.toLocaleString()}</p>
                </div>
                <div className="bg-blue-200 rounded-full p-3">
                  <CheckCircle className="h-6 w-6 text-blue-700" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                <span className="text-blue-700 font-medium">Commission Guard</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-700 text-sm font-medium">Average Commission</p>
                  <p className="text-3xl font-bold text-purple-900 mt-1">${commissionData.averageCommission.toLocaleString()}</p>
                </div>
                <div className="bg-purple-200 rounded-full p-3">
                  <TrendingUp className="h-6 w-6 text-purple-700" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></div>
                <span className="text-purple-700 font-medium">Per transaction</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="calculator" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="calculator">Commission Calculator</TabsTrigger>
            <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
            <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
            <TabsTrigger value="goals">Goal Tracking</TabsTrigger>
          </TabsList>

          <TabsContent value="calculator" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Calculator Input */}
              <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                    <Calculator className="text-primary mr-2" />
                    Commission Calculator
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="salePrice">Sale Price ($)</Label>
                    <Input
                      id="salePrice"
                      type="number"
                      placeholder="500000"
                      value={calculatorData.salePrice}
                      onChange={(e) => setCalculatorData({...calculatorData, salePrice: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                    <Select value={calculatorData.commissionRate} onValueChange={(value) => setCalculatorData({...calculatorData, commissionRate: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select rate" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2.5">2.5%</SelectItem>
                        <SelectItem value="3">3.0%</SelectItem>
                        <SelectItem value="3.5">3.5%</SelectItem>
                        <SelectItem value="4">4.0%</SelectItem>
                        <SelectItem value="5">5.0%</SelectItem>
                        <SelectItem value="6">6.0%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="splitRate">Agent Split (%)</Label>
                    <Select value={calculatorData.splitRate} onValueChange={(value) => setCalculatorData({...calculatorData, splitRate: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select split" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="40">40%</SelectItem>
                        <SelectItem value="50">50%</SelectItem>
                        <SelectItem value="60">60%</SelectItem>
                        <SelectItem value="70">70%</SelectItem>
                        <SelectItem value="80">80%</SelectItem>
                        <SelectItem value="90">90%</SelectItem>
                        <SelectItem value="100">100%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="brokerageFee">Brokerage Fee ($)</Label>
                    <Input
                      id="brokerageFee"
                      type="number"
                      placeholder="0"
                      value={calculatorData.brokerageFee}
                      onChange={(e) => setCalculatorData({...calculatorData, brokerageFee: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="transactionFee">Transaction Fee ($)</Label>
                    <Input
                      id="transactionFee"
                      type="number"
                      placeholder="0"
                      value={calculatorData.transactionFee}
                      onChange={(e) => setCalculatorData({...calculatorData, transactionFee: e.target.value})}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Calculator Results */}
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                    <Receipt className="text-green-600 mr-2" />
                    Commission Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                      <span className="text-gray-700">Sale Price:</span>
                      <span className="font-semibold text-lg">${calculations.salePrice.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                      <span className="text-gray-700">Gross Commission ({calculatorData.commissionRate}%):</span>
                      <span className="font-semibold text-lg text-blue-600">${calculations.grossCommission.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                      <span className="text-gray-700">Agent Split ({calculatorData.splitRate}%):</span>
                      <span className="font-semibold text-lg text-purple-600">${calculations.agentSplit.toLocaleString()}</span>
                    </div>
                    
                    {(calculations.brokerageFee > 0 || calculations.transactionFee > 0) && (
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                        <span className="text-gray-700">Fees & Deductions:</span>
                        <span className="font-semibold text-lg text-red-600">-${(calculations.brokerageFee + calculations.transactionFee).toLocaleString()}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border-2 border-green-300">
                      <span className="text-green-800 font-semibold">Net Commission:</span>
                      <span className="font-bold text-2xl text-green-700">${calculations.netCommission.toLocaleString()}</span>
                    </div>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                    Save Calculation
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                  <BarChart3 className="text-primary mr-2" />
                  Recent Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-300">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{transaction.client}</h4>
                          <p className="text-sm text-gray-600">{transaction.property}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">${transaction.amount.toLocaleString()}</p>
                          <Badge variant={
                            transaction.status === 'Paid' ? 'default' :
                            transaction.status === 'Pending' ? 'secondary' :
                            'outline'
                          } className={
                            transaction.status === 'Paid' ? 'bg-green-100 text-green-800' :
                            transaction.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }>
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                          <span className="text-gray-600">
                            Type: <span className="font-medium">{transaction.type}</span>
                          </span>
                          <span className="text-gray-600">
                            Date: <span className="font-medium">{transaction.date}</span>
                          </span>
                        </div>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Monthly Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Performance chart will display here</p>
                      <p className="text-sm text-gray-500">Showing monthly commission trends</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Commission Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Source breakdown will display here</p>
                      <p className="text-sm text-gray-500">Buyer vs Seller commissions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                  <Target className="text-primary mr-2" />
                  Annual Goals & Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Annual Commission Goal</span>
                        <span>${commissionData.yearToDate.toLocaleString()} / $400,000</span>
                      </div>
                      <Progress value={(commissionData.yearToDate / 400000) * 100} className="h-3" />
                      <p className="text-xs text-gray-600 mt-1">44.6% of annual goal achieved</p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Transaction Count</span>
                        <span>20 / 50 deals</span>
                      </div>
                      <Progress value={40} className="h-3" />
                      <p className="text-xs text-gray-600 mt-1">40% of transaction goal</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-gray-900 mb-2">Monthly Projections</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Projected Monthly Income:</span>
                        <span className="font-semibold">$28,500</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Year-End Projection:</span>
                        <span className="font-semibold">$456,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Goal Achievement:</span>
                        <span className="font-semibold text-green-600">114%</span>
                      </div>
                    </div>
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