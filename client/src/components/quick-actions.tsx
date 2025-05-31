import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, FileUp, BarChart3, Scale } from "lucide-react";
import { useLocation } from "wouter";

export default function QuickActions() {
  const [, setLocation] = useLocation();

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
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        fileInput?.click();
      }
    },
    {
      icon: BarChart3,
      label: "View Reports",
      onClick: () => {
        setLocation("/reports");
      }
    },
    {
      icon: Scale,
      label: "Legal Support",
      onClick: () => {
        setLocation("/legal-support");
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
