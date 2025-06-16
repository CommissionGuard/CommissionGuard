import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, AlertTriangle, CheckCircle, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function ContractReminders() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSettingUp, setIsSettingUp] = useState(false);

  // Fetch contract reminders
  const { data: reminders = [], isLoading } = useQuery({
    queryKey: ["/api/contract-reminders"],
    queryFn: () => apiRequest("/api/contract-reminders"),
  });

  // Fetch pending reminders count
  const { data: pendingReminders = [] } = useQuery({
    queryKey: ["/api/contract-reminders/pending"],
    queryFn: () => apiRequest("/api/contract-reminders/pending"),
  });

  // Setup automated reminders mutation
  const setupRemindersMutation = useMutation({
    mutationFn: () => apiRequest("/api/contract-reminders/setup-automated", {
      method: "POST",
    }),
    onSuccess: (data) => {
      toast({
        title: "Automated Reminders Setup Complete",
        description: `Created ${data.remindersCreated} reminders for ${data.activeContracts} active contracts`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/contract-reminders"] });
      setIsSettingUp(false);
    },
    onError: (error: any) => {
      toast({
        title: "Setup Failed",
        description: error.message || "Failed to setup automated reminders",
        variant: "destructive",
      });
      setIsSettingUp(false);
    },
  });

  // Process pending reminders mutation
  const processRemindersMutation = useMutation({
    mutationFn: () => apiRequest("/api/contract-reminders/process", {
      method: "POST",
    }),
    onSuccess: (data) => {
      toast({
        title: "Reminders Processed",
        description: `Successfully processed ${data.processedCount} pending reminders`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/contract-reminders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/contract-reminders/pending"] });
    },
    onError: (error: any) => {
      toast({
        title: "Processing Failed",
        description: error.message || "Failed to process reminders",
        variant: "destructive",
      });
    },
  });

  const handleSetupReminders = () => {
    setIsSettingUp(true);
    setupRemindersMutation.mutate();
  };

  const handleProcessReminders = () => {
    processRemindersMutation.mutate();
  };

  const getReminderTypeBadge = (type: string) => {
    switch (type) {
      case "weekly_checkin":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700"><Calendar className="w-3 h-3 mr-1" />Weekly Check-in</Badge>;
      case "expiration_warning":
        return <Badge variant="outline" className="bg-orange-50 text-orange-700"><AlertTriangle className="w-3 h-3 mr-1" />Expiration Warning</Badge>;
      case "renewal_due":
        return <Badge variant="outline" className="bg-red-50 text-red-700"><Clock className="w-3 h-3 mr-1" />Renewal Due</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge variant="destructive">Urgent</Badge>;
      case "high":
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">High</Badge>;
      case "normal":
        return <Badge variant="secondary">Normal</Badge>;
      case "low":
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "sent":
        return <Badge variant="outline" className="bg-green-50 text-green-700"><CheckCircle className="w-3 h-3 mr-1" />Sent</Badge>;
      case "delivered":
        return <Badge variant="outline" className="bg-green-50 text-green-700"><CheckCircle className="w-3 h-3 mr-1" />Delivered</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const weeklyReminders = reminders.filter((r: any) => r.reminderType === "weekly_checkin");
  const expirationWarnings = reminders.filter((r: any) => r.reminderType === "expiration_warning");

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Contract Reminders</h1>
          <p className="text-muted-foreground">
            Automated weekly check-ins and contract expiration warnings
          </p>
        </div>
        <div className="flex gap-2">
          {pendingReminders.length > 0 && (
            <Button 
              onClick={handleProcessReminders}
              disabled={processRemindersMutation.isPending}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Bell className="w-4 h-4" />
              Process {pendingReminders.length} Pending
            </Button>
          )}
          <Button 
            onClick={handleSetupReminders}
            disabled={isSettingUp || setupRemindersMutation.isPending}
            className="flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            {isSettingUp ? "Setting Up..." : "Setup Automated Reminders"}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reminders</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reminders.length}</div>
            <p className="text-xs text-muted-foreground">Active reminder schedule</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Check-ins</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{weeklyReminders.length}</div>
            <p className="text-xs text-muted-foreground">Recurring client contact</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiration Warnings</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{expirationWarnings.length}</div>
            <p className="text-xs text-muted-foreground">Contract renewal alerts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Actions</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingReminders.length}</div>
            <p className="text-xs text-muted-foreground">Ready to send</p>
          </CardContent>
        </Card>
      </div>

      {/* Reminders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reminder Schedule</CardTitle>
          <CardDescription>
            View and manage your automated contract reminders
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : reminders.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No reminders configured</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Set up automated reminders to stay on top of your client contracts.
              </p>
              <div className="mt-6">
                <Button onClick={handleSetupReminders} disabled={isSettingUp}>
                  <Users className="w-4 h-4 mr-2" />
                  Setup Reminders
                </Button>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Scheduled Date</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Recurring</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reminders.map((reminder: any) => (
                  <TableRow key={reminder.id}>
                    <TableCell>
                      {getReminderTypeBadge(reminder.reminderType)}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">Client #{reminder.clientId}</div>
                      <div className="text-sm text-muted-foreground">Contract #{reminder.contractId}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{formatDate(reminder.scheduledDate)}</div>
                      {reminder.nextSendDate && (
                        <div className="text-sm text-muted-foreground">
                          Next: {formatDate(reminder.nextSendDate)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {getPriorityBadge(reminder.priority)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(reminder.status)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {reminder.notificationMethod}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {reminder.isRecurring ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Every {reminder.recurringInterval} days
                        </Badge>
                      ) : (
                        <Badge variant="outline">One-time</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">How Automated Reminders Work</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700">
          <div className="space-y-2">
            <p><strong>Weekly Check-ins:</strong> Recurring reminders every 7 days to maintain client contact and ensure satisfaction</p>
            <p><strong>30-Day Expiration Warning:</strong> High-priority alert when contracts are 30 days from expiration</p>
            <p><strong>7-Day Final Warning:</strong> Urgent notification requiring immediate renewal action</p>
            <p className="text-sm text-blue-600 mt-4">
              Reminders are automatically sent via email and SMS based on your preferences. Processing can be done manually or scheduled.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}