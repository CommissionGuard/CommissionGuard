import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, FileUp, BarChart3, Settings } from "lucide-react";

export default function QuickActions() {
  const actions = [
    {
      icon: UserPlus,
      label: "Add New Client",
      onClick: () => {
        // Scroll to add client form
        document.querySelector('input[name="fullName"]')?.scrollIntoView({ behavior: 'smooth' });
        (document.querySelector('input[name="fullName"]') as HTMLInputElement)?.focus();
      }
    },
    {
      icon: FileUp,
      label: "Upload Contract",
      onClick: () => {
        document.querySelector('input[type="file"]')?.click();
      }
    },
    {
      icon: BarChart3,
      label: "View Reports",
      onClick: () => {
        // TODO: Navigate to reports page
        console.log("Navigate to reports");
      }
    },
    {
      icon: Settings,
      label: "Manage Settings",
      onClick: () => {
        // TODO: Navigate to settings page
        console.log("Navigate to settings");
      }
    }
  ];

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            className="w-full justify-start p-3 h-auto text-left border-gray-200 hover:bg-gray-50"
            onClick={action.onClick}
          >
            <action.icon className="h-5 w-5 text-primary mr-3" />
            <span className="font-medium">{action.label}</span>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
