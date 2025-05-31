import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function AlertsSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: alerts, isLoading } = useQuery({
    queryKey: ["/api/alerts"],
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (alertId: number) => {
      await apiRequest("PATCH", `/api/alerts/${alertId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/alerts/unread/count"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to mark alert as read",
        variant: "destructive",
      });
    },
  });

  const getAlertIcon = (type: string, severity: string) => {
    if (type === "breach") return AlertTriangle;
    if (type === "expiration") return Clock;
    return CheckCircle;
  };

  const getAlertColor = (type: string, severity: string) => {
    if (type === "breach" || severity === "high") return "border-red-200 bg-red-50";
    if (type === "expiration" || severity === "medium") return "border-yellow-200 bg-yellow-50";
    return "border-green-200 bg-green-50";
  };

  const getIconColor = (type: string, severity: string) => {
    if (type === "breach" || severity === "high") return "bg-accent text-white";
    if (type === "expiration" || severity === "medium") return "bg-warning text-white";
    return "bg-success text-white";
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="text-primary mr-2" />
            Recent Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
          <Bell className="text-primary mr-2" />
          Recent Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {!alerts || alerts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">All Clear!</h3>
              <p className="text-gray-600">No active alerts at this time.</p>
            </div>
          ) : (
            alerts.map((alert: any) => {
              const AlertIcon = getAlertIcon(alert.type, alert.severity);
              const alertColor = getAlertColor(alert.type, alert.severity);
              const iconColor = getIconColor(alert.type, alert.severity);

              return (
                <div
                  key={alert.id}
                  className={`flex items-start space-x-4 p-4 border rounded-lg ${alertColor} ${
                    alert.isRead ? "opacity-60" : ""
                  }`}
                >
                  <div className={`${iconColor} rounded-full p-2 flex-shrink-0`}>
                    <AlertIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{alert.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-xs text-gray-500">
                        {new Date(alert.createdAt).toLocaleDateString()}
                      </span>
                      {!alert.isRead && (
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => markAsReadMutation.mutate(alert.id)}
                          disabled={markAsReadMutation.isPending}
                          className="text-primary text-sm font-medium hover:underline p-0"
                        >
                          Mark as Read
                        </Button>
                      )}
                      {alert.type === "breach" && (
                        <Button
                          variant="link"
                          size="sm"
                          className="text-primary text-sm font-medium hover:underline p-0"
                        >
                          Contact Legal
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
