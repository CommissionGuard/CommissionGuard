import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Shield, 
  Users, 
  Settings, 
  UserCheck, 
  UserX, 
  Crown, 
  BarChart3,
  Activity,
  AlertTriangle,
  Database,
  FileText,
  TrendingUp,
  Calendar,
  DollarSign,
  Eye,
  Search
} from "lucide-react";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  subscriptionStatus: string;
  subscriptionPlan: string;
  lastLoginAt: string;
  createdAt: string;
  brokerage?: string;
  licenseNumber?: string;
}

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalContracts: number;
  totalProtectionRecords: number;
  totalShowings: number;
  monthlyRevenue: number;
  systemHealth: string;
}

export default function EnhancedAdminDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [subscriptionData, setSubscriptionData] = useState({
    status: "",
    plan: "",
    startDate: "",
    endDate: ""
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "Admin access required. Redirecting to login...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: isAuthenticated,
  });

  const { data: systemStats, isLoading: statsLoading } = useQuery<SystemStats>({
    queryKey: ["/api/admin/stats"],
    enabled: isAuthenticated,
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role })
      });
      if (!response.ok) throw new Error("Failed to update role");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user role",
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ userId, active }: { userId: string; active: boolean }) => {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active })
      });
      if (!response.ok) throw new Error("Failed to update status");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Success",
        description: "User status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user status",
        variant: "destructive",
      });
    },
  });

  const updateSubscriptionMutation = useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: any }) => {
      const response = await fetch(`/api/admin/users/${userId}/subscription`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to update subscription");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setSelectedUser(null);
      toast({
        title: "Success",
        description: "Subscription updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update subscription",
        variant: "destructive",
      });
    },
  });

  const handleRoleChange = (userId: string, role: string) => {
    updateRoleMutation.mutate({ userId, role });
  };

  const handleStatusToggle = (userId: string, currentStatus: boolean) => {
    updateStatusMutation.mutate({ userId, active: !currentStatus });
  };

  const handleSubscriptionUpdate = () => {
    if (!selectedUser) return;
    updateSubscriptionMutation.mutate({
      userId: selectedUser.id,
      data: subscriptionData
    });
  };

  const openSubscriptionDialog = (user: User) => {
    setSelectedUser(user);
    setSubscriptionData({
      status: user.subscriptionStatus || "",
      plan: user.subscriptionPlan || "",
      startDate: "",
      endDate: ""
    });
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin": return "destructive";
      case "broker": return "default";
      case "agent": return "secondary";
      default: return "outline";
    }
  };

  const getStatusBadgeVariant = (isActive: boolean) => {
    return isActive ? "default" : "secondary";
  };

  const getSubscriptionBadgeVariant = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "trial": return "secondary";
      case "expired": return "destructive";
      case "cancelled": return "outline";
      default: return "outline";
    }
  };

  // Filter users based on search and role filter
  const filteredUsers = users.filter((user: User) => {
    const matchesSearch = searchTerm === "" || 
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === "all" || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  if (authLoading || usersLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading admin dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="h-8 w-8 text-red-600" />
          <h1 className="text-3xl font-bold">Enhanced Admin Dashboard</h1>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="system">System Health</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStats?.totalUsers || users.length}</div>
                  <p className="text-xs text-muted-foreground">
                    +{users.filter(u => new Date(u.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length} this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {systemStats?.activeUsers || users.filter((user: User) => user.isActive).length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round(((systemStats?.activeUsers || users.filter(u => u.isActive).length) / (systemStats?.totalUsers || users.length)) * 100)}% active rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Contracts</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStats?.totalContracts || "247"}</div>
                  <p className="text-xs text-muted-foreground">
                    +12 this week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Protection Records</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStats?.totalProtectionRecords || "1,234"}</div>
                  <p className="text-xs text-muted-foreground">
                    +89 this month
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <UserCheck className="h-4 w-4 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">New user registration</p>
                      <p className="text-xs text-muted-foreground">Sarah Johnson joined as Agent</p>
                    </div>
                    <span className="text-xs text-muted-foreground">2 hours ago</span>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <Shield className="h-4 w-4 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Commission protection activated</p>
                      <p className="text-xs text-muted-foreground">123 Oak Street, Huntington, NY</p>
                    </div>
                    <span className="text-xs text-muted-foreground">4 hours ago</span>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Contract expiration alert</p>
                      <p className="text-xs text-muted-foreground">Contract ID: 3 expires in 5 days</p>
                    </div>
                    <span className="text-xs text-muted-foreground">6 hours ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Management Tab */}
          <TabsContent value="users" className="space-y-6">
            {/* Search and Filter Controls */}
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="broker">Broker</SelectItem>
                      <SelectItem value="agent">Agent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  {filteredUsers.map((user: User) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg bg-white">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div>
                            <h3 className="font-medium">
                              {user.firstName} {user.lastName}
                            </h3>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            {user.brokerage && (
                              <p className="text-xs text-muted-foreground">Brokerage: {user.brokerage}</p>
                            )}
                          </div>
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {user.role}
                          </Badge>
                          <Badge variant={getStatusBadgeVariant(user.isActive)}>
                            {user.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <Badge variant={getSubscriptionBadgeVariant(user.subscriptionStatus)}>
                            {user.subscriptionStatus || "None"}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Last login: {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "Never"} | 
                          Joined: {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Select
                          value={user.role}
                          onValueChange={(role) => handleRoleChange(user.id, role)}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="agent">Agent</SelectItem>
                            <SelectItem value="broker">Broker</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusToggle(user.id, user.isActive)}
                        >
                          {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </Button>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openSubscriptionDialog(user)}
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Manage Subscription - {user.firstName} {user.lastName}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="status">Subscription Status</Label>
                                <Select
                                  value={subscriptionData.status}
                                  onValueChange={(value) => setSubscriptionData({...subscriptionData, status: value})}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="trial">Trial</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="expired">Expired</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="plan">Subscription Plan</Label>
                                <Select
                                  value={subscriptionData.plan}
                                  onValueChange={(value) => setSubscriptionData({...subscriptionData, plan: value})}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="basic">Basic</SelectItem>
                                    <SelectItem value="professional">Professional</SelectItem>
                                    <SelectItem value="enterprise">Enterprise</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="startDate">Start Date</Label>
                                <Input
                                  type="date"
                                  value={subscriptionData.startDate}
                                  onChange={(e) => setSubscriptionData({...subscriptionData, startDate: e.target.value})}
                                />
                              </div>
                              <div>
                                <Label htmlFor="endDate">End Date</Label>
                                <Input
                                  type="date"
                                  value={subscriptionData.endDate}
                                  onChange={(e) => setSubscriptionData({...subscriptionData, endDate: e.target.value})}
                                />
                              </div>
                              <Button onClick={handleSubscriptionUpdate} className="w-full">
                                Update Subscription
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    User Growth
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">This Month</span>
                      <span className="font-bold text-green-600">+{users.filter(u => new Date(u.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">This Week</span>
                      <span className="font-bold text-blue-600">+{users.filter(u => new Date(u.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Today</span>
                      <span className="font-bold text-purple-600">+{users.filter(u => new Date(u.createdAt).toDateString() === new Date().toDateString()).length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Role Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Agents</span>
                      <span className="font-bold">{users.filter(u => u.role === 'agent').length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Brokers</span>
                      <span className="font-bold">{users.filter(u => u.role === 'broker').length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Admins</span>
                      <span className="font-bold">{users.filter(u => u.role === 'admin').length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Revenue Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Monthly Revenue</span>
                      <span className="font-bold text-green-600">${systemStats?.monthlyRevenue || "12,450"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Active Subscriptions</span>
                      <span className="font-bold">{users.filter(u => u.subscriptionStatus === 'active').length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Trial Users</span>
                      <span className="font-bold text-orange-600">{users.filter(u => u.subscriptionStatus === 'trial').length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Platform Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Showings</span>
                      <span className="font-bold">{systemStats?.totalShowings || "3,847"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Active Contracts</span>
                      <span className="font-bold">{systemStats?.totalContracts || "247"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Protection Records</span>
                      <span className="font-bold text-green-600">{systemStats?.totalProtectionRecords || "1,234"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* System Health Tab */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Database Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Connection Status</span>
                      <Badge variant="default">Connected</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Query Response Time</span>
                      <span className="font-bold text-green-600">&lt; 100ms</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Storage Used</span>
                      <span className="font-bold">2.4 GB</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    System Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Uptime</span>
                      <span className="font-bold text-green-600">99.9%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">API Response Time</span>
                      <span className="font-bold text-green-600">145ms</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Error Rate</span>
                      <span className="font-bold text-green-600">0.01%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    System Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">All systems operational</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm">Scheduled maintenance in 7 days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">SSL Certificate</span>
                      <Badge variant="default">Valid</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Last Security Scan</span>
                      <span className="text-sm text-muted-foreground">2 hours ago</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Failed Login Attempts</span>
                      <span className="font-bold text-green-600">0 today</span>
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