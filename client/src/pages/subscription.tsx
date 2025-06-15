import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Navbar from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  CreditCard, 
  Check, 
  Star, 
  Calendar, 
  DollarSign, 
  Shield, 
  Zap,
  Crown,
  TrendingUp,
  Clock,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const plans = [
  {
    id: "basic",
    name: "Basic",
    price: 29,
    interval: "month",
    description: "Perfect for individual agents",
    features: [
      "Up to 25 active contracts",
      "Basic commission protection alerts",
      "Email notifications",
      "Standard support",
      "Basic analytics"
    ],
    popular: false
  },
  {
    id: "professional",
    name: "Professional",
    price: 59,
    interval: "month",
    description: "Ideal for growing agents and small teams",
    features: [
      "Up to 100 active contracts",
      "Advanced AI-powered breach detection",
      "Real-time SMS & email alerts",
      "Priority support",
      "Advanced analytics & reporting",
      "Client portal access",
      "API integrations"
    ],
    popular: true
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 149,
    interval: "month",
    description: "For brokerages and large teams",
    features: [
      "Unlimited contracts",
      "AI-powered market analysis",
      "Custom alert workflows",
      "24/7 dedicated support",
      "White-label options",
      "Advanced team management",
      "Custom integrations",
      "Compliance reporting"
    ],
    popular: false
  }
];

export default function Subscription() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const { data: subscriptionData, isLoading } = useQuery({
    queryKey: ["/api/subscription/status"],
    retry: false,
  });

  const upgradeMutation = useMutation({
    mutationFn: async (planId: string) => {
      const response = await apiRequest("POST", "/api/subscription/upgrade", { planId });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        toast({
          title: "Success",
          description: "Subscription updated successfully",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/subscription/status"] });
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upgrade subscription",
        variant: "destructive",
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/subscription/cancel");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Subscription cancelled successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/subscription/status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel subscription",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-green-600 bg-green-100";
      case "trial": return "text-blue-600 bg-blue-100";
      case "expired": return "text-red-600 bg-red-100";
      case "cancelled": return "text-gray-600 bg-gray-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <Check className="h-4 w-4" />;
      case "trial": return <Clock className="h-4 w-4" />;
      case "expired": return <AlertTriangle className="h-4 w-4" />;
      case "cancelled": return <AlertTriangle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case "basic": return <Shield className="h-5 w-5" />;
      case "professional": return <Zap className="h-5 w-5" />;
      case "enterprise": return <Crown className="h-5 w-5" />;
      default: return <Shield className="h-5 w-5" />;
    }
  };

  const currentPlan = user?.subscriptionPlan || "trial";
  const currentStatus = user?.subscriptionStatus || "trial";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading subscription information...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Subscription Management</h1>
          <p className="text-gray-600 mt-1">Manage your Commission Guard subscription and billing</p>
        </div>

        {/* Current Subscription Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Current Subscription</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Plan</p>
                <div className="flex items-center space-x-2">
                  {getPlanIcon(currentPlan)}
                  <span className="text-lg font-semibold capitalize">{currentPlan}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Status</p>
                <Badge className={`${getStatusColor(currentStatus)} flex items-center space-x-1 w-fit`}>
                  {getStatusIcon(currentStatus)}
                  <span className="capitalize">{currentStatus}</span>
                </Badge>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Next Billing</p>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">
                    {user?.subscriptionEndDate 
                      ? new Date(user.subscriptionEndDate).toLocaleDateString()
                      : "N/A"
                    }
                  </span>
                </div>
              </div>
            </div>

            {currentStatus === "trial" && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Trial Period</span>
                </div>
                <p className="text-sm text-blue-700">
                  You're currently on a free trial. Upgrade to continue using Commission Guard after your trial expires.
                </p>
                <Progress value={60} className="mt-3" />
                <p className="text-xs text-blue-600 mt-1">18 days remaining</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Billing History */}
        {currentStatus === "active" && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Recent Payments</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Payment Successful</p>
                      <p className="text-sm text-gray-500">Dec 15, 2024</p>
                    </div>
                  </div>
                  <span className="font-medium">${plans.find(p => p.id === currentPlan)?.price || 29}.00</span>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Payment Successful</p>
                      <p className="text-sm text-gray-500">Nov 15, 2024</p>
                    </div>
                  </div>
                  <span className="font-medium">${plans.find(p => p.id === currentPlan)?.price || 29}.00</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Plans */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative ${plan.popular ? 'ring-2 ring-blue-500' : ''} ${
                  currentPlan === plan.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white">
                      <Star className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                {currentPlan === plan.id && (
                  <div className="absolute -top-3 right-4">
                    <Badge className="bg-green-600 text-white">
                      <Check className="h-3 w-3 mr-1" />
                      Current Plan
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center">
                  <div className="flex justify-center mb-2">
                    {getPlanIcon(plan.id)}
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="space-y-1">
                    <span className="text-3xl font-bold">${plan.price}</span>
                    <span className="text-gray-500">/{plan.interval}</span>
                  </div>
                  <p className="text-sm text-gray-600">{plan.description}</p>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    {currentPlan === plan.id ? (
                      currentStatus === "active" ? (
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => cancelMutation.mutate()}
                          disabled={cancelMutation.isPending}
                        >
                          {cancelMutation.isPending ? "Cancelling..." : "Cancel Subscription"}
                        </Button>
                      ) : (
                        <Button variant="outline" className="w-full" disabled>
                          Current Plan
                        </Button>
                      )
                    ) : (
                      <Button 
                        className="w-full"
                        onClick={() => upgradeMutation.mutate(plan.id)}
                        disabled={upgradeMutation.isPending}
                      >
                        {upgradeMutation.isPending && selectedPlan === plan.id 
                          ? "Processing..." 
                          : currentStatus === "trial" 
                            ? "Start Plan" 
                            : "Upgrade"
                        }
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Benefits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Commission Protection</h4>
                    <p className="text-sm text-gray-600">Advanced AI monitoring to protect your commissions and detect potential breaches.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <TrendingUp className="h-5 w-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Market Analytics</h4>
                    <p className="text-sm text-gray-600">Real-time market insights and property analysis to stay ahead of the competition.</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Zap className="h-5 w-5 text-yellow-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Automated Alerts</h4>
                    <p className="text-sm text-gray-600">Never miss important contract expirations or potential commission threats.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Crown className="h-5 w-5 text-purple-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Priority Support</h4>
                    <p className="text-sm text-gray-600">Get help when you need it with our dedicated support team.</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}