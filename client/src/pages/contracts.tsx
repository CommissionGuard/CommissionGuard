import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Navbar from "@/components/navbar";
import ContractsTable from "@/components/contracts-table";
import AddContractForm from "@/components/add-contract-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bell, Clock, MessageSquare, Calendar, Settings, Play, Pause, FileText, Plus } from "lucide-react";
import { 
  ContractLoadingAnimation, 
  ContractCardSkeleton, 
  KeyLoadingAnimation,
  FloatingKey 
} from "@/components/ui/loading-animations";

export default function Contracts() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [filter, setFilter] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("contracts");
  const [showAddContractForm, setShowAddContractForm] = useState(false);

  // Contract reminders data fetching - must be at top level
  const { data: reminders = [], isLoading: remindersLoading, refetch: refetchReminders } = useQuery({
    queryKey: ["/api/contract-reminders"],
    enabled: isAuthenticated && activeTab === "reminders",
    throwOnError: false,
  });

  // Check for URL parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const filterParam = urlParams.get('filter');
    const tabParam = urlParams.get('tab');
    const actionParam = urlParams.get('action');
    if (filterParam) {
      setFilter(filterParam);
    }
    if (tabParam) {
      setActiveTab(tabParam);
    }
    if (actionParam === 'add') {
      setShowAddContractForm(true);
      // Clean up URL parameter
      window.history.replaceState({}, '', '/contracts');
    }
  }, []);

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

  // Setup automated reminders mutation
  const setupRemindersMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/contract-reminders/setup-automated", {});
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `Set up automated reminders for ${data.activeContracts} contracts`,
      });
      refetchReminders();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to setup automated reminders",
        variant: "destructive",
      });
    },
  });

  // Process pending reminders mutation
  const processRemindersMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/contract-reminders/process-pending", {});
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Processing Complete",
        description: `Processed ${data.processedCount} pending reminders`,
      });
      refetchReminders();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to process reminders",
        variant: "destructive",
      });
    },
  });

  // Helper functions for reminders
  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "normal": return "bg-blue-100 text-blue-800";
      case "low": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "sent": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "failed": return "bg-red-100 text-red-800";
      case "delivered": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatReminderType = (type: string) => {
    switch (type) {
      case "weekly_checkin": return "Weekly Check-in";
      case "expiration_warning": return "Expiration Warning";
      case "renewal_due": return "Renewal Due";
      default: return type;
    }
  };

  // Calculate reminder statistics
  const activeReminders = Array.isArray(reminders) ? reminders.filter((r: any) => r.status === "pending") : [];
  const sentReminders = Array.isArray(reminders) ? reminders.filter((r: any) => r.status === "sent") : [];
  const failedReminders = Array.isArray(reminders) ? reminders.filter((r: any) => r.status === "failed") : [];
  const weeklyCheckIns = Array.isArray(reminders) ? reminders.filter((r: any) => r.reminderType === "weekly_checkin") : [];
  const expirationWarnings = Array.isArray(reminders) ? reminders.filter((r: any) => r.reminderType === "expiration_warning") : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Contract Management</h1>
          <p className="text-gray-600 mt-1">Monitor your representation agreements and automated reminders</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="contracts">Contracts</TabsTrigger>
            <TabsTrigger value="reminders">Contract Reminders</TabsTrigger>
          </TabsList>

          <TabsContent value="contracts" className="mt-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2">
                <ContractsTable filter={filter} />
              </div>
              <div>
                {/* Contract Management Section */}
                <Card>
                  <CardHeader className="pb-4 text-center">
                    <CardTitle className="flex items-center justify-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Contract Management
                    </CardTitle>
                    <Button onClick={() => setShowAddContractForm(true)} className="flex items-center gap-2 mx-auto w-fit">
                      <Plus className="h-4 w-4" />
                      Add New Contract
                    </Button>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reminders" className="mt-6">
            {/* Reminder Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Reminders</p>
                      <p className="text-2xl font-bold text-gray-900">{activeReminders.length}</p>
                    </div>
                    <Clock className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Sent Today</p>
                      <p className="text-2xl font-bold text-gray-900">{sentReminders.length}</p>
                    </div>
                    <MessageSquare className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Failed</p>
                      <p className="text-2xl font-bold text-gray-900">{failedReminders.length}</p>
                    </div>
                    <Bell className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Weekly Check-ins</p>
                      <p className="text-2xl font-bold text-gray-900">{weeklyCheckIns.length}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Expiration Warnings</p>
                      <p className="text-2xl font-bold text-gray-900">{expirationWarnings.length}</p>
                    </div>
                    <Settings className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Reminder Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Setup Automation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Automatically create reminders for all active contracts. This will set up:
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Weekly client check-ins (every 7 days)</li>
                    <li>• Contract expiration warnings (30 days before)</li>
                    <li>• Final expiration alerts (7 days before)</li>
                  </ul>
                  <Button 
                    onClick={() => setupRemindersMutation.mutate()}
                    disabled={setupRemindersMutation.isPending}
                    className="w-full"
                  >
                    {setupRemindersMutation.isPending ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                        Setting Up...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Setup Automated Reminders
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Process Pending
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Process and send all pending reminders that are scheduled for now or past due.
                  </p>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">
                      {activeReminders.length} reminders ready to process
                    </p>
                  </div>
                  <Button 
                    onClick={() => processRemindersMutation.mutate()}
                    disabled={processRemindersMutation.isPending || activeReminders.length === 0}
                    className="w-full"
                    variant={activeReminders.length > 0 ? "default" : "secondary"}
                  >
                    {processRemindersMutation.isPending ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Process Pending Reminders
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Reminders Table */}
            <Card>
              <CardHeader>
                <CardTitle>Contract Reminders</CardTitle>
              </CardHeader>
              <CardContent>
                {remindersLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading reminders...</p>
                  </div>
                ) : !Array.isArray(reminders) || reminders.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Contract Reminders</h3>
                    <p className="text-gray-600 mb-4">Set up automated reminders to maintain consistent client contact.</p>
                    <Button onClick={() => setupRemindersMutation.mutate()}>
                      Setup Automated Reminders
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Type</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Scheduled</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Priority</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Method</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Recurring</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reminders.map((reminder: any) => (
                          <tr key={reminder.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="font-medium text-gray-900">
                                {formatReminderType(reminder.reminderType)}
                              </div>
                              <div className="text-sm text-gray-500">
                                Contract #{reminder.contractId}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-sm text-gray-900">
                                {new Date(reminder.scheduledDate).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(reminder.scheduledDate).toLocaleTimeString()}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={getStatusBadgeColor(reminder.status)}>
                                {reminder.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={getPriorityBadgeColor(reminder.priority)}>
                                {reminder.priority}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-gray-600 capitalize">
                                {reminder.notificationMethod}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {reminder.isRecurring ? (
                                <Badge className="bg-green-100 text-green-800">
                                  Every {reminder.recurringInterval} days
                                </Badge>
                              ) : (
                                <span className="text-sm text-gray-500">One-time</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Add Contract Modal */}
        <Dialog open={showAddContractForm} onOpenChange={setShowAddContractForm}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Contract
              </DialogTitle>
            </DialogHeader>
            <AddContractForm onClose={() => setShowAddContractForm(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}